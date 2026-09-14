using System;
using System.Globalization;
using System.IO;
using System.Text.Json;
using System.Windows;
using Microsoft.Web.WebView2.Core;

namespace DigitalClock.Windows;

public partial class MainWindow : Window
{
    private readonly WindowsSoundService _soundService = new();

    public MainWindow()
    {
        InitializeComponent();
        Loaded += MainWindow_Loaded;
        Closed += (_, _) => _soundService.Dispose();
    }

    private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        await ClockWebView.EnsureCoreWebView2Async();

        ClockWebView.CoreWebView2.WebMessageReceived += ClockWebView_WebMessageReceived;

        string webFolder = Path.Combine(AppContext.BaseDirectory, "Web");

        ClockWebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
            "digitalclock.local",
            webFolder,
            CoreWebView2HostResourceAccessKind.Allow
        );

        ClockWebView.Source = new Uri("https://digitalclock.local/index.html");
    }

    private void ClockWebView_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        string? requestId = null;

        try
        {
            using JsonDocument document = JsonDocument.Parse(e.WebMessageAsJson);
            JsonElement root = document.RootElement;
            requestId = ReadString(root, "requestId");

            string? action = ReadString(root, "action");
            object? payload = action switch
            {
                "getHostInfo" => new
                {
                    language = GetSupportedWindowsLanguage(CultureInfo.CurrentUICulture.Name),
                    customSounds = _soundService.GetSelectedSoundNames()
                },
                "pickCustomSound" => PickCustomSound(ReadString(root, "channel")),
                "playCustomSound" => PlayCustomSound(
                    ReadString(root, "channel"),
                    root.TryGetProperty("preview", out JsonElement preview) && preview.GetBoolean()
                ),
                "stopCustomSound" => StopCustomSound(ReadString(root, "channel")),
                _ => throw new InvalidOperationException("Unsupported Windows bridge action.")
            };

            SendBridgeResponse(requestId, true, payload);
        }
        catch (Exception exception)
        {
            SendBridgeResponse(requestId, false, new { error = exception.Message });
        }
    }

    private object PickCustomSound(string? channel)
    {
        WindowsSoundChoice? choice = _soundService.Pick(channel);
        return choice is null
            ? new { cancelled = true }
            : new { name = choice.Name };
    }

    private object PlayCustomSound(string? channel, bool preview)
    {
        bool played = _soundService.Play(channel, preview);
        return new { played };
    }

    private object StopCustomSound(string? channel)
    {
        _soundService.Stop(channel);
        return new { stopped = true };
    }

    private void SendBridgeResponse(string? requestId, bool ok, object? payload)
    {
        if (ClockWebView.CoreWebView2 is null || string.IsNullOrWhiteSpace(requestId))
        {
            return;
        }

        ClockWebView.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(new
        {
            type = "windowsBridgeResponse",
            requestId,
            ok,
            payload
        }));
    }

    private static string? ReadString(JsonElement root, string propertyName)
    {
        return root.TryGetProperty(propertyName, out JsonElement property) &&
               property.ValueKind == JsonValueKind.String
            ? property.GetString()
            : null;
    }

    private static string GetSupportedWindowsLanguage(string windowsLanguage)
    {
        string language = windowsLanguage.Split('-', StringSplitOptions.RemoveEmptyEntries)[0].ToLowerInvariant();
        return language is "hr" or "de" or "it" or "es" or "en" ? language : "en";
    }
}
