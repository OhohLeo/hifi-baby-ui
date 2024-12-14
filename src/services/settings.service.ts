import { apiClient } from '@/services/api.service'

const settingsService = {
  async getSettings() {
    const response = await apiClient.get('/settings')
    return response.data
  },
}

export default settingsService
