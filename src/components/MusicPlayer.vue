<template>
  <div
    class="music-player-footer"
    role="contentinfo"
  >
    <div class="music-player__inner">
      <div class="music-player__title-row">
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
      </div>

      <div
        class="music-player__controls-band"
        role="toolbar"
        :aria-label="$t('musicPlayer.transportControls')"
      >
        <div class="music-player__left-group">
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
        </div>

        <div class="music-player__center-slider">
          <v-slider
            v-model="currentPosition"
            class="music-player__position-slider mini-player__slider-slim"
            density="compact"
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
        </div>

        <div class="music-player__center-times mini-player__times d-flex justify-space-between">
          <span class="text-caption text-medium-emphasis time-tick">{{ formattedCurrentTime }}</span>
          <span class="text-caption text-medium-emphasis time-tick">{{ formattedDuration }}</span>
        </div>

        <div class="music-player__right-group">
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

          <v-slider
            v-model="volumeSliderModel"
            class="music-player__volume-slider mini-player__slider-slim"
            density="compact"
            :disabled="musicPlayer.isMuted"
            :max="100"
            :step="10"
            hide-details
            color="accent"
            track-color="surface-variant"
            thumb-color="accent"
            track-size="4"
            thumb-size="10"
            rounded
            :aria-label="$t('musicPlayer.volumeLevel')"
            @start="onVolumeSlideStart"
            @end="onVolumeSlideEnd"
          />
        </div>
      </div>
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

const VOLUME_SLIDER_STEP = 10

const volumeSliderModel = ref(
  Math.round(musicPlayer.volume * 100 / VOLUME_SLIDER_STEP) * VOLUME_SLIDER_STEP
)
const volumeSlideStart = ref(volumeSliderModel.value)

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

watch(
  () => musicPlayer.volume,
  v => {
    const snapped = Math.round(v * 100 / VOLUME_SLIDER_STEP) * VOLUME_SLIDER_STEP
    volumeSliderModel.value = Math.min(100, Math.max(0, snapped))
  }
)

function onVolumeSlideStart() {
  volumeSlideStart.value = volumeSliderModel.value
}

async function onVolumeSlideEnd() {
  const startStep = Math.round(volumeSlideStart.value / VOLUME_SLIDER_STEP)
  const endStep = Math.round(volumeSliderModel.value / VOLUME_SLIDER_STEP)
  const diff = endStep - startStep
  if (diff === 0) {
    return
  }
  const count = Math.abs(diff)
  const goUp = diff > 0
  for (let i = 0; i < count; i++) {
    if (goUp) {
      await audioService.increaseVolume()
    } else {
      await audioService.decreaseVolume()
    }
  }
  await musicPlayer.updateVolume(volumeSliderModel.value / 100)
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

.music-player__inner {
  width: 100%;
  max-width: 800px;
  margin-inline: auto;
  padding-inline: 12px;
  box-sizing: border-box;
}

.music-player__title-row {
  display: flex;
  justify-content: center;
  padding: 6px 0 0;
  box-sizing: border-box;
}

.music-player__track-title-wrap {
  width: 100%;
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

.music-player__controls-band {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  grid-template-rows: auto auto;
  align-items: center;
  column-gap: 12px;
  row-gap: 2px;
  padding: 6px 0 calc(10px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.music-player__left-group {
  display: flex;
  grid-column: 1;
  grid-row: 1;
  align-items: center;
  align-self: center;
  gap: 4px;
}

.music-player__center-slider {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  align-items: center;
  align-self: center;
  min-width: 0;
  min-height: 0;
}

.music-player__center-times {
  grid-column: 2;
  grid-row: 2;
  margin-top: 0;
}

.music-player__right-group {
  display: flex;
  grid-column: 3;
  grid-row: 1;
  align-items: center;
  align-self: center;
  flex-shrink: 0;
  gap: 4px;
  min-width: 0;
  max-width: 160px;
}

.music-player__position-slider,
.music-player__volume-slider {
  flex: 1 1 auto;
  width: 100%;
  margin: 0;
  padding-inline: 0;

  :deep(.v-input__control) {
    min-height: 0;
  }

  :deep(.v-field) {
    padding-top: 0;
    padding-bottom: 0;
  }
}

.music-player__volume-slider {
  flex: 1 1 88px;
  min-width: 72px;
  max-width: 120px;
}

@media (max-width: 719px) {
  .music-player__controls-band {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto auto;
  }

  .music-player__left-group {
    grid-column: 1;
    grid-row: 1;
  }

  .music-player__right-group {
    grid-column: 2;
    grid-row: 1;
    justify-self: end;
    max-width: min(200px, 55vw);
  }

  .music-player__center-slider {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .music-player__center-times {
    grid-column: 1 / -1;
    grid-row: 3;
  }
}

.mini-player__slider-slim {
  margin: 0;
  padding-inline: 0;

  :deep(.v-input__control) {
    min-height: 0;
  }

  :deep(.v-input--density-compact) {
    --v-input-control-height: 32px;
  }

  :deep(.v-slider.v-input) {
    flex: 1 1 auto;
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
  padding-bottom: 2px;
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
