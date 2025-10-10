# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hifi Baby UI is a web-based music player interface built for the [Hifi Baby](https://github.com/ohohleo/hifi-baby) project. It communicates with a backend audio service running at `http://hifi-baby.local:3000/audio` to control music playback.

**Tech Stack**: Vue 3, Vuetify 3, TypeScript, Vite, Pinia

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production (includes TypeScript type checking)
npm run build

# Preview production build
npm preview

# Lint and auto-fix code
npm run lint
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
- Use context7 to check-up-to-date docs needed for implementing new libraries or frameworks, or adding new features using them.
- Use playwright mcp to open, test, get screenshots from browser to localhost:3000
- Do not write a .md files each time we add a new feature / fonctionality