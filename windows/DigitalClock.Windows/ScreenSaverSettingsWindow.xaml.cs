using System;
using System.IO;
using System.Windows;
using Microsoft.Web.WebView2.Core;

namespace DigitalClock.Windows;

public partial class ScreenSaverSettingsWindow : Window
{
    public ScreenSaverSettingsWindow()
    {
        InitializeComponent();
        Loaded += ScreenSaverSettingsWindow_Loaded;
    }

    private async void ScreenSaverSettingsWindow_Loaded(object sender, RoutedEventArgs e)
    {
        await SettingsWebView.EnsureCoreWebView2Async();

        string webFolder = Path.Combine(AppContext.BaseDirectory, "Web");
        SettingsWebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
            "digitalclock.local",
            webFolder,
            CoreWebView2HostResourceAccessKind.Allow
        );

        SettingsWebView.Source = new Uri("https://digitalclock.local/index.html?screenSaverConfig=1");
    }
}
