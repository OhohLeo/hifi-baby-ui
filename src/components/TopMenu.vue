<template>
  <v-app-bar :elevation="7" rounded scroll-behavior="elevate">
    <v-app-bar-title>Hifi Baby</v-app-bar-title>

    <template v-slot:extension>
      <v-container>
        <v-tabs
          align-tabs="center"
          height="60"
          grow
          stacked
          v-model="selectedTab"
          @update:model-value="updateFabIcon"
        >
          <v-tab
            to="/"
            prepend-icon="mdi-music"
            text="Songs"
            :value="tabs.songs"
          ></v-tab>
          <v-tab
            to="/tags"
            prepend-icon="mdi-tag-multiple"
            text="Tags"
            :value="tabs.tags"
          ></v-tab>
          <v-tab
            to="/settings"
            prepend-icon="mdi-cog"
            text="Settings"
            :value="tabs.settings"
          ></v-tab>
        </v-tabs>
      </v-container>
      <v-fab
        v-if="selectedTab !== tabs.settings"
        class="mr-4"
        color="blue-accent-2"
        :icon="fabIcon"
        location="bottom right"
        size="60"
        absolute
        offset
        @click="openDialog"
      >
      </v-fab>
    </template>
  </v-app-bar>
  <AddSongDialog
    v-if="selectedTab == tabs.songs"
    v-model:isOpen="isDialogOpen"
  />
  <AddTagDialog v-if="selectedTab == tabs.tags" v-model:isOpen="isDialogOpen" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tabs = {
  songs: 'songs',
  tags: 'tags',
  settings: 'settings',
}

const selectedTab = ref('songs')
const fabIcon = ref('mdi-music-note-plus')

const updateFabIcon = () => {
  switch (selectedTab.value) {
    case 'songs':
      fabIcon.value = 'mdi-music-note-plus'
      break
    case 'tags':
      fabIcon.value = 'mdi-tag-plus'
      break
  }
}

const isDialogOpen = ref(false)
const openDialog = () => {
  isDialogOpen.value = true
}
</script>
