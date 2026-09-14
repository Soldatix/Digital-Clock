; Build with scripts/Build-WindowsInstaller.ps1
; The resulting public installer is publish/installer/DigitalClock-Setup-x64.exe.

#ifndef MyAppVersion
  #define MyAppVersion "2.0.0"
#endif

#ifndef SourceDir
  #define SourceDir "..\publish\windows-x64"
#endif

#define MyAppName "Digital Clock"
#define MyAppPublisher "Apps & Games"
#define MyAppURL "https://appsandgames.org/digital-clock"
#define MyAppExeName "DigitalClock.Windows.exe"
#define MyScreenSaverName "AppsAndGames-DigitalClock.scr"

[Setup]
AppId={{36A3C11D-94A0-4E00-9E6F-DAA4C2B65A19}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
VersionInfoVersion={#MyAppVersion}.0
VersionInfoProductVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={localappdata}\AppsAndGames\Digital Clock
DefaultGroupName=Apps & Games
DisableProgramGroupPage=yes
OutputDir=..\publish\installer
OutputBaseFilename=DigitalClock-Setup-x64
SetupIconFile=..\favicon.ico
UninstallDisplayIcon={app}\{#MyAppExeName}
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
CloseApplications=yes
RestartApplications=no

[Languages]
Name: "hr"; MessagesFile: "languages\Croatian.isl"
Name: "en"; MessagesFile: "compiler:Default.isl"
Name: "de"; MessagesFile: "compiler:Languages\German.isl"
Name: "it"; MessagesFile: "compiler:Languages\Italian.isl"
Name: "es"; MessagesFile: "compiler:Languages\Spanish.isl"

[CustomMessages]
hr.ActivateScreenSaverTask=Aktiviraj Apps & Games Digital Clock čuvar zaslona nakon instalacije
en.ActivateScreenSaverTask=Activate the Apps & Games Digital Clock Screen Saver after installation
de.ActivateScreenSaverTask=Apps & Games Digital Clock-Bildschirmschoner nach der Installation aktivieren
it.ActivateScreenSaverTask=Attiva lo screensaver Apps & Games Digital Clock dopo l'installazione
es.ActivateScreenSaverTask=Activar el protector de pantalla Apps & Games Digital Clock después de la instalación
hr.InstallingWebView2=Instaliranje Microsoft Edge WebView2 Runtimea...
en.InstallingWebView2=Installing Microsoft Edge WebView2 Runtime...
de.InstallingWebView2=Microsoft Edge WebView2 Runtime wird installiert...
it.InstallingWebView2=Installazione di Microsoft Edge WebView2 Runtime...
es.InstallingWebView2=Instalando Microsoft Edge WebView2 Runtime...
hr.LaunchDigitalClock=Pokreni Digital Clock
en.LaunchDigitalClock=Launch Digital Clock
de.LaunchDigitalClock=Digital Clock starten
it.LaunchDigitalClock=Avvia Digital Clock
es.LaunchDigitalClock=Iniciar Digital Clock

[Tasks]
Name: "activateScreensaver"; Description: "{cm:ActivateScreenSaverTask}"; Flags: unchecked

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{#SourceDir}\{#MyAppExeName}"; DestDir: "{app}"; DestName: "{#MyScreenSaverName}"; Flags: ignoreversion
Source: "prerequisites\MicrosoftEdgeWebView2Setup.exe"; DestDir: "{tmp}"; DestName: "MicrosoftEdgeWebView2Setup.exe"; Flags: ignoreversion deleteafterinstall

[Icons]
Name: "{group}\Digital Clock"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Uninstall Digital Clock"; Filename: "{uninstallexe}"

[UninstallDelete]
Type: files; Name: "{app}\previous-screensaver-path.txt"
Type: files; Name: "{app}\previous-screensaver-active.txt"
Type: filesandordirs; Name: "{app}\DigitalClock.Windows.exe.WebView2"

[Run]
Filename: "{tmp}\MicrosoftEdgeWebView2Setup.exe"; Parameters: "/silent /install"; StatusMsg: "{cm:InstallingWebView2}"; Flags: waituntilterminated
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchDigitalClock}"; Flags: nowait postinstall skipifsilent

[Code]
const
  ScreenSaverRegistryKey = 'Control Panel\Desktop';
  ScreenSaverValueName = 'SCRNSAVE.EXE';
  PreviousScreenSaverFileName = 'previous-screensaver-path.txt';
  PreviousScreenSaverActiveFileName = 'previous-screensaver-active.txt';
  MissingRegistryValueMarker = '<missing>';

function InstalledScreenSaverPath(): String;
begin
  Result := ExpandConstant('{app}\{#MyScreenSaverName}');
end;

function PreviousScreenSaverPathFile(): String;
begin
  Result := ExpandConstant('{app}\' + PreviousScreenSaverFileName);
end;

function PreviousScreenSaverActiveFile(): String;
begin
  Result := ExpandConstant('{app}\' + PreviousScreenSaverActiveFileName);
end;

function LoadSavedPreviousScreenSaverPath(): String;
var
  SavedAnsi: AnsiString;
begin
  Result := '';
  SavedAnsi := '';
  if LoadStringFromFile(PreviousScreenSaverPathFile(), SavedAnsi) then
    Result := String(SavedAnsi);
end;

procedure SavePreviousScreenSaverActiveState();
var
  CurrentPath: String;
  CurrentActive: String;
  SavedPreviousPath: String;
begin
  if FileExists(PreviousScreenSaverActiveFile()) then
    exit;

  CurrentPath := '';
  RegQueryStringValue(HKCU, ScreenSaverRegistryKey, ScreenSaverValueName, CurrentPath);

  if CompareText(CurrentPath, InstalledScreenSaverPath()) = 0 then
  begin
    { Migration from an older installer that did not save ScreenSaveActive.
      If there was no previous saver path, restore the disabled state on uninstall.
      If there was a previous saver, the safest legacy fallback is active. }
    SavedPreviousPath := LoadSavedPreviousScreenSaverPath();
    if SavedPreviousPath = '' then
      SaveStringToFile(PreviousScreenSaverActiveFile(), '0', False)
    else
      SaveStringToFile(PreviousScreenSaverActiveFile(), '1', False);
  end
  else if RegQueryStringValue(HKCU, ScreenSaverRegistryKey, 'ScreenSaveActive', CurrentActive) then
    SaveStringToFile(PreviousScreenSaverActiveFile(), CurrentActive, False)
  else
    SaveStringToFile(PreviousScreenSaverActiveFile(), MissingRegistryValueMarker, False);
end;

procedure ActivateScreenSaver();
var
  PreviousPath: String;
  SavedPreviousPath: String;
  SavedPreviousPathAnsi: AnsiString;
begin
  { Preserve the original Screen Saver across reinstall/upgrade. }
  if FileExists(PreviousScreenSaverPathFile()) then
  begin
    SavedPreviousPath := '';
    SavedPreviousPathAnsi := '';
    if LoadStringFromFile(PreviousScreenSaverPathFile(), SavedPreviousPathAnsi) then
      SavedPreviousPath := String(SavedPreviousPathAnsi);

    { A previous buggy reinstall may have saved our own .scr as the previous saver.
      Treat that as no previous saver so uninstall never restores a dead path. }
    if CompareText(SavedPreviousPath, InstalledScreenSaverPath()) = 0 then
      SaveStringToFile(PreviousScreenSaverPathFile(), '', False);
  end
  else
  begin
    if RegQueryStringValue(HKCU, ScreenSaverRegistryKey, ScreenSaverValueName, PreviousPath) then
    begin
      if CompareText(PreviousPath, InstalledScreenSaverPath()) <> 0 then
        SaveStringToFile(PreviousScreenSaverPathFile(), PreviousPath, False)
      else
        SaveStringToFile(PreviousScreenSaverPathFile(), '', False);
    end
    else
      SaveStringToFile(PreviousScreenSaverPathFile(), '', False);
  end;

  SavePreviousScreenSaverActiveState();

  RegWriteStringValue(HKCU, ScreenSaverRegistryKey, ScreenSaverValueName, InstalledScreenSaverPath());
  RegWriteStringValue(HKCU, ScreenSaverRegistryKey, 'ScreenSaveActive', '1');
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if (CurStep = ssPostInstall) and WizardIsTaskSelected('activateScreensaver') then
    ActivateScreenSaver();
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  CurrentPath: String;
  PreviousPath: String;
  PreviousPathAnsi: AnsiString;
  PreviousActive: String;
  PreviousActiveAnsi: AnsiString;
begin
  if CurUninstallStep <> usUninstall then
    exit;

  if not RegQueryStringValue(HKCU, ScreenSaverRegistryKey, ScreenSaverValueName, CurrentPath) then
    exit;

  if CompareText(CurrentPath, InstalledScreenSaverPath()) <> 0 then
    exit;

  PreviousPath := '';
  PreviousPathAnsi := '';
  if LoadStringFromFile(PreviousScreenSaverPathFile(), PreviousPathAnsi) then
    PreviousPath := String(PreviousPathAnsi);

  if PreviousPath <> '' then
    RegWriteStringValue(HKCU, ScreenSaverRegistryKey, ScreenSaverValueName, PreviousPath)
  else
    RegDeleteValue(HKCU, ScreenSaverRegistryKey, ScreenSaverValueName);

  PreviousActive := '';
  PreviousActiveAnsi := '';
  if LoadStringFromFile(PreviousScreenSaverActiveFile(), PreviousActiveAnsi) then
    PreviousActive := String(PreviousActiveAnsi);

  if PreviousActive = MissingRegistryValueMarker then
    RegDeleteValue(HKCU, ScreenSaverRegistryKey, 'ScreenSaveActive')
  else if PreviousActive <> '' then
    RegWriteStringValue(HKCU, ScreenSaverRegistryKey, 'ScreenSaveActive', PreviousActive)
  else if PreviousPath = '' then
    RegWriteStringValue(HKCU, ScreenSaverRegistryKey, 'ScreenSaveActive', '0');
end;
