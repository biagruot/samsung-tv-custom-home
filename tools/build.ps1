# Packs src/ into dist/quick-home.wgt. The package is unsigned on purpose:
# Apps2Samsung signs it with your Samsung certificate while installing.
#
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File tools\build.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root 'src'
$dist = Join-Path $root 'dist'
$out = Join-Path $dist 'quick-home.wgt'

if (-not (Test-Path (Join-Path $src 'icon.png'))) {
    & (Join-Path $PSScriptRoot 'make-icon.ps1')
}

New-Item -ItemType Directory -Force $dist | Out-Null
if (Test-Path $out) { Remove-Item $out }

$zip = [System.IO.Compression.ZipFile]::Open($out, 'Create')
try {
    Get-ChildItem $src -Recurse -File | Where-Object { -not $_.Name.StartsWith('.') } | ForEach-Object {
        # Forward slashes: the TV unpacks on Linux, where backslashes are not folder separators.
        $entry = $_.FullName.Substring($src.Length + 1).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $entry, 'Optimal') | Out-Null
    }
}
finally {
    $zip.Dispose()
}

"Built $out"
