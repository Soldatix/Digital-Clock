using System;
using System.IO;

namespace DigitalClock.Windows;

internal static class AppDataPaths
{
#if DIGITALCLOCK_TEST_BUILD
    private const string ProductFolderName = "DigitalClock-Test";
    public const bool IsTestBuild = true;
    public const string StartupRunValueName = "AppsAndGamesDigitalClockTest";
    public const string ScreenSaverMutexName = "Local\\DigitalClockTest.ScreenSaverAppearance";
#else
    private const string ProductFolderName = "DigitalClock";
    public const bool IsTestBuild = false;
    public const string StartupRunValueName = "AppsAndGamesDigitalClock";
    public const string ScreenSaverMutexName = "Local\\DigitalClock.ScreenSaverAppearance";
#endif

    public static string RootDirectory => Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "AppsAndGames",
        ProductFolderName
    );

    public static string DesktopWebView2Directory => IsTestBuild
        ? Path.Combine(RootDirectory, "Desktop.WebView2")
        : Path.Combine(AppContext.BaseDirectory, "DigitalClock.Windows.exe.WebView2");

    public static string ScreenSaverWebView2Directory =>
        Path.Combine(RootDirectory, "ScreenSaver.WebView2");

    public static string LogsDirectory => Path.Combine(RootDirectory, "Logs");
}
