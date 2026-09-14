using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Text.Json;
using Microsoft.Win32;

namespace DigitalClock.Windows;

internal sealed record WindowsHostState(bool StartWithWindows, bool KeepDisplayAwake);

internal sealed class WindowsHostPreferencesService : IDisposable
{
    private const string RunKeyPath = @"Software\Microsoft\Windows\CurrentVersion\Run";
    private const string RunValueName = "AppsAndGamesDigitalClock";
    private const uint EsContinuous = 0x80000000;
    private const uint EsDisplayRequired = 0x00000002;

    private readonly string _settingsPath;
    private HostPreferences _preferences;
    private bool _bedsideModeAwake;

    public WindowsHostPreferencesService()
    {
        string directory = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "AppsAndGames",
            "DigitalClock"
        );

        _settingsPath = Path.Combine(directory, "windows-host-preferences.json");
        _preferences = LoadPreferences();

        ApplyDisplayAwakeState(IsDisplayAwakeRequested());
    }

    public WindowsHostState GetState() => new(
        IsStartWithWindowsEnabled(),
        _preferences.KeepDisplayAwake
    );

    public bool SetStartWithWindows(bool enabled)
    {
        string executablePath = Path.Combine(AppContext.BaseDirectory, "DigitalClock.Windows.exe");

        if (!File.Exists(executablePath))
        {
            throw new InvalidOperationException("Digital Clock executable was not found.");
        }

        using RegistryKey? key = Registry.CurrentUser.CreateSubKey(RunKeyPath);
        if (key is null)
        {
            throw new InvalidOperationException("Windows startup settings are unavailable.");
        }

        if (enabled)
        {
            key.SetValue(RunValueName, $"\"{executablePath}\"");
        }
        else
        {
            key.DeleteValue(RunValueName, false);
        }

        return IsStartWithWindowsEnabled() == enabled;
    }

    public bool SetKeepDisplayAwake(bool enabled)
    {
        _preferences.KeepDisplayAwake = enabled;
        ApplyDisplayAwakeState(IsDisplayAwakeRequested());
        SavePreferences();
        return _preferences.KeepDisplayAwake;
    }

    public void SetBedsideMode(bool enabled)
    {
        _bedsideModeAwake = enabled;
        ApplyDisplayAwakeState(IsDisplayAwakeRequested());
    }

    public void Dispose()
    {
        _bedsideModeAwake = false;
        ApplyDisplayAwakeState(false);
    }

    private bool IsStartWithWindowsEnabled()
    {
        using RegistryKey? key = Registry.CurrentUser.OpenSubKey(RunKeyPath, writable: false);
        return key?.GetValue(RunValueName) is string;
    }

    private bool IsDisplayAwakeRequested() => _preferences.KeepDisplayAwake || _bedsideModeAwake;

    private static void ApplyDisplayAwakeState(bool enabled)
    {
        uint flags = enabled
            ? EsContinuous | EsDisplayRequired
            : EsContinuous;

        SetThreadExecutionState(flags);
    }

    private HostPreferences LoadPreferences()
    {
        try
        {
            if (File.Exists(_settingsPath))
            {
                return JsonSerializer.Deserialize<HostPreferences>(File.ReadAllText(_settingsPath)) ?? new HostPreferences();
            }
        }
        catch (JsonException)
        {
            // A corrupt preferences file should not prevent the clock from starting.
        }
        catch (IOException)
        {
            // The feature is optional if the file cannot be read.
        }
        catch (UnauthorizedAccessException)
        {
            // The feature is optional if the file cannot be read.
        }

        return new HostPreferences();
    }

    private void SavePreferences()
    {
        try
        {
            string? directory = Path.GetDirectoryName(_settingsPath);
            if (!string.IsNullOrWhiteSpace(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(_settingsPath, JsonSerializer.Serialize(_preferences, new JsonSerializerOptions
            {
                WriteIndented = true
            }));
        }
        catch (IOException)
        {
            // The preference still applies until the application closes.
        }
        catch (UnauthorizedAccessException)
        {
            // The preference still applies until the application closes.
        }
    }

    [DllImport("kernel32.dll")]
    private static extern uint SetThreadExecutionState(uint executionState);

    private sealed class HostPreferences
    {
        public bool KeepDisplayAwake { get; set; }
    }
}
