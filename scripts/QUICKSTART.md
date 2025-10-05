# 🚀 Quick Start - Download Emergency Resources

## Step 1: Download PDF Safety Guides

Open PowerShell in the `scripts` folder and run:

```powershell
cd scripts
.\download-pdfs.ps1
```

This will download 15 PDF files (~22 MB) from official sources:
- ✅ FEMA (Federal Emergency Management Agency)
- ✅ Red Cross / IFRC
- ✅ NOAA (National Oceanic and Atmospheric Administration)
- ✅ Ready.gov
- ✅ Cal Fire
- ✅ American Heart Association

**Expected output:**
```
🚨 Emergency Safety Guides Downloader
=====================================

📁 Creating directories...
✓ Created: ..\public\safety-guides\first-aid
✓ Created: ..\public\safety-guides\earthquake
...

⬇️  Downloading PDF files...

🏥 First Aid & Medical Guides
[1] Downloading: Red Cross First Aid Basics
   ✓ Success! Size: 2.1 MB

[2] Downloading: IFRC First Aid Training Manual
   ✓ Success! Size: 8.3 MB
...

=====================================
📊 Download Summary
=====================================

Total Files:    15
✓ Successful:   15
✗ Failed:       0

✅ All files downloaded successfully!

📁 Files saved to: public\safety-guides\
💾 Total Size: 22.4 MB

✨ Done! PDFs are ready to use in your app.
```

---

## Step 2: Access PDFs in Dashboard

After downloading, the PDFs will be available in your app:

1. Run your app: `npm run dev`
2. Go to **Dashboard** (`/dashboard`)
3. Scroll to **"Safety Guides Library"** section
4. Click **"Download All (15)"** or individual PDF download buttons

Each PDF will open in a new browser tab.

---

## Step 3: (Optional) Download Disaster Images

If you want professional WebP images from Freepik:

```powershell
.\download-images.ps1
```

**Note:** This script provides instructions for manual download because Freepik requires attribution.

Follow the on-screen instructions to:
1. Search for disaster images on Freepik
2. Download high-quality JPG files
3. Convert to WebP format (1200x800px, 80% quality)
4. Save to `public/disasters/`

---

## 📁 Expected Folder Structure

After running scripts:

```
public/
├── safety-guides/
│   ├── first-aid/
│   │   ├── red-cross-first-aid-basics.pdf (2 MB)
│   │   ├── ifrc-first-aid-training-manual.pdf (8 MB)
│   │   └── aha-cpr-quick-reference.pdf (500 KB)
│   ├── earthquake/
│   │   ├── fema-earthquake-safety.pdf (500 KB)
│   │   └── red-cross-earthquake-preparedness.pdf (1 MB)
│   ├── tsunami/
│   │   └── noaa-tsunami-preparedness.pdf (2 MB)
│   ├── wildfire/
│   │   ├── ready-wildfire-preparedness.pdf (1 MB)
│   │   └── calfire-wildfire-safety.pdf (3 MB)
│   ├── flood/
│   │   ├── fema-flood-safety.pdf (500 KB)
│   │   └── red-cross-flood-preparedness.pdf (1 MB)
│   ├── hurricane/
│   │   ├── fema-hurricane-safety.pdf (500 KB)
│   │   └── noaa-hurricane-preparedness.pdf (2 MB)
│   └── emergency-planning/
│       ├── fema-family-emergency-plan.pdf (200 KB)
│       ├── red-cross-emergency-checklist.pdf (300 KB)
│       └── ready-emergency-supply-list.pdf (200 KB)
└── disasters/
    ├── tsunami.webp (optional)
    ├── wildfire.webp (optional)
    ├── earthquake.webp (optional)
    ├── hurricane.webp (optional)
    ├── flood.webp (optional)
    └── volcano.webp (optional)
```

---

## 🐛 Troubleshooting

### "Execution Policy" Error

```
.\download-pdfs.ps1 : File cannot be loaded because running scripts is disabled on this system.
```

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run the script again.

---

### PDF Download Fails

**Error:** "Invoke-WebRequest: The remote server returned an error"

**Solutions:**

1. **Check Internet Connection** - Make sure you're connected to the internet

2. **Enable TLS 1.2** - Some servers require HTTPS with TLS 1.2:
   ```powershell
   [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
   ```

3. **Check URL** - Some URLs may have changed. See [PDF_DOWNLOAD_LINKS.md](../public/safety-guides/PDF_DOWNLOAD_LINKS.md) for updated links

4. **Manual Download** - If automation fails, download manually:
   - Open link in browser
   - Right-click → "Save As..."
   - Save to correct folder in `public/safety-guides/`

---

### "File Not Found" in Dashboard

If PDFs don't load in the dashboard:

1. **Verify files exist:**
   ```powershell
   Get-ChildItem -Path "..\public\safety-guides" -Recurse -File
   ```

2. **Check file paths** - Make sure files are in correct folders:
   - `public/safety-guides/first-aid/*.pdf`
   - `public/safety-guides/earthquake/*.pdf`
   - etc.

3. **Restart dev server:**
   ```powershell
   npm run dev
   ```

---

## 📊 Verification

After downloading, verify everything works:

```powershell
# Check total size
Get-ChildItem -Path "..\public\safety-guides" -Recurse -File | Measure-Object -Property Length -Sum

# List all PDFs
Get-ChildItem -Path "..\public\safety-guides" -Recurse -Filter "*.pdf" | Format-Table Name, Length

# Count files
(Get-ChildItem -Path "..\public\safety-guides" -Recurse -File).Count
```

Expected:
- **Files:** 15 PDFs
- **Size:** ~22 MB

---

## ⚡ Next Steps

After downloading resources:

1. ✅ **Start dev server:** `npm run dev`
2. ✅ **Go to Dashboard:** `http://localhost:3000/dashboard`
3. ✅ **Test PDF downloads** - Click individual buttons
4. ✅ **Test "Download All"** - Allow pop-ups in browser
5. ✅ **Check Emergency Chat** - PDFs will appear in chat suggestions

---

## 🎯 Dashboard Features

The **Safety Guides Library** card in Dashboard shows:

- 📊 **Statistics:** Total guides, categories, size, downloaded count
- 🔵 **Info Banner:** Instructions to run download script
- 📚 **Categories:** First Aid, Earthquake, Tsunami, Wildfire, Flood, Hurricane, Planning
- 📄 **15 PDF cards** with:
  - Title & description
  - Organization badge (FEMA, Red Cross, etc.)
  - File size & page count
  - Download button (opens PDF in new tab)
  - Checkmark when downloaded
- 🔽 **"Download All" button** - Opens all 15 PDFs at once

---

## 📜 Additional Resources

- **PDF Download Links:** [public/safety-guides/PDF_DOWNLOAD_LINKS.md](../public/safety-guides/PDF_DOWNLOAD_LINKS.md)
- **Image Sources:** [public/disasters/README.md](../public/disasters/README.md)
- **Script Documentation:** [README.md](./README.md)

---

## ✅ Success!

If you see this in PowerShell output:

```
✅ All files downloaded successfully!
💾 Total Size: 22.4 MB
✨ Done! PDFs are ready to use in your app.
```

Then you're all set! 🎉

Open the dashboard and test the PDF download buttons.
