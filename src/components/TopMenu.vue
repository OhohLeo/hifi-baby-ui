<template>
  <v-app-bar
    :elevation="7"
    rounded
    scroll-behavior="elevate"
  >
    <v-app-bar-title>Hifi Baby</v-app-bar-title>

    <template #append>
      <v-btn icon="mdi-music" @click="goToIndex" />
      <v-btn icon="mdi-plus" @click="triggerFileUpload" />
      <input
        id="fileInput"
        accept="audio/*"
        style="display: none"
        type="file"
        @change="handleFileUpload"
      >
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
  import audioService from '@/services/api'
  import { useRouter } from 'vue-router'
  import { usePlaylistStore } from '@/stores/PlayList'

  const router = useRouter()
  const goToIndex = () => {
    router.push('/')
  }

  const triggerFileUpload = () => {
    const fileInput = document.querySelector('#fileInput')
    if (fileInput instanceof HTMLInputElement) {
      fileInput.click()
    }
  }
  const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target && target.files && target.files.length > 0) {
      audioService.addTrack(target.files[0])
      usePlaylistStore().fetchTracks()
      goToIndex()
    }
  }
</script>
