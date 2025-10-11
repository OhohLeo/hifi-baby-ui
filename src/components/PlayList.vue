<template>
  <div class="playlist-container">
    <v-container>
      <v-row class="justify-center">
        <v-col
          cols="12"
          sm="12"
          md="10"
          lg="8"
          xl="6"
        >
          <!-- Empty State -->
          <v-card
            v-if="playlistStore.tracks.length === 0"
            class="empty-state pa-8 text-center"
            variant="flat"
          >
            <v-icon
              size="64"
              color="secondary"
              class="mb-4"
            >
              mdi-music-note-off
            </v-icon>
            <h2 class="text-h5 mb-2">
              No songs yet
            </h2>
            <p class="text-body-1 text-secondary mb-4">
              Add your first track to start enjoying your music
            </p>
          </v-card>

          <!-- Track List -->
          <v-list
            v-else
            class="track-list"
            role="list"
            aria-label="Song playlist"
          >
            <v-list-subheader class="text-overline">
              {{ playlistStore.tracks.length }}
              {{ playlistStore.tracks.length === 1 ? 'Song' : 'Songs' }}
            </v-list-subheader>

            <v-list-item
              v-for="track in playlistStore.tracks"
              :key="track.id"
              :title="track.name"
              class="track-item elevation-1 mb-2"
              :class="{
                'track-active': musicPlayerStore.isCurrentTrack(track.id),
              }"
              role="listitem"
            >
              <template #prepend>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  :aria-label="
                    musicPlayerStore.isCurrentTrack(track.id)
                      ? musicPlayerStore.isPlaying
                        ? 'Pause track'
                        : 'Resume track'
                      : 'Play track'
                  "
                  class="play-button"
                  @click="playOrPauseTrack(track.id)"
                >
                  <v-icon>
                    {{
                      musicPlayerStore.isCurrentTrack(track.id)
                        ? musicPlayerStore.currentStateIcon
                        : 'mdi-play-circle-outline'
                    }}
                  </v-icon>
                </v-btn>
              </template>

              <template #title>
                <span class="track-title">{{ track.name }}</span>
              </template>

              <template #subtitle>
                <span
                  v-if="track.format"
                  class="text-caption text-secondary"
                >
                  {{ track.format.toUpperCase() }}
                </span>
              </template>

              <template #append>
                <div class="track-actions">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    aria-label="Add tags"
                    class="mr-1"
                    @click="openTagDialog(track.id)"
                  >
                    <v-icon size="small">
                      mdi-tag-plus-outline
                    </v-icon>
                  </v-btn>

                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    :aria-label="`Delete ${track.name}`"
                    color="error"
                    @click="removeTrack(track.id)"
                  >
                    <v-icon size="small">
                      mdi-delete-outline
                    </v-icon>
                  </v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-container>
  </div>

  <!-- Tag Dialog -->
  <v-dialog
    v-model="dialog"
    max-width="500"
    transition="dialog-bottom-transition"
  >
    <v-card class="dialog-card">
      <v-card-title class="text-h6 pa-6">
        <v-icon class="mr-2">
          mdi-tag-multiple
        </v-icon>
        Add Tag
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-alert
          v-if="message"
          type="error"
          variant="tonal"
          class="mb-4"
        >
          {{ message }}
        </v-alert>

        <p class="text-body-2 text-secondary">
          Tag functionality will be implemented soon.
        </p>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          @click="dialog = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="accent"
          variant="flat"
          @click="submitTag"
        >
          Submit
        </v-btn>
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
import audioService from '../services/api'

const playlistStore = usePlaylistStore()
const musicPlayerStore = useMusicPlayerStore()

playlistStore.fetchTracks()

const playOrPauseTrack = async (trackID: string) => {
  const track = playlistStore.tracks.find(
    (t: { id: string }) => t.id === trackID
  )
  if (track) {
    if (musicPlayerStore.track?.id === track.id) {
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
  if (
    confirm(
      `Are you sure you want to delete this track? This action cannot be undone.`
    )
  ) {
    await audioService.removeTrack(trackID)
    playlistStore.fetchTracks()
    musicPlayerStore.fetchCurrentTrack()
  }
}

const dialog = ref(false)
const message = ref('')
const selectedTrackId = ref<string | null>(null)

const openTagDialog = (trackID: string) => {
  selectedTrackId.value = trackID
  dialog.value = true
  message.value = ''
}

const submitTag = () => {
  // TODO: Implement tag functionality
  dialog.value = false
}
</script>

<style scoped lang="scss">
.playlist-container {
  min-height: calc(100vh - 260px);
  padding: var(--spacing-lg) 0;
}

.empty-state {
  opacity: 0.8;
  transition: all var(--transition-base);

  &:hover {
    opacity: 1;
  }
}

.track-list {
  background: transparent !important;
}

.track-item {
  background: rgb(var(--v-theme-surface)) !important;
  margin-bottom: var(--spacing-sm);
  transition: all var(--transition-base) !important;
  border: 2px solid transparent;

  &:hover {
    transform: translateX(8px);
    border-color: rgb(var(--v-theme-accent));
  }

  &.track-active {
    border-color: rgb(var(--v-theme-accent));
    background: rgb(var(--v-theme-surface-variant)) !important;

    .track-title {
      color: rgb(var(--v-theme-accent));
      font-weight: var(--font-weight-semibold);
    }
  }
}

.track-title {
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.track-actions {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
}

.play-button {
  transition: all var(--transition-base);

  &:hover {
    transform: scale(1.2);
  }
}

.dialog-card {
  border-radius: var(--radius-2xl) !important;
}

// Responsive adjustments
@media (max-width: 600px) {
  .playlist-container {
    padding: var(--spacing-sm) 0;
  }

  .track-item {
    &:hover {
      transform: translateX(4px);
    }
  }

  .track-actions {
    flex-direction: column;
    gap: 0;
  }
}
</style>
