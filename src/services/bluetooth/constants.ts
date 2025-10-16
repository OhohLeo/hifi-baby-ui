/**
 * HiFi Baby Bluetooth Low Energy (BLE) Protocol Constants
 *
 * These constants define the GATT service and characteristic UUIDs
 * for the HiFi Baby BLE server. They mirror the Golang implementation
 * in ref/bluetooth/services.go
 */

// ============================================================================
// Service UUIDs
// ============================================================================

/**
 * Audio Control Service
 * Handles playback control, volume, position, and player state
 */
export const AUDIO_CONTROL_SERVICE_UUID = '6ba1b900-0001-1000-8000-00805f9b34fb'

/**
 * Track Management Service
 * Handles track uploads, deletions, and upload progress
 */
export const TRACK_MANAGEMENT_SERVICE_UUID = '6ba1b900-0002-1000-8000-00805f9b34fb'

/**
 * Statistics Service
 * Provides listened track history and most listened tracks
 */
export const STATISTICS_SERVICE_UUID = '6ba1b900-0003-1000-8000-00805f9b34fb'

/**
 * Settings Service
 * Manages application settings read/write
 */
export const SETTINGS_SERVICE_UUID = '6ba1b900-0004-1000-8000-00805f9b34fb'

// ============================================================================
// Audio Control Service Characteristics
// ============================================================================

/**
 * Track Control Characteristic (Write)
 * Commands: play, pause, resume, stop
 */
export const TRACK_CONTROL_CHAR_UUID = '6ba1b901-0001-1000-8000-00805f9b34fb'

/**
 * Track Position Characteristic (Read, Write)
 * Get or set playback position in seconds
 */
export const TRACK_POSITION_CHAR_UUID = '6ba1b902-0001-1000-8000-00805f9b34fb'

/**
 * Volume Control Characteristic (Write)
 * Commands: increase, decrease, mute
 */
export const VOLUME_CONTROL_CHAR_UUID = '6ba1b903-0001-1000-8000-00805f9b34fb'

/**
 * Player State Characteristic (Read, Notify)
 * Current player state with real-time notifications
 */
export const PLAYER_STATE_CHAR_UUID = '6ba1b904-0001-1000-8000-00805f9b34fb'

/**
 * Track List Characteristic (Read)
 * List of all available tracks
 */
export const TRACK_LIST_CHAR_UUID = '6ba1b905-0001-1000-8000-00805f9b34fb'

// ============================================================================
// Track Management Service Characteristics
// ============================================================================

/**
 * Upload Control Characteristic (Write)
 * Commands: init, finalize, cancel
 */
export const UPLOAD_CONTROL_CHAR_UUID = '6ba1b906-0002-1000-8000-00805f9b34fb'

/**
 * Upload Data Characteristic (Write)
 * Binary chunk data for file uploads
 */
export const UPLOAD_DATA_CHAR_UUID = '6ba1b907-0002-1000-8000-00805f9b34fb'

/**
 * Upload Status Characteristic (Read, Notify)
 * Upload progress with notifications
 */
export const UPLOAD_STATUS_CHAR_UUID = '6ba1b908-0002-1000-8000-00805f9b34fb'

/**
 * Track Delete Characteristic (Write)
 * Delete a track by ID
 */
export const TRACK_DELETE_CHAR_UUID = '6ba1b909-0002-1000-8000-00805f9b34fb'

// ============================================================================
// Statistics Service Characteristics
// ============================================================================

/**
 * Listened Tracks Characteristic (Read, Write)
 * Query listened tracks history
 */
export const LISTENED_TRACKS_CHAR_UUID = '6ba1b90a-0003-1000-8000-00805f9b34fb'

/**
 * Most Listened Characteristic (Read, Write)
 * Query most listened tracks
 */
export const MOST_LISTENED_CHAR_UUID = '6ba1b90b-0003-1000-8000-00805f9b34fb'

// ============================================================================
// Settings Service Characteristics
// ============================================================================

/**
 * Settings Read Characteristic (Read)
 * Get current application settings
 */
export const SETTINGS_READ_CHAR_UUID = '6ba1b90c-0004-1000-8000-00805f9b34fb'

/**
 * Settings Write Characteristic (Write)
 * Update application settings
 */
export const SETTINGS_WRITE_CHAR_UUID = '6ba1b90d-0004-1000-8000-00805f9b34fb'

// ============================================================================
// Device Configuration
// ============================================================================

/**
 * Default device name to scan for
 */
export const DEFAULT_DEVICE_NAME = 'HiFi Baby'

/**
 * Maximum Transmission Unit (bytes)
 */
export const BLE_MTU = 512

/**
 * Default chunk size for file transfers (bytes)
 */
export const BLE_CHUNK_SIZE = 480

/**
 * Scan duration in milliseconds
 */
export const SCAN_DURATION = 10000

/**
 * Connection timeout in milliseconds
 */
export const CONNECTION_TIMEOUT = 15000

/**
 * Command timeout in milliseconds
 */
export const COMMAND_TIMEOUT = 5000

// ============================================================================
// Service and Characteristic Maps
// ============================================================================

/**
 * Map of all services with their characteristics
 */
export const BLE_SERVICES = {
  audioControl: {
    uuid: AUDIO_CONTROL_SERVICE_UUID,
    characteristics: {
      trackControl: TRACK_CONTROL_CHAR_UUID,
      trackPosition: TRACK_POSITION_CHAR_UUID,
      volumeControl: VOLUME_CONTROL_CHAR_UUID,
      playerState: PLAYER_STATE_CHAR_UUID,
      trackList: TRACK_LIST_CHAR_UUID
    }
  },
  trackManagement: {
    uuid: TRACK_MANAGEMENT_SERVICE_UUID,
    characteristics: {
      uploadControl: UPLOAD_CONTROL_CHAR_UUID,
      uploadData: UPLOAD_DATA_CHAR_UUID,
      uploadStatus: UPLOAD_STATUS_CHAR_UUID,
      trackDelete: TRACK_DELETE_CHAR_UUID
    }
  },
  statistics: {
    uuid: STATISTICS_SERVICE_UUID,
    characteristics: {
      listenedTracks: LISTENED_TRACKS_CHAR_UUID,
      mostListened: MOST_LISTENED_CHAR_UUID
    }
  },
  settings: {
    uuid: SETTINGS_SERVICE_UUID,
    characteristics: {
      settingsRead: SETTINGS_READ_CHAR_UUID,
      settingsWrite: SETTINGS_WRITE_CHAR_UUID
    }
  }
} as const

/**
 * All service UUIDs for filtering during scan
 */
export const ALL_SERVICE_UUIDS = [
  AUDIO_CONTROL_SERVICE_UUID,
  TRACK_MANAGEMENT_SERVICE_UUID,
  STATISTICS_SERVICE_UUID,
  SETTINGS_SERVICE_UUID
] as const
