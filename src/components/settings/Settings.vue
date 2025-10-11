<template>
  <v-container>
    <v-row>
      <v-col cols="4">
        <v-list>
          <v-list-item
            v-for="item in menuItems"
            :key="item.title"
            :active="selectedSetting?.title === item.title"
            class="cursor-pointer"
            @click="selectSetting(item)"
          >
            <v-icon>{{ item.icon }}</v-icon>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-col>

      <v-col cols="8">
        <component
          :is="selectedSetting?.component"
          v-if="selectedSetting"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { shallowRef } from 'vue'
import Network from '@/components/settings/Network.vue'
import Audio from '@/components/settings/Audio.vue'
import Bluetooth from '@/components/settings/Bluetooth.vue'
import Tags from '@/components/settings/Tags.vue'
import Interface from '@/components/settings/Interface.vue'

const menuItems = [
  { title: 'Network', icon: 'mdi-wifi', component: Network },
  { title: 'Audio', icon: 'mdi-volume-high', component: Audio },
  { title: 'Bluetooth', icon: 'mdi-bluetooth', component: Bluetooth },
  { title: 'Interface', icon: 'mdi-overscan', component: Interface },
  { title: 'Tags', icon: 'mdi-tag', component: Tags }
]

// Set Network as default
const selectedSetting = shallowRef(menuItems[0])

// Fonction pour sélectionner un élément
const selectSetting = (item) => {
  selectedSetting.value = item
}
</script>

<style>
.cursor-pointer {
  cursor: pointer;
}
</style>
