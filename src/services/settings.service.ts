import { apiClient } from '@/services/api.service'
import { Settings } from '@/models'

const settingsService = {
  async getSettings() {
    const response = await apiClient.get('/settings')
    return response.data
  },

  setSettings(settings: Settings) {
    return apiClient.put('/settings', settings)
  }
}

export default settingsService
