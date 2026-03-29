/**
 * Capability detection composable
 * Detects available platform capabilities (Bluetooth, file system, network, etc.)
 */
import { reactive, computed, type ComputedRef } from 'vue'
import { Capacitor } from '@capacitor/core'
import type { Capabilities, CapabilityState } from '@/types/capabilities'

interface UseCapabilitiesReturn {
  platform: string
  isNative: boolean
  isWeb: boolean
  capabilities: Capabilities
  detectAll: () => Promise<void>
  hasBluetoothSupport: ComputedRef<boolean>
  hasNetworkDiscovery: ComputedRef<boolean>
  hasNativeFilePicker: ComputedRef<boolean>
}

export function useCapabilities(): UseCapabilitiesReturn {
  const platform = Capacitor.getPlatform()
  const isNative = Capacitor.isNativePlatform()
  const isWeb = !isNative

  const capabilities = reactive<Capabilities>({
    bluetooth: {
      available: false,
      permission: 'unknown',
      supported: false
    },
    camera: {
      available: false,
      permission: 'unknown',
      supported: false
    },
    fileSystem: {
      available: true,
      permission: 'granted',
      supported: true,
      type: isNative ? 'native' : 'web'
    },
    network: {
      available: true,
      permission: 'granted',
      supported: true,
      discovery: false
    },
    localStorage: {
      available: true,
      permission: 'granted',
      supported: true
    },
    notifications: {
      available: false,
      permission: 'unknown',
      supported: false
    }
  })

  /**
   * Detect Bluetooth capability
   */
  async function detectBluetoothCapability(): Promise<void> {
    if (isNative) {
      // On native platforms, check if Bluetooth plugin is available
      // We'll implement the actual plugin integration in Phase 3
      capabilities.bluetooth.supported = Capacitor.isPluginAvailable('BluetoothLe')
      capabilities.bluetooth.available = capabilities.bluetooth.supported

      if (capabilities.bluetooth.supported) {
        capabilities.bluetooth.permission = 'prompt' // Will request when used
      }
    } else {
      // Web Bluetooth API
      if ('bluetooth' in navigator) {
        capabilities.bluetooth.supported = true
        capabilities.bluetooth.available = true
        capabilities.bluetooth.permission = 'prompt'
      }
    }
  }

  /**
   * Detect network capability
   */
  async function detectNetworkCapability(): Promise<void> {
    capabilities.network.available = true
    capabilities.network.supported = true

    if (isNative) {
      // Native platforms can potentially use mDNS discovery
      capabilities.network.discovery = true // Placeholder for Phase 3
    } else {
      // Web relies on manual URL configuration
      capabilities.network.discovery = false
    }
  }

  /**
   * Detect file system capability
   */
  async function detectFileSystemCapability(): Promise<void> {
    if (isNative) {
      capabilities.fileSystem.type = 'native'
      capabilities.fileSystem.available = Capacitor.isPluginAvailable('Filesystem')
      capabilities.fileSystem.supported = capabilities.fileSystem.available
    } else {
      capabilities.fileSystem.type = 'web'
      capabilities.fileSystem.available = true
      capabilities.fileSystem.supported = true
    }
  }

  /**
   * Detect camera capability
   */
  async function detectCameraCapability(): Promise<void> {
    if (isNative) {
      capabilities.camera.supported = Capacitor.isPluginAvailable('Camera')
      capabilities.camera.available = capabilities.camera.supported
      if (capabilities.camera.supported) {
        capabilities.camera.permission = 'prompt'
      }
    } else {
      // Web: Check for getUserMedia
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        capabilities.camera.supported = true
        capabilities.camera.available = true
        capabilities.camera.permission = 'prompt'
      }
    }
  }

  /**
   * Detect notification capability
   */
  async function detectNotificationCapability(): Promise<void> {
    if (isNative) {
      capabilities.notifications.supported = Capacitor.isPluginAvailable('LocalNotifications')
      capabilities.notifications.available = capabilities.notifications.supported
      if (capabilities.notifications.supported) {
        capabilities.notifications.permission = 'prompt'
      }
    } else {
      // Web: Check for Notification API
      if ('Notification' in window) {
        capabilities.notifications.supported = true
        capabilities.notifications.available = true
        const permission = Notification.permission
        capabilities.notifications.permission = permission === 'default' ? 'prompt' : permission as CapabilityState['permission']
      }
    }
  }

  /**
   * Detect all capabilities
   */
  async function detectAll(): Promise<void> {
    try {
      await Promise.all([
        detectBluetoothCapability(),
        detectNetworkCapability(),
        detectFileSystemCapability(),
        detectCameraCapability(),
        detectNotificationCapability()
      ])
    } catch (error) {
      console.error('Error detecting capabilities:', error)
    }
  }

  // Computed helpers
  const hasBluetoothSupport = computed(() =>
    capabilities.bluetooth.available && capabilities.bluetooth.supported
  )

  const hasNetworkDiscovery = computed(() =>
    capabilities.network.discovery
  )

  const hasNativeFilePicker = computed(() =>
    capabilities.fileSystem.type === 'native' && capabilities.fileSystem.available
  )

  return {
    platform,
    isNative,
    isWeb,
    capabilities,
    detectAll,
    hasBluetoothSupport,
    hasNetworkDiscovery,
    hasNativeFilePicker
  }
}
