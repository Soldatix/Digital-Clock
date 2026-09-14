using System;
using System.Linq;
using System.Windows;

namespace DigitalClock.Windows;

public partial class App : System.Windows.Application
{
    private void App_Startup(object sender, StartupEventArgs e)
    {
        string command = e.Args.FirstOrDefault()?.Trim().ToLowerInvariant() ?? string.Empty;

        Window window = command switch
        {
            "/s" or "-s" => new ScreenSaverWindow(),
            "/c" or "-c" => new ScreenSaverSettingsWindow(),
            "/p" or "-p" => new ScreenSaverWindow(isPreview: true),
            _ => new MainWindow()
        };

        MainWindow = window;
        window.Show();
    }
}
