<template>
  <div class="default-layout">
    <TopMenu />
    <div class="default-layout__content">
      <Settings v-if="settingsView.isSettingsOpen.value" />
      <PlayList v-else />
    </div>
    <div class="app-bottom-chrome">
      <MusicPlayer />
      <AppBottomNav />
    </div>
  </div>
</template>

<script lang="ts" setup>
import TopMenu from '@/components/TopMenu.vue'
import MusicPlayer from '@/components/MusicPlayer.vue'
import PlayList from '@/components/PlayList.vue'
import Settings from '@/components/settings/Settings.vue'
import AppBottomNav from '@/components/AppBottomNav.vue'
import { useSettingsView } from '@/composables/useSettingsView'

const settingsView = useSettingsView()
</script>

<style scoped lang="scss">
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.default-layout__content {
  flex: 1 1 auto;
  min-height: 0;
  padding-bottom: calc(var(--bottom-chrome-total) + env(safe-area-inset-bottom, 0px));
}

.app-bottom-chrome {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  /* Above v-main scrolling content and Vuetify overlays that sit at ~1000 */
  z-index: 2004;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.25);
}
</style>
