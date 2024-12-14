<template>
  <div>
    <h3>Device Parameters</h3>
    <br />
    <p>Select device</p>
    <v-combobox
      v-model="device"
      class="ma-2 pa-2"
      :items="devices"
      :disabled="disabledState"
      label="device"
    ></v-combobox>  
  </div>
</template>

<script setup>
import settingsService from '@/services/settings.service'

const devices = ref([])
const disabledState = ref(true)
const device = ref()

settingsService
  .getSettings()
  .then((result) => {
    devices.value = Object.entries(result.devices).map(([key, value]) => `${key} (${value})`)
    
    if (devices.value.length === 0) {
      disabledState.value = true
    } else {
      disabledState.value = false
      device.value = devices.value[0]
    }
  })
  .catch(() => (testStatus.value = STATUS_ERROR))
</script>
