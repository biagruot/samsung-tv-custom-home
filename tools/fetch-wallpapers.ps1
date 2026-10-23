# Downloads the chosen Unsplash wallpapers from the CleanFrame repo and
# downscales each to 1920x1080 (cover-fit) so the package stays small.
# Photos are free to reuse under the Unsplash License; credits in
# src/img/wallpapers/CREDITS.txt.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$names = 'misty', 'cove', 'forest', 'night', 'peaks', 'ridge'
$base = 'https://raw.githubusercontent.com/nthnclrk/CleanFrame/main/app/assets/wallpapers/'

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root 'src\img\wallpapers'
# Keep raw downloads in their own folder, separate from our source.
$dlDir = Join-Path $env:TEMP 'qh-wallpaper-dl'
New-Item -ItemType Directory -Force $outDir | Out-Null
New-Item -ItemType Directory -Force $dlDir | Out-Null

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]82)

foreach ($n in $names) {
    $raw = Join-Path $dlDir "$n.jpg"
    Invoke-WebRequest -Uri "$base$n.jpg" -OutFile $raw -UseBasicParsing
    $img = [System.Drawing.Image]::FromFile($raw)
    try {
        $ratio = [Math]::Max(1920 / $img.Width, 1080 / $img.Height)
        $w = [int]($img.Width * $ratio)
        $h = [int]($img.Height * $ratio)
        $x = [int](( 1920 - $w) / 2)
        $y = [int]((1080 - $h) / 2)
        $bmp = New-Object System.Drawing.Bitmap 1920, 1080
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = 'HighQualityBicubic'
        $g.DrawImage($img, $x, $y, $w, $h)
        $out = Join-Path $outDir "$n.jpg"
        $bmp.Save($out, $codec, $params)
        $g.Dispose(); $bmp.Dispose()
        "{0,-8} {1,6} KB" -f $n, [int]((Get-Item $out).Length / 1KB)
    }
    finally {
        $img.Dispose()
    }
}
Remove-Item -Recurse -Force $dlDir
"total: " + [int](((Get-ChildItem $outDir -Filter *.jpg | Measure-Object Length -Sum).Sum) / 1KB) + " KB"
