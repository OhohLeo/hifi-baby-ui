<template>
  <form>
    <h3>Device Parameters</h3>
    <br>
    <p>Set device name</p>
    <v-text-field
      v-model="deviceName"
      class="ma-2 pa-2"
      :counter="10"
      :rules="deviceNameRules"
      label="Device name"
      required
    />

    <p>Select device</p>
    <v-combobox
      v-model="device"
      class="ma-2 pa-2"
      :items="devices"
      :disabled="disabledState"
      label="device"
    />
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import settingsService from '../../services/settings.service'

const deviceName = ref('')
const deviceNameRules = [
  (value: string) => {
    if (value) return true

    return 'Device name is required.'
  },
  (value: string) => {
    if (value?.length <= 10) return true

    return 'Name must be less than 10 characters.'
  }
]

const devices = ref<string[]>([])
const disabledState = ref(true)
const device = ref()

settingsService.getSettings().then((result) => {
  devices.value = Object.entries(result.devices).map(([key, value]) => `${key} (${value})`)

  if (devices.value.length === 0) {
    disabledState.value = true
  } else {
    disabledState.value = false
    device.value = devices.value[0]
  }
})
</script>
