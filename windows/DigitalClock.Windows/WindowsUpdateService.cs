using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace DigitalClock.Windows;

internal sealed class WindowsUpdateService
{
    private const string ManifestUrl = "https://appsandgames.org/downloads/digital-clock/latest-windows.json";
    private static readonly HttpClient HttpClient = new()
    {
        Timeout = TimeSpan.FromSeconds(30)
    };

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public string CurrentVersion => FormatVersion(Assembly.GetExecutingAssembly().GetName().Version);

    public async Task<WindowsUpdateInfo> CheckForUpdatesAsync()
    {
        WindowsUpdateManifest manifest = await LoadManifestAsync();
        Version current = ParseVersion(CurrentVersion, "installed version");
        Version latest = ParseVersion(manifest.Version, "latest version");

        return new WindowsUpdateInfo(
            CurrentVersion,
            manifest.Version,
            latest > current,
            manifest.ReleaseNotesUrl ?? string.Empty
        );
    }

    public async Task<string> DownloadUpdateInstallerAsync()
    {
        WindowsUpdateManifest manifest = await LoadManifestAsync();
        Version current = ParseVersion(CurrentVersion, "installed version");
        Version latest = ParseVersion(manifest.Version, "latest version");

        if (latest <= current)
        {
            throw new InvalidOperationException("No newer Digital Clock version is available.");
        }

        Uri downloadUri = ValidateDownloadUri(manifest.DownloadUrl);
        string expectedHash = ValidateSha256(manifest.Sha256);
        string installerPath = Path.Combine(
            Path.GetTempPath(),
            $"DigitalClock-Setup-x64-{manifest.Version}.exe"
        );

        if (File.Exists(installerPath))
        {
            File.Delete(installerPath);
        }

        using HttpResponseMessage response = await HttpClient.GetAsync(
            downloadUri,
            HttpCompletionOption.ResponseHeadersRead
        );
        response.EnsureSuccessStatusCode();

        await using (Stream source = await response.Content.ReadAsStreamAsync())
        await using (var destination = new FileStream(
            installerPath,
            FileMode.CreateNew,
            FileAccess.Write,
            FileShare.None,
            81920,
            useAsync: true))
        {
            await source.CopyToAsync(destination);
        }

        string actualHash;
        await using (FileStream file = File.OpenRead(installerPath))
        {
            byte[] hash = await SHA256.HashDataAsync(file);
            actualHash = Convert.ToHexString(hash);
        }

        if (!actualHash.Equals(expectedHash, StringComparison.OrdinalIgnoreCase))
        {
            File.Delete(installerPath);
            throw new InvalidOperationException("The downloaded update failed the SHA-256 verification.");
        }

        return installerPath;
    }

    private static async Task<WindowsUpdateManifest> LoadManifestAsync()
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, ManifestUrl);
        request.Headers.CacheControl = new CacheControlHeaderValue
        {
            NoCache = true,
            NoStore = true
        };

        using HttpResponseMessage response = await HttpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        string json = await response.Content.ReadAsStringAsync();
        WindowsUpdateManifest? manifest = JsonSerializer.Deserialize<WindowsUpdateManifest>(json, JsonOptions);

        if (manifest is null ||
            string.IsNullOrWhiteSpace(manifest.Version) ||
            string.IsNullOrWhiteSpace(manifest.DownloadUrl) ||
            string.IsNullOrWhiteSpace(manifest.Sha256))
        {
            throw new InvalidOperationException("The update manifest is incomplete.");
        }

        ParseVersion(manifest.Version, "latest version");
        ValidateDownloadUri(manifest.DownloadUrl);
        ValidateSha256(manifest.Sha256);
        return manifest;
    }

    private static Uri ValidateDownloadUri(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out Uri? uri) ||
            uri.Scheme != Uri.UriSchemeHttps ||
            !uri.Host.Equals("downloads.appsandgames.org", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("The update download URL is not trusted.");
        }

        return uri;
    }

    private static string ValidateSha256(string value)
    {
        string hash = value.Trim();
        if (!Regex.IsMatch(hash, "^[A-Fa-f0-9]{64}$"))
        {
            throw new InvalidOperationException("The update SHA-256 value is invalid.");
        }

        return hash.ToUpperInvariant();
    }

    private static Version ParseVersion(string value, string label)
    {
        if (!Version.TryParse(value, out Version? version))
        {
            throw new InvalidOperationException($"Invalid {label}: {value}");
        }

        return version;
    }

    private static string FormatVersion(Version? version)
    {
        if (version is null)
        {
            return "0.0.0";
        }

        int build = Math.Max(version.Build, 0);
        return $"{version.Major}.{version.Minor}.{build}";
    }
}

internal sealed record WindowsUpdateInfo(
    [property: JsonPropertyName("currentVersion")] string CurrentVersion,
    [property: JsonPropertyName("latestVersion")] string LatestVersion,
    [property: JsonPropertyName("updateAvailable")] bool UpdateAvailable,
    [property: JsonPropertyName("releaseNotesUrl")] string ReleaseNotesUrl
);

internal sealed record WindowsUpdateManifest(
    [property: JsonPropertyName("version")] string Version,
    [property: JsonPropertyName("downloadUrl")] string DownloadUrl,
    [property: JsonPropertyName("sha256")] string Sha256,
    [property: JsonPropertyName("releaseNotesUrl")] string? ReleaseNotesUrl
);
