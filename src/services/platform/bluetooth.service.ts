/**
 * Bluetooth service abstraction
 * Provides a unified interface for Bluetooth Low Energy operations
 */
import { BleClient } from '@capacitor-community/bluetooth-le'
import { Capacitor } from '@capacitor/core'

export interface HifiBabyDevice {
  id: string
  name: string
  address: string
  rssi: number
  isConnected: boolean
}

export class BluetoothService {
  private devices: HifiBabyDevice[] = []
  private isScanning = false
  private isInitialized = false

  /**
   * Initialize Bluetooth LE client
   */
  async initialize(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Bluetooth only available on native platforms')
      return false
    }

    if (this.isInitialized) {
      return true
    }

    try {
      await BleClient.initialize()
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Bluetooth initialization failed:', error)
      return false
    }
  }

  /**
   * Request Bluetooth permissions (Android 12+)
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // The plugin handles permissions automatically on most platforms
      // This is a placeholder for explicit permission requests if needed
      return true
    } catch (error) {
      console.error('Bluetooth permission request failed:', error)
      return false
    }
  }

  /**
   * Scan for Bluetooth LE devices
   * @param duration - Scan duration in milliseconds (default: 10000)
   */
  async scan(duration: number = 10000): Promise<HifiBabyDevice[]> {
    if (this.isScanning) {
      console.warn('Scan already in progress')
      return this.devices
    }

    if (!this.isInitialized) {
      const initialized = await this.initialize()
      if (!initialized) {
        throw new Error('Failed to initialize Bluetooth')
      }
    }

    this.isScanning = true
    this.devices = []

    try {
      await BleClient.requestLEScan(
        {
          // Filter for Hifi Baby devices
          // You can add services UUID here when available
          // services: ['UUID-OF-HIFI-BABY-SERVICE']
        },
        (result) => {
          const device: HifiBabyDevice = {
            id: result.device.deviceId,
            name: result.device.name || 'Unknown Device',
            address: result.device.deviceId,
            rssi: result.rssi || 0,
            isConnected: false
          }

          // Avoid duplicates
          const exists = this.devices.find(d => d.id === device.id)
          if (!exists) {
            this.devices.push(device)
          } else {
            // Update RSSI if device already exists
            exists.rssi = device.rssi
          }
        }
      )

      // Stop scan after duration
      setTimeout(async () => {
        await this.stopScan()
      }, duration)

      return this.devices
    } catch (error) {
      console.error('Bluetooth scan failed:', error)
      this.isScanning = false
      throw error
    }
  }

  /**
   * Stop scanning for devices
   */
  async stopScan(): Promise<void> {
    if (this.isScanning) {
      try {
        await BleClient.stopLEScan()
        this.isScanning = false
      } catch (error) {
        console.error('Failed to stop Bluetooth scan:', error)
      }
    }
  }

  /**
   * Connect to a device
   */
  async connect(deviceId: string): Promise<boolean> {
    try {
      await BleClient.connect(
        deviceId,
        (disconnectedDeviceId) => {
          console.log(`Device ${disconnectedDeviceId} disconnected`)
          const device = this.devices.find(d => d.id === disconnectedDeviceId)
          if (device) {
            device.isConnected = false
          }
        }
      )

      const device = this.devices.find(d => d.id === deviceId)
      if (device) {
        device.isConnected = true
      }

      return true
    } catch (error) {
      console.error('Bluetooth connection failed:', error)
      return false
    }
  }

  /**
   * Disconnect from a device
   */
  async disconnect(deviceId: string): Promise<void> {
    try {
      await BleClient.disconnect(deviceId)
      const device = this.devices.find(d => d.id === deviceId)
      if (device) {
        device.isConnected = false
      }
    } catch (error) {
      console.error('Bluetooth disconnection failed:', error)
    }
  }

  /**
   * Get list of discovered devices
   */
  getDevices(): HifiBabyDevice[] {
    return this.devices
  }

  /**
   * Check if a device is connected
   */
  isDeviceConnected(deviceId: string): boolean {
    const device = this.devices.find(d => d.id === deviceId)
    return device?.isConnected || false
  }

  /**
   * Check if scanning is in progress
   */
  isScanningInProgress(): boolean {
    return this.isScanning
  }

  /**
   * Clear device list
   */
  clearDevices(): void {
    this.devices = []
  }
}

export const bluetoothService = new BluetoothService()
