# Multifunctional Digital Clock

A free, customizable browser clock with alarms, stopwatch, countdown timer, world time zones, saved profiles, offline support and a multilingual interface.

## Live application

[Open Digital Clock](https://digitalclock.appsandgames.org/)

## Main features

- Digital clock with optional seconds
- Current date with multiple date formats
- 12-hour and 24-hour time formats
- Automatic or manual font sizing
- Custom clock, date and background colors
- Brightness and contrast controls
- Day and night modes
- Fullscreen mode
- Saved appearance profiles
- Multiple alarms
- Countdown timer
- Stopwatch with lap recording
- World clock with saved cities
- Validated JSON backup export and import
- Installable Progressive Web App
- Offline support after the first successful load

## Languages

- English
- Hrvatski
- Deutsch
- Italiano
- Español

English is used by default when no language preference has been saved.

## Privacy

Digital Clock does not require an account. Settings, profiles, alarms and selected world clock cities are stored locally in the browser.

Backup files are created only when the user selects Export Backup. Imported JSON backup files are validated before stored data is replaced.

## Technology

- Vite
- Vanilla JavaScript
- JavaScript ES Modules
- HTML5
- CSS
- Web App Manifest
- Service Worker
- Local Storage

## Local development

Requirements: Node.js 20.19 or newer and npm.

- Install dependencies: `npm install`
- Start development: `npm run dev`
- Create production build: `npm run build`
- Preview production build: `npm run preview`

The production output is generated in the `dist` directory.

## Project structure

- `index.html` — application document and metadata
- `src/main.js` — main application coordinator
- `src/data/` — translations and static application data
- `src/js/` — storage, backup and accessibility modules
- `src/styles/` — application styles
- `public/` — PWA and production static files

## Deployment

The production site is built from GitHub and deployed through Cloudflare.

- Build command: `npm install && npm run build`
- Output directory: `dist`

## Support

Digital Clock remains free to use. Optional support methods are available from the Information / Donations panel inside the application.

## Publisher

[Apps & Games](https://appsandgames.org/)

## Version

2.0.0
