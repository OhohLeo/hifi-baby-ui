<template>
  <v-container>
    <h3>Network Parameters</h3>
    <br />
    <p>Set base URL and check connectivity:</p>
    <div class="d-flex">
      <v-text-field
        v-model="baseURL"
        class="ma-2 pa-2"
        label="Base URL"
        placeholder="http://hifi-baby.local:3000/audio"
        outlined
        clearable
      />
      <v-btn
        class="ma-2 pa-2 align-self-center"
        :color="testStatus.color"
        @click="validateBaseURL"
      >
        <v-icon left>
          {{ testStatus.icon }}
        </v-icon>
        Validate
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import audioService from '@/services/api'
import localStorageService from '@/services/storage'

const STATUS_SUCCESS = { color: 'green', icon: 'mdi-check-circle' }
const STATUS_ERROR = { color: 'red', icon: 'mdi-alert-circle' }
const STATUS_DEFAULT = { color: 'primary', icon: 'mdi-play-circle' }

const storedBaseURL = localStorageService.get('baseURL')
const baseURL = ref(
  storedBaseURL !== '' ? storedBaseURL : 'http://hifi-baby.local:3000/audio'
)
const testStatus = ref(STATUS_DEFAULT)

const validateBaseURL = async () => {
  testStatus.value = STATUS_DEFAULT

  if (!baseURL.value) {
    testStatus.value = STATUS_ERROR
    return
  }

  audioService.setBaseURL(baseURL.value)
  audioService
    .getCurrentPlayerState()
    .then(() => {
      localStorageService.set('baseURL', baseURL.value)
      testStatus.value = STATUS_SUCCESS
    })
    .catch(() => (testStatus.value = STATUS_ERROR))
}

onMounted(() => {
  validateBaseURL()
})
</script>
