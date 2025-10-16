/**
 * Network discovery service
 * Handles backend discovery across different platforms
 */
import { Capacitor } from '@capacitor/core'
import localStorageService from '@/services/storage'

export interface ConnectionConfig {
  baseURL: string
  discoveryMethod: 'manual' | 'mdns' | 'bluetooth'
  isConnected: boolean
}

export class NetworkService {
  private config: ConnectionConfig = {
    baseURL: 'http://hifi-baby.local:3000/audio',
    discoveryMethod: 'manual',
    isConnected: false
  }

  /**
   * Discover backend based on platform
   */
  async discoverBackend(): Promise<string | null> {
    const platform = Capacitor.getPlatform()

    if (platform === 'web') {
      return this.webDiscovery()
    } else if (platform === 'android') {
      return this.androidDiscovery()
    } else if (platform === 'ios') {
      return this.iosDiscovery()
    }

    return null
  }

  /**
   * Web discovery strategy
   */
  private async webDiscovery(): Promise<string | null> {
    // Try stored URL first
    const storedURL = localStorageService.get<string>('baseURL')
    if (storedURL) {
      const isValid = await this.validateConnection(storedURL)
      if (isValid) {
        this.config.baseURL = storedURL
        this.config.isConnected = true
        return storedURL
      }
    }

    // Try default mDNS URL
    const defaultURL = 'http://hifi-baby.local:3000/audio'
    const isValid = await this.validateConnection(defaultURL)
    if (isValid) {
      this.config.baseURL = defaultURL
      this.config.isConnected = true
      return defaultURL
    }

    return null
  }

  /**
   * Android discovery strategy
   * TODO: Implement NSD (Network Service Discovery) in Phase 3
   */
  private async androidDiscovery(): Promise<string | null> {
    // Try stored URL first
    const storedURL = localStorageService.get<string>('baseURL')
    if (storedURL) {
      const isValid = await this.validateConnection(storedURL)
      if (isValid) {
        this.config.baseURL = storedURL
        this.config.isConnected = true
        return storedURL
      }
    }

    // Fallback to common discovery methods
    return this.fallbackDiscovery()
  }

  /**
   * iOS discovery strategy
   * TODO: Implement Bonjour discovery in Phase 3
   */
  private async iosDiscovery(): Promise<string | null> {
    // Try stored URL first
    const storedURL = localStorageService.get<string>('baseURL')
    if (storedURL) {
      const isValid = await this.validateConnection(storedURL)
      if (isValid) {
        this.config.baseURL = storedURL
        this.config.isConnected = true
        return storedURL
      }
    }

    // Fallback to common discovery methods
    return this.fallbackDiscovery()
  }

  /**
   * Fallback discovery: try common local IP patterns
   */
  private async fallbackDiscovery(): Promise<string | null> {
    const commonURLs = [
      'http://hifi-baby.local:3000/audio',
      'http://192.168.1.100:3000/audio',
      'http://192.168.0.100:3000/audio',
      'http://10.0.0.100:3000/audio'
    ]

    for (const url of commonURLs) {
      const isValid = await this.validateConnection(url)
      if (isValid) {
        this.config.baseURL = url
        this.config.isConnected = true
        return url
      }
    }

    return null
  }

  /**
   * Validate connection to backend
   */
  private async validateConnection(url: string): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(`${url}/state`, {
        method: 'GET',
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Manually set base URL
   */
  async setBaseURL(url: string): Promise<boolean> {
    const isValid = await this.validateConnection(url)
    if (isValid) {
      this.config.baseURL = url
      this.config.isConnected = true
      this.config.discoveryMethod = 'manual'
      localStorageService.set('baseURL', url)
      return true
    }
    return false
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.config.baseURL
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.config.isConnected
  }

  /**
   * Get connection config
   */
  getConfig(): ConnectionConfig {
    return { ...this.config }
  }
}

export const networkService = new NetworkService()
