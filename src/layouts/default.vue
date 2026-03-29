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

/* Settings: center the panel vertically in the scroll area; horizontal cap on large screens */
.default-layout__content--settings {
  display: flex;
  flex-direction: column;
  justify-content: safe center;
  padding-block: clamp(20px, 4vh, 48px);
  box-sizing: border-box;

  @media (min-width: 960px) {
    width: 90%;
    max-width: 1000px;
    margin-inline: auto;
    padding-inline: 16px;
  }
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
