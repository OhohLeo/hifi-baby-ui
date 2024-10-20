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
                <v-icon @click="playTrack(track.id)">
                  {{
                    musicPlayerStore.isCurrentTrack(track.id) ?
                      musicPlayerStore.currentStateIcon  : "mdi-music"
                  }}
                </v-icon>
              </template>
              <template #append>
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
  import { useMusicPlayerStore } from '../stores/MusicPlayer'
  import audioService from '../services/api'

  const playlistStore = usePlaylistStore()
  const musicPlayerStore = useMusicPlayerStore()

  playlistStore.fetchTracks()

  const playTrack = async (trackID: string) => {
    const track = playlistStore.tracks.find(t => t.id === trackID)
    if (track) {
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
