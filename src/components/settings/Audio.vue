<template>
  <div>
    <h3>Audio Parameters</h3>
    <br />
    <p>Settings: {{ settings }}</p>
    <p v-if="settingsOk">Settings are loaded!</p>
  </div>
</template>

<script setup>
import { useSettingsProps } from '@/composables/useSettingsProps'

defineProps(useSettingsProps())
</script>
