<template>
  <v-footer
    app
    class="music-player-footer"
    role="contentinfo"
  >
    <v-container class="py-4">
      <!-- Track Info -->
      <v-row
        align="center"
        justify="center"
        no-gutters
        class="mb-3"
      >
        <v-col
          cols="12"
          class="text-center"
        >
          <transition
            name="fade"
            mode="out-in"
          >
            <div
              :key="musicPlayer.track?.id"
              class="track-info"
            >
              <h3 class="text-h6 track-name mb-1">
                {{ musicPlayer.track ? musicPlayer.track.name : $t('musicPlayer.noTrackPlaying') }}
              </h3>
              <p
                v-if="musicPlayer.track?.format"
                class="text-caption text-secondary"
              >
                {{ musicPlayer.track.format.toUpperCase() }}
              </p>
            </div>
          </transition>
        </v-col>
      </v-row>

      <!-- Progress Slider -->
      <v-row
        align="center"
        justify="center"
        no-gutters
        class="mb-2"
      >
        <v-col
          cols="auto"
          class="text-caption text-secondary"
        >
          {{ formattedCurrentTime }}
        </v-col>
        <v-col class="px-2">
          <v-slider
            v-model="currentPosition"
            :max="musicPlayer.track?.duration || 0"
            readonly
            hide-details
            color="accent"
            track-color="surface-variant"
            thumb-color="accent"
          />
        </v-col>
        <v-col
          cols="auto"
          class="text-caption text-secondary"
        >
          {{ formattedDuration }}
        </v-col>
      </v-row>

      <!-- Playback Controls -->
      <v-row
        align="center"
        justify="center"
        no-gutters
      >
        <!-- Volume Down -->
        <v-col
          cols="auto"
          class="d-none d-sm-flex"
        >
          <v-btn
            icon
            variant="text"
            size="large"
            aria-label="Decrease volume"
            class="control-btn"
            @click="decreaseVolume"
          >
            <v-icon>mdi-volume-minus</v-icon>
          </v-btn>
        </v-col>

        <!-- Mute -->
        <v-col
          cols="auto"
          class="d-none d-sm-flex"
        >
          <v-btn
            icon
            variant="text"
            size="large"
            :aria-label="musicPlayer.isMuted ? 'Unmute' : 'Mute'"
            class="control-btn"
            @click="musicPlayer.toggleMute()"
          >
            <v-icon>
              {{ musicPlayer.isMuted ? 'mdi-volume-off' : 'mdi-volume-high' }}
            </v-icon>
          </v-btn>
        </v-col>

        <!-- Stop -->
        <v-col cols="auto">
          <v-btn
            icon
            variant="text"
            size="large"
            aria-label="Stop"
            class="control-btn"
            :disabled="musicPlayer.isStopped"
            @click="musicPlayer.stop()"
          >
            <v-icon>mdi-stop</v-icon>
          </v-btn>
        </v-col>

        <!-- Play/Pause - Main Control -->
        <v-col cols="auto">
          <v-btn
            icon
            color="accent"
            size="x-large"
            variant="flat"
            elevation="2"
            :disabled="musicPlayer.isStopped"
            :aria-label="musicPlayer.isPlaying ? 'Pause' : 'Play'"
            class="play-pause-btn"
            @click="togglePlayPause"
          >
            <v-icon size="32">
              {{ musicPlayer.isPlaying ? 'mdi-pause' : 'mdi-play' }}
            </v-icon>
          </v-btn>
        </v-col>

        <!-- Volume Up -->
        <v-col
          cols="auto"
          class="d-none d-sm-flex"
        >
          <v-btn
            icon
            variant="text"
            size="large"
            aria-label="Increase volume"
            class="control-btn"
            @click="increaseVolume"
          >
            <v-icon>mdi-volume-plus</v-icon>
          </v-btn>
        </v-col>

        <!-- Mobile Volume Menu -->
        <v-col
          cols="auto"
          class="d-sm-none"
        >
          <v-menu location="top">
            <template #activator="{ props }">
              <v-btn
                icon
                variant="text"
                size="large"
                v-bind="props"
                aria-label="Volume controls"
                class="control-btn"
              >
                <v-icon>
                  {{ musicPlayer.isMuted ? 'mdi-volume-off' : 'mdi-volume-high' }}
                </v-icon>
              </v-btn>
            </template>

            <v-list class="volume-menu">
              <v-list-item @click="musicPlayer.toggleMute()">
                <template #prepend>
                  <v-icon>
                    {{ musicPlayer.isMuted ? 'mdi-volume-off' : 'mdi-volume-high' }}
                  </v-icon>
                </template>
                <v-list-item-title>
                  {{ musicPlayer.isMuted ? 'Unmute' : 'Mute' }}
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="decreaseVolume">
                <template #prepend>
                  <v-icon>mdi-volume-minus</v-icon>
                </template>
                <v-list-item-title>Decrease Volume</v-list-item-title>
              </v-list-item>
              <v-list-item @click="increaseVolume">
                <template #prepend>
                  <v-icon>mdi-volume-plus</v-icon>
                </template>
                <v-list-item-title>Increase Volume</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useMusicPlayerStore } from '../stores/MusicPlayer'
import audioService from '../services/api'

const musicPlayer = useMusicPlayerStore()
const currentPosition = ref(0)
const interval = ref<number | null>(null)

musicPlayer.fetchCurrentTrack()

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
  stopTimer() // Ensure no multiple timers
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

const increaseVolume = async () => {
  await audioService.increaseVolume()
}

const decreaseVolume = async () => {
  await audioService.decreaseVolume()
}
</script>

<style scoped lang="scss">
.music-player-footer {
  backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(var(--v-theme-on-background), 0.08);
}

.track-info {
  .track-name {
    font-weight: var(--font-weight-semibold);
    letter-spacing: -0.01em;
    margin-bottom: var(--spacing-xs);
  }
}

.control-btn {
  transition: all var(--transition-base);

  &:hover:not(:disabled) {
    transform: scale(1.1);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.3;
  }
}

.play-pause-btn {
  transition: all var(--transition-base);
  box-shadow: var(--shadow-lg);

  &:hover:not(:disabled) {
    transform: scale(1.15);
    box-shadow: var(--shadow-xl);
  }

  &:active:not(:disabled) {
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.3;
  }
}

.volume-menu {
  border-radius: var(--radius-lg);
}

// Fade transition for track changes
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// Responsive adjustments
@media (max-width: 600px) {
  .track-name {
    font-size: 1rem !important;
  }

  .control-btn {
    &:hover:not(:disabled) {
      transform: scale(1.05);
    }
  }

  .play-pause-btn {
    &:hover:not(:disabled) {
      transform: scale(1.1);
    }
  }
}
</style>
