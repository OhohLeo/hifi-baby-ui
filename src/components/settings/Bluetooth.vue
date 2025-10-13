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
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-medium">
                  Bluetooth Status
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ bluetoothStatus }}
                </div>
              </div>
              <v-icon :color="capabilities.bluetooth.available ? 'success' : 'error'" size="large">
                {{ capabilities.bluetooth.available ? 'mdi-bluetooth' : 'mdi-bluetooth-off' }}
              </v-icon>
            </div>
          </v-card-text>
        </v-card>

        <!-- Info Message -->
        <v-card variant="tonal" color="info" class="mb-4">
          <v-card-text>
            <v-icon start>mdi-information</v-icon>
            Bluetooth device scanning and connection will be implemented in Phase 3.
            For now, use Network settings to connect to your Hifi Baby device.
          </v-card-text>
        </v-card>

        <!-- Coming Soon Features -->
        <v-list>
          <v-list-subheader>Coming Soon</v-list-subheader>
          <v-list-item prepend-icon="mdi-radar">
            <v-list-item-title>Scan for Bluetooth Devices</v-list-item-title>
            <v-list-item-subtitle>Discover Hifi Baby devices nearby</v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-bluetooth-connect">
            <v-list-item-title>Connect to Device</v-list-item-title>
            <v-list-item-subtitle>Establish Bluetooth connection</v-list-item-subtitle>
          </v-list-item>
          <v-list-item prepend-icon="mdi-bluetooth-settings">
            <v-list-item-title>Manage Connections</v-list-item-title>
            <v-list-item-subtitle>View and manage paired devices</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCapabilities } from '@/composables/useCapabilities'
import { usePlatform } from '@/composables/usePlatform'

const { isNative } = usePlatform()
const { capabilities, detectAll } = useCapabilities()

const bluetoothStatus = computed(() => {
  if (!capabilities.bluetooth.supported) return 'Not supported'
  if (!capabilities.bluetooth.available) return 'Not available'
  if (capabilities.bluetooth.permission === 'denied') return 'Permission denied'
  return 'Available'
})

onMounted(async () => {
  if (isNative) {
    await detectAll()
  }
})
</script>