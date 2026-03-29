<template>
  <v-container
    class="connect-root pa-0"
    fluid
  >
    <!-- Current Connection Status -->
    <v-card
      variant="outlined"
      rounded="lg"
      class="connect-card mb-4"
    >
      <v-card-title class="text-subtitle-1">
        <v-icon
          :color="connectionStatusColor"
          start
        >
          {{ connectionStatusIcon }}
        </v-icon>
        {{ $t('settings.connectPanel.connectionStatusTitle') }}
      </v-card-title>
      <v-divider />
      <v-card-text>
        <div class="d-flex flex-column gap-2">
          <div>
            <strong>{{ $t('settings.connectPanel.statusLabel') }}:</strong>
            <v-chip
              :color="connectionStatusColor"
              size="small"
              variant="flat"
              :class="['ml-2', 'connect-status-chip', connectionStatusChipTone]"
            >
              {{ connectionStatusLabel }}
            </v-chip>
          </div>
          <div v-if="isConnected">
            <strong>{{ $t('settings.connectPanel.typeLabel') }}:</strong>
            <v-chip
              :color="activeTransport === 'bluetooth' ? 'success' : 'info'"
              size="small"
              variant="flat"
              :class="['ml-2', 'connect-status-chip', transportChipTone]"
            >
              <v-icon
                start
                size="small"
              >
                {{ activeTransport === 'bluetooth' ? 'mdi-bluetooth' : 'mdi-wifi' }}
              </v-icon>
              {{ transportDisplayName }}
            </v-chip>
          </div>
          <div v-if="connectionInfo.name">
            <strong>{{ $t('settings.connectPanel.deviceLabel') }}:</strong> {{ connectionInfo.name }}
          </div>
          <div v-if="connectionInfo.address">
            <strong>{{ $t('settings.connectPanel.addressLabel') }}:</strong> {{ connectionInfo.address }}
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Connection Type Selector -->
    <v-card
      v-if="isNative && hasBluetoothSupport"
      variant="outlined"
      rounded="lg"
      class="connect-card mb-4"
    >
      <v-card-title class="text-subtitle-1">
        {{ $t('settings.connectPanel.connectionTypeTitle') }}
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-radio-group
          v-model="selectedTransport"
          @update:model-value="onTransportChange"
        >
          <v-radio
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
                <span>{{ $t('settings.connectPanel.bluetooth') }}</span>
                <v-chip
                  size="x-small"
                  color="success"
                  variant="tonal"
                  class="ml-2"
                >
                  {{ $t('settings.connectPanel.priority') }}
                </v-chip>
              </div>
            </template>
          </v-radio>
          <v-radio
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
                <span>{{ $t('settings.connectPanel.wifi') }}</span>
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
      rounded="lg"
      class="connect-card mb-4"
    >
      <v-card-title class="text-subtitle-1">
        <v-icon
          color="success"
          start
        >
          mdi-bluetooth
        </v-icon>
        {{ $t('settings.connectPanel.bluetoothConfigTitle') }}
      </v-card-title>
      <v-divider />
      <v-card-text>
        <!-- Bluetooth Status -->
        <div class="mb-4">
          <div class="text-subtitle-2 mb-2">
            {{ $t('settings.connectPanel.btStatus') }}
          </div>
          <v-chip
            :color="bluetoothStatus.color"
            variant="flat"
            size="small"
            class="connect-status-chip"
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
          {{ isScanning ? $t('settings.connectPanel.scanning') : $t('settings.connectPanel.scanDevices') }}
        </v-btn>

        <!-- Device List -->
        <div v-if="bluetoothDevices.length > 0">
          <div class="text-subtitle-2 mb-2">
            {{ $t('settings.connectPanel.availableDevices') }}
          </div>
          <v-list density="compact">
            <v-list-item
              v-for="device in bluetoothDevices"
              :key="device.id"
              :title="device.name"
              :subtitle="$t('settings.connectPanel.signalDbm', { rssi: device.rssi })"
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
                  {{ $t('settings.connectPanel.connect') }}
                </v-btn>
                <v-chip
                  v-else
                  color="success"
                  size="small"
                  variant="flat"
                  class="connect-status-chip"
                >
                  {{ $t('settings.connectPanel.connected') }}
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
          {{ $t('settings.connectPanel.noDevicesFound') }}
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- WiFi Configuration -->
    <v-card
      v-if="selectedTransport === 'wifi' || !isNative || !hasBluetoothSupport"
      variant="outlined"
      rounded="lg"
      class="connect-card mb-4"
    >
      <v-card-title class="text-subtitle-1">
        <v-icon
          color="info"
          start
        >
          mdi-wifi
        </v-icon>
        {{ $t('settings.connectPanel.wifiConfigTitle') }}
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
          {{ $t('settings.connectPanel.autoDiscover') }}
        </v-btn>

        <!-- Manual configuration: label above field (clearer than floating label) -->
        <div class="d-flex flex-column flex-sm-row gap-3 align-sm-start">
          <div class="flex-grow-1 connect-url-block">
            <label
              class="text-body-2 text-medium-emphasis d-block mb-1"
              for="connect-backend-url"
            >
              {{ $t('settings.connectPanel.backendUrlLabel') }}
            </label>
            <v-text-field
              id="connect-backend-url"
              v-model="baseURL"
              :placeholder="$t('settings.connectPanel.backendUrlPlaceholder')"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              :disabled="isValidating"
              class="connect-url-field connect-url-field--framed"
            />
          </div>
          <v-btn
            color="accent"
            variant="outlined"
            :loading="isValidating"
            size="large"
            :block="mobile"
            class="connect-test-btn flex-shrink-0"
            @click="testWiFiConnection"
          >
            <v-icon start>
              {{ testStatus.icon }}
            </v-icon>
            {{ $t('settings.connectPanel.testConnection') }}
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

    <!-- Connection Tips (subtle ghost style — does not compete with primary actions) -->
    <v-card
      variant="outlined"
      rounded="lg"
      class="connect-card connect-card--tips mt-4"
    >
      <v-card-text>
        <div class="text-subtitle-2 mb-2 connect-tips__title">
          <v-icon
            class="connect-tips__icon"
            size="20"
          >
            mdi-help-circle-outline
          </v-icon>
          {{ $t('settings.connectPanel.connectionTipsTitle') }}
        </div>
        <ul class="text-body-2 connect-tips__list">
          <li v-if="isNative && hasBluetoothSupport">
            {{ $t('settings.connectPanel.tipBluetooth') }}
          </li>
          <li v-if="isNative">
            {{ $t('settings.connectPanel.tipWifiNative') }}
          </li>
          <li v-if="!isNative">
            {{ $t('settings.connectPanel.tipWeb') }}
          </li>
          <li>
            {{ $t('settings.connectPanel.tipMdns', { url: 'http://hifi-baby.local:3000/audio' }) }}
          </li>
          <li>
            {{ $t('settings.connectPanel.tipDirectIp', { url: 'http://192.168.x.x:3000/audio' }) }}
          </li>
        </ul>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { useCapabilities } from '@/composables/useCapabilities'
import { usePlatform } from '@/composables/usePlatform'
import { useConnection } from '@/composables/useConnection'
import { bluetoothService, type HifiBabyDevice } from '@/services/platform/bluetooth.service'
import type { TransportType } from '@/services/transport/transport.interface'

const { t } = useI18n()
const { mobile } = useDisplay()
const { isNative } = usePlatform()
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

const connectionStatusLabel = computed(() =>
  t(`settings.connectPanel.status.${connectionInfo.value.status}`)
)

/** Ensures label uses theme “on-*” foreground for flat chips (better contrast). */
const connectionStatusChipTone = computed(() => {
  const s = connectionInfo.value.status
  if (s === 'connected') {
    return 'connect-status-chip--on-success'
  }
  if (s === 'disconnected' || s === 'error') {
    return 'connect-status-chip--on-error'
  }
  return 'connect-status-chip--on-warning'
})

const transportChipTone = computed(() =>
  activeTransport.value === 'bluetooth'
    ? 'connect-status-chip--on-success'
    : 'connect-status-chip--on-info'
)

const transportDisplayName = computed(() => {
  if (!activeTransport.value) {
    return ''
  }
  return t(`settings.connectPanel.transportNames.${activeTransport.value}`)
})

const connectionStatusColor = computed(() => {
  switch (connectionInfo.value.status) {
    case 'connected':
      return 'success'
    case 'connecting':
    case 'reconnecting':
      return 'warning'
    case 'error':
    case 'disconnected':
    default:
      return 'error'
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
    return {
      color: 'error',
      icon: 'mdi-bluetooth-off',
      text: t('settings.connectPanel.bluetoothState.notSupported')
    }
  }
  if (!capabilities.bluetooth.available) {
    return {
      color: 'error',
      icon: 'mdi-bluetooth-off',
      text: t('settings.connectPanel.bluetoothState.notAvailable')
    }
  }
  if (isConnected.value && activeTransport.value === 'bluetooth') {
    return {
      color: 'success',
      icon: 'mdi-bluetooth-connect',
      text: t('settings.connectPanel.bluetoothState.connected')
    }
  }
  return {
    color: 'info',
    icon: 'mdi-bluetooth',
    text: t('settings.connectPanel.bluetoothState.ready')
  }
})

// Methods
async function onTransportChange(newTransport: TransportType | null) {
  if (!newTransport || newTransport === activeTransport.value) {
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
    connectionMessage.value = t('settings.connectPanel.errors.invalidUrl')
    return
  }

  testStatus.value = { color: 'primary', icon: 'mdi-play-circle' }
  isValidating.value = true
  connectionTested.value = false

  try {
    await connectToWiFi(baseURL.value)

    testStatus.value = { color: 'success', icon: 'mdi-check-circle' }
    connectionMessage.value = t('settings.connectPanel.errors.connectSuccess', { url: baseURL.value })
    connectionTested.value = true
  } catch {
    testStatus.value = { color: 'error', icon: 'mdi-alert-circle' }
    connectionMessage.value = t('settings.connectPanel.errors.connectFailed', { url: baseURL.value })
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
  } else if (isNative.value && hasBluetoothSupport.value) {
    selectedTransport.value = 'bluetooth'
  }

  // Update WiFi URL from connection info
  const currentWiFiURL = getWiFiURL()
  if (currentWiFiURL) {
    baseURL.value = currentWiFiURL
  }
})
</script>

<style scoped lang="scss">
.connect-card {
  border-color: rgba(var(--v-theme-on-surface), 0.12) !important;
}

.connect-card--tips {
  background: rgba(var(--v-theme-on-surface), 0.28) !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.35) !important;
  box-shadow: none !important;
}

.connect-tips__title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.connect-tips__icon {
  color: rgb(var(--v-theme-primary));
  flex-shrink: 0;
}

.connect-tips__list {
  color: rgba(var(--v-theme-on-surface), 0.75);
  padding-left: 1.1rem;
}

.connect-url-block {
  min-width: 0;
  width: 100%;
}

.connect-url-field--framed {
  :deep(.v-field) {
    border-width: 2px;
  }
}

.connect-status-chip {
  font-weight: 600;
}

.connect-status-chip--on-error {
  color: rgb(var(--v-theme-on-error)) !important;
}

.connect-status-chip--on-success {
  color: rgb(var(--v-theme-on-success)) !important;
}

.connect-status-chip--on-warning {
  color: rgb(var(--v-theme-on-warning)) !important;
}

.connect-status-chip--on-info {
  color: rgb(var(--v-theme-on-info)) !important;
}

/* Desktop: URL field uses available width; Test stays button-sized (thumb-friendly full width on mobile via block) */
.connect-url-field {
  min-width: 0;
}

.connect-test-btn {
  @media (min-width: 600px) {
    align-self: flex-start;
  }
}
</style>
