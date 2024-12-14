<template>
  <div>
    <v-container>
      <v-row class="justify-center">
        <v-col cols="12" md="8">
          <v-list>
            <v-list-subheader>SONGS</v-list-subheader>
            <v-list-item
              v-for="track in playlistStore.tracks"
              :key="track.id"
              :title="track.name"
            >
              <template #prepend>
                <v-icon @click="playOrPauseTrack(track.id)">
                  {{
                    musicPlayerStore.isCurrentTrack(track.id)
                      ? musicPlayerStore.currentStateIcon
                      : 'mdi-music'
                  }}
                </v-icon>
              </template>
              <template #append>
                <v-container>
                  <v-row align="center">
                    <v-chip
                      prepend-icon="mdi-tag-multiple"
                      @click="openTagDialog"
                      >+</v-chip
                    >
                  </v-row>
                </v-container>
                <v-icon @click="removeTrack(track.id)">mdi-delete</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-container>
  </div>

  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-item>
        <v-card-title>Add Tag</v-card-title>
        <v-spacer class=""></v-spacer>
      </v-card-item>
      <v-alert v-if="message" type="error">
        {{ message }}
      </v-alert>
      <v-card-actions>
        <v-btn class="mt-3" color="primary" variant="text"> Submit </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { usePlaylistStore } from '../stores/PlayList'
import {
  STATE_PLAY,
  STATE_PAUSE,
  useMusicPlayerStore,
} from '../stores/MusicPlayer'
import audioService from '../services/audio.service'

const playlistStore = usePlaylistStore()
const musicPlayerStore = useMusicPlayerStore()

playlistStore.fetchTracks()

const playOrPauseTrack = async (trackID: string) => {
  const track = playlistStore.tracks.find(
    (t: { id: string }) => t.id === trackID
  )
  if (track) {
    if (musicPlayerStore.track?.id == track.id) {
      // Selected music is currently playing or paused
      switch (musicPlayerStore.currentState) {
        case STATE_PLAY: {
          await musicPlayerStore.pause()
          return
        }
        case STATE_PAUSE: {
          await musicPlayerStore.resume()
          return
        }
      }

      return
    }

    await musicPlayerStore.play(track)
  }
}

const removeTrack = async (trackID: string) => {
  await audioService.removeTrack(trackID)
  playlistStore.fetchTracks()
  musicPlayerStore.fetchCurrentTrack()
}

const dialog = ref(false)
const message = ref('')

const openTagDialog = () => {
  dialog.value = true
  message.value = ''
}
</script>
