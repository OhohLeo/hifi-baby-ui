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
                  <v-row align="center" justify="start">
                    <v-col class="py-1 pe-0" cols="auto">
                      <v-chip closable>
                        <v-icon icon="mdi-music" start></v-icon>
                        {{ 'test' }}
                      </v-chip>
                    </v-col>
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
</template>

<script setup lang="ts">
import { usePlaylistStore } from '../stores/PlayList'
import {
  STATE_PLAY,
  STATE_PAUSE,
  useMusicPlayerStore,
} from '../stores/MusicPlayer'
import audioService from '../services/api'

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

// Ajout de la fonction de suppression de track
const removeTrack = async (trackID: string) => {
  await audioService.removeTrack(trackID)
  playlistStore.fetchTracks()
  musicPlayerStore.fetchCurrentTrack()
}
</script>
