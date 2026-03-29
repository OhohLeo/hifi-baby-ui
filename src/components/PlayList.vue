<template>
  <div>
    <div>
      <v-container class="playlist-container">
        <v-row class="justify-center">
          <v-col
            cols="12"
            sm="12"
            md="10"
            lg="8"
            xl="6"
          >
            <div
              v-if="playlistStore.tracks.length === 0"
              class="empty-state-wrapper"
            >
              <div class="empty-state-glass pa-8 text-center">
                <div
                  class="empty-state-art"
                  aria-hidden="true"
                >
                  <span class="empty-state-art__ring empty-state-art__ring--outer" />
                  <span class="empty-state-art__ring empty-state-art__ring--inner" />
                  <v-icon
                    class="empty-state-art__note"
                    size="80"
                    color="accent"
                  >
                    mdi-music-note
                  </v-icon>
                </div>
                <h2 class="text-h5 mb-2 font-weight-semibold">
                  {{ $t('playlist.noSongs') }}
                </h2>
                <p class="text-body-2 text-medium-emphasis mb-6">
                  {{ $t('playlist.addFirstTrack') }}
                </p>
                <v-btn
                  color="accent"
                  size="large"
                  variant="flat"
                  class="add-music-cta"
                  @click="openAddSongDialog"
                >
                  {{ $t('playlist.addMusic') }}
                </v-btn>
              </div>
            </div>

            <div v-else>
              <p
                v-if="filteredTracks.length > 0"
                class="text-caption text-medium-emphasis mb-3 text-uppercase letter-spacing-wider"
              >
                {{ filteredTracks.length }}
                {{ filteredTracks.length === 1 ? $t('playlist.song') : $t('playlist.songs') }}
              </p>

              <div
                v-if="filteredTracks.length > 0"
                class="track-rows"
                role="list"
                :aria-label="$t('playlist.songs')"
              >
                <div
                  v-for="track in filteredTracks"
                  :key="track.id"
                  class="track-row"
                  :class="{ 'track-row--active': musicPlayerStore.isCurrentTrack(track.id) }"
                  role="listitem"
                  tabindex="0"
                  @click="onRowActivate(track.id)"
                  @keydown.enter.prevent="onRowActivate(track.id)"
                  @keydown.space.prevent="onRowActivate(track.id)"
                >
                  <div
                    class="track-row__art"
                    aria-hidden="true"
                  >
                    <v-icon
                      size="26"
                      color="accent"
                      class="track-row__art-icon"
                    >
                      mdi-album
                    </v-icon>
                  </div>

                  <div class="track-row__text min-w-0">
                    <div class="track-row__title text-body-1 text-high-emphasis text-truncate">
                      {{ displayTrackTitle(track.name) }}
                    </div>
                    <div class="track-row__subtitle text-caption text-medium-emphasis text-truncate">
                      {{ trackSubtitle(track) }}
                    </div>
                  </div>

                  <v-menu location="bottom end">
                    <template #activator="{ props: menuProps }">
                      <v-btn
                        icon
                        variant="text"
                        size="small"
                        class="track-row__menu-btn"
                        :aria-label="$t('playlist.trackMenu')"
                        v-bind="menuProps"
                        @click.stop
                      >
                        <v-icon size="20">
                          mdi-dots-vertical
                        </v-icon>
                      </v-btn>
                    </template>
                    <v-list
                      density="compact"
                      class="track-row-menu"
                    >
                      <v-list-item
                        :title="$t('playlist.addTags')"
                        prepend-icon="mdi-tag-plus-outline"
                        @click="openTagDialog(track.id)"
                      />
                      <v-divider class="my-1" />
                      <v-list-item
                        :title="$t('playlist.delete')"
                        prepend-icon="mdi-delete-outline"
                        base-color="error"
                        @click="removeTrack(track.id)"
                      />
                    </v-list>
                  </v-menu>
                </div>
              </div>

              <v-card
                v-else
                class="empty-state pa-8 text-center"
                variant="flat"
                :style="{ borderRadius: 'var(--radius-ui)' }"
              >
                <v-icon
                  size="56"
                  color="secondary"
                  class="mb-4"
                >
                  mdi-magnify-close
                </v-icon>
                <h2 class="text-h6 mb-2">
                  {{ $t('playlist.noResults') }}
                </h2>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ $t('playlist.tryDifferentQuery') }}
                </p>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <v-btn
      v-if="!isSettingsActive && playlistStore.tracks.length > 0"
      class="fab-add"
      color="accent"
      icon
      size="large"
      elevation="6"
      aria-label="Add song"
      @click="openAddSongDialog"
    >
      <v-icon size="28">
        mdi-plus
      </v-icon>
    </v-btn>

    <AddSongDialog v-model:is-open="isAddSongDialogOpen" />

    <v-dialog
      v-model="isTagDialogOpen"
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card
        class="dialog-card"
        :style="{ borderRadius: 'var(--radius-ui)' }"
      >
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
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlaylistStore } from '../stores/PlayList'
import {
  STATE_PLAY,
  STATE_PAUSE,
  useMusicPlayerStore,
} from '../stores/MusicPlayer'
import type { TrackModel } from '../models'
import audioService from '../services/api'
import { useSettingsView } from '@/composables/useSettingsView'
import { usePlaylistSearch } from '@/composables/usePlaylistSearch'
import { cleanTrackTitleForDisplay } from '@/utils/trackDisplay'

const { t } = useI18n()
const settingsView = useSettingsView()
const { searchQuery } = usePlaylistSearch()

const playlistStore = usePlaylistStore()
const musicPlayerStore = useMusicPlayerStore()

function displayTrackTitle(name: string) {
  return cleanTrackTitleForDisplay(name)
}

const filteredTracks = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) {
    return playlistStore.tracks
  }
  return playlistStore.tracks.filter(track =>
    track.name.toLowerCase().includes(q)
    || displayTrackTitle(track.name).toLowerCase().includes(q)
  )
})

playlistStore.fetchTracks()

function trackSubtitle(_track: TrackModel) {
  return t('playlist.subtitleDefault')
}

function onRowActivate(trackID: string) {
  void playOrPauseTrack(trackID)
}

const playOrPauseTrack = async (trackID: string) => {
  const track = playlistStore.tracks.find(
    (tr: { id: string }) => tr.id === trackID
  )
  if (track) {
    if (musicPlayerStore.track?.id === track.id) {
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
  if (confirm(t('playlist.confirmDelete'))) {
    await audioService.removeTrack(trackID)
    playlistStore.fetchTracks()
    musicPlayerStore.fetchCurrentTrack()
  }
}

const isTagDialogOpen = ref(false)
const message = ref('')

const openTagDialog = (_trackID: string) => {
  isTagDialogOpen.value = true
  message.value = ''
}

const submitTag = () => {
  isTagDialogOpen.value = false
}

const isSettingsActive = computed(() => settingsView.isSettingsOpen.value)

const isAddSongDialogOpen = ref(false)
const openAddSongDialog = () => {
  isAddSongDialogOpen.value = true
}
</script>

<style scoped lang="scss">
.playlist-container {
  padding-top: 0.5rem;
}

.letter-spacing-wider {
  letter-spacing: 0.08em;
}

.empty-state-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: calc(100dvh - 8rem - var(--bottom-chrome-total));
  padding-block: 1rem;
}

.empty-state-glass {
  max-width: 28rem;
  width: 100%;
  border-radius: var(--radius-ui);
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  transition:
    box-shadow var(--transition-base),
    border-color var(--transition-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  }
}

.empty-state-art {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8rem;
  height: 8rem;
  margin: 0 auto 1.25rem;
}

.empty-state-art__ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

.empty-state-art__ring--outer {
  inset: 0;
  opacity: 0.9;
}

.empty-state-art__ring--inner {
  inset: 1rem;
  opacity: 0.5;
  background: radial-gradient(circle, rgba(41, 121, 255, 0.12) 0%, transparent 70%);
  border-color: rgba(41, 121, 255, 0.2);
}

.empty-state-art__note {
  position: relative;
  z-index: 1;
  opacity: 0.92;
}

.add-music-cta {
  font-weight: var(--font-weight-semibold) !important;
  letter-spacing: 0.01em;
  min-width: 10rem;
  border-radius: var(--radius-ui) !important;
}

.empty-state {
  opacity: 0.9;
  transition: opacity var(--transition-base);
  max-width: 28rem;
  margin-inline: auto;
}

.track-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.track-row {
  display: grid;
  grid-template-columns: 48px 1fr 40px;
  align-items: center;
  gap: 12px;
  padding: 8px 10px 8px 8px;
  border-radius: var(--radius-ui);
  background: rgba(var(--v-theme-on-surface), 0.05);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);

  &:hover {
    background: rgba(var(--v-theme-on-surface), 0.08);
    border-color: rgba(var(--v-theme-on-surface), 0.1);
  }

  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-accent));
    outline-offset: 2px;
  }

  &--active {
    background: rgba(var(--v-theme-accent), 0.12);
    border-color: rgba(var(--v-theme-accent), 0.35);

    .track-row__title {
      color: rgb(var(--v-theme-accent));
      font-weight: var(--font-weight-semibold);
    }
  }
}

.track-row__art {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-ui);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    rgba(var(--v-theme-accent), 0.2) 0%,
    rgba(var(--v-theme-on-surface), 0.12) 100%
  );
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.track-row__art-icon {
  opacity: 0.9;
}

.track-row__menu-btn {
  opacity: 0.65;

  .track-row:hover & {
    opacity: 1;
  }
}

.track-row-menu {
  border-radius: var(--radius-ui) !important;
  min-width: 200px;
}

.dialog-card {
  border-radius: var(--radius-ui) !important;
}

.fab-add {
  position: fixed !important;
  right: 20px !important;
  bottom: calc(env(safe-area-inset-bottom, 0px) + var(--bottom-chrome-total) + 12px) !important;
  z-index: 2010 !important;
  width: 56px !important;
  height: 56px !important;
  border-radius: var(--radius-ui) !important;
  box-shadow:
    0 8px 24px rgba(41, 121, 255, 0.45),
    0 2px 8px rgba(0, 0, 0, 0.35) !important;
}

@media (max-width: 600px) {
  .track-row {
    grid-template-columns: 44px 1fr 36px;
    gap: 10px;
    padding: 6px 8px 6px 6px;
  }

  .track-row__art {
    width: 44px;
    height: 44px;
  }
}
</style>
