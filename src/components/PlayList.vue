<template>
  <div>
    <div>
      <v-container>
        <!-- Tabs moved from TopMenu -->
        <v-tabs
          v-if="!isSettingsActive"
          v-model="selectedTab"
          align-tabs="center"
          height="60"
          grow
          stacked
          class="mb-4"
          @update:model-value="handleTabChange"
        >
          <v-tab
            v-for="(tab, key) in tabs"
            :key="key"
            :prepend-icon="tab.icon"
            :text="tab.name"
            :value="tab.value"
            :disabled="tab.disabled"
          />
        </v-tabs>

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
                {{ $t('playlist.noSongs') }}
              </h2>
              <p class="text-body-1 text-secondary mb-4">
                {{ $t('playlist.addFirstTrack') }}
              </p>
            </v-card>

            <div v-else>
              <!-- Search Input -->
              <v-text-field
                v-model="searchQuery"
                :label="$t('playlist.search')"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                clearable
                class="mb-4"
              />

              <!-- Track List -->
              <v-list
                v-if="filteredTracks.length > 0"
                class="track-list"
                role="list"
                aria-label="Song playlist"
              >
                <v-list-subheader class="text-overline">
                  {{ filteredTracks.length }}
                  {{ filteredTracks.length === 1 ? $t('playlist.song') : $t('playlist.songs') }}
                </v-list-subheader>

                <v-list-item
                  v-for="track in filteredTracks"
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
                        :aria-label="$t('playlist.addTags')"
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
                        :aria-label="`${$t('playlist.delete')} ${track.name}`"
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
              <!-- No Search Results -->
              <v-card
                v-else
                class="empty-state pa-8 text-center"
                variant="flat"
              >
                <v-icon
                  size="64"
                  color="secondary"
                  class="mb-4"
                >
                  mdi-magnify-close
                </v-icon>
                <h2 class="text-h5 mb-2">
                  {{ $t('playlist.noResults') }}
                </h2>
                <p class="text-body-1 text-secondary mb-4">
                  {{ $t('playlist.tryDifferentQuery') }}
                </p>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Floating Action Button -->
    <v-fab
      v-if="!isSettingsActive"
      class="fab-button"
      color="accent"
      :icon="fabIcon"
      size="60"
      app
      location="bottom end"
      aria-label="Add song"
      @click="openAddSongDialog"
    />

    <AddSongDialog v-model:is-open="isAddSongDialogOpen" />

    <!-- Tag Dialog -->
    <v-dialog
      v-model="isTagDialogOpen"
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card class="dialog-card">
        <v-card-title class="text-h6 pa-6">
          <v-icon class="mr-2">
            mdi-tag-multiple
          </v-icon>
          {{ $t('addTagDialog.title') }}
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
            @click="isTagDialogOpen = false"
          >
            {{ $t('settings.cancel') }}
          </v-btn>
          <v-btn
            color="accent"
            variant="flat"
            @click="submitTag"
          >
            {{ $t('addTagDialog.submit') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { usePlaylistStore } from '../stores/PlayList'
import {
  STATE_PLAY,
  STATE_PAUSE,
  useMusicPlayerStore,
} from '../stores/MusicPlayer'
import audioService from '../services/api'
import { useSettingsView } from '@/composables/useSettingsView'
import AddSongDialog from './AddSongDialog.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const settingsView = useSettingsView()

const playlistStore = usePlaylistStore()
const musicPlayerStore = useMusicPlayerStore()

const searchQuery = ref('')
const filteredTracks = computed(() => {
  if (!searchQuery.value) {
    return playlistStore.tracks
  }
  return playlistStore.tracks.filter(track =>
    track.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

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
    confirm(t('playlist.confirmDelete'))
  ) {
    await audioService.removeTrack(trackID)
    playlistStore.fetchTracks()
    musicPlayerStore.fetchCurrentTrack()
  }
}

// Tag Dialog logic
const isTagDialogOpen = ref(false)
const message = ref('')
const selectedTrackId = ref<string | null>(null)

const openTagDialog = (trackID: string) => {
  selectedTrackId.value = trackID
  isTagDialogOpen.value = true
  message.value = ''
}

const submitTag = () => {
  // TODO: Implement tag functionality
  isTagDialogOpen.value = false
}

// Tabs and FAB logic moved from TopMenu.vue
const tabs = computed(() => ({
  songs: { name: t('topMenu.songs'), icon: 'mdi-music', value: 'songs', disabled: false },
  radios: { name: t('topMenu.radios'), icon: 'mdi-radio-tower', value: 'radios', disabled: true },
}))

const fabIcon = ref('mdi-music-note-plus')

const isSettingsActive = computed(() => settingsView.isSettingsOpen.value)

const selectedTab = ref<string | null>('songs')

function handleTabChange(tabValue: unknown) {
  // Only handle user interactions, not programmatic changes
  if (tabValue === null || typeof tabValue !== 'string') {
    return
  }

  updateFabIcon()

  // Navigate to home when Songs tab is clicked from another page
  if (tabValue === 'songs' && route.path !== '/') {
    router.push('/')
  }
}

const updateFabIcon = () => {
  switch (selectedTab.value) {
    case 'songs':
      fabIcon.value = 'mdi-music-note-plus'
      break
    case 'radios':
      fabIcon.value = 'mdi-radio'
      break
  }
}

// Add Song Dialog logic
const isAddSongDialogOpen = ref(false)
const openAddSongDialog = () => {
  isAddSongDialogOpen.value = true
}
</script>

<style scoped lang="scss">
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

.fab-button {
  position: fixed !important;
  bottom: 160px !important;
  right: 24px !important;
  z-index: 2000 !important;
}

// Responsive adjustments
@media (max-width: 600px) {
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
