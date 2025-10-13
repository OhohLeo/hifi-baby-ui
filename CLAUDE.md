# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hifi Baby UI is a **cross-platform music player interface** built for the [Hifi Baby](https://github.com/ohohleo/hifi-baby) project. It runs on **web, Android, and iOS** using Capacitor. The app communicates with a backend audio service running at `http://hifi-baby.local:3000/audio` to control music playback.

**Tech Stack**: Vue 3, Vuetify 3, TypeScript, Vite, Pinia, Capacitor

**Platforms**: Web, Android, iOS (native via Capacitor)

## Development Commands

### Web Development

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production (includes TypeScript type checking)
npm run build
npm run build:web  # Explicit web build

# Preview production build
npm preview

# Lint and auto-fix code
npm run lint
```

### Cross-Platform Development

```bash
# Build and open Android project in Android Studio
npm run build:android

# Capacitor commands
npm run cap:sync                # Sync web assets to all platforms
npm run cap:sync:android        # Sync to Android only
npm run cap:open:android        # Open in Android Studio
npm run cap:run:android         # Build and run on connected device
```

## Architecture

### State Management (Pinia Stores)

The application uses Pinia for centralized state management with two main stores:

- **MusicPlayerStore** (`src/stores/MusicPlayer.ts`): Manages current playback state (play/pause/stop), track information, volume, and mute status. Contains states: `STATE_PLAY`, `STATE_PAUSE`, `STATE_STOP`.

- **PlaylistStore** (`src/stores/PlayList.ts`): Manages the list of available tracks, sorted alphabetically by name.

Both stores interact with the backend through `audioService` in `src/services/api.ts`.

### API Service Layer

**API Client** (`src/services/api.ts`): Axios-based service that communicates with the backend audio API. The base URL is configurable via localStorage using the key `domainName` (defaults to `hifi-baby.local`). All endpoints are prefixed with `/audio`.

Key API endpoints:
- `POST /audio/play/{trackID}` - Play a track
- `POST /audio/pause` - Pause playback
- `POST /audio/resume` - Resume playback
- `POST /audio/stop` - Stop playback
- `GET /audio/tracks` - List all tracks
- `GET /audio/state` - Get current player state
- `POST /audio/volume/up` - Increase volume
- `POST /audio/volume/down` - Decrease volume
- `POST /audio/volume/mute?enable={boolean}` - Toggle mute
- `POST /audio/` (multipart) - Upload new track
- `DELETE /audio/{trackID}` - Remove track

### Routing

The app uses Vue Router with a simple two-page structure defined in `src/router/index.ts`:
- `/` - Playlist view (PlayList.vue)
- `/settings` - Settings view (Settings.vue)

Both routes use the `DefaultLayout` (`src/layouts/default.vue`) which includes the TopMenu and MusicPlayer components.

**Note**: The router includes a workaround for Vite dynamic import errors that automatically reloads the page once if such errors occur.

### Component Structure

**Layout Components**:
- `layouts/default.vue` - Main layout wrapper with TopMenu and MusicPlayer footer

**Main Components**:
- `PlayList.vue` - Displays track list with play/pause/delete controls and tag assignment
- `MusicPlayer.vue` - Footer player controls (play/pause, stop, volume, mute)
- `TopMenu.vue` - Navigation bar with add song functionality
- `AddSongDialog.vue` - Dialog for uploading new audio files
- `AddTagDialog.vue` - Dialog for managing tags on tracks

**Settings Components** (`src/components/settings/`):
- `Settings.vue` - Settings page with sidebar menu and dynamic component loading
- `Audio.vue`, `Bluetooth.vue`, `Network.vue`, `Interface.vue`, `Tags.vue` - Individual settings panels

### Data Models

Defined in `src/models.ts`:
- `TrackModel`: Track metadata (id, name, format, tags)
- `MusicPlayerModel`: Player state from backend (currentTrack, isPlaying, isMuted)
- `Tag`: Tag structure with time or assignment parameters

### Vite Configuration

The project uses several Vite plugins configured in `vite.config.mts`:
- `unplugin-vue-router` - Automatic route generation (though currently using manual routes)
- `vite-plugin-vue-layouts` - Layout system support
- `unplugin-auto-import` - Auto-imports Vue composables and Vue Router hooks
- `unplugin-vue-components` - Auto-imports components
- `vite-plugin-vuetify` - Vuetify integration with custom SCSS styles
- `unplugin-fonts` - Google Fonts (Roboto) integration

**Path Alias**: `@` resolves to `./src`

## Key Implementation Details

### Auto-imports

The project uses auto-imports for Vue composables and components:
- Vue functions (ref, computed, etc.) are auto-imported
- Vue Router functions (useRoute, useRouter) are auto-imported
- Components are auto-imported and type definitions are generated in `src/components.d.ts`
- Auto-import type definitions are in `src/auto-imports.d.ts`

### LocalStorage Service

`src/services/storage.ts` provides a typed localStorage wrapper used for persisting configuration (e.g., domain name).

### Styling

Vuetify styles are customized via `src/styles/settings.scss`. The project uses Material Design Icons (`@mdi/font`).

### State Synchronization

Components fetch initial state on mount:
- `PlayList.vue` calls `playlistStore.fetchTracks()` on load
- `MusicPlayer.vue` calls `musicPlayer.fetchCurrentTrack()` on load
- After modifying tracks (add/remove), components manually refresh both stores

### Track Playback Logic

In `PlayList.vue`, clicking a track icon:
1. If the track is already loaded: toggles between play/pause
2. If it's a different track: starts playing the new track
3. Uses the `playOrPauseTrack()` function to handle state transitions

## Cross-Platform Architecture (Capacitor)

### Platform Detection & Capabilities

The app uses capability detection to adapt features based on the platform:

**Composables** (`src/composables/`):
- `usePlatform()` - Detects current platform (web/iOS/Android) and provides helpers
- `useCapabilities()` - Detects available platform capabilities (Bluetooth, file system, network discovery, etc.)

**Platform Services** (`src/services/platform/`):
- `bluetooth.service.ts` - Bluetooth LE device scanning and connection (native only)
- `filesystem.service.ts` - Platform-aware file picking (web vs native)
- `network.service.ts` - Backend discovery with mDNS/fallback strategies

### Native Features

**Bluetooth (Android/iOS)**:
- Uses `@capacitor-community/bluetooth-le` plugin
- Scan for BLE devices, connect/disconnect
- UI shows device list with signal strength (RSSI)
- Web displays informational message (not supported)

**File Picker (Android/iOS)**:
- Uses `@capawesome/capacitor-file-picker` plugin
- Native file picker with audio file filtering
- Web uses standard HTML5 file input
- Displays file info (name, size) on native platforms

**Network Discovery**:
- Attempts auto-discovery of backend on app launch
- Platform-specific strategies (mDNS, Bonjour, IP scanning)
- Fallback to manual URL configuration

### Mobile Optimizations

**Styling** (`src/styles/mobile-enhancements.scss`):
- Touch target sizes (44x44px minimum)
- Safe area insets for notched devices
- Disabled hover effects on touch devices
- Mobile-specific spacing and font sizes

**Permissions** (Android):
- Bluetooth LE (BLUETOOTH_CONNECT, BLUETOOTH_SCAN)
- File access (READ_MEDIA_AUDIO)
- Network (ACCESS_NETWORK_STATE, ACCESS_WIFI_STATE)
- Cleartext traffic allowed for local HTTP

### Configuration

**Capacitor Config** (`capacitor.config.ts`):
- App ID: `com.hifibaby.ui`
- Allow navigation to local network URLs
- Splash screen and keyboard configuration
- Android-specific settings (cleartext traffic)

**Environment Variables** (`.env.development`, `.env.production`):
- `VITE_APP_TITLE` - Application title
- `VITE_API_BASE_URL` - Default API URL
- `VITE_DEFAULT_BACKEND` - Fallback backend URL

### Development Workflow

1. Make changes to Vue components/services
2. Run `npm run build:web` to build web assets
3. Run `npx cap sync android` to copy to native project
4. Open in Android Studio with `npx cap open android`
5. Build and run on device/emulator

### Platform-Specific UI

Components adapt based on platform:
- **Bluetooth Settings**: Shows scan button on native, info message on web
- **Network Settings**: Shows auto-discovery on native, manual config on web
- **Add Song Dialog**: Uses native file picker on mobile, web input on web
- **Settings Modal**: Platform badge shows current platform

## Notes for Claude

- Use context7 to check-up-to-date docs needed for implementing new libraries or frameworks, or adding new features using them.
- Use playwright mcp to open, test, get screenshots from browser to localhost:3000
- Do not write a .md files each time we add a new feature / fonctionality