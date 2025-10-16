<template>
  <TopMenu />
  <Settings v-if="settingsView.isSettingsOpen.value" />
  <PlayList v-else />
  <MusicPlayer />
</template>

<script lang="ts" setup>
import TopMenu from '@/components/TopMenu.vue'
import MusicPlayer from '@/components/MusicPlayer.vue'
import PlayList from '@/components/PlayList.vue'
import Settings from '@/components/settings/Settings.vue'
import { useSettingsView } from '@/composables/useSettingsView'

const settingsView = useSettingsView()
</script>
