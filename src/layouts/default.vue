<template>
  <div class="default-layout">
    <TopMenu />
    <div
      class="default-layout__content"
      :class="{ 'default-layout__content--settings': isSettingsOpen }"
    >
      <Settings v-if="isSettingsOpen" />
      <PlayList v-else />
    </div>
    <div class="app-bottom-chrome">
      <MusicPlayer />
      <AppBottomNav />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSettingsView } from '@/composables/useSettingsView'

const { isSettingsOpen } = useSettingsView()
</script>

<style scoped lang="scss">
.default-layout {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.default-layout__content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  /* Bottom chrome is in-flow below; keep a little breathing room above it */
  padding-bottom: 8px;
}

/* Settings: stay within the flex slot above bottom chrome; inner scroll for long forms */
.default-layout__content--settings {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: safe center;
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
  padding-block: clamp(12px, 2.5vh, 28px);
  box-sizing: border-box;

  @media (min-width: 960px) {
    width: 90%;
    max-width: 1000px;
    margin-inline: auto;
    padding-inline: 16px;
  }
}

/* Constrain the settings card to the available column (MusicPlayer + bottom nav stay visible) */
.default-layout__content--settings > * {
  flex: 1 1 auto;
  min-height: 0;
  max-height: min(100%, var(--settings-panel-max-height));
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-bottom-chrome {
  position: relative;
  z-index: 2004;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  width: 100%;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.25);
}
</style>
