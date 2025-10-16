/**
 * Audio Service API
 *
 * Main API service for the HiFi Baby application
 * Now uses the unified TransportManager for both WiFi and Bluetooth connections
 */

import { getTransportManager } from '@/services/transport/transport-manager'
import type { TransportType } from '@/services/transport/transport.interface'
import localStorageService from '@/services/storage'

// Get singleton transport manager instance
const transportManager = getTransportManager()

const audioService = {
  /**
   * Set base URL for WiFi transport
   * @deprecated Use connectToWiFi or switchTransport instead
   */
  setBaseURL(newBaseURL: string) {
    const wifiTransport = transportManager.getTransport('wifi')
    if (wifiTransport && 'setBaseURL' in wifiTransport) {
      (wifiTransport as any).setBaseURL(newBaseURL)
    }
  },

  /**
   * Add a track (upload file)
   */
  async addTrack(file: File) {
    await transportManager.addTrack(file)
  },

  /**
   * Remove a track
   */
  async removeTrack(trackID: string) {
    await transportManager.removeTrack(trackID)
  },

  /**
   * Play a track
   */
  async playTrack(trackID: string) {
    await transportManager.playTrack(trackID)
  },

  /**
   * Set track playback position
   */
  async setTrackPosition(position: number) {
    await transportManager.setTrackPosition(position)
  },

  /**
   * Pause playback
   */
  async pauseTrack() {
    await transportManager.pauseTrack()
  },

  /**
   * Resume playback
   */
  async resumeTrack() {
    await transportManager.resumeTrack()
  },

  /**
   * Stop playback
   */
  async stopTrack() {
    await transportManager.stopTrack()
  },

  /**
   * List all tracks
   */
  async listTracks() {
    return transportManager.listTracks()
  },

  /**
   * Get current player state
   */
  async getCurrentPlayerState() {
    return transportManager.getCurrentPlayerState()
  },

  /**
   * Increase volume
   */
  async increaseVolume() {
    await transportManager.increaseVolume()
  },

  /**
   * Decrease volume
   */
  async decreaseVolume() {
    await transportManager.decreaseVolume()
  },

  /**
   * Mute/unmute volume
   */
  async muteVolume(isMuted: boolean) {
    await transportManager.muteVolume(isMuted)
  },

  /**
   * Initialize API service with auto-discovery
   * Should be called during app initialization
   */
  async initializeAPI(): Promise<boolean> {
    try {
      await transportManager.initialize()
      // Auto-connect will be handled by the transport manager
      return true
    } catch (error) {
      console.error('Failed to initialize API:', error)
      return false
    }
  },

  /**
   * Get current API base URL (for WiFi transport)
   * @deprecated Use getConnectionInfo instead
   */
  getBaseURL(): string {
    const wifiTransport = transportManager.getTransport('wifi')
    if (wifiTransport && 'getBaseURL' in wifiTransport) {
      return (wifiTransport as any).getBaseURL()
    }
    return localStorageService.get<string>('baseURL') || 'http://localhost:3000/audio'
  },

  // ========================================================================
  // New Transport Management Methods
  // ========================================================================

  /**
   * Get transport manager instance
   */
  getTransportManager() {
    return transportManager
  },

  /**
   * Connect to a specific transport
   */
  async connect(type?: TransportType, config?: string): Promise<boolean> {
    return transportManager.connect(config)
  },

  /**
   * Disconnect from current transport
   */
  async disconnect(): Promise<void> {
    return transportManager.disconnect()
  },

  /**
   * Switch to a different transport
   */
  async switchTransport(type: TransportType): Promise<boolean> {
    return transportManager.switchTransport(type)
  },

  /**
   * Connect to WiFi with specific URL
   */
  async connectToWiFi(url: string): Promise<boolean> {
    return transportManager.connectToTransport('wifi', url)
  },

  /**
   * Connect to Bluetooth with specific device ID
   */
  async connectToBluetooth(deviceId: string): Promise<boolean> {
    return transportManager.connectToTransport('bluetooth', deviceId)
  },

  /**
   * Discover all available transports
   */
  async discoverTransports() {
    return transportManager.discoverAllTransports()
  },

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return transportManager.isConnected()
  },

  /**
   * Get connection info
   */
  getConnectionInfo() {
    return transportManager.getConnectionInfo()
  },

  /**
   * Get active transport type
   */
  getActiveTransport(): TransportType | null {
    return transportManager.getActiveTransportType()
  },

  /**
   * Listen to transport events
   */
  on(event: string, callback: (data: unknown) => void): void {
    transportManager.on(event as any, callback)
  },

  /**
   * Remove event listener
   */
  off(event: string, callback: (data: unknown) => void): void {
    transportManager.off(event as any, callback)
  }
}

export default audioService
