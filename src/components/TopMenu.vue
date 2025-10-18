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
</template>

<script setup lang="ts">
import { watch, computed} from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useSettingsView } from '@/composables/useSettingsView'
import { useI18n } from 'vue-i18n'

const {  locale } = useI18n()

// Language management
const locales = [
  { title: 'EN', value: 'en' },
  { title: 'FR', value: 'fr' },
]

watch(locale, (newLocale) => {
  localStorage.setItem('locale', newLocale)
})

// Theme management
const theme = useTheme()
const themeIcon = computed(() => (theme.isDark.value ? 'mdi-weather-sunny' : 'mdi-weather-night'))
function handleThemeToggle() {
  theme.toggleTheme()
}

// Settings view management
const settingsView = useSettingsView()

function openSettings() {
  settingsView.openSettings()
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
    margin-right: 12px;
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

/* Hide the toolbar extension container when it has no content */
:deep(.v-toolbar__extension:empty) {
  display: none;
}

.settings-view {
  border-radius: var(--radius-2xl) !important;
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
}

// Ensure proper scrolling for modal content
:deep(.v-card-text) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>