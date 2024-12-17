import { defineStore } from 'pinia'
import type { Settings } from '@/models'
import settingsService from '@/services/settings.service'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {} as Settings,
  }),
  actions: {
    async fetchSettings() {
      this.settings = await settingsService.getSettings()
    },
  },
})
