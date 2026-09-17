param(
    [string]$Version = "2.0.5",
    [string]$Runtime = "win-x64"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$project = Join-Path $repoRoot "windows\DigitalClock.Windows\DigitalClock.Windows.csproj"
$readme = Join-Path $repoRoot "portable\README.txt"
$publishFolder = Join-Path $repoRoot "publish\portable-x64"
$packageRoot = Join-Path $repoRoot "publish\portable-package"
$packageFolder = Join-Path $packageRoot "DigitalClock-Portable-x64"
$outputFolder = Join-Path $repoRoot "publish\portable"
$zipFile = Join-Path $outputFolder "DigitalClock-Portable-x64.zip"
$checksumFile = Join-Path $outputFolder "DigitalClock-Portable-x64.sha256.txt"

if (-not (Test-Path $project)) {
    throw "Windows project was not found: $project"
}

if (-not (Test-Path $readme)) {
    throw "Portable README was not found: $readme"
}

Remove-Item $publishFolder -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $packageRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $publishFolder, $packageFolder, $outputFolder | Out-Null

Push-Location $repoRoot
try {
    npm run build
    dotnet publish $project -c Release -r $Runtime --self-contained true -o $publishFolder
}
finally {
    Pop-Location
}

Copy-Item (Join-Path $publishFolder "*") $packageFolder -Recurse -Force

# Presence of this marker makes the Windows host use .\Data instead of LocalAppData.
New-Item -ItemType File -Force -Path (Join-Path $packageFolder "portable.flag") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $packageFolder "Data") | Out-Null
Copy-Item $readme (Join-Path $packageFolder "README.txt") -Force
Set-Content -Path (Join-Path $packageFolder "VERSION.txt") -Value $Version -Encoding UTF8

# A portable package must not contain a registered/renamed Windows Screen Saver file.
Get-ChildItem $packageFolder -Filter "*.scr" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force

Remove-Item $zipFile -Force -ErrorAction SilentlyContinue
Compress-Archive -Path $packageFolder -DestinationPath $zipFile -CompressionLevel Optimal

$hash = (Get-FileHash $zipFile -Algorithm SHA256).Hash.ToUpperInvariant()
Set-Content -Path $checksumFile -Value "$hash  DigitalClock-Portable-x64.zip" -Encoding ASCII

Write-Host ""
Write-Host "Digital Clock Portable created:"
Write-Host "  $zipFile"
Write-Host "  SHA-256: $hash"
Write-Host ""
Write-Host "Test the extracted package on Windows x64 before publishing it on Apps & Games."
