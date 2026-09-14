using System;
using System.Diagnostics;
using System.IO;
using System.Text.Json;
using System.Windows;
using System.Windows.Input;
using Microsoft.Web.WebView2.Core;

namespace DigitalClock.Windows;

public partial class ScreenSaverWindow : Window
{
    private readonly Stopwatch _startupStopwatch = Stopwatch.StartNew();
    private readonly bool _isPreview;
    private readonly ClockAppearanceStore _appearanceStore = new();
    private bool _closeRequested;

    public ScreenSaverWindow(bool isPreview = false)
    {
        _isPreview = isPreview;
        InitializeComponent();

        if (_isPreview)
        {
            Width = 320;
            Height = 240;
            WindowState = WindowState.Normal;
            WindowStartupLocation = WindowStartupLocation.CenterScreen;
            ShowInTaskbar = true;
        }
        else
        {
            Topmost = true;
        }

        Loaded += ScreenSaverWindow_Loaded;
        PreviewKeyDown += ScreenSaverWindow_PreviewKeyDown;
        MouseMove += ScreenSaverWindow_MouseMove;
    }

    private async void ScreenSaverWindow_Loaded(object sender, RoutedEventArgs e)
    {
        var webViewEnvironment = await CoreWebView2Environment.CreateAsync(
            null,
            Path.Combine(AppContext.BaseDirectory, "DigitalClock.Windows.exe.WebView2")
        );
        await ScreenSaverWebView.EnsureCoreWebView2Async(webViewEnvironment);
        string appearanceJson = _appearanceStore.Read() ?? "null";
        await ScreenSaverWebView.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync(
            $"window.__digitalClockScreenSaverSeed = {appearanceJson};"
        );
        ScreenSaverWebView.CoreWebView2.WebMessageReceived += ScreenSaverWebView_WebMessageReceived;

        string webFolder = Path.Combine(AppContext.BaseDirectory, "Web");
        ScreenSaverWebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
            "digitalclock.local",
            webFolder,
            CoreWebView2HostResourceAccessKind.Allow
        );

        ScreenSaverWebView.Source = new Uri("https://digitalclock.local/index.html?screenSaver=1");
    }

    private void ScreenSaverWindow_PreviewKeyDown(object sender, System.Windows.Input.KeyEventArgs e)
    {
        if (!_isPreview)
        {
            CloseScreenSaver();
        }
    }

    private void ScreenSaverWindow_MouseMove(object sender, System.Windows.Input.MouseEventArgs e)
    {
        if (!_isPreview && _startupStopwatch.ElapsedMilliseconds > 900)
        {
            CloseScreenSaver();
        }
    }

    private void ScreenSaverWebView_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        try
        {
            using JsonDocument message = JsonDocument.Parse(e.WebMessageAsJson);
            if (message.RootElement.TryGetProperty("action", out JsonElement action) &&
                action.ValueKind == JsonValueKind.String &&
                action.GetString() == "exitScreenSaver")
            {
                CloseScreenSaver();
            }
        }
        catch (JsonException)
        {
            // Ignore malformed web messages from the hosted page.
        }
    }

    private void CloseScreenSaver()
    {
        if (_closeRequested)
        {
            return;
        }

        _closeRequested = true;
        Close();
    }
}
