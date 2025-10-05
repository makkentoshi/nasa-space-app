# Disaster WebP Images

This folder contains WebP images for different types of natural disasters used throughout the application.

## Required Images

### 🌊 Tsunami
- **Filename**: `tsunami.webp`
- **Primary Source - Freepik**: 
  - https://www.freepik.com/search?format=search&last_filter=query&last_value=tsunami&query=tsunami&type=photo
  - Search: "tsunami wave ocean disaster"
  - License: Free (with attribution) or Premium
- **Alternative Sources**:
  - Unsplash: https://unsplash.com/s/photos/tsunami
  - Pexels: https://www.pexels.com/search/tsunami/
  - NASA: https://earthobservatory.nasa.gov/images/event/84173/sumatra-tsunami
- **Recommended size**: 1200x800px
- **Description**: Massive ocean wave approaching shore, tsunami warning, coastal disaster

### 🔥 Wildfire
- **Filename**: `wildfire.webp`
- **Primary Source - Freepik**:
  - https://www.freepik.com/search?format=search&query=wildfire&type=photo
  - Search: "forest fire flames wildfire"
  - License: Free (with attribution) or Premium
- **Alternative Sources**:
  - Unsplash: https://unsplash.com/s/photos/wildfire
  - Pexels: https://www.pexels.com/search/wildfire/
  - NASA FIRMS: https://firms.modaps.eosdis.nasa.gov/
- **Recommended size**: 1200x800px
- **Description**: Forest fire with flames and smoke, wildfire disaster

### 🌍 Earthquake
- **Filename**: `earthquake.webp`
- **Primary Source - Freepik**:
  - https://www.freepik.com/search?format=search&query=earthquake&type=photo
  - Search: "earthquake damage cracked ground building collapse"
  - License: Free (with attribution) or Premium
- **Alternative Sources**:
  - Unsplash: https://unsplash.com/s/photos/earthquake-damage
  - Pexels: https://www.pexels.com/search/earthquake/
  - USGS: https://www.usgs.gov/media/images/
- **Recommended size**: 1200x800px
- **Description**: Damaged buildings, cracked ground, seismic disaster

### 🌀 Hurricane
- **Filename**: `hurricane.webp`
- **Primary Source - Freepik**:
  - https://www.freepik.com/search?format=search&query=hurricane&type=photo
  - Search: "hurricane cyclone storm satellite view"
  - License: Free (with attribution) or Premium
- **Alternative Sources**:
  - Unsplash: https://unsplash.com/s/photos/hurricane
  - Pexels: https://www.pexels.com/search/hurricane/
  - NOAA: https://www.noaa.gov/media-release/
  - NASA: https://earthobservatory.nasa.gov/images/search?q=hurricane
- **Recommended size**: 1200x800px
- **Description**: Satellite view of hurricane spiral or storm damage

### 💧 Flood
- **Filename**: `flood.webp`
- **Primary Source - Freepik**:
  - https://www.freepik.com/search?format=search&query=flood&type=photo
  - Search: "flood water disaster city streets"
  - License: Free (with attribution) or Premium
- **Alternative Sources**:
  - Unsplash: https://unsplash.com/s/photos/flood
  - Pexels: https://www.pexels.com/search/flood/
- **Recommended size**: 1200x800px
- **Description**: Flooded streets or buildings, water disaster

### 🌋 Volcano
- **Filename**: `volcano.webp`
- **Primary Source - Freepik**:
  - https://www.freepik.com/search?format=search&query=volcano+eruption&type=photo
  - Search: "volcano eruption lava ash"
  - License: Free (with attribution) or Premium
- **Alternative Sources**:
  - Unsplash: https://unsplash.com/s/photos/volcano-eruption
  - Pexels: https://www.pexels.com/search/volcano/
  - NASA: https://earthobservatory.nasa.gov/images/search?q=volcano
- **Recommended size**: 1200x800px
- **Description**: Volcanic eruption with lava or ash

## How to Download and Convert

### Option 1: Download from Freepik (Recommended)
1. Go to https://www.freepik.com/
2. Search for disaster type (e.g., "tsunami disaster")
3. Filter by: Photos > Free or Premium
4. Download high-quality image (JPG format, usually 5000x3333px)
5. Convert to WebP using online tool or command line
6. Resize to 1200x800px for optimal loading
7. Save with correct filename (tsunami.webp, wildfire.webp, etc.)

**Important**: 
- Free images require attribution (link back to Freepik)
- Premium images (if you have subscription) don't require attribution
- Check license before using commercially

### Option 2: Using Online Tools
1. Go to source website (Unsplash, Pexels, NASA, Freepik)
2. Download high-quality image (JPG/PNG)
3. Convert to WebP using: https://cloudconvert.com/jpg-to-webp
4. Save to this folder with correct filename

### Option 2: Using Command Line (requires `cwebp`)
```bash
# Install cwebp (if not installed)
# macOS: brew install webp
# Ubuntu: sudo apt install webp
# Windows: download from https://developers.google.com/speed/webp/download

# Convert image
cwebp input.jpg -q 80 -o tsunami.webp
```

### Option 3: Using Node.js Script
```javascript
const sharp = require('sharp');

sharp('input.jpg')
  .webp({ quality: 80 })
  .toFile('tsunami.webp');
```

## License Information

- **Unsplash**: Free to use under Unsplash License
- **Pexels**: Free to use under Pexels License
- **NASA**: Public domain
- **NOAA**: Public domain

Always check and comply with the license terms of the source.

## Usage in Application

These images are used in:
- `/app/alerts/page.tsx` - Alert cards
- `/app/alerts/type/[type]/page.tsx` - Alert type pages
- `/app/emergency/map/page.tsx` - Emergency zones
- `/app/api/alerts/route.ts` - Alert API responses

## Fallback Images

If WebP images are not available, the application will use:
1. Alert type icons from Lucide React
2. Default placeholder from `/public/alerts/`
3. NASA satellite imagery from APIs

## Image Optimization

All images should be:
- Format: WebP
- Max width: 1200px
- Max height: 800px
- Quality: 75-85%
- File size: < 200KB

## Quick Links to Free Images

### Tsunami
- https://unsplash.com/photos/aerial-photography-of-shore-line-_OZCl4XcpRw
- https://www.pexels.com/photo/sea-beach-holiday-vacation-5602327/

### Wildfire
- https://unsplash.com/photos/green-pine-trees-covered-with-fogs-under-white-sky-during-daytime-NJuKSBoqnPo
- https://www.pexels.com/photo/photo-of-wildfire-714257/

### Earthquake
- https://unsplash.com/photos/brown-and-white-building-zNRITe8NPqY
- https://www.pexels.com/photo/cracked-concrete-structure-12789841/

### Hurricane
- https://unsplash.com/photos/satellite-image-of-hurricane-Q1p7bh3SHj8
- https://www.nasa.gov/image-article/hurricane-florence/

### Flood
- https://unsplash.com/photos/white-boat-on-body-of-water-near-city-buildings-during-daytime-fCXJxZInWKg
- https://www.pexels.com/photo/flood-in-the-city-8816940/

## TODO: Download and Add Images

To complete this task:
1. Download images from links above
2. Convert to WebP format (80% quality)
3. Rename to: `tsunami.webp`, `wildfire.webp`, `earthquake.webp`, `hurricane.webp`, `flood.webp`, `volcano.webp`
4. Place in this folder
5. Verify images load correctly in the app
