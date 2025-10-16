<template>
  <v-container>
    <h3>{{ $t('settings.network') }}</h3>

    <!-- Platform Info -->
    <v-chip
      :color="isNative ? 'success' : 'info'"
      variant="tonal"
      size="small"
      class="my-4"
    >
      <v-icon start>
        {{ isNative ? 'mdi-cellphone' : 'mdi-web' }}
      </v-icon>
      {{ platform }} Platform
    </v-chip>

    <!-- Current Connection Status -->
    <v-card
      variant="outlined"
      class="mb-4"
    >
      <v-card-title class="text-subtitle-1">
        <v-icon
          :color="connectionStatusColor"
          start
        >
          {{ connectionStatusIcon }}
        </v-icon>
        Connection Status
      </v-card-title>
      <v-divider />
      <v-card-text>
        <div class="d-flex flex-column gap-2">
          <div>
            <strong>Status:</strong>
            <v-chip
              :color="connectionStatusColor"
              size="small"
              variant="tonal"
              class="ml-2"
            >
              {{ connectionInfo.status }}
            </v-chip>
          </div>
          <div v-if="isConnected">
            <strong>Type:</strong>
            <v-chip
              :color="activeTransport === 'bluetooth' ? 'success' : 'info'"
              size="small"
              variant="tonal"
              class="ml-2"
            >
              <v-icon
                start
                size="small"
              >
                {{ activeTransport === 'bluetooth' ? 'mdi-bluetooth' : 'mdi-wifi' }}
              </v-icon>
              {{ activeTransport }}
            </v-chip>
          </div>
          <div v-if="connectionInfo.name">
            <strong>Device:</strong> {{ connectionInfo.name }}
          </div>
          <div v-if="connectionInfo.address">
            <strong>Address:</strong> {{ connectionInfo.address }}
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Connection Type Selector -->
    <v-card
      v-if="isNative && hasBluetoothSupport"
      variant="outlined"
      class="mb-4"
    >
      <v-card-title class="text-subtitle-1">
        Connection Type
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-radio-group
          v-model="selectedTransport"
          @update:model-value="onTransportChange"
        >
          <v-radio
            label="Bluetooth (Priority)"
            value="bluetooth"
            color="success"
          >
            <template #label>
              <div class="d-flex align-center">
                <v-icon
                  color="success"
                  class="mr-2"
                >
                  mdi-bluetooth
                </v-icon>
                <span>Bluetooth</span>
                <v-chip
                  size="x-small"
                  color="success"
                  variant="tonal"
                  class="ml-2"
                >
                  Priority
                </v-chip>
              </div>
            </template>
          </v-radio>
          <v-radio
            label="WiFi"
            value="wifi"
            color="info"
          >
            <template #label>
              <div class="d-flex align-center">
                <v-icon
                  color="info"
                  class="mr-2"
                >
                  mdi-wifi
                </v-icon>
                <span>WiFi</span>
              </div>
            </template>
          </v-radio>
        </v-radio-group>
      </v-card-text>
    </v-card>

    <!-- Bluetooth Configuration -->
    <v-card
      v-if="selectedTransport === 'bluetooth' && isNative && hasBluetoothSupport"
      variant="outlined"
      class="mb-4"
    >
      <v-card-title class="text-subtitle-1">
        <v-icon
          color="success"
          start
        >
          mdi-bluetooth
        </v-icon>
        Bluetooth Configuration
      </v-card-title>
      <v-divider />
      <v-card-text>
        <!-- Bluetooth Status -->
        <div class="mb-4">
          <div class="text-subtitle-2 mb-2">
            Status
          </div>
          <v-chip
            :color="bluetoothStatus.color"
            variant="tonal"
            size="small"
          >
            <v-icon
              start
              size="small"
            >
              {{ bluetoothStatus.icon }}
            </v-icon>
            {{ bluetoothStatus.text }}
          </v-chip>
        </div>

        <!-- Scan Button -->
        <v-btn
          :loading="isScanning"
          :disabled="!capabilities.bluetooth.available"
          color="success"
          variant="tonal"
          block
          class="mb-4"
          @click="scanForBluetoothDevices"
        >
          <v-icon start>
            mdi-radar
          </v-icon>
          {{ isScanning ? 'Scanning...' : 'Scan for Devices' }}
        </v-btn>

        <!-- Device List -->
        <div v-if="bluetoothDevices.length > 0">
          <div class="text-subtitle-2 mb-2">
            Available Devices
          </div>
          <v-list density="compact">
            <v-list-item
              v-for="device in bluetoothDevices"
              :key="device.id"
              :title="device.name"
              :subtitle="`Signal: ${device.rssi} dBm`"
            >
              <template #prepend>
                <v-icon :color="device.isConnected ? 'success' : 'secondary'">
                  {{ device.isConnected ? 'mdi-bluetooth-connect' : 'mdi-bluetooth' }}
                </v-icon>
              </template>
              <template #append>
                <v-btn
                  v-if="!device.isConnected"
                  variant="text"
                  color="success"
                  size="small"
                  :loading="connectingDeviceId === device.id"
                  @click="connectToBluetoothDevice(device.id)"
                >
                  Connect
                </v-btn>
                <v-chip
                  v-else
                  color="success"
                  size="small"
                  variant="tonal"
                >
                  Connected
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </div>
        <v-alert
          v-else-if="bluetoothScanCompleted && !isScanning"
          type="info"
          variant="tonal"
        >
          No devices found. Try scanning again.
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- WiFi Configuration -->
    <v-card
      v-if="selectedTransport === 'wifi' || !isNative || !hasBluetoothSupport"
      variant="outlined"
      class="mb-4"
    >
      <v-card-title class="text-subtitle-1">
        <v-icon
          color="info"
          start
        >
          mdi-wifi
        </v-icon>
        WiFi Configuration
      </v-card-title>
      <v-divider />
      <v-card-text>
        <!-- Auto-discovery Button -->
        <v-btn
          v-if="hasNetworkDiscovery"
          :loading="isDiscovering"
          color="info"
          variant="tonal"
          block
          class="mb-4"
          @click="attemptWiFiDiscovery"
        >
          <v-icon start>
            mdi-magnify
          </v-icon>
          Auto-Discover
        </v-btn>

        <!-- Manual Configuration -->
        <p class="mb-2 text-body-2">
          Backend URL:
        </p>
        <div class="d-flex flex-column flex-sm-row gap-2">
          <v-text-field
            v-model="baseURL"
            label="Backend URL"
            placeholder="http://hifi-baby.local:3000/audio"
            variant="outlined"
            density="comfortable"
            clearable
            :disabled="isValidating"
            class="flex-grow-1"
          />
          <v-btn
            :color="testStatus.color"
            :loading="isValidating"
            size="large"
            @click="testWiFiConnection"
          >
            <v-icon start>
              {{ testStatus.icon }}
            </v-icon>
            Test
          </v-btn>
        </div>

        <!-- Connection Status -->
        <v-expand-transition>
          <v-alert
            v-if="connectionTested"
            :type="testStatus.color === 'success' ? 'success' : 'error'"
            variant="tonal"
            class="mt-2"
          >
            {{ connectionMessage }}
          </v-alert>
        </v-expand-transition>
      </v-card-text>
    </v-card>

    <!-- Connection Tips -->
    <v-card
      variant="tonal"
      color="info"
      class="mt-4"
    >
      <v-card-text>
        <div class="text-subtitle-2 mb-2">
          <v-icon start>
            mdi-help-circle
          </v-icon>
          Connection Tips
        </div>
        <ul class="text-body-2">
          <li v-if="isNative && hasBluetoothSupport">
            <strong>Bluetooth:</strong> Ensure Bluetooth is enabled and device is nearby
          </li>
          <li v-if="isNative">
            <strong>WiFi:</strong> Ensure your device is on the same network as your Hifi Baby server
          </li>
          <li v-if="!isNative">
            Make sure your Hifi Baby backend is running and accessible
          </li>
          <li>
            Try <code>http://hifi-baby.local:3000/audio</code> for mDNS discovery
          </li>
          <li>
            Or use direct IP: <code>http://192.168.x.x:3000/audio</code>
          </li>
        </ul>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCapabilities } from '@/composables/useCapabilities'
import { usePlatform } from '@/composables/usePlatform'
import { useConnection } from '@/composables/useConnection'
import { bluetoothService, type HifiBabyDevice } from '@/services/platform/bluetooth.service'
import type { TransportType } from '@/services/transport/transport.interface'

const { platform, isNative } = usePlatform()
const { capabilities, detectAll, hasNetworkDiscovery } = useCapabilities()

// Connection composable
const {
  isConnected,
  activeTransport,
  connectionInfo,
  isDiscovering,
  discoverTransport,
  switchTransport,
  connectToWiFi,
  connectToBluetooth,
  getWiFiURL
} = useConnection()

// Transport selection
const selectedTransport = ref<TransportType>('wifi')

// WiFi state
const baseURL = ref(getWiFiURL() || 'http://hifi-baby.local:3000/audio')
const testStatus = ref({ color: 'primary', icon: 'mdi-play-circle' })
const isValidating = ref(false)
const connectionTested = ref(false)
const connectionMessage = ref('')

// Bluetooth state
const isScanning = ref(false)
const bluetoothScanCompleted = ref(false)
const bluetoothDevices = ref<HifiBabyDevice[]>([])
const connectingDeviceId = ref<string | null>(null)

// Computed properties
const hasBluetoothSupport = computed(() =>
  capabilities.bluetooth.supported && capabilities.bluetooth.available
)

const connectionStatusColor = computed(() => {
  switch (connectionInfo.value.status) {
    case 'connected':
      return 'success'
    case 'connecting':
    case 'reconnecting':
      return 'warning'
    case 'error':
      return 'error'
    default:
      return 'secondary'
  }
})

const connectionStatusIcon = computed(() => {
  switch (connectionInfo.value.status) {
    case 'connected':
      return 'mdi-check-network'
    case 'connecting':
    case 'reconnecting':
      return 'mdi-loading'
    case 'error':
      return 'mdi-alert-circle'
    default:
      return 'mdi-network-off'
  }
})

const bluetoothStatus = computed(() => {
  if (!capabilities.bluetooth.supported) {
    return { color: 'error', icon: 'mdi-bluetooth-off', text: 'Not supported' }
  }
  if (!capabilities.bluetooth.available) {
    return { color: 'error', icon: 'mdi-bluetooth-off', text: 'Not available' }
  }
  if (isConnected.value && activeTransport.value === 'bluetooth') {
    return { color: 'success', icon: 'mdi-bluetooth-connect', text: 'Connected' }
  }
  return { color: 'info', icon: 'mdi-bluetooth', text: 'Ready' }
})

// Methods
async function onTransportChange(newTransport: TransportType) {
  if (newTransport === activeTransport.value) {
    return
  }

  try {
    await switchTransport(newTransport)
  } catch (error) {
    console.error('Failed to switch transport:', error)
  }
}

async function scanForBluetoothDevices() {
  isScanning.value = true
  bluetoothScanCompleted.value = false
  bluetoothDevices.value = []

  try {
    const devices = await bluetoothService.scan(10000)
    bluetoothDevices.value = devices
    bluetoothScanCompleted.value = true
  } catch (error) {
    console.error('Bluetooth scan failed:', error)
    bluetoothScanCompleted.value = true
  } finally {
    isScanning.value = false
  }
}

async function connectToBluetoothDevice(deviceId: string) {
  connectingDeviceId.value = deviceId

  try {
    await connectToBluetooth(deviceId)
    // Update device list
    bluetoothDevices.value = bluetoothDevices.value.map(d => ({
      ...d,
      isConnected: d.id === deviceId
    }))
  } catch (error) {
    console.error('Failed to connect to Bluetooth device:', error)
  } finally {
    connectingDeviceId.value = null
  }
}

async function attemptWiFiDiscovery() {
  try {
    const discovered = await discoverTransport('wifi')
    if (discovered) {
      baseURL.value = discovered
      await testWiFiConnection()
    }
  } catch {
    // Discovery failed, user can enter URL manually
  }
}

async function testWiFiConnection() {
  if (!baseURL.value) {
    testStatus.value = { color: 'error', icon: 'mdi-alert-circle' }
    connectionTested.value = true
    connectionMessage.value = 'Please enter a valid URL'
    return
  }

  testStatus.value = { color: 'primary', icon: 'mdi-play-circle' }
  isValidating.value = true
  connectionTested.value = false

  try {
    await connectToWiFi(baseURL.value)

    testStatus.value = { color: 'success', icon: 'mdi-check-circle' }
    connectionMessage.value = `Successfully connected to ${baseURL.value}`
    connectionTested.value = true
  } catch {
    testStatus.value = { color: 'error', icon: 'mdi-alert-circle' }
    connectionMessage.value = `Failed to connect to ${baseURL.value}. Please check the URL and try again.`
    connectionTested.value = true
  } finally {
    isValidating.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await detectAll()

  // Set initial transport based on current connection
  if (activeTransport.value) {
    selectedTransport.value = activeTransport.value
  } else if (isNative && hasBluetoothSupport.value) {
    selectedTransport.value = 'bluetooth'
  }

  // Update WiFi URL from connection info
  const currentWiFiURL = getWiFiURL()
  if (currentWiFiURL) {
    baseURL.value = currentWiFiURL
  }
})
</script>
