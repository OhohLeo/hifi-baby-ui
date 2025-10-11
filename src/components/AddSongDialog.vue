<template>
  <v-dialog
    v-model="dialog"
    max-width="600"
    transition="dialog-bottom-transition"
    @update:model-value="close"
  >
    <v-card class="add-song-card">
      <v-card-title class="text-h6 pa-6">
        <v-icon
          class="mr-2"
          color="accent"
        >
          mdi-music-note-plus
        </v-icon>
        {{ $t('addSongDialog.title') }}
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-file-input
          v-model="selectedFile"
          :label="$t('addSongDialog.chooseAudioFile')"
          variant="outlined"
          prepend-inner-icon="mdi-file-music-outline"
          accept=".mp3, .wav, .ogg, .flac, .m4a, .aac"
          :loading="isUploading"
          :disabled="isUploading"
          hint="Supported formats: MP3, WAV, OGG, FLAC, M4A, AAC"
          persistent-hint
          class="mb-4"
        >
          <template #selection="{ fileNames }">
            <v-chip
              v-if="fileNames.length > 0"
              color="accent"
              size="small"
              label
              class="mr-2"
            >
              <v-icon start>
                mdi-music
              </v-icon>
              {{ fileNames[0] }}
            </v-chip>
          </template>
        </v-file-input>

        <v-alert
          v-if="message"
          type="error"
          variant="tonal"
          class="mb-0"
        >
          {{ message }}
        </v-alert>

        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          class="mb-0"
        >
          {{ successMessage }}
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="isUploading"
          @click="close"
        >
          {{ $t('addSongDialog.cancel') }}
        </v-btn>
        <v-btn
          color="accent"
          variant="flat"
          :loading="isUploading"
          :disabled="!selectedFile || isUploading"
          @click="submit"
        >
          {{ $t('addSongDialog.upload') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import audioService from '../services/api'
import { usePlaylistStore } from '../stores/PlayList'

const { t } = useI18n()

const message = ref('')
const successMessage = ref('')
const isUploading = ref(false)

const props = defineProps({
  isOpen: Boolean,
})
const emit = defineEmits(['update:isOpen'])

// Use computed for two-way binding
const dialog = computed({
  get: () => props.isOpen,
  set: (value) => {
    emit('update:isOpen', value)
    if (!value) {
      // Reset messages when closing
      message.value = ''
      successMessage.value = ''
      selectedFile.value = null
    }
  }
})

const selectedFile = ref(null)
const playlistStore = usePlaylistStore()

const submit = async () => {
  if (!selectedFile.value) {
    message.value = 'Please select an audio file.'
    return
  }

  isUploading.value = true
  message.value = ''
  successMessage.value = ''

  try {
    const response = await audioService.addTrack(selectedFile.value)
    if (response.status === 201) {
      successMessage.value = t('addSongDialog.success')
      await playlistStore.fetchTracks()

      // Close after a short delay to show success message
      setTimeout(() => {
        close()
      }, 1500)
    } else {
      console.error(response)
      message.value = t('addSongDialog.error')
    }
  } catch (error) {
    console.error(error)
    message.value = t('addSongDialog.errorConnection')
  } finally {
    isUploading.value = false
  }
}

const close = () => {
  if (isUploading.value) {
return
}
  dialog.value = false
}
</script>

<style scoped lang="scss">
.add-song-card {
  border-radius: var(--radius-2xl) !important;
}
</style>
