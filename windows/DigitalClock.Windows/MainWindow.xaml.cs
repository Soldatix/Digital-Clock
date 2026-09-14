using System;
using System.IO;
using System.Windows;
using Microsoft.Web.WebView2.Core;

namespace DigitalClock.Windows;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        Loaded += MainWindow_Loaded;
    }

    private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        await ClockWebView.EnsureCoreWebView2Async();

        string webFolder = Path.Combine(
            AppContext.BaseDirectory,
            "Web"
        );

        ClockWebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
            "digitalclock.local",
            webFolder,
            CoreWebView2HostResourceAccessKind.Allow
        );

        ClockWebView.Source = new Uri(
            "https://digitalclock.local/index.html"
        );
    }
}
