/**
 * HiFi Baby Bluetooth Low Energy (BLE) Protocol Types
 *
 * These types mirror the protocol structures defined in ref/bluetooth/protocol.go
 * All communication uses JSON encoding with a generic Response wrapper
 */

import type { TrackModel } from '@/models'

// ============================================================================
// Generic Response Wrapper
// ============================================================================

/**
 * Generic response wrapper for all BLE operations
 */
export interface BleResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// ============================================================================
// Track Control Commands
// ============================================================================

export type TrackControlCommandType = 'play' | 'pause' | 'resume' | 'stop'

/**
 * Track control command (Write to Track Control characteristic)
 */
export interface TrackControlCommand {
  command: TrackControlCommandType
  track_id?: string
}

// ============================================================================
// Position Control
// ============================================================================

/**
 * Position command (Write to Track Position characteristic)
 */
export interface PositionCommand {
  position: number // seconds
}

/**
 * Position response (Read from Track Position characteristic)
 */
export interface PositionResponse {
  position: number // seconds
}

// ============================================================================
// Volume Control
// ============================================================================

export type VolumeCommandType = 'increase' | 'decrease' | 'mute'

/**
 * Volume control command (Write to Volume Control characteristic)
 */
export interface VolumeCommand {
  command: VolumeCommandType
  enable?: boolean // Required for mute command
}

// ============================================================================
// Player State
// ============================================================================

/**
 * Player state response (Read/Notify from Player State characteristic)
 */
export interface PlayerStateResponse {
  track: TrackModel | null
  isPlaying: boolean
  isMuted: boolean
  position: number // seconds
  duration: number // seconds
}

// ============================================================================
// Track List
// ============================================================================

/**
 * Track list response (Read from Track List characteristic)
 */
export interface TrackListResponse {
  tracks: TrackModel[]
  total: number
  offset: number
  limit: number
}

// ============================================================================
// Upload Control
// ============================================================================

export type UploadControlCommandType = 'init' | 'finalize' | 'cancel'

/**
 * Upload control command (Write to Upload Control characteristic)
 */
export interface UploadControlCommand {
  command: UploadControlCommandType
  filename?: string // Required for init
  size?: number // Required for init
  checksum?: string // Required for init
  session_id?: string // Required for finalize/cancel
}

/**
 * Upload init response
 */
export interface UploadInitResponse {
  session_id: string
  chunk_size: number
  max_chunks: number
}

/**
 * Upload progress response (Read/Notify from Upload Status characteristic)
 */
export interface UploadProgressResponse {
  received: number
  total: number
  percent: number
}

/**
 * Upload finalize response
 */
export interface UploadFinalizeResponse {
  track: TrackModel
}

// ============================================================================
// Upload Data
// ============================================================================

/**
 * Binary chunk format for Upload Data characteristic
 * [0-3]   uint32 session_id_hash
 * [4-7]   uint32 chunk_index
 * [8-11]  uint32 chunk_size
 * [12-end] binary data
 */
export interface UploadChunkHeader {
  sessionIdHash: number
  chunkIndex: number
  chunkSize: number
}

// ============================================================================
// Track Delete
// ============================================================================

/**
 * Track delete command (Write to Track Delete characteristic)
 */
export interface TrackDeleteCommand {
  track_id: string
}

// ============================================================================
// Statistics Queries
// ============================================================================

/**
 * Statistics query parameters
 */
export interface StatisticsQuery {
  since: string // RFC3339 format
  top_nb?: number // For most listened query
}

/**
 * Listened track entry
 */
export interface ListenedTrack {
  track_name: string
  at: string // ISO 8601 timestamp
  during: number // seconds
}

/**
 * Listened tracks response
 */
export interface ListenedTracksResponse {
  tracks: ListenedTrack[]
}

/**
 * Most listened track entry
 */
export interface MostListenedTrack {
  track_name: string
  since: string // ISO 8601 timestamp
  during: number // total seconds
  count: number
}

/**
 * Most listened tracks response
 */
export interface MostListenedTracksResponse {
  tracks: MostListenedTrack[]
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Encode a command to JSON bytes (ArrayBuffer)
 */
export function encodeCommand(command: unknown): ArrayBuffer {
  const json = JSON.stringify(command)
  const encoder = new TextEncoder()
  return encoder.encode(json).buffer
}

/**
 * Decode a JSON response from ArrayBuffer
 */
export function decodeResponse<T = unknown>(data: ArrayBuffer): BleResponse<T> {
  const decoder = new TextDecoder()
  const json = decoder.decode(data)
  try {
    return JSON.parse(json) as BleResponse<T>
  } catch (error) {
    console.error('Failed to decode BLE response:', error)
    return {
      success: false,
      error: 'Failed to decode response'
    }
  }
}

/**
 * Decode a JSON response from DataView
 */
export function decodeResponseFromDataView<T = unknown>(dataView: DataView): BleResponse<T> {
  const decoder = new TextDecoder()
  const json = decoder.decode(dataView)
  try {
    return JSON.parse(json) as BleResponse<T>
  } catch (error) {
    console.error('Failed to decode BLE response:', error)
    return {
      success: false,
      error: 'Failed to decode response'
    }
  }
}

/**
 * Create upload chunk binary data
 */
export function createUploadChunk(
  sessionId: string,
  chunkIndex: number,
  data: Uint8Array
): ArrayBuffer {
  // Calculate session ID hash (first 4 bytes of UUID)
  const sessionIdHash = hashSessionId(sessionId)

  // Create buffer with header + data
  const buffer = new ArrayBuffer(12 + data.length)
  const view = new DataView(buffer)

  // Write header (big endian)
  view.setUint32(0, sessionIdHash, false) // session_id_hash
  view.setUint32(4, chunkIndex, false) // chunk_index
  view.setUint32(8, data.length, false) // chunk_size

  // Write data
  const uint8View = new Uint8Array(buffer)
  uint8View.set(data, 12)

  return buffer
}

/**
 * Hash session ID to uint32 (first 4 bytes)
 */
function hashSessionId(sessionId: string): number {
  // Remove dashes from UUID and convert first 8 hex chars to uint32
  const hex = sessionId.replace(/-/g, '').substring(0, 8)
  return parseInt(hex, 16)
}

/**
 * Calculate SHA-256 checksum of file data
 */
export async function calculateChecksum(data: BufferSource): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return `sha256-${hashHex}`
}

/**
 * Split file into chunks for upload
 */
export function splitFileIntoChunks(
  file: ArrayBuffer,
  chunkSize: number
): Uint8Array[] {
  const chunks: Uint8Array[] = []
  const fileData = new Uint8Array(file)

  for (let i = 0; i < fileData.length; i += chunkSize) {
    const chunk = fileData.slice(i, Math.min(i + chunkSize, fileData.length))
    chunks.push(chunk)
  }

  return chunks
}

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: BleResponse<T>
): response is BleResponse<T> & { success: true; data: T } {
  return response.success && response.data !== undefined
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse<T>(
  response: BleResponse<T>
): response is BleResponse<T> & { success: false; error: string } {
  return !response.success && response.error !== undefined
}
