<template>
  <v-app-bar :elevation="7" rounded scroll-behavior="elevate">
    <v-app-bar-title>Hifi Baby</v-app-bar-title>

    <template v-slot:extension>
      <v-container>
        <v-tabs align-tabs="center" height="60" grow stacked>
          <v-tab
            to="/"
            prepend-icon="mdi-music"
            text="Songs"
            value="songs"
          ></v-tab>
          <v-tab
            to="/tags"
            prepend-icon="mdi-tag-multiple"
            text="Tags"
            value="tags"
          ></v-tab>
          <v-tab
            to="/settings"
            prepend-icon="mdi-cog"
            text="Settings"
            value="settings"
          ></v-tab>
        </v-tabs>
      </v-container>
      <v-fab
        class="mr-4"
        color="blue-accent-2"
        icon="mdi-music-note-plus"
        location="bottom right"
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

const isDialogOpen = ref(false)
const openDialog = () => {
  isDialogOpen.value = true
}
</script>
