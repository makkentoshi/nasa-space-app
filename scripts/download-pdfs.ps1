# Emergency Safety Guides PDF Download Script
# Downloads 18 international emergency PDF guides from official sources

Write-Host "Emergency Safety Guides Downloader" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Create directory structure
$baseDir = "..\public\safety-guides"
$directories = @(
    "$baseDir\first-aid",
    "$baseDir\earthquake",
    "$baseDir\tsunami",
    "$baseDir\wildfire",
    "$baseDir\flood",
    "$baseDir\hurricane",
    "$baseDir\emergency-planning"
)

Write-Host "Creating directories..." -ForegroundColor Yellow
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "Exists: $dir" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Downloading PDF files..." -ForegroundColor Yellow
Write-Host ""

# Download counter
$totalFiles = 0
$successCount = 0
$failedFiles = @()

# Function to download with progress
function Download-SafetyGuide {
    param(
        [string]$Url,
        [string]$OutputPath,
        [string]$Name
    )
    
    $script:totalFiles++
    
    Write-Host "[$script:totalFiles] Downloading: $Name" -ForegroundColor Cyan
    
    try {
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $Url -OutFile $OutputPath -UseBasicParsing -TimeoutSec 60
        
        if ((Test-Path $OutputPath) -and ((Get-Item $OutputPath).Length -gt 1KB)) {
            $fileSize = [math]::Round((Get-Item $OutputPath).Length / 1MB, 2)
            Write-Host "   Success! Size: $fileSize MB" -ForegroundColor Green
            $script:successCount++
        } else {
            Write-Host "   Failed: File too small" -ForegroundColor Red
            $script:failedFiles += $Name
        }
    } catch {
        Write-Host "   Failed: $($_.Exception.Message)" -ForegroundColor Red
        $script:failedFiles += $Name
    }
    
    Write-Host ""
}

# FIRST AID GUIDES
Write-Host "First Aid Guides" -ForegroundColor Magenta

Download-SafetyGuide -Url "https://www.redcross.org/content/dam/redcross/atg/PDF_s/Health___Safety_Services/Training/pdf/First-Aid-CPR-AED_PM.pdf" -OutputPath "$baseDir\first-aid\red-cross-first-aid-basics.pdf" -Name "Red Cross First Aid Basics"

Download-SafetyGuide -Url "https://www.ifrc.org/sites/default/files/2021-07/IFRC-First-Aid-Training-Manual-English.pdf" -OutputPath "$baseDir\first-aid\ifrc-first-aid-training-manual.pdf" -Name "IFRC First Aid Training Manual"

Download-SafetyGuide -Url "https://cpr.heart.org/-/media/cpr-files/resources/heartsaver-first-aid-cpr-aed-quick-reference-guide.pdf" -OutputPath "$baseDir\first-aid\aha-cpr-quick-reference.pdf" -Name "AHA CPR Quick Reference"

# EARTHQUAKE GUIDES
Write-Host "Earthquake Guides" -ForegroundColor Magenta

Download-SafetyGuide -Url "https://www.fema.gov/sites/default/files/documents/fema_earthquake-safety-checklist_2021.pdf" -OutputPath "$baseDir\earthquake\fema-earthquake-safety.pdf" -Name "FEMA Earthquake Safety"

Download-SafetyGuide -Url "https://www.redcross.org/content/dam/redcross/atg/PDF_s/Preparedness___Disaster_Recovery/Disaster_Preparedness/Earthquake/Earthquake.pdf" -OutputPath "$baseDir\earthquake\red-cross-earthquake-preparedness.pdf" -Name "Red Cross Earthquake Preparedness"

# TSUNAMI GUIDES
Write-Host "Tsunami Guides" -ForegroundColor Magenta

Download-SafetyGuide -Url "https://www.tsunami.gov/sites/default/files/2023-07/TsunamiPreparedness-2023.pdf" -OutputPath "$baseDir\tsunami\noaa-tsunami-preparedness.pdf" -Name "NOAA Tsunami Preparedness"

# WILDFIRE GUIDES
Write-Host "Wildfire Guides" -ForegroundColor Magenta

Download-SafetyGuide -Url "https://www.ready.gov/sites/default/files/2020-11/ready_wildfires.pdf" -OutputPath "$baseDir\wildfire\ready-wildfire-preparedness.pdf" -Name "Ready.gov Wildfire Preparedness"

Download-SafetyGuide -Url "https://www.fire.ca.gov/media/5584/2021_readyforwildfire_guide_web.pdf" -OutputPath "$baseDir\wildfire\calfire-wildfire-safety.pdf" -Name "Cal Fire Wildfire Safety"

# FLOOD GUIDES
Write-Host "Flood Guides" -ForegroundColor Magenta

Download-SafetyGuide -Url "https://www.fema.gov/sites/default/files/documents/fema_flood-safety-tips-and-resources_2021.pdf" -OutputPath "$baseDir\flood\fema-flood-safety.pdf" -Name "FEMA Flood Safety"

Download-SafetyGuide -Url "https://www.redcross.org/content/dam/redcross/atg/PDF_s/Preparedness___Disaster_Recovery/Disaster_Preparedness/Flood/Flood.pdf" -OutputPath "$baseDir\flood\red-cross-flood-preparedness.pdf" -Name "Red Cross Flood Preparedness"

# HURRICANE GUIDES
Write-Host "Hurricane Guides" -ForegroundColor Magenta

Download-SafetyGuide -Url "https://www.fema.gov/sites/default/files/documents/fema_hurricane-safety-tips_2021.pdf" -OutputPath "$baseDir\hurricane\fema-hurricane-safety.pdf" -Name "FEMA Hurricane Safety"

Download-SafetyGuide -Url "https://www.nhc.noaa.gov/prepare/ready.pdf" -OutputPath "$baseDir\hurricane\noaa-hurricane-preparedness.pdf" -Name "NOAA Hurricane Preparedness"

# EMERGENCY PLANNING
Write-Host "Emergency Planning" -ForegroundColor Magenta

Download-SafetyGuide -Url "https://www.ready.gov/sites/default/files/2020-03/ready_family-emergency-plan.pdf" -OutputPath "$baseDir\emergency-planning\fema-family-emergency-plan.pdf" -Name "FEMA Family Emergency Plan"

Download-SafetyGuide -Url "https://www.redcross.org/content/dam/redcross/atg/PDF_s/Preparedness___Disaster_Recovery/Disaster_Preparedness/Home_Preparedness_Checklist.pdf" -OutputPath "$baseDir\emergency-planning\red-cross-emergency-checklist.pdf" -Name "Red Cross Emergency Checklist"

Download-SafetyGuide -Url "https://www.ready.gov/sites/default/files/2020-03/ready_checklist.pdf" -OutputPath "$baseDir\emergency-planning\ready-emergency-supply-list.pdf" -Name "Ready.gov Emergency Supply List"

# SUMMARY
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Download Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Files:    $totalFiles" -ForegroundColor White
Write-Host "Successful:     $successCount" -ForegroundColor Green
Write-Host "Failed:         $($totalFiles - $successCount)" -ForegroundColor Red
Write-Host ""

if ($failedFiles.Count -gt 0) {
    Write-Host "Failed Downloads:" -ForegroundColor Red
    foreach ($file in $failedFiles) {
        Write-Host "  - $file" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Some files failed. Check URLs or try again later." -ForegroundColor Yellow
} else {
    Write-Host "All files downloaded successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Files saved to: public\safety-guides\" -ForegroundColor Cyan

# Calculate total size
$totalSize = 0
Get-ChildItem -Path $baseDir -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
    $totalSize += $_.Length
}
if ($totalSize -gt 0) {
    $totalSizeMB = [math]::Round($totalSize / 1MB, 2)
    Write-Host "Total Size: $totalSizeMB MB" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Done! PDFs are ready to use in your app." -ForegroundColor Green
Write-Host ""
