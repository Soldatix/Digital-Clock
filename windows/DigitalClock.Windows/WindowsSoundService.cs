using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Windows.Media;
using System.Windows.Threading;
using Microsoft.Win32;

namespace DigitalClock.Windows;

public sealed class WindowsSoundChoice
{
    public string Path { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

internal sealed class WindowsSoundService : IDisposable
{
    private const string AlarmChannel = "alarm";
    private const string TimerChannel = "timer";

    private readonly Dictionary<string, MediaPlayer> _players = new();
    private readonly Dictionary<string, DispatcherTimer> _previewTimers = new();
    private readonly HashSet<string> _loopingChannels = new();
    private readonly string _settingsPath;
    private SoundSelections _selections;

    public WindowsSoundService()
    {
        string directory = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "AppsAndGames",
            "DigitalClock"
        );

        _settingsPath = Path.Combine(directory, "windows-sounds.json");
        _selections = LoadSelections();
    }

    public object GetSelectedSoundNames() => new
    {
        alarm = _selections.Alarm?.Name,
        timer = _selections.Timer?.Name
    };

    public WindowsSoundChoice? Pick(string? channel)
    {
        string validatedChannel = ValidateChannel(channel);

        var dialog = new Microsoft.Win32.OpenFileDialog
        {
            Title = "Choose Digital Clock sound",
            CheckFileExists = true,
            Multiselect = false,
            Filter = "Audio files|*.wav;*.mp3;*.wma;*.m4a;*.aac|All files|*.*"
        };

        if (dialog.ShowDialog() != true)
        {
            return null;
        }

        var choice = new WindowsSoundChoice
        {
            Path = dialog.FileName,
            Name = Path.GetFileName(dialog.FileName)
        };

        if (validatedChannel == AlarmChannel)
        {
            _selections.Alarm = choice;
        }
        else
        {
            _selections.Timer = choice;
        }

        SaveSelections();
        return choice;
    }

    public bool Play(string? channel, bool preview)
    {
        string validatedChannel = ValidateChannel(channel);
        WindowsSoundChoice? choice = GetChoice(validatedChannel);

        if (choice is null || !File.Exists(choice.Path))
        {
            return false;
        }

        Stop(validatedChannel);

        var player = new MediaPlayer();
        _players[validatedChannel] = player;

        if (preview)
        {
            _loopingChannels.Remove(validatedChannel);
            var timer = new DispatcherTimer { Interval = TimeSpan.FromSeconds(5) };
            timer.Tick += (_, _) =>
            {
                timer.Stop();
                Stop(validatedChannel);
            };
            _previewTimers[validatedChannel] = timer;
            timer.Start();
        }
        else
        {
            _loopingChannels.Add(validatedChannel);
            player.MediaEnded += (_, _) =>
            {
                if (_loopingChannels.Contains(validatedChannel) &&
                    _players.TryGetValue(validatedChannel, out MediaPlayer? activePlayer) &&
                    ReferenceEquals(activePlayer, player))
                {
                    player.Position = TimeSpan.Zero;
                    player.Play();
                }
            };
        }

        player.Open(new Uri(choice.Path, UriKind.Absolute));
        player.Play();
        return true;
    }

    public void Stop(string? channel)
    {
        string validatedChannel = ValidateChannel(channel);
        _loopingChannels.Remove(validatedChannel);

        if (_previewTimers.Remove(validatedChannel, out DispatcherTimer? timer))
        {
            timer.Stop();
        }

        if (_players.Remove(validatedChannel, out MediaPlayer? player))
        {
            player.Stop();
            player.Close();
        }
    }

    public void Dispose()
    {
        Stop(AlarmChannel);
        Stop(TimerChannel);
    }

    private WindowsSoundChoice? GetChoice(string channel) =>
        channel == AlarmChannel ? _selections.Alarm : _selections.Timer;

    private static string ValidateChannel(string? channel) =>
        channel switch
        {
            AlarmChannel => AlarmChannel,
            TimerChannel => TimerChannel,
            _ => throw new InvalidOperationException("Unknown sound channel.")
        };

    private SoundSelections LoadSelections()
    {
        try
        {
            if (File.Exists(_settingsPath))
            {
                return JsonSerializer.Deserialize<SoundSelections>(File.ReadAllText(_settingsPath)) ?? new SoundSelections();
            }
        }
        catch (JsonException)
        {
            // A corrupt preference file should never stop the clock from starting.
        }
        catch (IOException)
        {
            // Preferences remain optional if storage is temporarily unavailable.
        }

        return new SoundSelections();
    }

    private void SaveSelections()
    {
        try
        {
            string? directory = Path.GetDirectoryName(_settingsPath);
            if (!string.IsNullOrWhiteSpace(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(_settingsPath, JsonSerializer.Serialize(_selections, new JsonSerializerOptions
            {
                WriteIndented = true
            }));
        }
        catch (IOException)
        {
            // The selection still works for the current session if persistence fails.
        }
        catch (UnauthorizedAccessException)
        {
            // The selection still works for the current session if persistence fails.
        }
    }

    private sealed class SoundSelections
    {
        public WindowsSoundChoice? Alarm { get; set; }
        public WindowsSoundChoice? Timer { get; set; }
    }
}
