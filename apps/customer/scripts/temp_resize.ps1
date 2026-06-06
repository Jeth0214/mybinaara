
Add-Type -AssemblyName System.Drawing
$srcImg = [System.Drawing.Image]::FromFile('C:\Users\ACER\.gemini\antigravity-ide\brain\3834114b-0528-43f1-bc70-77971499ef58\media__1780645322488.png')
$newImg = New-Object System.Drawing.Bitmap(500, 500)
$g = [System.Drawing.Graphics]::FromImage($newImg)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)

# Scale to 60% (300px) and center
$size = 300
$x = (500 - $size) / 2
$y = (500 - $size) / 2

$g.DrawImage($srcImg, $x, $y, $size, $size)
$newImg.Save('c:\laragon\www\mybinaara\apps\customer\android\app\src\main\res\drawable\splash_logo.png', [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$newImg.Dispose()
$srcImg.Dispose()
