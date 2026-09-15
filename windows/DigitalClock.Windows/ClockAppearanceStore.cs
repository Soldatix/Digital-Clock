using System;
using System.IO;
using System.Text.Json;
using System.Threading;

namespace DigitalClock.Windows;

internal sealed class ClockAppearanceStore
{
    private readonly string _settingsPath;

    public ClockAppearanceStore()
    {
        _settingsPath = Path.Combine(AppDataPaths.RootDirectory, "clock-appearance.json");
    }

    public void Save(JsonElement settings)
    {
        string? directory = Path.GetDirectoryName(_settingsPath);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        File.WriteAllText(_settingsPath, settings.GetRawText());
    }

    public string? Read()
        => ReadObject(_settingsPath);

    private string ScreenSaverSettingsPath => Path.Combine(Path.GetDirectoryName(_settingsPath)!, "screen-saver-appearance.json");

    public string? ReadScreenSaver() => ReadObject(ScreenSaverSettingsPath);

    public void SaveScreenSaver(JsonElement settings, bool migrateOnly = false)
    {
        if (settings.ValueKind != JsonValueKind.Object)
            throw new ArgumentException("Screen saver appearance must be an object.", nameof(settings));

        // Serialize migration and explicit saves across the app and /c processes.
        using var mutex = new Mutex(false, AppDataPaths.ScreenSaverMutexName);
        bool acquired = false;
        try
        {
            try { acquired = mutex.WaitOne(TimeSpan.FromSeconds(5)); }
            catch (AbandonedMutexException) { acquired = true; }
            if (!acquired) throw new IOException("Timed out saving screen saver appearance.");
            if (migrateOnly && ReadScreenSaver() is not null) return;

            Directory.CreateDirectory(Path.GetDirectoryName(ScreenSaverSettingsPath)!);
            string temporaryPath = ScreenSaverSettingsPath + "." + Guid.NewGuid().ToString("N") + ".tmp";
            try
            {
                File.WriteAllText(temporaryPath, settings.GetRawText());
                File.Move(temporaryPath, ScreenSaverSettingsPath, overwrite: true);
            }
            finally
            {
                if (File.Exists(temporaryPath)) File.Delete(temporaryPath);
            }
        }
        finally
        {
            if (acquired) mutex.ReleaseMutex();
        }
    }

    private static string? ReadObject(string path)
    {
        try
        {
            if (!File.Exists(path))
            {
                return null;
            }

            string json = File.ReadAllText(path);
            using JsonDocument document = JsonDocument.Parse(json);
            return document.RootElement.ValueKind == JsonValueKind.Object ? json : null;
        }
        catch (JsonException)
        {
            return null;
        }
        catch (IOException)
        {
            return null;
        }
        catch (UnauthorizedAccessException)
        {
            return null;
        }
    }
}
