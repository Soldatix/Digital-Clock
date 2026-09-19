using System;
using System.IO;

namespace DigitalClock.Windows;

internal static class AppDataPaths
{
#if DIGITALCLOCK_TEST_BUILD
    private const string ProductFolderName = "DigitalClock-Test";
    private const string DefaultStartupRunValueName = "AppsAndGamesDigitalClockTest";
    private const string DefaultScreenSaverMutexName = "Local\\DigitalClockTest.ScreenSaverAppearance";
    public const bool IsTestBuild = true;
#else
    private const string ProductFolderName = "DigitalClock";
    private const string DefaultStartupRunValueName = "AppsAndGamesDigitalClock";
    private const string DefaultScreenSaverMutexName = "Local\\DigitalClock.ScreenSaverAppearance";
    public const bool IsTestBuild = false;
#endif

    public static string PortableMarkerPath => Path.Combine(AppContext.BaseDirectory, "portable.flag");

    public static bool IsPortable => File.Exists(PortableMarkerPath);

    public static string StartupRunValueName => IsPortable
        ? "AppsAndGamesDigitalClockPortable"
        : DefaultStartupRunValueName;

    public static string ScreenSaverMutexName => IsPortable
        ? "Local\\DigitalClockPortable.ScreenSaverAppearance"
        : DefaultScreenSaverMutexName;

    public static string RootDirectory => IsPortable
        ? Path.Combine(AppContext.BaseDirectory, "Data")
        : Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "AppsAndGames",
            ProductFolderName
        );

    public static string DesktopWebView2Directory => IsPortable
        ? Path.Combine(RootDirectory, "WebView2")
        : Path.Combine(RootDirectory, "Desktop.WebView2");

    public static string ScreenSaverWebView2Directory =>
        Path.Combine(RootDirectory, "ScreenSaver.WebView2");

    public static string LogsDirectory => Path.Combine(RootDirectory, "Logs");
}
