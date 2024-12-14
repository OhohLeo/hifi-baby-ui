<template>
  <v-app>
    <v-container>
      <v-row>
        <v-col cols="4">
          <v-list>
            <v-list-item
              v-for="item in menuItems"
              :key="item.title"
              @click="selectSetting(item)"
              class="cursor-pointer"
            >
              <v-icon>{{ item.icon }}</v-icon>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-col>

        <v-col cols="8">
          <component :is="selectedSetting?.component" v-if="selectedSetting" />
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<style>
.cursor-pointer {
  cursor: pointer;
}
</style>

<script setup>
import { shallowRef } from 'vue'
import Network from '@/components/settings/Network.vue'
import Audio from '@/components/settings/Audio.vue'
import Bluetooth from '@/components/settings/Bluetooth.vue'
import Tags from '@/components/settings/Tags.vue'
import Device from '@/components/settings/Device.vue'

const menuItems = [
  { title: 'Device', icon: 'mdi-monitor', component: Device },
  { title: 'Audio', icon: 'mdi-volume-high', component: Audio },
  { title: 'Bluetooth', icon: 'mdi-bluetooth', component: Bluetooth },
  { title: 'Network', icon: 'mdi-wifi', component: Network },
  { title: 'Tags', icon: 'mdi-tag', component: Tags }
]
const selectedSetting = shallowRef(null)

// Fonction pour sélectionner un élément
const selectSetting = (item) => {
  selectedSetting.value = item
}
</script>
