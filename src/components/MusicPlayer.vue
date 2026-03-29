<template>
  <div
    class="music-player-footer"
    role="contentinfo"
  >
    <div class="mini-player__bar">
      <div class="mini-player__progress-wrap">
        <transition
          name="fade"
          mode="out-in"
        >
          <div
            :key="musicPlayer.track?.id ?? 'none'"
            class="music-player__track-title-wrap min-w-0"
          >
            <v-tooltip
              location="top"
              :text="trackTitleTooltip"
            >
              <template #activator="{ props: tooltipProps }">
                <div
                  v-bind="tooltipProps"
                  class="music-player__track-title text-body-1 text-high-emphasis"
                >
                  {{ trackTitleDisplay }}
                </div>
              </template>
            </v-tooltip>
          </div>
        </transition>

        <v-slider
          v-model="currentPosition"
          class="mini-player__slider-slim"
          :max="musicPlayer.track?.duration || 0"
          hide-details
          color="accent"
          track-color="surface-variant"
          thumb-color="accent"
          track-size="4"
          thumb-size="10"
          rounded
          @start="stopTimer"
          @end="onPositionChange"
        />
        <div class="mini-player__times d-flex justify-space-between">
          <span class="text-caption text-medium-emphasis time-tick">{{ formattedCurrentTime }}</span>
          <span class="text-caption text-medium-emphasis time-tick">{{ formattedDuration }}</span>
        </div>
      </div>
    </div>

    <div
      class="mini-player__controls"
      role="toolbar"
      :aria-label="$t('musicPlayer.transportControls')"
    >
      <v-btn
        color="accent"
        icon
        size="large"
        variant="flat"
        elevation="0"
        :disabled="musicPlayer.isStopped"
        :aria-label="musicPlayer.isPlaying ? $t('musicPlayer.pause') : $t('musicPlayer.play')"
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
        :disabled="musicPlayer.isStopped"
        :aria-label="$t('musicPlayer.stop')"
        class="control-btn"
        @click="musicPlayer.stop()"
      >
        <v-icon size="26">
          mdi-stop
        </v-icon>
      </v-btn>

      <v-btn
        icon
        variant="text"
        size="large"
        class="control-btn"
        :aria-label="musicPlayer.isMuted ? $t('musicPlayer.unmute') : $t('musicPlayer.mute')"
        @click="musicPlayer.toggleMute()"
      >
        <v-icon size="26">
          {{ musicPlayer.isMuted ? 'mdi-volume-off' : 'mdi-volume-high' }}
        </v-icon>
      </v-btn>

      <v-menu location="top">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            icon
            variant="text"
            size="large"
            class="control-btn"
            :aria-label="$t('musicPlayer.volumeLevel')"
          >
            <v-icon size="26">
              mdi-volume-medium
            </v-icon>
          </v-btn>
        </template>
        <v-list
          density="compact"
          class="music-player__volume-menu"
        >
          <v-list-item
            :title="$t('musicPlayer.volumeUp')"
            prepend-icon="mdi-volume-plus"
            @click="onVolumeUp"
          />
          <v-list-item
            :title="$t('musicPlayer.volumeDown')"
            prepend-icon="mdi-volume-minus"
            @click="onVolumeDown"
          />
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMusicPlayerStore } from '../stores/MusicPlayer'
import audioService from '../services/api'
import { cleanTrackTitleForDisplay } from '@/utils/trackDisplay'

const { t } = useI18n()
const musicPlayer = useMusicPlayerStore()
const currentPosition = ref(0)
const interval = ref<ReturnType<typeof setInterval> | null>(null)

musicPlayer.fetchCurrentTrack()

function displayTitle(name: string) {
  return cleanTrackTitleForDisplay(name)
}

const trackTitleDisplay = computed(() =>
  musicPlayer.track
    ? displayTitle(musicPlayer.track.name)
    : t('musicPlayer.noTrackPlaying')
)

const trackTitleTooltip = computed(() => trackTitleDisplay.value)

const onVolumeUp = async () => {
  await audioService.increaseVolume()
}

const onVolumeDown = async () => {
  await audioService.decreaseVolume()
}

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

.mini-player__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
}

.mini-player__bar {
  display: flex;
  justify-content: center;
  padding: 8px 0 4px;
}

.mini-player__progress-wrap {
  width: 100%;
  max-width: 600px;
  margin-inline: auto;
  padding-inline: 16px;
  box-sizing: border-box;
}

.music-player__track-title-wrap {
  width: 100%;
  margin-bottom: 6px;
  text-align: center;
}

.music-player__track-title {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: default;
}

.music-player__volume-menu {
  border-radius: var(--radius-ui) !important;
  min-width: 200px;
}

.mini-player__slider-slim {
  margin: 0;
  padding-inline: 0;

  :deep(.v-input__control) {
    min-height: 0;
  }

  :deep(.v-slider-track__background),
  :deep(.v-slider-track__fill) {
    height: 4px !important;
    border-radius: 999px !important;
  }

  :deep(.v-slider-thumb) {
    width: 10px !important;
    height: 10px !important;
    opacity: 0.95;
  }
}

.mini-player__times {
  margin-top: 2px;
  padding-bottom: 4px;
}

.time-tick {
  font-variant-numeric: tabular-nums;
  min-width: 2rem;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
