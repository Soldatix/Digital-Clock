using System;
using System.Globalization;
using System.Linq;
using System.Windows;

namespace DigitalClock.Windows;

public partial class App : System.Windows.Application
{
    private void App_Startup(object sender, StartupEventArgs e)
    {
        string command = e.Args.FirstOrDefault()?.Trim().ToLowerInvariant() ?? string.Empty;
        IntPtr previewHandle = (command is "/p" or "-p") && e.Args.Length > 1 &&
            long.TryParse(e.Args[1], NumberStyles.Integer, CultureInfo.InvariantCulture, out long handleValue)
                ? new IntPtr(handleValue)
                : IntPtr.Zero;

        Window window = command switch
        {
            "/s" or "-s" => new ScreenSaverWindow(),
            "/c" or "-c" => new ScreenSaverSettingsWindow(),
            "/p" or "-p" => new ScreenSaverWindow(isPreview: true, previewParentHandle: previewHandle),
            _ => new MainWindow()
        };

        MainWindow = window;
        window.Show();
    }
}
