<template>
  <v-footer app height="100">
    <v-container>
      <!-- Centre le texte -->
      <v-row align="center" justify="center" no-gutters>
        <v-col class="text-center" cols="12">
          {{ musicPlayer.track ? musicPlayer.track.name : 'No track playing' }}
        </v-col>
      </v-row>
      <!-- Centre les boutons -->
      <v-row align="center" justify="center" no-gutters>
        <v-col cols="auto">
          <v-btn
            :disabled="musicPlayer.isStopped"
            :icon="musicPlayer.isPlaying ? 'mdi-pause' : 'mdi-play'"
            size="x-large"
            @click="togglePlayPause"
          />
        </v-col>
        <v-col cols="auto">
          <v-btn icon="mdi-stop" size="x-large" @click="musicPlayer.stop()" />
        </v-col>
        <v-col cols="auto">
          <v-btn
            :icon="musicPlayer.isMuted ? 'mdi-volume-off' : 'mdi-volume-high'"
            size="x-large"
            @click="musicPlayer.toggleMute()"
          />
        </v-col>
        <v-col cols="auto">
          <v-btn icon="mdi-volume-minus" size="x-large" @click="decreaseVolume" />
        </v-col>
        <v-col cols="auto">
          <v-btn icon="mdi-volume-plus" size="x-large" @click="increaseVolume" />
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
  import { useMusicPlayerStore } from '../stores/MusicPlayer' // Importez le store Pinia
  import audioService from '../services/api'

  const musicPlayer = useMusicPlayerStore()
  musicPlayer.fetchCurrentTrack()

  const togglePlayPause = async () => {
    if (musicPlayer.isPlaying) {
      await musicPlayer.pause()
    } else {
      await musicPlayer.resume()
    }
  }

  const increaseVolume = async () => {
    await audioService.increaseVolume()
  }

  const decreaseVolume = async () => {
    await audioService.decreaseVolume()
  }
</script>
