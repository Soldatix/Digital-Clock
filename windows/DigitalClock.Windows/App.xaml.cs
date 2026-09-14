using System;
using System.Globalization;
using System.Linq;
using System.Windows;

namespace DigitalClock.Windows;

public partial class App : System.Windows.Application
{
    private void App_Startup(object sender, StartupEventArgs e)
    {
        string rawCommand = e.Args.FirstOrDefault()?.Trim() ?? string.Empty;
        string command = rawCommand.ToLowerInvariant();

        IntPtr previewHandle = ParseScreenSaverHandle(rawCommand, e.Args);

        Window window = command switch
        {
            "/s" or "-s" => new ScreenSaverWindow(),
            "/c" or "-c" => new ScreenSaverSettingsWindow(),
            "/p" or "-p" => new ScreenSaverWindow(isPreview: true, previewParentHandle: previewHandle),
            _ when command.StartsWith("/c:", StringComparison.Ordinal) ||
                   command.StartsWith("-c:", StringComparison.Ordinal) => new ScreenSaverSettingsWindow(),
            _ when command.StartsWith("/p:", StringComparison.Ordinal) ||
                   command.StartsWith("-p:", StringComparison.Ordinal) => new ScreenSaverWindow(isPreview: true, previewParentHandle: previewHandle),
            _ => new MainWindow()
        };

        MainWindow = window;
        window.Show();
    }

    private static IntPtr ParseScreenSaverHandle(string rawCommand, string[] args)
    {
        string command = rawCommand.Trim();

        int separatorIndex = command.IndexOf(':');
        if (separatorIndex >= 0 &&
            separatorIndex < command.Length - 1 &&
            long.TryParse(command[(separatorIndex + 1)..], NumberStyles.Integer, CultureInfo.InvariantCulture, out long inlineHandle))
        {
            return new IntPtr(inlineHandle);
        }

        if (args.Length > 1 &&
            long.TryParse(args[1], NumberStyles.Integer, CultureInfo.InvariantCulture, out long separateHandle))
        {
            return new IntPtr(separateHandle);
        }

        return IntPtr.Zero;
    }
}
