# resQ Architecture Documentation

## Why Dynamic Imports?

### Client-Only Components (`ssr: false`)

Components like `Map`, `AIChat`, `WeatherAnimation` use dynamic imports with `ssr: false` because:

1. **Leaflet requires browser APIs**: The mapping library (Leaflet) depends on `window`, `document`, and browser-specific APIs that don't exist during server-side rendering.

2. **Performance**: These heavy components are code-split and only loaded when needed, reducing initial bundle size.

3. **Next.js Best Practice**: From Next.js docs, this is the recommended way to handle client-only libraries.

```tsx
// ✅ Correct approach
const Map = dynamic(() => import('@/app/components/Map'), { ssr: false });

// ❌ Would break: Leaflet tries to access window during SSR
import Map from '@/app/components/Map';
```

## Tailwind v4 Configuration

Tailwind CSS v4 changed dramatically from v3:

### Key Changes:
- **No `tailwind.config.js`** - Configuration is now CSS-based
- **Use `@import "tailwindcss"`** in your CSS file
- **PostCSS plugin**: Use `@tailwindcss/postcss` (not `tailwindcss` directly)

### Our Setup:
```css
/* globals.css */
@import "tailwindcss";

/* CSS variables and custom styles below */
```

```js
// postcss.config.mjs
export default {
  plugins: [
    "@tailwindcss/postcss",
    "autoprefixer",
  ],
};
```

## Component Architecture

### UI Primitives (`app/components/ui/`)
- Reusable base components (Button, Card, Badge, Alert)
- Use design tokens for consistent spacing/colors
- Follow Radix UI patterns for accessibility

### Feature Components (`app/components/`)
- Domain-specific components (Map, AIChat, WeatherAnimation)
- Compose UI primitives
- Handle business logic

### Layout Components (`app/components/layout/`)
- Page structure (AppShell)
- Navigation (BottomBar, EmergencyBottomBar)

## Design Tokens

Centralized in `app/components/ui/design-tokens.ts`:
```ts
const tokens = {
  spacing: { xs: '6px', sm: '8px', md: '12px', lg: '16px', xl: '24px' },
  colors: { primary: '#53B175', ... },
  radii: { sm: '8px', md: '12px', lg: '16px' },
  // ...
}
```

These are mirrored as CSS variables in `globals.css` for both JS and CSS usage.

## Spacing Strategy

- **Card default padding**: `p-4` (16px) or `p-6` (24px) for larger cards
- **Section spacing**: `space-y-4` or `space-y-6` between sibling elements
- **Page padding**: `px-4` (horizontal), `pt-6` (top), `pb-24` (bottom for nav)
- **Content gaps**: Use `gap-3`, `gap-4` in flex/grid layouts

## Why We Don't Use Python

Per project requirements:
- Backend is **TypeScript-only** via Next.js API routes (`app/api/`)
- Keeps deployment simple (single runtime)
- Better type safety across full stack
