using System;
using System.IO;
using System.Text.Json;
using System.Diagnostics;
using System.Windows;
using Microsoft.Web.WebView2.Core;

namespace DigitalClock.Windows;

public partial class ScreenSaverSettingsWindow : Window
{
    private readonly ClockAppearanceStore _appearanceStore = new();
    public ScreenSaverSettingsWindow()
    {
        InitializeComponent();
        if (AppDataPaths.IsTestBuild)
        {
            Title = "Digital Clock Screen Saver Settings [TEST]";
        }
        Loaded += ScreenSaverSettingsWindow_Loaded;
    }

    private async void ScreenSaverSettingsWindow_Loaded(object sender, RoutedEventArgs e)
    {
        var webViewEnvironment = await CoreWebView2Environment.CreateAsync(
            null,
            AppDataPaths.DesktopWebView2Directory
        );
        await SettingsWebView.EnsureCoreWebView2Async(webViewEnvironment);
        SettingsWebView.CoreWebView2.WebMessageReceived += SettingsWebView_WebMessageReceived;
        string saverJson = _appearanceStore.ReadScreenSaver() ?? "null";
        await SettingsWebView.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync(
            $"window.__digitalClockScreenSaverAppearance = {saverJson};"
        );

        string webFolder = Path.Combine(AppContext.BaseDirectory, "Web");
        SettingsWebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
            "digitalclock.local",
            webFolder,
            CoreWebView2HostResourceAccessKind.Allow
        );

        SettingsWebView.Source = new Uri("https://digitalclock.local/index.html?screenSaverConfig=1");
    }

    private void SettingsWebView_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        try
        {
            using JsonDocument document = JsonDocument.Parse(e.WebMessageAsJson);
            JsonElement root = document.RootElement;
            string? action = root.GetProperty("action").GetString();
            if (action is "saveScreenSaverAppearance" or "migrateScreenSaverAppearance")
                _appearanceStore.SaveScreenSaver(root.GetProperty("settings"), migrateOnly: action == "migrateScreenSaverAppearance");
        }
        catch (Exception exception)
        {
            Trace.TraceError("Could not save screen saver appearance: {0}", exception);
        }
    }
}
