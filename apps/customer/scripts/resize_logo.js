const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\3834114b-0528-43f1-bc70-77971499ef58\\media__1780645322488.png';
const androidDest = 'c:\\laragon\\www\\mybinaara\\apps\\customer\\android\\app\\src\\main\\res\\drawable\\splash_logo.png';
const iosDestDir = 'c:\\laragon\\www\\mybinaara\\apps\\customer\\ios\\App\\App\\Assets.xcassets\\Splash.imageset';

const iosFiles = [
  'Default@1x~universal~anyany.png',
  'Default@2x~universal~anyany.png',
  'Default@3x~universal~anyany.png',
  'Default@1x~universal~anyany-dark.png',
  'Default@2x~universal~anyany-dark.png',
  'Default@3x~universal~anyany-dark.png',
  'splash-2732x2732.png',
  'splash-2732x2732-1.png',
  'splash-2732x2732-2.png'
];

const psScript = `
Add-Type -AssemblyName System.Drawing
$srcImg = [System.Drawing.Image]::FromFile('${srcPath}')
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
$newImg.Save('${androidDest}', [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$newImg.Dispose()
$srcImg.Dispose()
`;

try {
  // Execute PowerShell script to resize and save to Android
  fs.writeFileSync('c:\\laragon\\www\\mybinaara\\apps\\customer\\scripts\\temp_resize.ps1', psScript);
  execSync('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe -ExecutionPolicy Bypass -File c:\\laragon\\www\\mybinaara\\apps\\customer\\scripts\\temp_resize.ps1');
  
  // Copy the resized image to iOS assets
  if (fs.existsSync(androidDest) && fs.existsSync(iosDestDir)) {
    iosFiles.forEach(file => {
      const dest = path.join(iosDestDir, file);
      fs.copyFileSync(androidDest, dest);
      console.log(`Copied resized splash logo to iOS: ${file}`);
    });
    fs.writeFileSync('c:\\laragon\\www\\mybinaara\\apps\\customer\\scripts\\resize_status.txt', 'SUCCESS');
  } else {
    fs.writeFileSync('c:\\laragon\\www\\mybinaara\\apps\\customer\\scripts\\resize_status.txt', 'ERROR: Android resized file or iOS destination dir not found.');
  }
} catch (e) {
  fs.writeFileSync('c:\\laragon\\www\\mybinaara\\apps\\customer\\scripts\\resize_status.txt', 'ERROR: ' + e.message + '\n' + e.stack);
}
