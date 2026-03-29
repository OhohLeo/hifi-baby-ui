/**
 * Shared test fixtures: canonical track models and player states.
 * DISPLAY_TITLE_* are the cleaned titles returned by cleanTrackTitleForDisplay().
 */

export const TRACK_A = {
  id: 'track-001',
  name: '01 - Bohemian Rhapsody.mp3',
  format: 'mp3',
  tags: [],
  duration: 354, // 5:54
}

export const TRACK_B = {
  id: 'track-002',
  name: '02 - Stairway to Heaven.flac',
  format: 'flac',
  tags: [],
  duration: 482,
}

export const TRACK_C = {
  id: 'track-003',
  name: '03 - Hotel California.mp3',
  format: 'mp3',
  tags: [],
  duration: 391,
}

// After cleanTrackTitleForDisplay(): strips extension + leading "XX - " index
export const DISPLAY_TITLE_A = 'Bohemian Rhapsody'
export const DISPLAY_TITLE_B = 'Stairway to Heaven'
export const DISPLAY_TITLE_C = 'Hotel California'

export const STOPPED_STATE = {
  currentTrack: null,
  isPlaying: false,
  isMuted: false,
  position: 0,
}

export const PLAYING_STATE_A = {
  currentTrack: TRACK_A,
  isPlaying: true,
  isMuted: false,
  position: 12,
}

export const PAUSED_STATE_A = {
  currentTrack: TRACK_A,
  isPlaying: false,
  isMuted: false,
  position: 12,
}
