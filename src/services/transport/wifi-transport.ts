/**
 * WiFi Transport Implementation
 *
 * HTTP/REST API transport using Axios
 * Wraps the existing API service to implement the ITransport interface
 */

import axios, { type AxiosInstance } from 'axios'
import { Capacitor } from '@capacitor/core'
import type {
  ITransport,
  TransportType,
  TransportStatus,
  TransportEventType,
  ConnectionInfo
} from './transport.interface'
import { ConnectionError, CommandTimeoutError } from './transport.interface'
import type { TrackModel, MusicPlayerModel } from '@/models'
import { networkService } from '@/services/platform/network.service'

/**
 * WiFi transport configuration
 */
interface WiFiTransportConfig {
  baseURL?: string
  timeout?: number
  autoReconnect?: boolean
  reconnectInterval?: number
}

/**
 * WiFi transport implementation using HTTP/REST API
 */
export class WiFiTransport implements ITransport {
  private client: AxiosInstance
  private status: TransportStatus = 'disconnected'
  private baseURL: string
  private eventListeners: Map<TransportEventType, Set<(data: unknown) => void>>
  private config: WiFiTransportConfig
  private reconnectTimer?: ReturnType<typeof setTimeout>
  private connectionInfo: ConnectionInfo

  constructor(config: WiFiTransportConfig = {}) {
    this.config = {
      timeout: config.timeout || 10000,
      autoReconnect: config.autoReconnect ?? true,
      reconnectInterval: config.reconnectInterval || 5000,
      ...config
    }

    this.baseURL = config.baseURL || 'http://localhost:3000/audio'
    this.eventListeners = new Map()
    this.connectionInfo = {
      type: 'wifi',
      status: 'disconnected'
    }

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add platform headers for native apps
    if (Capacitor.isNativePlatform()) {
      this.client.interceptors.request.use((config) => {
        config.headers['X-App-Platform'] = Capacitor.getPlatform()
        config.headers['X-App-Version'] = '1.0.0'
        return config
      })
    }

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNABORTED') {
            throw new CommandTimeoutError('wifi', error.config?.url || 'unknown')
          }
          if (error.response?.status === 0 || error.code === 'ERR_NETWORK') {
            this.handleDisconnection()
          }
        }
        throw error
      }
    )
  }

  // ========================================================================
  // Connection Management
  // ========================================================================

  getType(): TransportType {
    return 'wifi'
  }

  async initialize(): Promise<boolean> {
    return true
  }

  async connect(url?: string): Promise<boolean> {
    if (url) {
      this.setBaseURL(url)
    }

    this.status = 'connecting'
    this.emit('connecting', null)

    try {
      // Test connection with a simple API call
      await this.getCurrentPlayerState()

      this.status = 'connected'
      this.connectionInfo = {
        type: 'wifi',
        status: 'connected',
        address: this.extractHostFromURL(this.baseURL)
      }

      this.emit('connected', this.connectionInfo)
      return true
    } catch (error) {
      this.status = 'error'
      const connectionError = new ConnectionError(
        'wifi',
        'Failed to connect to backend',
        error as Error
      )
      this.emit('error', connectionError)

      // Auto-reconnect if enabled
      if (this.config.autoReconnect) {
        this.scheduleReconnect()
      }

      throw connectionError
    }
  }

  async disconnect(): Promise<void> {
    this.status = 'disconnected'
    this.clearReconnectTimer()
    this.connectionInfo.status = 'disconnected'
    this.emit('disconnected', null)
  }

  isConnected(): boolean {
    return this.status === 'connected'
  }

  getConnectionInfo(): ConnectionInfo {
    return { ...this.connectionInfo }
  }

  async discover(): Promise<string | null> {
    try {
      const url = await networkService.discoverBackend()
      if (url) {
        // Ensure URL ends with /audio
        return url.endsWith('/audio') ? url : `${url}/audio`
      }
      return null
    } catch (error) {
      console.error('WiFi discovery failed:', error)
      return null
    }
  }

  // ========================================================================
  // Track Control
  // ========================================================================

  async playTrack(trackID: string): Promise<void> {
    await this.client.post(`/play/${trackID}`)
  }

  async pauseTrack(): Promise<void> {
    await this.client.post('/pause')
  }

  async resumeTrack(): Promise<void> {
    await this.client.post('/resume')
  }

  async stopTrack(): Promise<void> {
    await this.client.post('/stop')
  }

  async setTrackPosition(position: number): Promise<void> {
    await this.client.post('/play/position', { position })
  }

  // ========================================================================
  // Volume Control
  // ========================================================================

  async increaseVolume(): Promise<void> {
    await this.client.post('/volume/up')
  }

  async decreaseVolume(): Promise<void> {
    await this.client.post('/volume/down')
  }

  async muteVolume(enable: boolean): Promise<void> {
    await this.client.post('/volume/mute', null, {
      params: { enable }
    })
  }

  // ========================================================================
  // Track Management
  // ========================================================================

  async listTracks(): Promise<TrackModel[]> {
    const response = await this.client.get('/tracks')
    return response.data
  }

  async getCurrentPlayerState(): Promise<MusicPlayerModel> {
    const response = await this.client.get('/state')
    return response.data
  }

  async addTrack(file: File): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)

    // Upload with progress tracking
    await this.client.post('/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = (progressEvent.loaded / progressEvent.total) * 100
          this.emit('upload-progress', {
            filename: file.name,
            received: progressEvent.loaded,
            total: progressEvent.total,
            percent
          })
        }
      }
    })
  }

  async removeTrack(trackID: string): Promise<void> {
    await this.client.delete(`/${trackID}`)
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
   * Set base URL for API calls
   */
  setBaseURL(url: string): void {
    this.baseURL = url
    this.client.defaults.baseURL = url
    this.connectionInfo.address = this.extractHostFromURL(url)
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.baseURL
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
        } catch (error) {
          console.error(`Error in ${event} event listener:`, error)
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
      } catch (error) {
        // Will schedule another reconnect in the connect method
        console.error('Reconnection attempt failed:', error)
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

  /**
   * Extract host from URL
   */
  private extractHostFromURL(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.host
    } catch {
      return url
    }
  }
}
