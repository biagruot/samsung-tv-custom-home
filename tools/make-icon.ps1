# Draws src/icon.png: a small copy of the four-tile layout, at the
# 512x423 size Samsung uses for Smart Hub icons.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$out = Join-Path (Split-Path -Parent $PSScriptRoot) 'src\icon.png'
$bmp = New-Object System.Drawing.Bitmap 512, 423
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.Clear([System.Drawing.Color]::FromArgb(11, 13, 18))

function Fill-Rounded($x, $y, $w, $h, $r, $hex) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $path.AddArc($x, $y, $d, $d, 180, 90)
    $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($hex))
    $g.FillPath($brush, $path)
    $brush.Dispose()
    $path.Dispose()
}

# Same proportions and colours as the tiles on screen.
Fill-Rounded 56 136 152 152 18 '#2b63f0'
Fill-Rounded 220 136 74 152 14 '#6a4bd8'
Fill-Rounded 306 136 74 152 14 '#ef3a2f'
Fill-Rounded 392 136 74 152 14 '#2c1d21'

$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
"Wrote $out"
