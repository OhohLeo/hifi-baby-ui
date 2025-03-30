<template>
  <v-app>
    <v-container>
      <v-row>
        <v-col cols="4">
          <v-list>
            <v-list-item
              v-for="item in menuItems"
              :key="item.title"
              :disabled="item.disabled"
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
            :settings="settings"
            :settings-ok="settingsOk"
            @update-settings="updateSettings"
          />
        </v-col>
      </v-row>
      <v-row justify="end">
        <v-col cols="auto">
          <v-btn @click="submitSettings"> submit </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { shallowRef } from 'vue'
import SettingsNetwork from '@/components/settings/SettingsNetwork.vue'
import SettingsAudio from '@/components/settings/SettingsAudio.vue'
import SettingsBluetooth from '@/components/settings/SettingsBluetooth.vue'
import SettingsTags from '@/components/settings/SettingsTags.vue'
import SettingsDevice from '@/components/settings/SettingsDevice.vue'
import settingsService from '@/services/settings.service'
import type { Settings } from '@/models'

interface SettingsItem {
  title: string
  icon: string
  component: any /* eslint-disable-line */
  disabled: boolean
}

const menuItems = [
  { title: 'Device', icon: 'mdi-monitor', component: SettingsDevice, disabled: false },
  {
    title: 'Audio',
    icon: 'mdi-volume-high',
    component: SettingsAudio,
    disabled: false
  },
  {
    title: 'Bluetooth',
    icon: 'mdi-bluetooth',
    component: SettingsBluetooth,
    disabled: true
  },
  { title: 'Network', icon: 'mdi-wifi', component: SettingsNetwork, disabled: false },
  { title: 'Tags', icon: 'mdi-tag', component: SettingsTags, disabled: true }
]
const selectedSetting = shallowRef(menuItems[0])

const selectSetting = (item: SettingsItem) => {
  selectedSetting.value = item
}

const settings = ref({} as Settings)
const settingsOk = ref(false)

settingsService.getSettings().then((result: Settings) => {
  settings.value = result
  settingsOk.value = true
})

const updateSettings = (updatedSettings: Settings) => {
  console.log(updatedSettings)
  settings.value = updatedSettings
}
const submitSettings = () => {
  settingsService.setSettings(settings.value)
}
</script>

<style>
.cursor-pointer {
  cursor: pointer;
}
</style>
