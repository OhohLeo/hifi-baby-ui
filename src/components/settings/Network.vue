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

    <!-- Auto-discovery Status -->
    <v-alert
      v-if="discoveryAttempted"
      :type="discoverySuccess ? 'success' : 'info'"
      variant="tonal"
      class="my-4"
    >
      <v-icon start>
        {{ discoverySuccess ? 'mdi-check-network' : 'mdi-network-off' }}
      </v-icon>
      {{ discoveryMessage }}
    </v-alert>

    <!-- Network Discovery Capability -->
    <v-card variant="outlined" class="mb-4" v-if="hasNetworkDiscovery">
      <v-card-text>
        <div class="d-flex flex-column flex-sm-row align-sm-center justify-sm-space-between">
          <div class="mb-4 mb-sm-0">
            <div class="text-subtitle-1 font-weight-medium">
              Auto-Discovery
            </div>
            <div class="text-caption text-medium-emphasis">
              mDNS/Bonjour service discovery available
            </div>
          </div>
          <v-btn
            color="accent"
            variant="tonal"
            :loading="isDiscovering"
            :block="isMobile"
            @click="attemptAutoDiscovery"
          >
            <v-icon start>mdi-magnify</v-icon>
            Discover
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Manual Configuration -->
    <v-card variant="outlined">
      <v-card-title class="text-subtitle-1">
        Backend Configuration
      </v-card-title>
      <v-divider />
      <v-card-text>
        <p class="mb-4 text-body-2">
          Set the backend URL and test connectivity:
        </p>
        <div class="d-flex flex-column flex-sm-row">
          <v-text-field
            v-model="baseURL"
            label="Backend URL"
            placeholder="http://hifi-baby.local:3000/audio"
            variant="outlined"
            density="comfortable"
            clearable
            :disabled="isValidating"
            class="mb-2 mb-sm-0 mr-sm-2"
          />
          <v-btn
            :color="testStatus.color"
            :loading="isValidating"
            size="large"
            :block="isMobile"
            @click="validateBaseURL"
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
            class="mt-4"
          >
            {{ connectionMessage }}
          </v-alert>
        </v-expand-transition>
      </v-card-text>
    </v-card>

    <!-- Help Section -->
    <v-card variant="tonal" color="info" class="mt-4">
      <v-card-text>
        <div class="text-subtitle-2 mb-2">
          <v-icon start>mdi-help-circle</v-icon>
          Connection Tips
        </div>
        <ul class="text-body-2">
          <li v-if="!isNative">
            Make sure your Hifi Baby backend is running and accessible
          </li>
          <li v-if="isNative">
            Ensure your device is on the same Wi-Fi network as your Hifi Baby server
          </li>
          <li>
            Try <code>http://hifi-baby.local:3000/audio</code> for mDNS
          </li>
          <li>
            Or use IP address: <code>http://192.168.x.x:3000/audio</code>
          </li>
        </ul>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDisplay } from 'vuetify'
import audioService from '@/services/api'
import localStorageService from '@/services/storage'
import { networkService } from '@/services/platform/network.service'
import { useCapabilities } from '@/composables/useCapabilities'
import { usePlatform } from '@/composables/usePlatform'

const { platform, isNative } = usePlatform()
const { hasNetworkDiscovery, detectAll } = useCapabilities()
const { mobile } = useDisplay()

const isMobile = computed(() => mobile.value)

const STATUS_SUCCESS = { color: 'success', icon: 'mdi-check-circle' }
const STATUS_ERROR = { color: 'error', icon: 'mdi-alert-circle' }
const STATUS_DEFAULT = { color: 'primary', icon: 'mdi-play-circle' }

const storedBaseURL = localStorageService.get<string>('baseURL')
const baseURL = ref(
  storedBaseURL || 'http://hifi-baby.local:3000/audio'
)
const testStatus = ref(STATUS_DEFAULT)
const isValidating = ref(false)
const connectionTested = ref(false)
const connectionMessage = ref('')

const isDiscovering = ref(false)
const discoveryAttempted = ref(false)
const discoverySuccess = ref(false)
const discoveryMessage = ref('')

const validateBaseURL = async () => {
  testStatus.value = STATUS_DEFAULT
  isValidating.value = true
  connectionTested.value = false

  if (!baseURL.value) {
    testStatus.value = STATUS_ERROR
    connectionTested.value = true
    connectionMessage.value = 'Please enter a valid URL'
    isValidating.value = false
    return
  }

  audioService.setBaseURL(baseURL.value)

  try {
    await audioService.getCurrentPlayerState()
    localStorageService.set('baseURL', baseURL.value)
    testStatus.value = STATUS_SUCCESS
    connectionMessage.value = `Successfully connected to ${baseURL.value}`
    connectionTested.value = true
  } catch (error) {
    testStatus.value = STATUS_ERROR
    connectionMessage.value = `Failed to connect to ${baseURL.value}. Please check the URL and try again.`
    connectionTested.value = true
  } finally {
    isValidating.value = false
  }
}

const attemptAutoDiscovery = async () => {
  isDiscovering.value = true
  discoveryAttempted.value = false

  try {
    const discoveredURL = await networkService.discoverBackend()

    discoveryAttempted.value = true

    if (discoveredURL) {
      baseURL.value = discoveredURL
      discoverySuccess.value = true
      discoveryMessage.value = `Backend discovered at: ${discoveredURL}`

      // Automatically validate the discovered URL
      await validateBaseURL()
    } else {
      discoverySuccess.value = false
      discoveryMessage.value = 'No backend found. Please enter the URL manually.'
    }
  } catch (error) {
    discoveryAttempted.value = true
    discoverySuccess.value = false
    discoveryMessage.value = 'Auto-discovery failed. Please configure manually.'
  } finally {
    isDiscovering.value = false
  }
}

onMounted(async () => {
  // Detect capabilities first
  await detectAll()

  // Attempt auto-discovery on native platforms
  if (isNative && hasNetworkDiscovery.value) {
    await attemptAutoDiscovery()
  } else {
    // On web or if no discovery, just validate current URL
    await validateBaseURL()
  }
})
</script>
