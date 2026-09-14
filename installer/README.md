# Windows installer

Run the installer build script from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Build-WindowsInstaller.ps1
```

The first run needs [Inno Setup 6](https://jrsoftware.org/isinfo.php). Install it once if necessary:

```powershell
winget install JRSoftware.InnoSetup
```

The build script:

1. runs the Vite production build;
2. publishes the WPF application as a self-contained Windows x64 application;
3. downloads the Microsoft Edge WebView2 bootstrapper if it is not present;
4. creates `publish\installer\DigitalClock-Setup-x64.exe`.

The installer always copies `AppsAndGames-DigitalClock.scr` beside the application. Its optional checkbox only activates that Screen Saver immediately. If the checkbox is left clear, it can later be activated by right-clicking that `.scr` file and choosing **Install**.

The Croatian installer translation is bundled in `installer\languages\Croatian.isl` so builds do not depend on an optional local Inno Setup language file. The bundled translation comes from the Inno Setup 6.7.1 source tree and retains the original translator attribution.

The default Windows installer version is `2.0.0`. It can still be overridden with the build script's `-Version` parameter when preparing a later release.

Do not commit `publish\` or `installer\prerequisites\`: they contain generated output and Microsoft binaries.
