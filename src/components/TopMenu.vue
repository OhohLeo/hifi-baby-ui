<template>
  <v-app-bar :elevation="7" rounded scroll-behavior="elevate">
    <v-app-bar-title>Hifi Baby</v-app-bar-title>

    <template v-slot:extension>
      <v-container class="d-flex">
        <v-tabs v-model="tabs" align-tabs="title">
          <v-tab text="Songs" value="songs"></v-tab>
          <v-tab text="Streams" value="streams"></v-tab>
          <v-tab text="Podcasts" value="poscasts"></v-tab>
        </v-tabs>
      </v-container>
      <v-fab class="mr-4" color="blue-accent-2" icon="mdi-plus" location="bottom right" size="60" absolute offset
        @click="openDialog">
      </v-fab>
    </template>
  </v-app-bar>

  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-item>
        <v-card-title>
          Import Song
        </v-card-title>
        <v-spacer class=""></v-spacer>
        <v-card-text>
          <v-file-input v-model="selectedFile" label="Audio file input" variant="outlined" prepend-icon="mdi-music-note"
            accept=".mp3, .wav, .ogg, .flac">
          </v-file-input>
        </v-card-text>
      </v-card-item>
      <v-alert v-if="message" type="error">
        {{ message }}
      </v-alert>
      <v-card-actions>
        <v-btn class="mt-3" color="primary" variant="text" @click="submitFile">
          Submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import audioService from '../services/api'
import { usePlaylistStore } from '../stores/PlayList'

const dialog = ref(false)
const selectedFile = ref(null)
const message = ref('')
const playlistStore = usePlaylistStore()

const openDialog = () => {
  message.value = '';
  dialog.value = true;
};

const submitFile = async () => {
  if (!selectedFile.value) {
    message.value = "Select an audio file."
    return
  }

  try {
    const response = await audioService.addTrack(selectedFile.value)
    if (response.status == 201) {
      playlistStore.fetchTracks() 
      message.value = ""
      dialog.value = false
    } else {
      console.error(response)
      message.value = "Issue when downloading audio file"
    }
  } catch (error) {
    console.error(error)
    message.value = 'Issue when sending audio file.'
  }
}
</script>

<script lang="ts">
export default {
  data: () => ({
    tabs: null,
  }),

  computed: {
    activeFab() {
      switch (this.tabs) {
        case 'songs':
        case 'streams':
        case 'podcasts':
        default:
          return {}
      }
    },
  },
}
</script>