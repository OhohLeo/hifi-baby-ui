/**
 * Transport Manager
 *
 * Manages multiple transports (WiFi, Bluetooth) with automatic detection,
 * priority-based selection, and failover capabilities.
 */

import { Capacitor } from '@capacitor/core'
import type {
  ITransport,
  TransportType,
  TransportEventType,
  TransportDiscoveryResult,
  ConnectionInfo
} from './transport.interface'
import type { TrackModel, MusicPlayerModel } from '@/models'
import { WiFiTransport } from './wifi-transport'
import { BluetoothTransport } from './bluetooth-transport'
import localStorageService from '@/services/storage'

/**
 * Transport priority order (higher number = higher priority)
 */
const TRANSPORT_PRIORITY: Record<TransportType, number> = {
  bluetooth: 2,
  wifi: 1
}

/**
 * Transport manager configuration
 */
interface TransportManagerConfig {
  /**
   * Preferred transport type (overrides priority)
   */
  preferredTransport?: TransportType

  /**
   * Enable automatic discovery on initialization
   */
  autoDiscover?: boolean

  /**
   * Enable automatic failover to next available transport
   */
  autoFailover?: boolean

  /**
   * WiFi base URL (if known)
   */
  wifiBaseURL?: string

  /**
   * Bluetooth device ID (if known)
   */
  bluetoothDeviceId?: string
}

/**
 * Transport Manager
 * Handles multiple transports with priority and failover
 */
export class TransportManager implements ITransport {
  private transports: Map<TransportType, ITransport>
  private activeTransport: ITransport | null = null
  private config: TransportManagerConfig
  private eventListeners: Map<TransportEventType, Set<(data: unknown) => void>>
  private isInitialized = false

  constructor(config: TransportManagerConfig = {}) {
    this.config = {
      autoDiscover: config.autoDiscover ?? true,
      autoFailover: config.autoFailover ?? true,
      ...config
    }

    this.transports = new Map()
    this.eventListeners = new Map()

    // Initialize transports based on platform
    this.initializeTransports()
  }

  // ========================================================================
  // Initialization
  // ========================================================================

  /**
   * Initialize available transports
   */
  private initializeTransports(): void {
    // WiFi is always available
    const wifiTransport = new WiFiTransport({
      baseURL: this.config.wifiBaseURL || this.getStoredWiFiURL(),
      autoReconnect: this.config.autoFailover
    })
    this.transports.set('wifi', wifiTransport)

    // Bluetooth only on native platforms
    if (Capacitor.isNativePlatform()) {
      const bluetoothTransport = new BluetoothTransport({
        deviceId: this.config.bluetoothDeviceId || this.getStoredBluetoothDeviceId(),
        autoReconnect: this.config.autoFailover
      })
      this.transports.set('bluetooth', bluetoothTransport)
    }

    // Forward events from all transports
    this.transports.forEach((transport, type) => {
      transport.on('connected', (data) => this.handleTransportConnected(type, data))
      transport.on('disconnected', (data) => this.handleTransportDisconnected(type, data))
      transport.on('error', (error) => this.emit('error', error))
      transport.on('player-state-changed', (state) => this.emit('player-state-changed', state))
      transport.on('tracks-changed', (tracks) => this.emit('tracks-changed', tracks))
      transport.on('upload-progress', (progress) => this.emit('upload-progress', progress))
    })
  }

  // ========================================================================
  // Connection Management
  // ========================================================================

  getType(): TransportType {
    return this.activeTransport?.getType() || 'wifi'
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true
    }

    // Initialize all transports
    const results = await Promise.allSettled(
      Array.from(this.transports.values()).map(t => t.initialize())
    )

    this.isInitialized = results.some(r => r.status === 'fulfilled' && r.value)

    // Auto-discover if enabled
    if (this.config.autoDiscover && this.isInitialized) {
      await this.autoConnect()
    }

    return this.isInitialized
  }

  async connect(config?: string): Promise<boolean> {
    // If a specific config is provided, try to determine transport type
    if (config) {
      if (config.startsWith('http://') || config.startsWith('https://')) {
        return this.connectToTransport('wifi', config)
      } else {
        // Assume it's a Bluetooth device ID
        return this.connectToTransport('bluetooth', config)
      }
    }

    // Otherwise, auto-connect
    return this.autoConnect()
  }

  async disconnect(): Promise<void> {
    if (this.activeTransport) {
      await this.activeTransport.disconnect()
      this.activeTransport = null
    }
  }

  isConnected(): boolean {
    return this.activeTransport?.isConnected() || false
  }

  getConnectionInfo(): ConnectionInfo {
    if (this.activeTransport) {
      return this.activeTransport.getConnectionInfo()
    }

    return {
      type: 'wifi',
      status: 'disconnected'
    }
  }

  async discover(): Promise<string | null> {
    const results = await this.discoverAllTransports()

    // Return first available transport based on priority
    const sorted = results
      .filter(r => r.available && r.connection)
      .sort((a, b) => TRANSPORT_PRIORITY[b.type] - TRANSPORT_PRIORITY[a.type])

    return sorted.length > 0 ? sorted[0].connection! : null
  }

  // ========================================================================
  // Auto-Connection & Discovery
  // ========================================================================

  /**
   * Auto-connect to best available transport
   */
  async autoConnect(): Promise<boolean> {
    // Try preferred transport first
    if (this.config.preferredTransport) {
      const transport = this.transports.get(this.config.preferredTransport)
      if (transport) {
        try {
          const connected = await this.connectToTransport(this.config.preferredTransport)
          if (connected) {
return true
}
        } catch {
          // Failed to connect to preferred transport
        }
      }
    }

    // Try transports in priority order
    const sortedTypes = Array.from(this.transports.keys())
      .sort((a, b) => TRANSPORT_PRIORITY[b] - TRANSPORT_PRIORITY[a])

    for (const type of sortedTypes) {
      try {
        const connected = await this.connectToTransport(type)
        if (connected) {
          return true
        }
      } catch {
        // Failed to connect to this transport, try next
      }
    }

    return false
  }

  /**
   * Discover all available transports
   */
  async discoverAllTransports(): Promise<TransportDiscoveryResult[]> {
    const results: TransportDiscoveryResult[] = []

    for (const [type, transport] of this.transports.entries()) {
      try {
        const connection = await transport.discover()
        results.push({
          type,
          available: connection !== null,
          connection: connection ?? undefined
        })
      } catch {
        // Discovery failed for this transport
        results.push({
          type,
          available: false
        })
      }
    }

    return results
  }

  /**
   * Connect to a specific transport
   */
  async connectToTransport(type: TransportType, config?: string): Promise<boolean> {
    const transport = this.transports.get(type)
    if (!transport) {
      throw new Error(`Transport "${type}" not available`)
    }

    // Disconnect current transport
    if (this.activeTransport && this.activeTransport !== transport) {
      await this.activeTransport.disconnect()
    }

    // Try to discover if no config provided
    if (!config) {
      const discovered = await transport.discover()
      if (discovered) {
        config = discovered
      } else {
        // For WiFi, try stored/default URL
        if (type === 'wifi') {
          config = this.getStoredWiFiURL()
        }
      }
    }

    // Connect
    try {
      const connected = await transport.connect(config)
      if (connected) {
        this.activeTransport = transport
        this.storeConnection(type, config || '')
        return true
      }
      return false
    } catch (error) {
      // Try failover
      if (this.config.autoFailover) {
        await this.tryFailover(type)
      }

      throw error
    }
  }

  /**
   * Switch to a different transport
   */
  async switchTransport(type: TransportType): Promise<boolean> {
    if (this.activeTransport?.getType() === type) {
      // Already connected to this transport
      return true
    }

    return this.connectToTransport(type)
  }

  /**
   * Try to failover to another transport
   */
  private async tryFailover(failedType: TransportType): Promise<boolean> {
    const otherTypes = Array.from(this.transports.keys())
      .filter(t => t !== failedType)
      .sort((a, b) => TRANSPORT_PRIORITY[b] - TRANSPORT_PRIORITY[a])

    for (const type of otherTypes) {
      try {
        const connected = await this.connectToTransport(type)
        if (connected) {
          return true
        }
      } catch {
        // Failover to this transport failed, try next
      }
    }

    return false
  }

  // ========================================================================
  // Transport Proxying (ITransport methods)
  // ========================================================================

  async playTrack(trackID: string): Promise<void> {
    return this.executeOnActiveTransport(t => t.playTrack(trackID))
  }

  async pauseTrack(): Promise<void> {
    return this.executeOnActiveTransport(t => t.pauseTrack())
  }

  async resumeTrack(): Promise<void> {
    return this.executeOnActiveTransport(t => t.resumeTrack())
  }

  async stopTrack(): Promise<void> {
    return this.executeOnActiveTransport(t => t.stopTrack())
  }

  async setTrackPosition(position: number): Promise<void> {
    return this.executeOnActiveTransport(t => t.setTrackPosition(position))
  }

  async increaseVolume(): Promise<void> {
    return this.executeOnActiveTransport(t => t.increaseVolume())
  }

  async decreaseVolume(): Promise<void> {
    return this.executeOnActiveTransport(t => t.decreaseVolume())
  }

  async muteVolume(enable: boolean): Promise<void> {
    return this.executeOnActiveTransport(t => t.muteVolume(enable))
  }

  async listTracks(): Promise<TrackModel[]> {
    return this.executeOnActiveTransport(t => t.listTracks())
  }

  async getCurrentPlayerState(): Promise<MusicPlayerModel> {
    return this.executeOnActiveTransport(t => t.getCurrentPlayerState())
  }

  async addTrack(file: File): Promise<void> {
    return this.executeOnActiveTransport(t => t.addTrack(file))
  }

  async removeTrack(trackID: string): Promise<void> {
    return this.executeOnActiveTransport(t => t.removeTrack(trackID))
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
    for (const transport of this.transports.values()) {
      await transport.dispose()
    }
    this.transports.clear()
    this.removeAllListeners()
    this.activeTransport = null
  }

  // ========================================================================
  // Helper Methods
  // ========================================================================

  /**
   * Execute a method on the active transport
   */
  private async executeOnActiveTransport<T>(
    fn: (transport: ITransport) => Promise<T>
  ): Promise<T> {
    if (!this.activeTransport) {
      throw new Error('No active transport')
    }

    try {
      return await fn(this.activeTransport)
    } catch (error) {
      // Try failover on error
      if (this.config.autoFailover) {
        const currentType = this.activeTransport.getType()
        const failedOver = await this.tryFailover(currentType)

        if (failedOver && this.activeTransport) {
          // Retry on new transport
          return await fn(this.activeTransport)
        }
      }

      throw error
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
   * Handle transport connected event
   */
  private handleTransportConnected(type: TransportType, data: unknown): void {
    this.emit('connected', data)
  }

  /**
   * Handle transport disconnected event
   */
  private handleTransportDisconnected(type: TransportType, data: unknown): void {
    // If this was the active transport, try failover
    if (this.activeTransport?.getType() === type && this.config.autoFailover) {
      this.tryFailover(type)
    }

    this.emit('disconnected', data)
  }

  // ========================================================================
  // Storage Helpers
  // ========================================================================

  private getStoredWiFiURL(): string {
    return localStorageService.get<string>('baseURL') || 'http://hifi-baby.local:3000/audio'
  }

  private getStoredBluetoothDeviceId(): string | undefined {
    return localStorageService.get<string>('bluetoothDeviceId') ?? undefined
  }

  private storeConnection(type: TransportType, config: string): void {
    if (type === 'wifi') {
      localStorageService.set('baseURL', config)
    } else if (type === 'bluetooth') {
      localStorageService.set('bluetoothDeviceId', config)
    }
  }

  /**
   * Get all available transports
   */
  getAvailableTransports(): TransportType[] {
    return Array.from(this.transports.keys())
  }

  /**
   * Get specific transport instance
   */
  getTransport(type: TransportType): ITransport | undefined {
    return this.transports.get(type)
  }

  /**
   * Get active transport type
   */
  getActiveTransportType(): TransportType | null {
    return this.activeTransport?.getType() || null
  }
}

// ========================================================================
// Singleton Instance
// ========================================================================

let transportManagerInstance: TransportManager | null = null

/**
 * Get singleton transport manager instance
 */
export function getTransportManager(config?: TransportManagerConfig): TransportManager {
  if (!transportManagerInstance) {
    transportManagerInstance = new TransportManager(config)
  }
  return transportManagerInstance
}

