<template>
  <div
    class="music-player-footer"
    role="contentinfo"
  >
    <!-- Full-width progress (slightly thicker for easier scrubbing) -->
    <div class="mini-player__bar">
      <v-slider
        v-model="currentPosition"
        class="mini-player__slider-slim"
        :max="musicPlayer.track?.duration || 0"
        hide-details
        color="accent"
        track-color="surface-variant"
        thumb-color="accent"
        track-size="6"
        thumb-size="14"
        rounded
        @start="stopTimer"
        @end="onPositionChange"
      />
      <div class="mini-player__times px-4 d-flex justify-space-between">
        <span class="text-caption text-medium-emphasis time-tick">{{ formattedCurrentTime }}</span>
        <span class="text-caption text-medium-emphasis time-tick">{{ formattedDuration }}</span>
      </div>
    </div>

    <div class="mini-player__body">
      <div class="mini-player__track-col">
        <transition
          name="fade"
          mode="out-in"
        >
          <div
            :key="musicPlayer.track?.id"
            class="track-info"
          >
            <h3 class="text-body-1 track-name text-truncate mb-0 font-weight-semibold">
              {{
                musicPlayer.track
                  ? displayTitle(musicPlayer.track.name)
                  : $t('musicPlayer.noTrackPlaying')
              }}
            </h3>
            <p
              v-if="musicPlayer.track"
              class="text-caption text-medium-emphasis text-truncate mb-0"
            >
              {{ $t('playlist.subtitleDefault') }}
            </p>
          </div>
        </transition>
      </div>

      <!-- Centered transport controls (Spotify-style) -->
      <div class="mini-player__controls-center">
        <v-btn
          color="accent"
          icon
          size="large"
          variant="flat"
          elevation="0"
          :disabled="musicPlayer.isStopped"
          :aria-label="musicPlayer.isPlaying ? 'Pause' : 'Play'"
          class="play-pause-btn"
          @click="togglePlayPause"
        >
          <v-icon size="28">
            {{ musicPlayer.isPlaying ? 'mdi-pause' : 'mdi-play' }}
          </v-icon>
        </v-btn>

        <v-btn
          icon
          variant="text"
          size="large"
          :disabled="!canSkipNext"
          :aria-label="$t('musicPlayer.next')"
          class="control-btn"
          @click="playNext"
        >
          <v-icon size="26">
            mdi-skip-next
          </v-icon>
        </v-btn>

        <v-menu location="top end">
          <template #activator="{ props: menuProps }">
            <v-btn
              icon
              variant="text"
              size="large"
              class="control-btn"
              v-bind="menuProps"
              :aria-label="$t('musicPlayer.more')"
            >
              <v-icon size="22">
                mdi-dots-horizontal
              </v-icon>
            </v-btn>
          </template>
          <v-list
            density="compact"
            class="player-more-menu"
          >
            <v-list-item
              :title="$t('musicPlayer.stop')"
              prepend-icon="mdi-stop"
              :disabled="musicPlayer.isStopped"
              @click="musicPlayer.stop()"
            />
            <v-divider class="my-1" />
            <v-list-item
              :title="musicPlayer.isMuted ? $t('musicPlayer.unmute') : $t('musicPlayer.mute')"
              :prepend-icon="musicPlayer.isMuted ? 'mdi-volume-off' : 'mdi-volume-high'"
              @click="musicPlayer.toggleMute()"
            />
            <v-list-item
              :title="$t('musicPlayer.volumeDown')"
              prepend-icon="mdi-volume-minus"
              @click="decreaseVolume"
            />
            <v-list-item
              :title="$t('musicPlayer.volumeUp')"
              prepend-icon="mdi-volume-plus"
              @click="increaseVolume"
            />
          </v-list>
        </v-menu>
      </div>

      <!-- Balances layout so center controls stay visually centered -->
      <div
        class="mini-player__track-spacer"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useMusicPlayerStore } from '../stores/MusicPlayer'
import { usePlaylistStore } from '../stores/PlayList'
import audioService from '../services/api'
import { cleanTrackTitleForDisplay } from '@/utils/trackDisplay'

const musicPlayer = useMusicPlayerStore()
const playlistStore = usePlaylistStore()
const currentPosition = ref(0)
const interval = ref<number | null>(null)

musicPlayer.fetchCurrentTrack()

function displayTitle(name: string) {
  return cleanTrackTitleForDisplay(name)
}

const canSkipNext = computed(() => playlistStore.sortedTracks.length > 0)

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) {
    return '0:00'
  }
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const formattedCurrentTime = computed(() => formatTime(currentPosition.value))
const formattedDuration = computed(() => formatTime(musicPlayer.track?.duration || 0))

const stopTimer = () => {
  if (interval.value) {
    clearInterval(interval.value)
    interval.value = null
  }
}

const startTimer = () => {
  stopTimer()
  interval.value = setInterval(() => {
    if (musicPlayer.track && currentPosition.value < musicPlayer.track.duration) {
      currentPosition.value++
    } else {
      stopTimer()
    }
  }, 1000)
}

watch(
  [() => musicPlayer.track, () => musicPlayer.isPlaying],
  ([track, isPlaying]) => {
    stopTimer()
    if (track) {
      currentPosition.value = musicPlayer.position || 0
      if (isPlaying) {
        startTimer()
      }
    } else {
      currentPosition.value = 0
    }
  },
  { deep: true }
)

onUnmounted(stopTimer)

const togglePlayPause = async () => {
  if (musicPlayer.isPlaying) {
    await musicPlayer.pause()
  } else {
    await musicPlayer.resume()
  }
}

async function playNext() {
  const list = playlistStore.sortedTracks
  if (!list.length) {
    return
  }
  const curId = musicPlayer.track?.id
  const idx = list.findIndex(t => t.id === curId)
  const nextIdx = idx >= 0 ? (idx + 1) % list.length : 0
  const next = list[nextIdx]
  if (next) {
    await musicPlayer.play(next)
  }
}

const increaseVolume = async () => {
  await audioService.increaseVolume()
}

const decreaseVolume = async () => {
  await audioService.decreaseVolume()
}

const onPositionChange = async (newPosition: number) => {
  if (musicPlayer.track) {
    await audioService.setTrackPosition(Math.round(newPosition))
    musicPlayer.position = newPosition
    if (musicPlayer.isPlaying) {
      startTimer()
    }
  }
}
</script>

<style scoped lang="scss">
.music-player-footer {
  flex: 0 0 auto;
  width: 100%;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(var(--v-theme-on-background), 0.1);
  background: rgba(var(--v-theme-surface), 0.94);
}

.mini-player__bar {
  padding: 8px 0 0;
}

.mini-player__slider-slim {
  margin: 0;
  padding-inline: 0;

  :deep(.v-input__control) {
    min-height: 0;
  }

  :deep(.v-slider-track__background),
  :deep(.v-slider-track__fill) {
    height: 6px !important;
    border-radius: 999px !important;
  }

  :deep(.v-slider-thumb) {
    width: 14px !important;
    height: 14px !important;
    opacity: 0.95;
  }
}

.mini-player__times {
  margin-top: 2px;
  padding-bottom: 2px;
}

.time-tick {
  font-variant-numeric: tabular-nums;
  min-width: 2rem;
}

.mini-player__body {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 52px;
  padding: 8px 12px 10px;
}

.mini-player__track-col {
  flex: 1 1 33%;
  min-width: 0;
  max-width: 42%;
  z-index: 1;
}

.mini-player__controls-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
}

.mini-player__track-spacer {
  flex: 1 1 33%;
  min-width: 0;
  pointer-events: none;
}

@media (max-width: 400px) {
  .mini-player__track-col {
    max-width: 36%;
  }
}

.track-info .track-name {
  letter-spacing: -0.01em;
  line-height: 1.35;
  color: rgba(var(--v-theme-on-surface), 0.98);
}

.control-btn {
  border-radius: var(--radius-ui) !important;
  transition: all var(--transition-base);

  &:hover:not(:disabled) {
    transform: scale(1.06);
    background: rgba(var(--v-theme-on-surface), 0.08) !important;
  }

  &:disabled {
    opacity: 0.35;
  }
}

.play-pause-btn {
  border-radius: var(--radius-ui) !important;
  width: 48px !important;
  height: 48px !important;
  transition: all var(--transition-base);
  box-shadow: 0 4px 14px rgba(41, 121, 255, 0.35) !important;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 6px 18px rgba(41, 121, 255, 0.45) !important;
  }

  &:disabled {
    opacity: 0.35;
    box-shadow: none !important;
  }
}

.player-more-menu {
  border-radius: var(--radius-ui) !important;
  min-width: 200px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
