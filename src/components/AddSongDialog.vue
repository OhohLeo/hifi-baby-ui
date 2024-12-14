<template>
  <v-dialog v-model="dialog" max-width="500" @update:model-value="close">
    <v-card>
      <v-card-item>
        <v-card-title>Add Song</v-card-title>
        <v-spacer></v-spacer>
        <v-card-text>
          <v-file-input
            v-model="selectedFile"
            label="Audio file input"
            variant="outlined"
            prepend-icon="mdi-music-note-plus"
            accept=".mp3, .wav, .ogg, .flac"
          >
          </v-file-input>
        </v-card-text>
      </v-card-item>
      <v-alert v-if="message" type="error">
        {{ message }}
      </v-alert>
      <v-card-actions>
        <v-btn class="mt-3" color="primary" variant="text" @click="submit">
          Submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import audioService from '../services/audio.service'
import { usePlaylistStore } from '../stores/PlayList'
import { defineProps } from 'vue'

const dialog = ref(false)
const message = ref('')
const props = defineProps({
  isOpen: Boolean,
})
const emit = defineEmits(['update:isOpen'])

watch(
  () => props.isOpen,
  (newValue) => {
    dialog.value = newValue
    message.value = ''
  }
)

const selectedFile = ref(null)
const playlistStore = usePlaylistStore()
const submit = async () => {
  if (!selectedFile.value) {
    message.value = 'Select an audio file.'
    return
  }

  try {
    const response = await audioService.addTrack(selectedFile.value)
    if (response.status == 201) {
      playlistStore.fetchTracks()
      close()
    } else {
      console.error(response)
      message.value = 'Issue when downloading audio file'
    }
  } catch (error) {
    console.error(error)
    message.value = 'Issue when sending audio file.'
  }
}
const close = () => {
  dialog.value = false
  message.value = ''
  emit('update:isOpen', false)
}
</script>
