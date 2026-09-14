param(
    [string]$Runtime = "win-x64"
)

$ErrorActionPreference = "Stop"

$project = Join-Path $PSScriptRoot "..\windows\DigitalClock.Windows\DigitalClock.Windows.csproj"
$publishFolder = Join-Path $PSScriptRoot "..\publish\DigitalClock-ScreenSaver"

dotnet publish $project -c Release -r $Runtime --self-contained false -o $publishFolder

$screenSaverExe = Join-Path $publishFolder "DigitalClock.Windows.exe"
$screenSaverFile = Join-Path $publishFolder "AppsAndGames-DigitalClock.scr"
$previousScreenSaverFile = Join-Path $publishFolder "DigitalClock.scr"

if (-not (Test-Path $screenSaverExe)) {
    throw "Published executable was not found: $screenSaverExe"
}

if (Test-Path $previousScreenSaverFile) {
    Remove-Item $previousScreenSaverFile -Force
}

Copy-Item $screenSaverExe $screenSaverFile -Force

Write-Host ""
Write-Host "Screen Saver package created:"
Write-Host "  $screenSaverFile"
Write-Host ""
Write-Host "Right-click AppsAndGames-DigitalClock.scr and choose Install."
