# 📜 Scripts Directory

This directory contains utility scripts for downloading emergency resources.

## 🚀 Available Scripts

### 1. Download PDF Safety Guides
**File:** `download-pdfs.ps1`

Downloads 18 international emergency PDF guides from official sources (FEMA, Red Cross, WHO, NOAA, etc.)

**Usage:**
```powershell
cd scripts
.\download-pdfs.ps1
```

**What it downloads:**
- 🏥 First Aid guides (Red Cross, IFRC, AHA) - 3 files
- 🏚️ Earthquake safety (FEMA, Red Cross) - 2 files
- 🌊 Tsunami preparedness (NOAA) - 1 file
- 🔥 Wildfire safety (Ready.gov, Cal Fire) - 2 files
- 💧 Flood preparedness (FEMA, Red Cross) - 2 files
- 🌀 Hurricane safety (FEMA, NOAA) - 2 files
- 📋 Emergency planning (FEMA, Red Cross, Ready.gov) - 3 files

**Total:** ~22 MB of official emergency guides

**Output:** `public/safety-guides/` (organized by category)

---

### 2. Download Disaster Images
**File:** `download-images.ps1`

Guides you through downloading WebP disaster images from Freepik.

**Usage:**
```powershell
cd scripts
.\download-images.ps1
```

**What it helps download:**
- 🌊 Tsunami wave images
- 🔥 Wildfire images
- 🏚️ Earthquake damage images
- 🌀 Hurricane/cyclone images
- 💧 Flood images
- 🌋 Volcano eruption images

**Output:** `public/disasters/*.webp`

**Note:** Requires manual download from Freepik due to licensing requirements.

---

## 📁 Output Structure

After running scripts, your project will have:

```
public/
├── safety-guides/
│   ├── first-aid/
│   │   ├── red-cross-first-aid-basics.pdf
│   │   ├── ifrc-first-aid-training-manual.pdf
│   │   └── aha-cpr-quick-reference.pdf
│   ├── earthquake/
│   │   ├── fema-earthquake-safety.pdf
│   │   └── red-cross-earthquake-preparedness.pdf
│   ├── tsunami/
│   │   └── noaa-tsunami-preparedness.pdf
│   ├── wildfire/
│   │   ├── ready-wildfire-preparedness.pdf
│   │   └── calfire-wildfire-safety.pdf
│   ├── flood/
│   │   ├── fema-flood-safety.pdf
│   │   └── red-cross-flood-preparedness.pdf
│   ├── hurricane/
│   │   ├── fema-hurricane-safety.pdf
│   │   └── noaa-hurricane-preparedness.pdf
│   └── emergency-planning/
│       ├── fema-family-emergency-plan.pdf
│       ├── red-cross-emergency-checklist.pdf
│       └── ready-emergency-supply-list.pdf
└── disasters/
    ├── tsunami.webp
    ├── wildfire.webp
    ├── earthquake.webp
    ├── hurricane.webp
    ├── flood.webp
    └── volcano.webp
```

---

## 🔧 Requirements

### PowerShell 5.1+ (Windows)
All scripts are written for PowerShell and should work on:
- ✅ Windows 10/11 (PowerShell 5.1)
- ✅ Windows Server 2019+
- ✅ PowerShell 7+ (cross-platform)

### Internet Connection
Scripts download files from official sources:
- fema.gov
- redcross.org
- ifrc.org
- noaa.gov
- ready.gov
- fire.ca.gov (Cal Fire)

---

## 🛡️ Legal & Attribution

### PDF Files (Public Domain)
All PDF files are from official government or humanitarian organizations:
- **Public Domain:** FEMA, NOAA, Ready.gov (U.S. Government works)
- **Creative Commons:** Red Cross, IFRC, WHO (with attribution)
- **Open Access:** American Heart Association (educational use)

No additional attribution required for PDFs.

### Image Files (Creative Commons)
Images from Freepik require attribution:
```html
<a href="https://www.freepik.com">Images from Freepik</a>
```

Or use Premium Freepik account to remove attribution requirement.

---

## 🐛 Troubleshooting

### PDF Download Fails
**Error:** "Invoke-WebRequest: The remote server returned an error"

**Solutions:**
1. Check internet connection
2. Some URLs may have changed - check [PDF_DOWNLOAD_LINKS.md](../public/safety-guides/PDF_DOWNLOAD_LINKS.md) for updated links
3. Some files may require HTTPS TLS 1.2:
   ```powershell
   [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
   ```

### Script Execution Policy
**Error:** "cannot be loaded because running scripts is disabled"

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Slow Downloads
Large PDF files (8+ MB) may take time on slow connections. The script shows progress for each file.

---

## 📝 Manual Alternatives

### If scripts don't work:

1. **PDF Downloads:** See [public/safety-guides/PDF_DOWNLOAD_LINKS.md](../public/safety-guides/PDF_DOWNLOAD_LINKS.md) for direct links

2. **Image Downloads:** See [public/disasters/README.md](../public/disasters/README.md) for Freepik search links

3. **Curl Alternative (Git Bash):**
   ```bash
   curl -o output.pdf "https://www.fema.gov/sites/default/files/documents/example.pdf"
   ```

---

## 🔄 Update Scripts

To update scripts with new resources:

1. Edit `download-pdfs.ps1` - add new PDF sources
2. Edit `download-images.ps1` - add new image categories
3. Update [PDF_DOWNLOAD_LINKS.md](../public/safety-guides/PDF_DOWNLOAD_LINKS.md) with new links
4. Commit changes to repository

---

## 📊 File Size Summary

| Script | Files | Total Size | Time |
|--------|-------|-----------|------|
| download-pdfs.ps1 | 15 PDFs | ~22 MB | 2-5 min |
| download-images.ps1 | 6 WebP | ~2 MB | Manual |
| **Total** | **21 files** | **~24 MB** | **5-10 min** |

---

## ✅ Verification

After running scripts, verify downloads:

```powershell
# Check PDF files
Get-ChildItem -Path "..\public\safety-guides" -Recurse -File | Measure-Object -Property Length -Sum

# Check image files
Get-ChildItem -Path "..\public\disasters" -Filter "*.webp" | Format-Table Name, Length
```

---

## 🎯 Next Steps

After downloading resources:

1. ✅ Run `npm run dev` to start development server
2. ✅ Visit `/dashboard` to see PDF download buttons
3. ✅ Check Emergency Chat for PDF links
4. ✅ Test disaster image displays in alerts
5. ✅ Verify all files are accessible in browser

---

## 📞 Support

If scripts fail or need updates:
1. Check [GitHub Issues](https://github.com/makkentoshi/nasa-space-app/issues)
2. Review error messages in PowerShell output
3. Manually download from links in README files
4. Update script URLs if sources have moved

---

## 📜 License

Scripts are MIT licensed. Downloaded content follows respective organization licenses (see Legal & Attribution section).
