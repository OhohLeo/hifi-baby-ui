<template>
  <!-- Custom dock (no v-bottom-navigation): Vuetify's bottom nav registers as a fixed
       layout item and overlaps the in-flow mini-player. This stays inside .app-bottom-chrome. -->
  <nav
    class="app-bottom-nav-custom"
    role="navigation"
    aria-label="Primary navigation"
  >
    <button
      type="button"
      class="nav-item"
      :class="{ 'nav-item--active': activeTab === 'songs' }"
      @click="goSongs"
    >
      <v-icon
        size="22"
        :color="activeTab === 'songs' ? 'accent' : undefined"
      >
        mdi-music-note
      </v-icon>
      <span class="nav-label">{{ $t('topMenu.songs') }}</span>
    </button>

    <button
      type="button"
      class="nav-item nav-item--disabled"
      disabled
      :title="$t('bottomNav.radiosComingSoon')"
    >
      <v-icon
        size="22"
        class="text-medium-emphasis"
      >
        mdi-radio-tower
      </v-icon>
      <span class="nav-label">{{ $t('topMenu.radios') }}</span>
    </button>

    <button
      type="button"
      class="nav-item"
      :class="{ 'nav-item--active': activeTab === 'settings' }"
      @click="goSettings"
    >
      <v-icon
        size="22"
        :color="activeTab === 'settings' ? 'accent' : undefined"
      >
        mdi-cog-outline
      </v-icon>
      <span class="nav-label">{{ $t('topMenu.settings') }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsView } from '@/composables/useSettingsView'

const router = useRouter()
const { isSettingsOpen, openSettings, closeSettings } = useSettingsView()

const activeTab = computed(() =>
  isSettingsOpen.value ? 'settings' : 'songs'
)

function goSongs() {
  closeSettings()
  if (router.currentRoute.value.path !== '/') {
    router.push('/')
  }
}

function goSettings() {
  openSettings()
}
</script>

<style scoped lang="scss">
.app-bottom-nav-custom {
  display: flex;
  width: 100%;
  flex: 0 0 auto;
  min-height: 56px;
  align-items: stretch;
  justify-content: space-around;
  border-top: 1px solid rgba(var(--v-theme-on-background), 0.1);
  background: rgb(var(--v-theme-surface));
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.nav-item {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 56px;
  max-width: 160px;
  margin: 0;
  padding: 6px 8px;
  border: none;
  border-radius: var(--radius-ui);
  background: transparent;
  color: rgba(var(--v-theme-on-surface), 0.75);
  cursor: pointer;
  font-family: var(--font-sans);
  transition:
    background var(--transition-fast),
    color var(--transition-fast);

  &:hover:not(:disabled) {
    background: rgba(var(--v-theme-on-surface), 0.06);
    color: rgba(var(--v-theme-on-surface), 0.95);
  }

  &--active {
    color: rgb(var(--v-theme-accent));
    background: rgba(var(--v-theme-accent), 0.12);
  }

  &--disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-accent));
    outline-offset: 2px;
  }
}

.nav-label {
  font-size: 0.6875rem;
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.02em;
  line-height: 1;
}
</style>
