# Writes a blurred copy of each photo wallpaper to src/img/wallpapers/blur/.
# Tiles and scenes paint it under their tint for the frosted-glass look,
# because a live CSS blur (backdrop-filter) is too slow on the TV.
# Run it again after adding or changing a photo.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$dir = Join-Path (Split-Path -Parent $PSScriptRoot) 'src\img\wallpapers'
$outDir = Join-Path $dir 'blur'
New-Item -ItemType Directory -Force $outDir | Out-Null

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]85)

# Mirrored edges, so resizing doesn't darken the borders.
$edges = New-Object System.Drawing.Imaging.ImageAttributes
$edges.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)

function Resize($img, $w, $h, $mode) {
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = $mode
    $g.PixelOffsetMode = 'HighQuality'
    $dest = New-Object System.Drawing.Rectangle 0, 0, $w, $h
    $g.DrawImage($img, $dest, 0, 0, $img.Width, $img.Height, [System.Drawing.GraphicsUnit]::Pixel, $edges)
    $g.Dispose()
    $bmp
}

# Shrinking in steps to 64x36 averages the photo into soft patches; growing
# it back in small bilinear steps smooths them out without blocky edges.
# The TV stretches the 384x216 result to full screen, which looks like a
# blur of about 30px.
$sizes = @(
    @(480, 270, 'HighQualityBicubic'), @(160, 90, 'HighQualityBicubic'), @(64, 36, 'HighQualityBicubic'),
    @(96, 54, 'HighQualityBilinear'), @(144, 81, 'HighQualityBilinear'), @(216, 122, 'HighQualityBilinear'),
    @(288, 162, 'HighQualityBilinear'), @(384, 216, 'HighQualityBilinear')
)
Get-ChildItem $dir -Filter *.jpg | ForEach-Object {
    $steps = @([System.Drawing.Image]::FromFile($_.FullName))
    try {
        foreach ($size in $sizes) {
            $steps += Resize $steps[-1] $size[0] $size[1] $size[2]
        }
        $out = Join-Path $outDir $_.Name
        $steps[-1].Save($out, $codec, $params)
        "{0,-8} {1,4} KB" -f $_.BaseName, [int]((Get-Item $out).Length / 1KB)
    }
    finally {
        $steps | ForEach-Object { $_.Dispose() }
    }
}
