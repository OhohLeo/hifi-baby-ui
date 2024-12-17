<template>
  <v-app-bar :elevation="7" rounded scroll-behavior="elevate">
    <v-app-bar-title>Hifi Baby</v-app-bar-title>
    <v-spacer></v-spacer>
    <v-btn icon :to="'/settings'" aria-label="Settings" @click="openSettings">
      <v-icon>mdi-cog</v-icon>
    </v-btn>
    <template v-slot:extension>
      <v-container>
        <v-tabs
          align-tabs="center"
          height="60"
          grow
          stacked
          v-model="selectedTab"
          @update:model-value="updateFabIcon"
          :hide-slider="!canDisplaySlider"
        >
          <v-tab
            v-for="(tab, key) in tabs"
            :key="key"
            :to="tab.to"
            :prepend-icon="tab.icon"
            :text="tab.name"
            :value="tab.value"
            @click="openTab"
          ></v-tab>
        </v-tabs>
      </v-container>
      <v-fab
        :active="canDisplayFab"
        class="mr-4"
        color="blue-accent-2"
        :icon="fabIcon"
        size="60"
        absolute
        offset
        @click="openDialog"
      >
      </v-fab>
    </template>
  </v-app-bar>

  <AddSongDialog v-model:isOpen="isDialogOpen" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tabs = {
  songs: { name: 'Songs', icon: 'mdi-music', value: 'songs', to: '/' },
  radios: { name: 'Radios', icon: 'mdi-music', value: 'radios', to: '/' }
}

const selectedTab = ref('songs')
const fabIcon = ref('mdi-music-note-plus')

const canDisplayFab = ref(true)
const canDisplaySlider = ref(true)
const openTab = () => {
  canDisplayFab.value = true
  canDisplaySlider.value = true
}
const openSettings = () => {
  canDisplayFab.value = false
  canDisplaySlider.value = false
}
const updateFabIcon = () => {
  switch (selectedTab.value) {
    case 'songs':
      fabIcon.value = 'mdi-music-note-plus'
      break
  }
}

const isDialogOpen = ref(false)
const openDialog = () => {
  isDialogOpen.value = true
}
</script>
