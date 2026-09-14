using System;
using System.IO;
using System.Text.Json;

namespace DigitalClock.Windows;

internal sealed class ClockAppearanceStore
{
    private readonly string _settingsPath;

    public ClockAppearanceStore()
    {
        _settingsPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "AppsAndGames",
            "DigitalClock",
            "clock-appearance.json"
        );
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
    {
        try
        {
            if (!File.Exists(_settingsPath))
            {
                return null;
            }

            string json = File.ReadAllText(_settingsPath);
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
