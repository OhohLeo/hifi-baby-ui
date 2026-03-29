<template>
  <div class="top-chrome">
    <v-app-bar
      :elevation="2"
      rounded
      scroll-behavior="elevate"
      class="premium-app-bar"
    >
      <div class="app-brand d-flex align-center min-w-0">
        <v-icon
          class="app-brand__mark mr-2 flex-shrink-0"
          size="22"
          color="accent"
        >
          mdi-headphones
        </v-icon>
        <span class="app-title text-h6 text-truncate">Hifi Baby</span>
      </div>

      <v-spacer />

      <v-btn
        v-if="!isSettingsOpen"
        icon
        variant="text"
        class="search-toggle"
        :aria-label="searchVisible ? $t('topMenu.closeSearch') : $t('topMenu.searchTracks')"
        @click="toggleSearch"
      >
        <v-icon>{{ searchVisible ? 'mdi-close' : 'mdi-magnify' }}</v-icon>
      </v-btn>

      <div class="language-selector-container">
        <v-select
          v-model="locale"
          :items="locales"
          item-title="title"
          item-value="value"
          variant="solo"
          hide-details
          density="compact"
          class="language-selector"
          aria-label="Select language"
        />
      </div>

      <v-btn
        icon
        variant="text"
        aria-label="Toggle theme"
        class="theme-toggle"
        @click="handleThemeToggle"
      >
        <v-icon>{{ themeIcon }}</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Full-width search line directly under the top menu (uses --v-layout-top from v-main) -->
    <v-slide-y-transition>
      <div
        v-if="searchVisible"
        class="search-below-bar"
      >
        <div class="search-below-bar__inner">
          <v-text-field
            v-model="searchQuery"
            density="comfortable"
            variant="solo-filled"
            flat
            hide-details
            single-line
            clearable
            autofocus
            :placeholder="$t('playlist.search')"
            :aria-label="$t('topMenu.searchTracks')"
            class="search-below-bar__field"
            @click.stop
          />
          <v-btn
            icon
            variant="text"
            size="small"
            class="search-below-bar__close"
            :aria-label="$t('topMenu.closeSearch')"
            @click="closeSearch"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { usePlaylistSearch } from '@/composables/usePlaylistSearch'
import { useSettingsView } from '@/composables/useSettingsView'
import { useI18n } from 'vue-i18n'

const { isSettingsOpen } = useSettingsView()
const { locale } = useI18n()
const { searchQuery, searchVisible, toggleSearch, closeSearch } = usePlaylistSearch()

watch(isSettingsOpen, (open) => {
  if (open) {
    closeSearch()
  }
})

const locales = [
  { title: 'EN', value: 'en' },
  { title: 'FR', value: 'fr' },
]

watch(locale, (newLocale) => {
  localStorage.setItem('locale', newLocale)
})

const theme = useTheme()
const themeIcon = computed(() => (theme.isDark.value ? 'mdi-weather-sunny' : 'mdi-weather-night'))
function handleThemeToggle() {
  theme.toggleTheme()
}
</script>

<style scoped lang="scss">
.top-chrome {
  position: relative;
  z-index: 1006;
}

// Pinned under the fixed app bar (--v-layout-top is set on v-main and inherits here)
.search-below-bar {
  position: fixed;
  left: 0;
  right: 0;
  top: var(--v-layout-top, calc(env(safe-area-inset-top, 0px) + 64px));
  z-index: 1005;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.12);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}

.search-below-bar__inner {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px 10px;
  max-width: 100%;
}

.search-below-bar__field {
  flex: 1 1 auto;
  min-width: 0;

  :deep(.v-field) {
    border-radius: var(--radius-ui) !important;
  }

  :deep(.v-field__input) {
    font-size: 0.9375rem;
    min-height: 44px;
    padding-top: 8px;
    padding-bottom: 8px;
  }
}

.search-below-bar__close {
  flex-shrink: 0;
}

.premium-app-bar {
  border-bottom: 1px solid rgba(var(--v-theme-on-background), 0.08);

  .app-title {
    font-weight: var(--font-weight-semibold);
    letter-spacing: -0.02em;
  }

  .app-brand__mark {
    opacity: 0.95;
  }

  .search-toggle {
    opacity: 0.85;

    &:hover {
      opacity: 1;
    }
  }

  .theme-toggle {
    transition: all var(--transition-base);
    margin-right: 4px;

    &:hover {
      transform: rotate(180deg);
    }
  }
}

.language-selector-container {
  width: 84px;
  margin-right: 4px;
}

.language-selector {
  :deep(.v-field) {
    border-radius: var(--radius-ui) !important;
    box-shadow: none !important;
  }
}

:deep(.v-toolbar__extension:empty) {
  display: none;
}

.settings-view {
  border-radius: var(--radius-2xl) !important;
  width: 100%;
}

:deep(.v-card-text) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
