<template>
  <v-container>
    <h3>Network Parameters</h3>
    <br />
    <p>Set domain name and check connectivity :</p>
    <div class="d-flex">
      <v-text-field
        class="ma-2 pa-2"
        v-model="domainName"
        label="domain name"
        placeholder="Enter domain name"
        outlined
        clearable
      />
      <v-btn
        class="ma-2 pa-2 align-self-center"
        :color="testStatus.color"
        @click="validateDomainName"
      >
        <v-icon left>{{ testStatus.icon }}</v-icon>
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

let storedDomainName = localStorageService.get('domainName')
const domainName = ref(
  storedDomainName != '' ? storedDomainName : 'hifi-baby.local123'
)
const testResult = ref(null)
const testStatus = ref(STATUS_DEFAULT)

const validateDomainName = async () => {
  testStatus.value = STATUS_DEFAULT

  if (!domainName.value) {
    testStatus.value = STATUS_ERROR
    return
  }

  audioService.setBaseURL(domainName.value)
  audioService
    .getCurrentPlayerState()
    .then(() => {
      localStorageService.set('domainName', domainName.value)
      testStatus.value = STATUS_SUCCESS
    })
    .catch(() => (testStatus.value = STATUS_ERROR))
}

onMounted(() => {
  validateDomainName()
})
</script>
