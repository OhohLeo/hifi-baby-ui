<template>
  <v-app-bar
    :elevation="7"
    rounded
    scroll-behavior="elevate"
    class="premium-app-bar"
  >
    <v-app-bar-title class="text-h6">
      <span class="app-title">Hifi Baby</span>
    </v-app-bar-title>

    <template #extension>
      <v-container>
        <v-tabs
          v-model="selectedTab"
          align-tabs="center"
          height="60"
          grow
          stacked
          :hide-slider="!canDisplaySlider"
          @update:model-value="updateFabIcon"
        >
          <v-tab
            v-for="(tab, key) in tabs"
            :key="key"
            :to="tab.to"
            :prepend-icon="tab.icon"
            :text="tab.name"
            :value="tab.value"
            @click="openTab"
          />
        </v-tabs>
      </v-container>
      <v-fab
        :active="canDisplayFab"
        class="mr-4"
        color="accent"
        :icon="fabIcon"
        size="60"
        absolute
        offset
        aria-label="Add song"
        @click="openDialog"
      />
    </template>

    <v-spacer />

    <!-- Dark Mode Toggle -->
    <v-btn
      icon
      aria-label="Toggle theme"
      class="theme-toggle"
      @click="toggleTheme"
    >
      <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    </v-btn>

    <v-btn
      icon
      :to="'/settings'"
      aria-label="Settings"
      @click="openSettings"
    >
      <v-icon>mdi-cog</v-icon>
    </v-btn>
  </v-app-bar>

  <AddSongDialog v-model:is-open="isDialogOpen" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()

const tabs = {
  songs: { name: 'Songs', icon: 'mdi-music', value: 'songs', to: '/' },
  radios: { name: 'Radios', icon: 'mdi-music', value: 'radios', to: '/' },
}

const selectedTab = ref('songs')
const fabIcon = ref('mdi-music-note-plus')

const canDisplayFab = ref(true)
const canDisplaySlider = ref(true)

const openTab = () => {
  canDisplayFab.value = true
  canDisplaySlider.value = true
}

const openSettings = () => {
  canDisplayFab.value = false
  canDisplaySlider.value = false
}

const updateFabIcon = () => {
  switch (selectedTab.value) {
    case 'songs':
      fabIcon.value = 'mdi-music-note-plus'
      break
  }
}

const isDialogOpen = ref(false)
const openDialog = () => {
  isDialogOpen.value = true
}
</script>

<style scoped lang="scss">
.premium-app-bar {
  .app-title {
    font-weight: var(--font-weight-semibold);
    letter-spacing: -0.02em;
  }

  .theme-toggle {
    transition: all var(--transition-base);

    &:hover {
      transform: rotate(180deg);
    }
  }
}
</style>
