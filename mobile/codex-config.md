# BR9ja Mobile Codex Config

## Platform Standard
- Target Android first with Material Design 3 visual behavior.
- Use tonal surfaces, high-contrast text, and 8dp spacing rhythm.
- Prefer rounded cards at 20dp to 28dp for wallet and service surfaces.
- Primary accent: `#FFD700`
- Base background: `#041126`
- Success accent: `#28C76F`

## Navigation
- Use `expo-router` for route structure and stack layout.
- Keep authentication, wallet, services, and BR9 Gold experiences in separate route groups as the app grows.
- Default to edge-to-edge safe-area aware layouts.

## UI Separation
- Shared mobile building blocks live in `/mobile/components/mobile`.
- Shared provider access lives in `/services/api.js`.
- Web-only presentation code must stay out of `/mobile`.

## Android Material 3 Rules
- Use large, readable section titles and short supporting copy.
- Keep tap targets at or above 48dp.
- Use prominent primary actions, tonal secondary actions, and restrained motion.
- Prefer bottom sheets, stacked cards, and top app bars over cramped modal patterns.
- Status, security, and payout progress should always be visible within the first screenful.

## Engineering Notes
- Expo 54 currently expects Node 20.19+ for a fully supported local toolchain.
- Keep provider endpoints configurable so VTpass and SquadCo can be swapped without rewriting screens.
- Avoid putting provider secrets in the mobile client; only use public-safe configuration here.
