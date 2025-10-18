/**
 * Unified Transport Interface
 *
 * This interface defines the contract that all transport implementations
 * (WiFi, Bluetooth) must follow. It provides a unified API for the
 * application to communicate with the HiFi Baby backend.
 */

import type { TrackModel, MusicPlayerModel } from '@/models'

// ============================================================================
// Transport Types
// ============================================================================

/**
 * Available transport types
 */
export type TransportType = 'wifi' | 'bluetooth'

/**
 * Transport connection status
 */
export type TransportStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'reconnecting'

/**
 * Transport event types
 */
export type TransportEventType =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'player-state-changed'
  | 'tracks-changed'
  | 'upload-progress'

/**
 * Transport event data
 */
export interface TransportEvent {
  type: TransportEventType
  data?: unknown
  error?: Error
}

/**
 * Connection info for each transport type
 */
export interface ConnectionInfo {
  type: TransportType
  status: TransportStatus
  address?: string // IP for WiFi, MAC for Bluetooth
  name?: string // Device name
  quality?: number // Signal strength (0-100)
  latency?: number // Response time in ms
}

/**
 * Upload progress event
 */
export interface UploadProgress {
  filename: string
  received: number
  total: number
  percent: number
}

// ============================================================================
// Transport Interface
// ============================================================================

/**
 * Base transport interface that all implementations must follow
 */
export interface ITransport {
  // ========================================================================
  // Connection Management
  // ========================================================================

  /**
   * Get transport type
   */
  getType(): TransportType

  /**
   * Initialize the transport
   */
  initialize(): Promise<boolean>

  /**
   * Connect to the backend
   * @param config - Optional configuration (URL for WiFi, device ID for Bluetooth)
   */
  connect(config?: string): Promise<boolean>

  /**
   * Disconnect from the backend
   */
  disconnect(): Promise<void>

  /**
   * Check if connected
   */
  isConnected(): boolean

  /**
   * Get connection info
   */
  getConnectionInfo(): ConnectionInfo

  /**
   * Auto-discover backend
   * @returns Connection string (URL or device ID) if found
   */
  discover(): Promise<string | null>

  // ========================================================================
  // Track Control
  // ========================================================================

  /**
   * Play a specific track
   */
  playTrack(trackID: string): Promise<void>

  /**
   * Pause current playback
   */
  pauseTrack(): Promise<void>

  /**
   * Resume playback
   */
  resumeTrack(): Promise<void>

  /**
   * Stop playback
   */
  stopTrack(): Promise<void>

  /**
   * Set playback position
   * @param position - Position in seconds
   */
  setTrackPosition(position: number): Promise<void>

  // ========================================================================
  // Volume Control
  // ========================================================================

  /**
   * Increase volume
   */
  increaseVolume(): Promise<void>

  /**
   * Decrease volume
   */
  decreaseVolume(): Promise<void>

  /**
   * Mute/unmute volume
   * @param enable - True to mute, false to unmute
   */
  muteVolume(enable: boolean): Promise<void>

  // ========================================================================
  // Track Management
  // ========================================================================

  /**
   * List all tracks
   */
  listTracks(): Promise<TrackModel[]>

  /**
   * Get current player state
   */
  getCurrentPlayerState(): Promise<MusicPlayerModel>

  /**
   * Add a new track (upload file)
   * @param file - Audio file to upload
   */
  addTrack(file: File): Promise<void>

  /**
   * Remove a track
   */
  removeTrack(trackID: string): Promise<void>

  // ========================================================================
  // Event Handling
  // ========================================================================

  /**
   * Subscribe to transport events
   */
  on(event: TransportEventType, callback: (data: unknown) => void): void

  /**
   * Unsubscribe from transport events
   */
  off(event: TransportEventType, callback: (data: unknown) => void): void

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void

  // ========================================================================
  // Cleanup
  // ========================================================================

  /**
   * Dispose and cleanup resources
   */
  dispose(): Promise<void>
}

// ============================================================================
// Transport Factory
// ============================================================================

/**
 * Transport factory configuration
 */
export interface TransportConfig {
  /**
   * Transport type
   */
  type: TransportType

  /**
   * Connection string (URL for WiFi, device ID for Bluetooth)
   */
  connection?: string

  /**
   * Auto-connect on initialization
   */
  autoConnect?: boolean

  /**
   * Enable auto-reconnect
   */
  autoReconnect?: boolean

  /**
   * Reconnect interval in ms
   */
  reconnectInterval?: number

  /**
   * Connection timeout in ms
   */
  connectionTimeout?: number
}

/**
 * Transport discovery result
 */
export interface TransportDiscoveryResult {
  type: TransportType
  available: boolean
  connection?: string
  name?: string
  quality?: number
}

// ============================================================================
// Transport Error Types
// ============================================================================

/**
 * Custom error for transport operations
 */
export class TransportError extends Error {
  constructor(
    message: string,
    public code: string,
    public transport: TransportType,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'TransportError'
  }
}

/**
 * Connection error
 */
export class ConnectionError extends TransportError {
  constructor(transport: TransportType, message: string, originalError?: Error) {
    super(message, 'CONNECTION_ERROR', transport, originalError)
    this.name = 'ConnectionError'
  }
}

/**
 * Command timeout error
 */
export class CommandTimeoutError extends TransportError {
  constructor(transport: TransportType, command: string) {
    super(
      `Command "${command}" timed out`,
      'COMMAND_TIMEOUT',
      transport
    )
    this.name = 'CommandTimeoutError'
  }
}

/**
 * Upload error
 */
export class UploadError extends TransportError {
  constructor(transport: TransportType, message: string, originalError?: Error) {
    super(message, 'UPLOAD_ERROR', transport, originalError)
    this.name = 'UploadError'
  }
}
