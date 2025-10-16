/**
 * Bluetooth Transport Implementation
 *
 * BLE GATT transport using Capacitor Bluetooth LE plugin
 * Implements the ITransport interface using the HiFi Baby BLE protocol
 */

import { BleClient, type BleDevice } from '@capacitor-community/bluetooth-le'
import { Capacitor } from '@capacitor/core'
import type {
  ITransport,
  TransportType,
  TransportStatus,
  TransportEventType,
  ConnectionInfo,
  UploadProgress
} from './transport.interface'
import { ConnectionError, UploadError } from './transport.interface'
import type { TrackModel, MusicPlayerModel } from '@/models'
import * as BLE from '../bluetooth/constants'
import * as Protocol from '../bluetooth/protocol'

/**
 * Bluetooth transport configuration
 */
export interface BluetoothTransportConfig {
  deviceId?: string
  deviceName?: string
  timeout?: number
  autoReconnect?: boolean
  reconnectInterval?: number
}

/**
 * Bluetooth transport implementation using BLE GATT
 */
export class BluetoothTransport implements ITransport {
  private device: BleDevice | null = null
  private deviceId: string | null = null
  private status: TransportStatus = 'disconnected'
  private eventListeners: Map<TransportEventType, Set<(data: unknown) => void>>
  private config: BluetoothTransportConfig
  private reconnectTimer?: ReturnType<typeof setTimeout>
  private connectionInfo: ConnectionInfo
  private isInitialized = false

  constructor(config: BluetoothTransportConfig = {}) {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Bluetooth transport is only available on native platforms')
    }

    this.config = {
      timeout: config.timeout || BLE.COMMAND_TIMEOUT,
      autoReconnect: config.autoReconnect ?? true,
      reconnectInterval: config.reconnectInterval || 5000,
      ...config
    }

    this.eventListeners = new Map()
    this.connectionInfo = {
      type: 'bluetooth',
      status: 'disconnected'
    }
  }

  // ========================================================================
  // Connection Management
  // ========================================================================

  getType(): TransportType {
    return 'bluetooth'
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true
    }

    try {
      await BleClient.initialize()
      this.isInitialized = true
      return true
    } catch {
      return false
    }
  }

  async connect(deviceId?: string): Promise<boolean> {
    if (!this.isInitialized) {
      const initialized = await this.initialize()
      if (!initialized) {
        throw new ConnectionError('bluetooth', 'Failed to initialize Bluetooth')
      }
    }

    if (deviceId) {
      this.deviceId = deviceId
    }

    if (!this.deviceId) {
      throw new ConnectionError('bluetooth', 'No device ID provided')
    }

    this.status = 'connecting'
    this.emit('connecting', null)

    try {
      // Connect to device
      await BleClient.connect(
        this.deviceId,
        () => {
          this.handleDisconnection()
        },
        { timeout: BLE.CONNECTION_TIMEOUT }
      )

      // Get device info
      this.device = await BleClient.getDevice(this.deviceId)

      this.status = 'connected'
      this.connectionInfo = {
        type: 'bluetooth',
        status: 'connected',
        address: this.deviceId,
        name: this.device.name || BLE.DEFAULT_DEVICE_NAME
      }

      // Subscribe to notifications
      await this.setupNotifications()

      this.emit('connected', this.connectionInfo)
      return true
    } catch (error) {
      this.status = 'error'
      const connectionError = new ConnectionError(
        'bluetooth',
        'Failed to connect to device',
        error as Error
      )
      this.emit('error', connectionError)

      if (this.config.autoReconnect) {
        this.scheduleReconnect()
      }

      throw connectionError
    }
  }

  async disconnect(): Promise<void> {
    if (this.deviceId) {
      try {
        await BleClient.disconnect(this.deviceId)
      } catch (error) {
        console.error('Error disconnecting:', error)
      }
    }

    this.status = 'disconnected'
    this.device = null
    this.clearReconnectTimer()
    this.connectionInfo.status = 'disconnected'
    this.emit('disconnected', null)
  }

  isConnected(): boolean {
    return this.status === 'connected' && this.deviceId !== null
  }

  getConnectionInfo(): ConnectionInfo {
    return { ...this.connectionInfo }
  }

  async discover(): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Scan for HiFi Baby devices
      const devices: BleDevice[] = []

      await BleClient.requestLEScan(
        {
          services: BLE.ALL_SERVICE_UUIDS as unknown as string[],
          namePrefix: BLE.DEFAULT_DEVICE_NAME
        },
        (result) => {
          const exists = devices.find(d => d.deviceId === result.device.deviceId)
          if (!exists) {
            devices.push(result.device)
          }
        }
      )

      // Stop scan after duration
      await new Promise(resolve => setTimeout(resolve, BLE.SCAN_DURATION))
      await BleClient.stopLEScan()

      // Return first device found
      if (devices.length > 0) {
        this.deviceId = devices[0].deviceId
        return devices[0].deviceId
      }

      return null
    } catch {
      return null
    }
  }

  // ========================================================================
  // Track Control
  // ========================================================================

  async playTrack(trackID: string): Promise<void> {
    const command: Protocol.TrackControlCommand = {
      command: 'play',
      track_id: trackID
    }
    await this.writeCharacteristic(
      BLE.AUDIO_CONTROL_SERVICE_UUID,
      BLE.TRACK_CONTROL_CHAR_UUID,
      command
    )
  }

  async pauseTrack(): Promise<void> {
    const command: Protocol.TrackControlCommand = {
      command: 'pause'
    }
    await this.writeCharacteristic(
      BLE.AUDIO_CONTROL_SERVICE_UUID,
      BLE.TRACK_CONTROL_CHAR_UUID,
      command
    )
  }

  async resumeTrack(): Promise<void> {
    const command: Protocol.TrackControlCommand = {
      command: 'resume'
    }
    await this.writeCharacteristic(
      BLE.AUDIO_CONTROL_SERVICE_UUID,
      BLE.TRACK_CONTROL_CHAR_UUID,
      command
    )
  }

  async stopTrack(): Promise<void> {
    const command: Protocol.TrackControlCommand = {
      command: 'stop'
    }
    await this.writeCharacteristic(
      BLE.AUDIO_CONTROL_SERVICE_UUID,
      BLE.TRACK_CONTROL_CHAR_UUID,
      command
    )
  }

  async setTrackPosition(position: number): Promise<void> {
    const command: Protocol.PositionCommand = {
      position
    }
    await this.writeCharacteristic(
      BLE.AUDIO_CONTROL_SERVICE_UUID,
      BLE.TRACK_POSITION_CHAR_UUID,
      command
    )
  }

  // ========================================================================
  // Volume Control
  // ========================================================================

  async increaseVolume(): Promise<void> {
    const command: Protocol.VolumeCommand = {
      command: 'increase'
    }
    await this.writeCharacteristic(
      BLE.AUDIO_CONTROL_SERVICE_UUID,
      BLE.VOLUME_CONTROL_CHAR_UUID,
      command
    )
  }

  async decreaseVolume(): Promise<void> {
    const command: Protocol.VolumeCommand = {
      command: 'decrease'
    }
    await this.writeCharacteristic(
      BLE.AUDIO_CONTROL_SERVICE_UUID,
      BLE.VOLUME_CONTROL_CHAR_UUID,
      command
    )
  }

  async muteVolume(enable: boolean): Promise<void> {
    const command: Protocol.VolumeCommand = {
      command: 'mute',
      enable
    }
    await this.writeCharacteristic(
      BLE.AUDIO_CONTROL_SERVICE_UUID,
      BLE.VOLUME_CONTROL_CHAR_UUID,
      command
    )
  }

  // ========================================================================
  // Track Management
  // ========================================================================

  async listTracks(): Promise<TrackModel[]> {
    const response = await this.readCharacteristic<Protocol.TrackListResponse>(
      BLE.AUDIO_CONTROL_SERVICE_UUID,
      BLE.TRACK_LIST_CHAR_UUID
    )

    if (Protocol.isSuccessResponse(response)) {
      return response.data.tracks
    }

    throw new Error(response.error || 'Failed to list tracks')
  }

  async getCurrentPlayerState(): Promise<MusicPlayerModel> {
    const response = await this.readCharacteristic<Protocol.PlayerStateResponse>(
      BLE.AUDIO_CONTROL_SERVICE_UUID,
      BLE.PLAYER_STATE_CHAR_UUID
    )

    if (Protocol.isSuccessResponse(response)) {
      const state = response.data
      return {
        currentTrack: state.track,
        isPlaying: state.isPlaying,
        isMuted: state.isMuted,
        position: state.position
      }
    }

    throw new Error(response.error || 'Failed to get player state')
  }

  async addTrack(file: File): Promise<void> {
    if (!this.deviceId) {
      throw new UploadError('bluetooth', 'Not connected')
    }

    try {
      // Read file as ArrayBuffer
      const fileData = await file.arrayBuffer()
      const checksum = await Protocol.calculateChecksum(fileData)

      // 1. Initiate upload
      const initCommand: Protocol.UploadControlCommand = {
        command: 'init',
        filename: file.name,
        size: file.size,
        checksum
      }

      const initResponse = await this.writeAndReadResponse<Protocol.UploadInitResponse>(
        BLE.TRACK_MANAGEMENT_SERVICE_UUID,
        BLE.UPLOAD_CONTROL_CHAR_UUID,
        initCommand
      )

      if (!Protocol.isSuccessResponse(initResponse)) {
        throw new Error(initResponse.error || 'Upload init failed')
      }

      const { session_id, chunk_size } = initResponse.data

      // 2. Upload chunks
      const chunks = Protocol.splitFileIntoChunks(fileData, chunk_size)
      for (let i = 0; i < chunks.length; i++) {
        const chunkData = Protocol.createUploadChunk(session_id, i, chunks[i])

        await BleClient.write(
          this.deviceId,
          BLE.TRACK_MANAGEMENT_SERVICE_UUID,
          BLE.UPLOAD_DATA_CHAR_UUID,
          chunkData
        )

        // Emit progress
        const progress: UploadProgress = {
          filename: file.name,
          received: (i + 1) * chunk_size,
          total: file.size,
          percent: ((i + 1) / chunks.length) * 100
        }
        this.emit('upload-progress', progress)
      }

      // 3. Finalize upload
      const finalizeCommand: Protocol.UploadControlCommand = {
        command: 'finalize',
        session_id
      }

      const finalizeResponse = await this.writeAndReadResponse<Protocol.UploadFinalizeResponse>(
        BLE.TRACK_MANAGEMENT_SERVICE_UUID,
        BLE.UPLOAD_CONTROL_CHAR_UUID,
        finalizeCommand
      )

      if (!Protocol.isSuccessResponse(finalizeResponse)) {
        throw new Error(finalizeResponse.error || 'Upload finalization failed')
      }

      // Track uploaded successfully
    } catch (error) {
      throw new UploadError('bluetooth', 'Upload failed', error as Error)
    }
  }

  async removeTrack(trackID: string): Promise<void> {
    const command: Protocol.TrackDeleteCommand = {
      track_id: trackID
    }
    await this.writeCharacteristic(
      BLE.TRACK_MANAGEMENT_SERVICE_UUID,
      BLE.TRACK_DELETE_CHAR_UUID,
      command
    )
  }

  // ========================================================================
  // Event Handling
  // ========================================================================

  on(event: TransportEventType, callback: (data: unknown) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)
  }

  off(event: TransportEventType, callback: (data: unknown) => void): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  removeAllListeners(): void {
    this.eventListeners.clear()
  }

  // ========================================================================
  // Cleanup
  // ========================================================================

  async dispose(): Promise<void> {
    this.clearReconnectTimer()
    this.removeAllListeners()
    await this.disconnect()
  }

  // ========================================================================
  // Helper Methods
  // ========================================================================

  /**
   * Write to a characteristic
   */
  private async writeCharacteristic(
    serviceUUID: string,
    characteristicUUID: string,
    command: unknown
  ): Promise<void> {
    if (!this.deviceId) {
      throw new ConnectionError('bluetooth', 'Not connected')
    }

    const data = Protocol.encodeCommand(command)
    await BleClient.write(this.deviceId, serviceUUID, characteristicUUID, data)
  }

  /**
   * Read from a characteristic
   */
  private async readCharacteristic<T>(
    serviceUUID: string,
    characteristicUUID: string
  ): Promise<Protocol.BleResponse<T>> {
    if (!this.deviceId) {
      throw new ConnectionError('bluetooth', 'Not connected')
    }

    const dataView = await BleClient.read(
      this.deviceId,
      serviceUUID,
      characteristicUUID
    )

    return Protocol.decodeResponseFromDataView<T>(dataView)
  }

  /**
   * Write to characteristic and read response (for commands that return data)
   */
  private async writeAndReadResponse<T>(
    serviceUUID: string,
    characteristicUUID: string,
    command: unknown
  ): Promise<Protocol.BleResponse<T>> {
    await this.writeCharacteristic(serviceUUID, characteristicUUID, command)

    // Wait a bit for processing
    await new Promise(resolve => setTimeout(resolve, 100))

    return this.readCharacteristic<T>(serviceUUID, characteristicUUID)
  }

  /**
   * Setup notifications for real-time updates
   */
  private async setupNotifications(): Promise<void> {
    if (!this.deviceId) {
      return
    }

    try {
      // Subscribe to player state notifications
      await BleClient.startNotifications(
        this.deviceId,
        BLE.AUDIO_CONTROL_SERVICE_UUID,
        BLE.PLAYER_STATE_CHAR_UUID,
        (value) => {
          const response = Protocol.decodeResponseFromDataView<Protocol.PlayerStateResponse>(value)
          if (Protocol.isSuccessResponse(response)) {
            this.emit('player-state-changed', response.data)
          }
        }
      )

      // Subscribe to upload status notifications
      await BleClient.startNotifications(
        this.deviceId,
        BLE.TRACK_MANAGEMENT_SERVICE_UUID,
        BLE.UPLOAD_STATUS_CHAR_UUID,
        (value) => {
          const response = Protocol.decodeResponseFromDataView<Protocol.UploadProgressResponse>(value)
          if (Protocol.isSuccessResponse(response)) {
            this.emit('upload-progress', response.data)
          }
        }
      )
    } catch {
      // Failed to setup notifications
    }
  }

  /**
   * Emit an event to all listeners
   */
  private emit(event: TransportEventType, data: unknown): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data)
        } catch {
          // Error in event listener
        }
      })
    }
  }

  /**
   * Handle connection loss
   */
  private handleDisconnection(): void {
    if (this.status === 'connected') {
      this.status = 'disconnected'
      this.connectionInfo.status = 'disconnected'
      this.device = null
      this.emit('disconnected', null)

      if (this.config.autoReconnect) {
        this.scheduleReconnect()
      }
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    this.clearReconnectTimer()

    this.status = 'reconnecting'
    this.connectionInfo.status = 'reconnecting'

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect()
      } catch {
        // Reconnection attempt failed
      }
    }, this.config.reconnectInterval)
  }

  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }
  }
}
