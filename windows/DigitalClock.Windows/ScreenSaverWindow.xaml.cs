using System;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Windows;
using System.Windows.Interop;
using System.Windows.Threading;
using Microsoft.Web.WebView2.Core;

namespace DigitalClock.Windows;

public partial class ScreenSaverWindow : Window
{
    private const int GwlStyle = -16;
    private const long WsChild = 0x40000000L;
    private const long WsPopup = unchecked((long)0x80000000);
    private const uint SwpNoZOrder = 0x0004;
    private const uint SwpNoActivate = 0x0010;
    private const uint SwpShowWindow = 0x0040;

    private readonly Stopwatch _startupStopwatch = Stopwatch.StartNew();
    private readonly bool _isPreview;
    private readonly IntPtr _previewParentHandle;
    private readonly ClockAppearanceStore _appearanceStore = new();
    private readonly DispatcherTimer _inputMonitorTimer;
    private uint _initialLastInputTick;
    private bool _hasInitialLastInputTick;
    private bool _closeRequested;

    public ScreenSaverWindow(bool isPreview = false, IntPtr previewParentHandle = default)
    {
        _isPreview = isPreview;
        _previewParentHandle = previewParentHandle;
        InitializeComponent();

        _inputMonitorTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromMilliseconds(200)
        };
        _inputMonitorTimer.Tick += InputMonitorTimer_Tick;

        if (!_isPreview)
        {
            _hasInitialLastInputTick = TryGetLastInputTick(out _initialLastInputTick);
        }

        if (_isPreview)
        {
            WindowState = WindowState.Normal;
            WindowStartupLocation = WindowStartupLocation.Manual;
            ShowInTaskbar = false;
            Topmost = false;
            SourceInitialized += ScreenSaverWindow_SourceInitialized;
        }
        else
        {
            Topmost = true;
        }

        Loaded += ScreenSaverWindow_Loaded;
        Closed += ScreenSaverWindow_Closed;
    }

    private void ScreenSaverWindow_SourceInitialized(object? sender, EventArgs e)
    {
        if (_previewParentHandle == IntPtr.Zero)
        {
            return;
        }

        IntPtr windowHandle = new WindowInteropHelper(this).Handle;
        SetParent(windowHandle, _previewParentHandle);

        long style = GetWindowStyle(windowHandle);
        SetWindowStyle(windowHandle, (style | WsChild) & ~WsPopup);

        if (GetClientRect(_previewParentHandle, out Rect previewRect))
        {
            SetWindowPos(
                windowHandle,
                IntPtr.Zero,
                0,
                0,
                previewRect.Right - previewRect.Left,
                previewRect.Bottom - previewRect.Top,
                SwpNoZOrder | SwpNoActivate | SwpShowWindow
            );
        }
    }

    private async void ScreenSaverWindow_Loaded(object sender, RoutedEventArgs e)
    {
        string userDataFolder = _isPreview
            ? AppDataPaths.DesktopWebView2Directory
            : AppDataPaths.ScreenSaverWebView2Directory;
        string stage = "Create environment";
        CoreWebView2Environment? webViewEnvironment = null;
        try
        {
            webViewEnvironment = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
            if (_closeRequested) return;
            stage = "Create controller";
            await ScreenSaverWebView.EnsureCoreWebView2Async(webViewEnvironment);
            if (_closeRequested) return;
            stage = "Inject appearance";
            string appearanceJson = _appearanceStore.Read() ?? "null";
            string saverJson = _appearanceStore.ReadScreenSaver() ?? "null";
            await ScreenSaverWebView.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync(
                $"window.__digitalClockScreenSaverSeed = {appearanceJson}; " +
                $"window.__digitalClockScreenSaverAppearance = {saverJson}; " +
                $"window.__digitalClockIsolatedScreenSaver = {(_isPreview ? "false" : "true")};"
            );
            if (_closeRequested) return;
            stage = "Map web content and navigate";
            ScreenSaverWebView.CoreWebView2.WebMessageReceived += ScreenSaverWebView_WebMessageReceived;

            string webFolder = Path.Combine(AppContext.BaseDirectory, "Web");
            ScreenSaverWebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                "digitalclock.local",
                webFolder,
                CoreWebView2HostResourceAccessKind.Allow
            );

            ScreenSaverWebView.Source = new Uri("https://digitalclock.local/index.html?screenSaver=1");

            if (!_isPreview)
            {
                _inputMonitorTimer.Start();
            }
        }
        catch (Exception exception)
        {
            LogInitializationFailure(exception, stage, userDataFolder, webViewEnvironment);
            CloseScreenSaver();
        }
    }

    private void LogInitializationFailure(Exception exception, string stage, string requestedFolder, CoreWebView2Environment? environment)
    {
        try
        {
            string logDirectory = AppDataPaths.LogsDirectory;
            Directory.CreateDirectory(logDirectory);
            File.AppendAllText(Path.Combine(logDirectory, "screen-saver.log"),
                $"{DateTimeOffset.Now:O} Mode={(_isPreview ? "/p" : "/s")} PID={Environment.ProcessId} Stage={stage}\n" +
                $"RequestedFolder={requestedFolder}\nActualFolder={environment?.UserDataFolder}\nRuntime={environment?.BrowserVersionString}\n" +
                $"HRESULT=0x{exception.HResult:X8}\n{exception}\n\n");
        }
        catch (Exception loggingException)
        {
            Debug.WriteLine($"Screen saver initialization failed: {exception}; logging failed: {loggingException}");
        }
    }

    private void InputMonitorTimer_Tick(object? sender, EventArgs e)
    {
        if (_isPreview || _closeRequested || _startupStopwatch.ElapsedMilliseconds <= 1500)
        {
            return;
        }

        if (!TryGetLastInputTick(out uint currentLastInputTick))
        {
            return;
        }

        if (!_hasInitialLastInputTick)
        {
            _initialLastInputTick = currentLastInputTick;
            _hasInitialLastInputTick = true;
            return;
        }

        if (currentLastInputTick != _initialLastInputTick)
        {
            CloseScreenSaver();
        }
    }

    private void ScreenSaverWindow_Closed(object? sender, EventArgs e)
    {
        _closeRequested = true;
        _inputMonitorTimer.Stop();
        ScreenSaverWebView.Dispose();
    }

    private void ScreenSaverWebView_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        try
        {
            using JsonDocument message = JsonDocument.Parse(e.WebMessageAsJson);
            if (message.RootElement.TryGetProperty("action", out JsonElement action) &&
                action.ValueKind == JsonValueKind.String &&
                action.GetString() == "exitScreenSaver")
            {
                CloseScreenSaver();
            }
        }
        catch (JsonException)
        {
            // Ignore malformed web messages from the hosted page.
        }
    }

    private void CloseScreenSaver()
    {
        if (_closeRequested)
        {
            return;
        }

        _closeRequested = true;
        Close();
    }

    private static bool TryGetLastInputTick(out uint tick)
    {
        var lastInputInfo = new LastInputInfo
        {
            CbSize = (uint)Marshal.SizeOf<LastInputInfo>()
        };

        if (GetLastInputInfo(ref lastInputInfo))
        {
            tick = lastInputInfo.DwTime;
            return true;
        }

        tick = 0;
        return false;
    }

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool GetLastInputInfo(ref LastInputInfo lastInputInfo);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SetParent(IntPtr childWindow, IntPtr newParent);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool GetClientRect(IntPtr windowHandle, out Rect clientRect);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool SetWindowPos(
        IntPtr windowHandle,
        IntPtr insertAfter,
        int x,
        int y,
        int width,
        int height,
        uint flags
    );

    [DllImport("user32.dll", EntryPoint = "GetWindowLongPtr", SetLastError = true)]
    private static extern IntPtr GetWindowLongPtr64(IntPtr windowHandle, int index);

    [DllImport("user32.dll", EntryPoint = "SetWindowLongPtr", SetLastError = true)]
    private static extern IntPtr SetWindowLongPtr64(IntPtr windowHandle, int index, IntPtr value);

    private static long GetWindowStyle(IntPtr windowHandle) => IntPtr.Size == 8
        ? GetWindowLongPtr64(windowHandle, GwlStyle).ToInt64()
        : GetWindowLong32(windowHandle, GwlStyle);

    private static void SetWindowStyle(IntPtr windowHandle, long value)
    {
        if (IntPtr.Size == 8)
        {
            SetWindowLongPtr64(windowHandle, GwlStyle, new IntPtr(value));
        }
        else
        {
            SetWindowLong32(windowHandle, GwlStyle, unchecked((int)value));
        }
    }

    [DllImport("user32.dll", EntryPoint = "GetWindowLong", SetLastError = true)]
    private static extern int GetWindowLong32(IntPtr windowHandle, int index);

    [DllImport("user32.dll", EntryPoint = "SetWindowLong", SetLastError = true)]
    private static extern int SetWindowLong32(IntPtr windowHandle, int index, int value);

    [StructLayout(LayoutKind.Sequential)]
    private struct LastInputInfo
    {
        public uint CbSize;
        public uint DwTime;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct Rect
    {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }
}
