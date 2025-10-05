// Disaster Image Placeholders
// These are base64-encoded SVG placeholders for disaster types
// Replace with actual WebP images in /public/disasters/

export const disasterPlaceholders = {
  tsunami: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="tsunami-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0369a1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#tsunami-bg)"/>
      <path d="M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z" fill="#1e40af" opacity="0.7"/>
      <path d="M0,450 Q200,350 400,450 T800,450 Q1000,450 1200,350 L1200,800 L0,800 Z" fill="#1e3a8a" opacity="0.5"/>
      <text x="600" y="400" font-family="Arial, sans-serif" font-size="64" fill="white" text-anchor="middle" font-weight="bold">🌊 TSUNAMI</text>
    </svg>
  `)}`,
  
  wildfire: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="fire-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7f1d1d;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="flame" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#dc2626;stop-opacity:0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#fire-bg)"/>
      <circle cx="300" cy="400" r="150" fill="url(#flame)" opacity="0.8"/>
      <circle cx="600" cy="300" r="200" fill="url(#flame)" opacity="0.6"/>
      <circle cx="900" cy="450" r="180" fill="url(#flame)" opacity="0.7"/>
      <rect x="0" y="600" width="1200" height="200" fill="#1c1917" opacity="0.8"/>
      <text x="600" y="700" font-family="Arial, sans-serif" font-size="64" fill="white" text-anchor="middle" font-weight="bold">🔥 WILDFIRE</text>
    </svg>
  `)}`,
  
  earthquake: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="quake-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#78716c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#292524;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#quake-bg)"/>
      <path d="M0,400 L200,350 L400,450 L600,380 L800,420 L1000,360 L1200,400 L1200,800 L0,800 Z" fill="#44403c" opacity="0.9"/>
      <line x1="0" y1="400" x2="1200" y2="400" stroke="#ef4444" stroke-width="8" stroke-dasharray="20,10"/>
      <line x1="50" y1="350" x2="150" y2="450" stroke="#f97316" stroke-width="4"/>
      <line x1="400" y1="300" x2="500" y2="500" stroke="#f97316" stroke-width="4"/>
      <line x1="800" y1="320" x2="900" y2="480" stroke="#f97316" stroke-width="4"/>
      <text x="600" y="250" font-family="Arial, sans-serif" font-size="64" fill="white" text-anchor="middle" font-weight="bold">🌍 EARTHQUAKE</text>
    </svg>
  `)}`,
  
  hurricane: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="hurricane-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#64748b;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="eye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
          <stop offset="30%" style="stop-color:#cbd5e1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#475569;stop-opacity:0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#hurricane-bg)"/>
      <circle cx="600" cy="400" r="300" fill="url(#eye)" opacity="0.8"/>
      <circle cx="600" cy="400" r="80" fill="#f8fafc" opacity="0.9"/>
      <path d="M600,400 Q500,300 400,250 Q350,220 300,200" stroke="#e2e8f0" stroke-width="30" fill="none" opacity="0.6"/>
      <path d="M600,400 Q700,300 800,250 Q850,220 900,200" stroke="#e2e8f0" stroke-width="30" fill="none" opacity="0.6"/>
      <path d="M600,400 Q500,500 400,550 Q350,580 300,600" stroke="#e2e8f0" stroke-width="30" fill="none" opacity="0.6"/>
      <path d="M600,400 Q700,500 800,550 Q850,580 900,600" stroke="#e2e8f0" stroke-width="30" fill="none" opacity="0.6"/>
      <text x="600" y="100" font-family="Arial, sans-serif" font-size="64" fill="white" text-anchor="middle" font-weight="bold">🌀 HURRICANE</text>
    </svg>
  `)}`,
  
  flood: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="flood-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#7dd3fc;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0c4a6e;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#flood-bg)"/>
      <rect x="0" y="500" width="1200" height="300" fill="#0369a1" opacity="0.7"/>
      <path d="M0,500 Q200,480 400,500 T800,500 Q1000,500 1200,480 L1200,800 L0,800 Z" fill="#075985" opacity="0.8"/>
      <path d="M0,550 Q150,530 300,550 T600,550 Q800,550 1200,530 L1200,800 L0,800 Z" fill="#0c4a6e" opacity="0.6"/>
      <rect x="200" y="300" width="100" height="250" fill="#44403c" opacity="0.8"/>
      <rect x="500" y="250" width="120" height="300" fill="#44403c" opacity="0.8"/>
      <rect x="850" y="320" width="90" height="230" fill="#44403c" opacity="0.8"/>
      <text x="600" y="200" font-family="Arial, sans-serif" font-size="64" fill="white" text-anchor="middle" font-weight="bold">💧 FLOOD</text>
    </svg>
  `)}`,
  
  volcano: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="volcano-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#44403c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1c1917;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="lava" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#dc2626;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7f1d1d;stop-opacity:0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#volcano-bg)"/>
      <polygon points="600,200 350,800 850,800" fill="#292524" opacity="0.9"/>
      <polygon points="600,200 500,800 700,800" fill="#1c1917" opacity="0.8"/>
      <circle cx="600" cy="150" r="100" fill="url(#lava)" opacity="0.8"/>
      <path d="M600,200 Q580,150 560,100 Q550,80 540,50" stroke="#fbbf24" stroke-width="8" fill="none" opacity="0.8"/>
      <path d="M600,200 Q620,150 640,100 Q650,80 660,50" stroke="#fbbf24" stroke-width="8" fill="none" opacity="0.8"/>
      <text x="600" y="700" font-family="Arial, sans-serif" font-size="64" fill="white" text-anchor="middle" font-weight="bold">🌋 VOLCANO</text>
    </svg>
  `)}`
}

export function getDisasterImage(type: string): string {
  const normalizedType = type.toLowerCase()
  
  // Check if actual WebP image exists
  const webpPath = `/disasters/${normalizedType}.webp`
  
  // For now, return placeholder SVG
  // In production, you would check if the file exists and return webpPath
  const placeholderMap: Record<string, string> = {
    tsunami: disasterPlaceholders.tsunami,
    wildfire: disasterPlaceholders.wildfire,
    fire: disasterPlaceholders.wildfire,
    earthquake: disasterPlaceholders.earthquake,
    hurricane: disasterPlaceholders.hurricane,
    cyclone: disasterPlaceholders.hurricane,
    typhoon: disasterPlaceholders.hurricane,
    flood: disasterPlaceholders.flood,
    volcano: disasterPlaceholders.volcano,
    volcanic: disasterPlaceholders.volcano
  }
  
  return placeholderMap[normalizedType] || disasterPlaceholders.earthquake
}
