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

    <!-- Language Selector -->
    <div class="language-selector-container">
      <v-select
        v-model="locale"
        :items="locales"
        item-title="title"
        item-value="value"
        variant="solo"
        hide-details
        class="language-selector"
        aria-label="Select language"
      />
    </div>

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
      :aria-label="$t('topMenu.settings')"
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
import { useSettingsModal } from '@/composables/useSettingsModal'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const route = useRoute()
const router = useRouter()

// Language management
const locales = [
  { title: 'EN', value: 'en' },
  { title: 'FR', value: 'fr' },
]

watch(locale, (newLocale) => {
  localStorage.setItem('locale', newLocale)
})


// Theme management - keep object intact for proper reactivity
const theme = useTheme()

// Settings modal management
const settingsModal = useSettingsModal()

// Computed property for theme icon based on current theme state
const themeIcon = computed(() => {
  return theme.isDark.value ? 'mdi-weather-sunny' : 'mdi-weather-night'
})

// Method to handle theme toggle action
function handleThemeToggle() {
  theme.toggleTheme()
}

const tabs = computed(() => ({
  songs: { name: t('topMenu.songs'), icon: 'mdi-music', value: 'songs', disabled: false },
  radios: { name: t('topMenu.radios'), icon: 'mdi-radio-tower', value: 'radios', disabled: true },
}))

// Initialize based on current route
const isOnSettings = route.path === '/settings'
const selectedTab = ref<string | null>(isOnSettings ? null : 'songs')
const fabIcon = ref('mdi-music-note-plus')

const canDisplayFab = ref(!isOnSettings)
const canDisplaySlider = ref(!isOnSettings)

// Watch route changes to open settings modal and manage UI state
watch(() => route.path, (newPath, oldPath) => {
  if (newPath === '/settings') {
    // Open settings modal and redirect back to previous page
    settingsModal.openModal()
    if (oldPath && oldPath !== '/settings') {
      router.replace(oldPath)
    } else {
      router.replace('/')
    }
  }

  // Update UI state based on route
  const isSettings = newPath === '/settings'
  canDisplayFab.value = !isSettings
  canDisplaySlider.value = !isSettings
  selectedTab.value = isSettings ? null : 'songs'
})

function openSettings() {
  settingsModal.openModal()
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
    margin-right:12px;
    &:hover {
      transform: rotate(180deg);
    }
  }
}

.language-selector-container {
  width: 90px;
  margin-right: 12px;
}

.language-selector {
  :deep(.v-field) {
    border-radius: var(--radius-lg) !important;
    box-shadow: none !important;
  }
}

.fab-button {
  position: fixed !important;
  bottom: 160px !important;
  right: 24px !important;
  z-index: 2000 !important;
}
</style>
