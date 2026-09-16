using System;
using System.Runtime.InteropServices;

namespace DigitalClock.Windows;

internal static class WindowsPackageIdentity
{
    private const int ErrorInsufficientBuffer = 122;

    public static bool HasPackageIdentity
    {
        get
        {
            int length = 0;
            int result = GetCurrentPackageFullName(ref length, IntPtr.Zero);
            return result == ErrorInsufficientBuffer;
        }
    }

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetCurrentPackageFullName(
        ref int packageFullNameLength,
        IntPtr packageFullName);
}
