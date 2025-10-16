/**
 * Connection Management Composable
 *
 * Provides reactive state and methods for managing transport connections
 * (WiFi and Bluetooth) with auto-detection and switching capabilities
 */

import { ref, computed, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue'
import { getTransportManager, type TransportManager } from '@/services/transport/transport-manager'
import type {
  TransportType,
  ConnectionInfo,
  TransportDiscoveryResult
} from '@/services/transport/transport.interface'

export interface UseConnectionReturn {
  // State
  isConnected: ComputedRef<boolean>
  activeTransport: Ref<TransportType | null>
  connectionInfo: Ref<ConnectionInfo>
  availableTransports: Ref<TransportType[]>
  isConnecting: Ref<boolean>
  isDiscovering: Ref<boolean>
  error: Ref<Error | null>

  // Discovery
  discoverAll: () => Promise<TransportDiscoveryResult[]>
  discoverTransport: (type: TransportType) => Promise<string | null>

  // Connection
  connect: (type?: TransportType, config?: string) => Promise<boolean>
  disconnect: () => Promise<void>
  switchTransport: (type: TransportType) => Promise<boolean>

  // Manual connection
  connectToWiFi: (url: string) => Promise<boolean>
  connectToBluetooth: (deviceId: string) => Promise<boolean>

  // Info
  getWiFiURL: () => string | undefined
  getBluetoothDeviceId: () => string | undefined
}

/**
 * Connection management composable
 */
export function useConnection(): UseConnectionReturn {
  const transportManager: TransportManager = getTransportManager()

  // ========================================================================
  // Reactive State
  // ========================================================================

  const connectionInfo = ref<ConnectionInfo>({
    type: 'wifi',
    status: 'disconnected'
  })

  const activeTransport = ref<TransportType | null>(null)
  const availableTransports = ref<TransportType[]>([])
  const isConnecting = ref(false)
  const isDiscovering = ref(false)
  const error = ref<Error | null>(null)

  // ========================================================================
  // Computed Properties
  // ========================================================================

  const isConnected = computed(() => connectionInfo.value.status === 'connected')

  // ========================================================================
  // Discovery Methods
  // ========================================================================

  /**
   * Discover all available transports
   */
  async function discoverAll(): Promise<TransportDiscoveryResult[]> {
    isDiscovering.value = true
    error.value = null

    try {
      const results = await transportManager.discoverAllTransports()
      availableTransports.value = results
        .filter(r => r.available)
        .map(r => r.type)

      return results
    } catch (err) {
      error.value = err as Error
      console.error('Discovery failed:', err)
      return []
    } finally {
      isDiscovering.value = false
    }
  }

  /**
   * Discover a specific transport
   */
  async function discoverTransport(type: TransportType): Promise<string | null> {
    isDiscovering.value = true
    error.value = null

    try {
      const transport = transportManager.getTransport(type)
      if (!transport) {
        throw new Error(`Transport "${type}" not available`)
      }

      const result = await transport.discover()
      return result
    } catch (err) {
      error.value = err as Error
      console.error(`Discovery failed for ${type}:`, err)
      return null
    } finally {
      isDiscovering.value = false
    }
  }

  // ========================================================================
  // Connection Methods
  // ========================================================================

  /**
   * Connect to a transport
   * @param type - Transport type (if not provided, auto-selects based on priority)
   * @param config - Connection config (URL for WiFi, device ID for Bluetooth)
   */
  async function connect(type?: TransportType, config?: string): Promise<boolean> {
    isConnecting.value = true
    error.value = null

    try {
      let connected = false

      if (type) {
        connected = await transportManager.connectToTransport(type, config)
      } else {
        connected = await transportManager.autoConnect()
      }

      if (connected) {
        updateConnectionState()
      }

      return connected
    } catch (err) {
      error.value = err as Error
      console.error('Connection failed:', err)
      return false
    } finally {
      isConnecting.value = false
    }
  }

  /**
   * Disconnect from current transport
   */
  async function disconnect(): Promise<void> {
    error.value = null

    try {
      await transportManager.disconnect()
      updateConnectionState()
    } catch (err) {
      error.value = err as Error
      console.error('Disconnection failed:', err)
    }
  }

  /**
   * Switch to a different transport
   */
  async function switchTransport(type: TransportType): Promise<boolean> {
    isConnecting.value = true
    error.value = null

    try {
      const switched = await transportManager.switchTransport(type)
      if (switched) {
        updateConnectionState()
      }
      return switched
    } catch (err) {
      error.value = err as Error
      console.error('Transport switch failed:', err)
      return false
    } finally {
      isConnecting.value = false
    }
  }

  /**
   * Connect to WiFi with specific URL
   */
  async function connectToWiFi(url: string): Promise<boolean> {
    return connect('wifi', url)
  }

  /**
   * Connect to Bluetooth with specific device ID
   */
  async function connectToBluetooth(deviceId: string): Promise<boolean> {
    return connect('bluetooth', deviceId)
  }

  // ========================================================================
  // Info Methods
  // ========================================================================

  /**
   * Get WiFi base URL from WiFi transport
   */
  function getWiFiURL(): string | undefined {
    const wifiTransport = transportManager.getTransport('wifi')
    if (wifiTransport && 'getBaseURL' in wifiTransport) {
      return (wifiTransport as { getBaseURL: () => string }).getBaseURL()
    }
    return undefined
  }

  /**
   * Get Bluetooth device ID from connection info
   */
  function getBluetoothDeviceId(): string | undefined {
    const bluetoothTransport = transportManager.getTransport('bluetooth')
    if (bluetoothTransport) {
      const info = bluetoothTransport.getConnectionInfo()
      return info.address
    }
    return undefined
  }

  // ========================================================================
  // State Management
  // ========================================================================

  /**
   * Update connection state from transport manager
   */
  function updateConnectionState(): void {
    connectionInfo.value = transportManager.getConnectionInfo()
    activeTransport.value = transportManager.getActiveTransportType()
    availableTransports.value = transportManager.getAvailableTransports()
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners(): void {
    transportManager.on('connected', () => {
      updateConnectionState()
    })

    transportManager.on('disconnected', () => {
      updateConnectionState()
    })

    transportManager.on('error', (err) => {
      error.value = err as Error
    })
  }

  /**
   * Cleanup event listeners
   */
  function cleanupEventListeners(): void {
    transportManager.removeAllListeners()
  }

  // ========================================================================
  // Lifecycle Hooks
  // ========================================================================

  onMounted(() => {
    setupEventListeners()
    updateConnectionState()
  })

  onUnmounted(() => {
    cleanupEventListeners()
  })

  // ========================================================================
  // Return API
  // ========================================================================

  return {
    // State
    isConnected,
    activeTransport,
    connectionInfo,
    availableTransports,
    isConnecting,
    isDiscovering,
    error,

    // Discovery
    discoverAll,
    discoverTransport,

    // Connection
    connect,
    disconnect,
    switchTransport,

    // Manual connection
    connectToWiFi,
    connectToBluetooth,

    // Info
    getWiFiURL,
    getBluetoothDeviceId
  }
}
