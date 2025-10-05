# Disaster Images WebP Download Script
# This script helps download and convert disaster images from Freepik

Write-Host "🌍 Disaster Images Downloader (WebP)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Create directory
$imageDir = "..\public\disasters"

Write-Host "📁 Checking directory..." -ForegroundColor Yellow
if (!(Test-Path $imageDir)) {
    New-Item -ItemType Directory -Path $imageDir -Force | Out-Null
    Write-Host "✓ Created: $imageDir" -ForegroundColor Green
} else {
    Write-Host "✓ Directory exists: $imageDir" -ForegroundColor Gray
}

Write-Host ""
Write-Host "⚠️  MANUAL DOWNLOAD REQUIRED" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Freepik requires manual download with attribution." -ForegroundColor White
Write-Host "Please follow these steps for each disaster type:" -ForegroundColor White
Write-Host ""

$disasters = @(
    @{Name="Tsunami"; Query="tsunami wave disaster"; File="tsunami.webp"},
    @{Name="Wildfire"; Query="wildfire forest fire disaster"; File="wildfire.webp"},
    @{Name="Earthquake"; Query="earthquake building collapse disaster"; File="earthquake.webp"},
    @{Name="Hurricane"; Query="hurricane cyclone storm disaster"; File="hurricane.webp"},
    @{Name="Flood"; Query="flood water disaster"; File="flood.webp"},
    @{Name="Volcano"; Query="volcano eruption lava disaster"; File="volcano.webp"}
)

foreach ($disaster in $disasters) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "📸 $($disaster.Name)" -ForegroundColor Magenta
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Search URL:" -ForegroundColor Yellow
    Write-Host "   https://www.freepik.com/search?format=search&query=$($disaster.Query -replace ' ', '%20')&type=photo" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Download Steps:" -ForegroundColor Yellow
    Write-Host "   - Click on high-quality image (look for 5000x3333px)" -ForegroundColor Gray
    Write-Host "   - Click 'Download' button (Free or Premium)" -ForegroundColor Gray
    Write-Host "   - Save as JPG file" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Convert to WebP:" -ForegroundColor Yellow
    Write-Host "   - Use https://cloudconvert.com/jpg-to-webp" -ForegroundColor Gray
    Write-Host "   - OR use online tool: https://www.freeconvert.com/jpg-to-webp" -ForegroundColor Gray
    Write-Host "   - Set quality: 80%" -ForegroundColor Gray
    Write-Host "   - Resize to: 1200x800px" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Save as:" -ForegroundColor Yellow
    Write-Host "   public\disasters\$($disaster.File)" -ForegroundColor Green
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Pro Tip: Use PowerShell ImageMagick (if installed):" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Install ImageMagick first:" -ForegroundColor Gray
Write-Host "winget install ImageMagick.ImageMagick" -ForegroundColor White
Write-Host ""
Write-Host "# Then convert JPG to WebP:" -ForegroundColor Gray
Write-Host "magick convert input.jpg -resize 1200x800 -quality 80 output.webp" -ForegroundColor White
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Required Files:" -ForegroundColor Yellow
foreach ($disaster in $disasters) {
    $filePath = Join-Path $imageDir $disaster.File
    if (Test-Path $filePath) {
        $fileSize = [math]::Round((Get-Item $filePath).Length / 1KB, 0)
        Write-Host "   ✓ $($disaster.File) ($fileSize KB)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $($disaster.File) (missing)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "⚖️  Attribution Required (Free Images):" -ForegroundColor Yellow
Write-Host "Add to your app: 'Images from Freepik.com'" -ForegroundColor White
Write-Host ""
Write-Host "✨ Done! Follow the steps above to download images." -ForegroundColor Green
Write-Host ""
