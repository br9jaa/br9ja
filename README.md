# Bayright9ja Mobile

Bayright9ja is a Flutter fintech app with supporting `backend/` and
`bayright9ja_web/` workspaces in the same repository folder.

## Current Architecture

- Mobile stack: Flutter + Dart
- State management: `provider`
- App shape: feature-led screens and services under `lib/`
- Local backend: Express server under `backend/`
- Unified mobile networking: `lib/core/api/br9_api_client.dart`
- Unified design system: `lib/core/theme/br9_theme.dart`

## Environment Files

- Backend development config: `backend/.env.dev`
- Backend production config: `backend/.env.prod`
- Web development config: `bayright9ja_web/.env.dev`
- Web production config: `bayright9ja_web/.env.prod`

Mobile builds use `--dart-define=BASE_URL=...` rather than checked-in `.env` files.

## Local Commands

- `flutter analyze`
- `flutter test`
- `flutter build apk --debug`
- `cd backend && npm install && npm run dev`
- `cd bayright9ja_web && npm install && npm run dev`

## Secure Release Builds

Release artifacts should always be built through the repo script so Dart
obfuscation is consistently enabled and split debug symbols are preserved.

- `./scripts/build_release.sh apk`
- `./scripts/build_release.sh appbundle`
- `./scripts/build_release.sh ipa`

Split debug info is written under `build/obfuscation/`. Keep those files safe;
they are required to symbolicate obfuscated crash reports.
