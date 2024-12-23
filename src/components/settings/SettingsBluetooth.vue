<template>
  <div>
    <h3>Bluetooth Parameters</h3>
    <br>
    <p>Settings: {{ settings }}</p>
    <p v-if="settingsOk">
      Settings are loaded!
    </p>
  </div>
</template>œ

<script setup lang="ts">
import { useSettingsProps } from '../../composables/useSettingsProps'

defineProps(useSettingsProps())
</script>
