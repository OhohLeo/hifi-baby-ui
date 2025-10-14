<template>
  <v-container>
    <h3>{{ $t('settings.bluetooth') }}</h3>

    <!-- Platform Check: Web -->
    <v-alert
      v-if="!isNative"
      type="info"
      variant="tonal"
      class="my-4"
    >
      <v-icon start>mdi-information-outline</v-icon>
      Bluetooth management is only available on mobile devices.
      On the web, use Network settings to configure your connection.
    </v-alert>

    <!-- Native Platform: Show Bluetooth Status -->
    <div v-else>
      <!-- Capability Detection -->
      <v-alert
        v-if="!capabilities.bluetooth.supported"
        type="warning"
        variant="tonal"
        class="my-4"
      >
        <v-icon start>mdi-bluetooth-off</v-icon>
        Bluetooth is not supported on this device.
      </v-alert>

      <!-- Bluetooth Available -->
      <div v-else>
        <v-card variant="outlined" class="mb-4">
          <v-card-text>
            <div class="d-flex flex-column flex-sm-row align-sm-center justify-sm-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-medium">
                  Bluetooth Status
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ bluetoothStatus }}
                </div>
              </div>
              <v-icon :color="capabilities.bluetooth.available ? 'success' : 'error'" size="large" class="mt-2 mt-sm-0">
                {{ capabilities.bluetooth.available ? 'mdi-bluetooth' : 'mdi-bluetooth-off' }}
              </v-icon>
            </div>
          </v-card-text>
        </v-card>

        <!-- Scan Button -->
        <v-btn
          :loading="isScanning"
          :disabled="!isInitialized"
          color="accent"
          block
          size="large"
          prepend-icon="mdi-radar"
          class="mb-4"
          @click="startScan"
        >
          {{ isScanning ? 'Scanning...' : 'Scan for Devices' }}
        </v-btn>

        <!-- Device List -->
        <v-card v-if="devices.length > 0" variant="outlined">
          <v-card-title class="text-subtitle-1">
            Available Devices ({{ devices.length }})
          </v-card-title>
          <v-divider />
          <v-list>
            <v-list-item
              v-for="device in devices"
              :key="device.id"
              :title="device.name"
              :subtitle="`Signal: ${device.rssi} dBm | ${device.address}`"
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
                  color="accent"
                  :loading="connectingDeviceId === device.id"
                  @click="connectToDevice(device.id)"
                >
                  Connect
                </v-btn>
                <v-btn
                  v-else
                  variant="text"
                  color="error"
                  @click="disconnectDevice(device.id)"
                >
                  Disconnect
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- Empty State -->
        <v-card v-else-if="!isScanning && scanCompleted" variant="outlined" class="pa-8 text-center">
          <v-icon size="64" color="secondary" class="mb-4">
            mdi-bluetooth-off
          </v-icon>
          <p class="text-body-2 text-medium-emphasis">
            No devices found. Press "Scan for Devices" to search again.
          </p>
        </v-card>

        <!-- Help Section -->
        <v-card variant="tonal" color="info" class="mt-4">
          <v-card-text>
            <div class="text-subtitle-2 mb-2">
              <v-icon start>mdi-help-circle</v-icon>
              Bluetooth Tips
            </div>
            <ul class="text-body-2">
              <li>Make sure Bluetooth is enabled on your device</li>
              <li>Keep your Hifi Baby device powered on and nearby</li>
              <li>Scanning will last 10 seconds</li>
              <li>You may need to grant Bluetooth permissions when scanning</li>
            </ul>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCapabilities } from '@/composables/useCapabilities'
import { usePlatform } from '@/composables/usePlatform'
import { bluetoothService, type HifiBabyDevice } from '@/services/platform/bluetooth.service'

const { isNative } = usePlatform()
const { capabilities, detectAll } = useCapabilities()

const isInitialized = ref(false)
const isScanning = ref(false)
const scanCompleted = ref(false)
const devices = ref<HifiBabyDevice[]>([])
const connectingDeviceId = ref<string | null>(null)

const bluetoothStatus = computed(() => {
  if (!capabilities.bluetooth.supported) return 'Not supported'
  if (!capabilities.bluetooth.available) return 'Not available'
  if (capabilities.bluetooth.permission === 'denied') return 'Permission denied'
  if (isInitialized.value) return 'Ready'
  return 'Initializing...'
})

async function startScan() {
  isScanning.value = true
  scanCompleted.value = false
  bluetoothService.clearDevices()
  devices.value = []

  try {
    const discoveredDevices = await bluetoothService.scan(10000)
    devices.value = discoveredDevices
    scanCompleted.value = true
  } catch (error) {
    console.error('Scan failed:', error)
    scanCompleted.value = true
  } finally {
    isScanning.value = false
  }
}

async function connectToDevice(deviceId: string) {
  connectingDeviceId.value = deviceId
  try {
    const success = await bluetoothService.connect(deviceId)
    if (success) {
      devices.value = bluetoothService.getDevices()
    }
  } catch (error) {
    console.error('Connection failed:', error)
  } finally {
    connectingDeviceId.value = null
  }
}

async function disconnectDevice(deviceId: string) {
  try {
    await bluetoothService.disconnect(deviceId)
    devices.value = bluetoothService.getDevices()
  } catch (error) {
    console.error('Disconnection failed:', error)
  }
}

onMounted(async () => {
  if (isNative) {
    await detectAll()

    if (capabilities.bluetooth.supported) {
      isInitialized.value = await bluetoothService.initialize()
      if (isInitialized.value) {
        await bluetoothService.requestPermissions()
      }
    }
  }
})
</script>