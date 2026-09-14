using System;
using System.Globalization;
using System.IO;
using System.Text.Json;
using System.Windows;
using System.Windows.Input;
using Microsoft.Web.WebView2.Core;
using Forms = System.Windows.Forms;

namespace DigitalClock.Windows;

public partial class MainWindow : Window
{
    private readonly WindowsSoundService _soundService = new();
    private readonly WindowsHostPreferencesService _hostPreferences = new();
    private Forms.NotifyIcon? _trayIcon;
    private bool _exitRequested;
    private bool _bedsideMode;
    private WindowStyle _previousWindowStyle;
    private ResizeMode _previousResizeMode;
    private bool _previousTopmost;
    private WindowState _previousWindowState;

    public MainWindow()
    {
        InitializeComponent();
        Loaded += MainWindow_Loaded;
        Closing += MainWindow_Closing;
        PreviewKeyDown += MainWindow_PreviewKeyDown;
        Closed += (_, _) =>
        {
            _soundService.Dispose();
            _hostPreferences.Dispose();
            DisposeTrayIcon();
        };
    }

    private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        CreateTrayIcon();
        await ClockWebView.EnsureCoreWebView2Async();

        ClockWebView.CoreWebView2.WebMessageReceived += ClockWebView_WebMessageReceived;

        string webFolder = Path.Combine(AppContext.BaseDirectory, "Web");

        ClockWebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
            "digitalclock.local",
            webFolder,
            CoreWebView2HostResourceAccessKind.Allow
        );

        ClockWebView.Source = new Uri("https://digitalclock.local/index.html");
    }

    private void CreateTrayIcon()
    {
        if (_trayIcon is not null)
        {
            return;
        }

        var menu = new Forms.ContextMenuStrip();
        menu.Items.Add("Show Digital Clock", null, (_, _) => Dispatcher.Invoke(ShowFromTray));
        menu.Items.Add("Hide", null, (_, _) => Dispatcher.Invoke(Hide));
        menu.Items.Add("Exit Bedside Mode", null, (_, _) => Dispatcher.Invoke(ExitBedsideModeFromTray));
        menu.Items.Add(new Forms.ToolStripSeparator());
        menu.Items.Add("Exit", null, (_, _) => Dispatcher.Invoke(ExitApplication));

        _trayIcon = new Forms.NotifyIcon
        {
            Text = "Digital Clock",
            Icon = System.Drawing.SystemIcons.Application,
            ContextMenuStrip = menu,
            Visible = true
        };

        _trayIcon.DoubleClick += (_, _) => Dispatcher.Invoke(ShowFromTray);
    }

    private void MainWindow_Closing(object? sender, System.ComponentModel.CancelEventArgs e)
    {
        if (_exitRequested)
        {
            return;
        }

        e.Cancel = true;
        Hide();
        _trayIcon?.ShowBalloonTip(2000, "Digital Clock", "The clock is still running in the system tray.", Forms.ToolTipIcon.Info);
    }

    private void MainWindow_PreviewKeyDown(object sender, System.Windows.Input.KeyEventArgs e)
    {
        if (_bedsideMode && e.Key == Key.Escape)
        {
            SetBedsideMode(false);
            e.Handled = true;
        }
    }

    private void ShowFromTray()
    {
        Show();
        WindowState = WindowState.Normal;
        Activate();
    }

    private void ExitBedsideModeFromTray()
    {
        if (_bedsideMode)
        {
            SetBedsideMode(false);
        }

        ShowFromTray();
    }

    private void ExitApplication()
    {
        _exitRequested = true;
        DisposeTrayIcon();
        System.Windows.Application.Current.Shutdown();
    }

    private void DisposeTrayIcon()
    {
        if (_trayIcon is null)
        {
            return;
        }

        _trayIcon.Visible = false;
        _trayIcon.Dispose();
        _trayIcon = null;
    }

    private void SetBedsideMode(bool enabled)
    {
        if (_bedsideMode == enabled)
        {
            return;
        }

        _bedsideMode = enabled;
        _hostPreferences.SetBedsideMode(enabled);

        if (enabled)
        {
            _previousWindowStyle = WindowStyle;
            _previousResizeMode = ResizeMode;
            _previousTopmost = Topmost;
            _previousWindowState = WindowState;

            WindowState = WindowState.Normal;
            WindowStyle = WindowStyle.None;
            ResizeMode = ResizeMode.NoResize;
            Topmost = true;
            WindowState = WindowState.Maximized;
        }
        else
        {
            WindowState = WindowState.Normal;
            WindowStyle = _previousWindowStyle;
            ResizeMode = _previousResizeMode;
            Topmost = _previousTopmost;
            WindowState = _previousWindowState == WindowState.Minimized
                ? WindowState.Normal
                : _previousWindowState;
        }

        SendHostEvent("bedsideModeChanged", new { enabled = _bedsideMode });
    }

    private void ClockWebView_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        string? requestId = null;

        try
        {
            using JsonDocument document = JsonDocument.Parse(e.WebMessageAsJson);
            JsonElement root = document.RootElement;
            requestId = ReadString(root, "requestId");

            string? action = ReadString(root, "action");
            object? payload = action switch
            {
                "getHostInfo" => GetHostInfo(),
                "pickCustomSound" => PickCustomSound(ReadString(root, "channel")),
                "playCustomSound" => PlayCustomSound(
                    ReadString(root, "channel"),
                    root.TryGetProperty("preview", out JsonElement preview) && preview.GetBoolean()
                ),
                "stopCustomSound" => StopCustomSound(ReadString(root, "channel")),
                "setStartWithWindows" => SetStartWithWindows(ReadBoolean(root, "enabled")),
                "setKeepDisplayAwake" => SetKeepDisplayAwake(ReadBoolean(root, "enabled")),
                "setBedsideMode" => SetBedsideModeFromBridge(ReadBoolean(root, "enabled")),
                _ => throw new InvalidOperationException("Unsupported Windows bridge action.")
            };

            SendBridgeResponse(requestId, true, payload);
        }
        catch (Exception exception)
        {
            SendBridgeResponse(requestId, false, new { error = exception.Message });
        }
    }

    private object GetHostInfo()
    {
        WindowsHostState preferences = _hostPreferences.GetState();
        return new
        {
            language = GetSupportedWindowsLanguage(CultureInfo.CurrentUICulture.Name),
            customSounds = _soundService.GetSelectedSoundNames(),
            hostPreferences = new
            {
                startWithWindows = preferences.StartWithWindows,
                keepDisplayAwake = preferences.KeepDisplayAwake,
                bedsideMode = _bedsideMode
            }
        };
    }

    private object PickCustomSound(string? channel)
    {
        WindowsSoundChoice? choice = _soundService.Pick(channel);
        return choice is null
            ? new { cancelled = true }
            : new { name = choice.Name };
    }

    private object PlayCustomSound(string? channel, bool preview)
    {
        bool played = _soundService.Play(channel, preview);
        return new { played };
    }

    private object StopCustomSound(string? channel)
    {
        _soundService.Stop(channel);
        return new { stopped = true };
    }

    private object SetStartWithWindows(bool enabled)
    {
        return new { enabled = _hostPreferences.SetStartWithWindows(enabled) };
    }

    private object SetKeepDisplayAwake(bool enabled)
    {
        return new { enabled = _hostPreferences.SetKeepDisplayAwake(enabled) };
    }

    private object SetBedsideModeFromBridge(bool enabled)
    {
        SetBedsideMode(enabled);
        return new { enabled = _bedsideMode };
    }

    private void SendBridgeResponse(string? requestId, bool ok, object? payload)
    {
        if (ClockWebView.CoreWebView2 is null || string.IsNullOrWhiteSpace(requestId))
        {
            return;
        }

        ClockWebView.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(new
        {
            type = "windowsBridgeResponse",
            requestId,
            ok,
            payload
        }));
    }

    private void SendHostEvent(string eventName, object payload)
    {
        if (ClockWebView.CoreWebView2 is null)
        {
            return;
        }

        ClockWebView.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(new
        {
            type = "windowsHostEvent",
            eventName,
            payload
        }));
    }

    private static bool ReadBoolean(JsonElement root, string propertyName)
    {
        return root.TryGetProperty(propertyName, out JsonElement property) &&
               property.ValueKind is JsonValueKind.True or JsonValueKind.False &&
               property.GetBoolean();
    }

    private static string? ReadString(JsonElement root, string propertyName)
    {
        return root.TryGetProperty(propertyName, out JsonElement property) &&
               property.ValueKind == JsonValueKind.String
            ? property.GetString()
            : null;
    }

    private static string GetSupportedWindowsLanguage(string windowsLanguage)
    {
        string language = windowsLanguage.Split('-', StringSplitOptions.RemoveEmptyEntries)[0].ToLowerInvariant();
        return language is "hr" or "de" or "it" or "es" or "en" ? language : "en";
    }
}
