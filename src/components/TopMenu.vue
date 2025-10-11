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
      </v-container>
    </template>

    <v-spacer />

    <!-- Dark Mode Toggle -->
    <v-btn
      icon
      aria-label="Toggle theme"
      class="theme-toggle"
      @click="handleThemeToggle"
    >
      <v-icon>{{ themeIcon }}</v-icon>
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

  <!-- Floating Action Button -->
  <v-fab
    v-if="canDisplayFab"
    class="fab-button"
    color="accent"
    :icon="fabIcon"
    size="60"
    app
    location="bottom end"
    aria-label="Add song"
    @click="openDialog"
  />

  <AddSongDialog v-model:is-open="isDialogOpen" />
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const router = useRouter()

// Theme management - keep object intact for proper reactivity
const theme = useTheme()

// Computed property for theme icon based on current theme state
const themeIcon = computed(() => {
  return theme.isDark.value ? 'mdi-weather-sunny' : 'mdi-weather-night'
})

// Method to handle theme toggle action
function handleThemeToggle() {
  theme.toggleTheme()
}

const tabs = {
  songs: { name: 'Songs', icon: 'mdi-music', value: 'songs', disabled: false },
  radios: { name: 'Radios', icon: 'mdi-music', value: 'radios', disabled: true },
}

// Initialize based on current route
const isOnSettings = route.path === '/settings'
const selectedTab = ref<string | null>(isOnSettings ? null : 'songs')
const fabIcon = ref('mdi-music-note-plus')

const canDisplayFab = ref(!isOnSettings)
const canDisplaySlider = ref(!isOnSettings)

// Watch route changes to show/hide FAB based on current page
watch(() => route.path, (newPath) => {
  if (newPath === '/settings') {
    canDisplayFab.value = false
    canDisplaySlider.value = false
    selectedTab.value = null // Deselect tab when on settings to allow re-selection
  } else {
    canDisplayFab.value = true
    canDisplaySlider.value = true
    selectedTab.value = 'songs'
  }
})

const openSettings = () => {
  router.push('/settings')
}

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

.fab-button {
  position: fixed !important;
  bottom: 100px !important;
  right: 24px !important;
  z-index: 2000 !important;
}
</style>
