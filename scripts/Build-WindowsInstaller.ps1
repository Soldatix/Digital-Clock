param(
    [string]$Version = "2.0.0",
    [string]$Runtime = "win-x64"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$project = Join-Path $repoRoot "windows\DigitalClock.Windows\DigitalClock.Windows.csproj"
$installerScript = Join-Path $repoRoot "installer\DigitalClock.iss"
$publishFolder = Join-Path $repoRoot "publish\windows-x64"
$prerequisiteFolder = Join-Path $repoRoot "installer\prerequisites"
$webViewBootstrapper = Join-Path $prerequisiteFolder "MicrosoftEdgeWebView2Setup.exe"
$setupFolder = Join-Path $repoRoot "publish\installer"

function Find-InnoSetupCompiler {
    $command = Get-Command ISCC.exe -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    $knownPaths = @(
        (Join-Path $env:LOCALAPPDATA "Programs\Inno Setup 6\ISCC.exe"),
        (Join-Path ${env:ProgramFiles(x86)} "Inno Setup 6\ISCC.exe"),
        (Join-Path $env:ProgramFiles "Inno Setup 6\ISCC.exe")
    )

    foreach ($knownPath in $knownPaths) {
        if ($knownPath -and (Test-Path $knownPath)) {
            return $knownPath
        }
    }

    throw "Inno Setup 6 was not found. Install it once with: winget install JRSoftware.InnoSetup"
}

if (-not (Test-Path $project)) {
    throw "Windows project was not found: $project"
}

New-Item -ItemType Directory -Force -Path $prerequisiteFolder, $publishFolder, $setupFolder | Out-Null

Push-Location $repoRoot
try {
    npm run build
    dotnet publish $project -c Release -r $Runtime --self-contained true -o $publishFolder

    if (-not (Test-Path $webViewBootstrapper)) {
        Write-Host "Downloading Microsoft Edge WebView2 bootstrapper..."
        Invoke-WebRequest `
            -Uri "https://go.microsoft.com/fwlink/p/?LinkId=2124703" `
            -OutFile $webViewBootstrapper
    }

    $iscc = Find-InnoSetupCompiler
    & $iscc "/DMyAppVersion=$Version" "/DSourceDir=$publishFolder" $installerScript

    if ($LASTEXITCODE -ne 0) {
        throw "Inno Setup failed with exit code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
}

$setupFile = Join-Path $setupFolder "DigitalClock-Setup-x64.exe"
if (-not (Test-Path $setupFile)) {
    throw "Installer was not created: $setupFile"
}

Write-Host ""
Write-Host "Windows installer created:"
Write-Host "  $setupFile"
Write-Host ""
Write-Host "Test it on a Windows x64 PC before publishing it on Apps & Games."
