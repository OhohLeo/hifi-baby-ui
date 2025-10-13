import axios from 'axios'
import { Capacitor } from '@capacitor/core'
import localStorageService from '@/services/storage'
import { networkService } from '@/services/platform/network.service'

function getBaseURL(): string {
  return localStorageService.get<string>('baseURL') || 'http://localhost:3000'
}

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add platform-specific headers for native apps
if (Capacitor.isNativePlatform()) {
  apiClient.interceptors.request.use((config) => {
    config.headers['X-App-Platform'] = Capacitor.getPlatform()
    config.headers['X-App-Version'] = '1.0.0' // TODO: Get from package.json
    return config
  })
}

const audioService = {
  setBaseURL(newBaseURL: string) {
    apiClient.defaults.baseURL = newBaseURL
  },

  addTrack(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  removeTrack(trackID: string) {
    return apiClient.delete(`/${trackID}`)
  },
  playTrack(trackID: string) {
    return apiClient.post(`/play/${trackID}`)
  },
  pauseTrack() {
    return apiClient.post('/pause')
  },
  resumeTrack() {
    return apiClient.post('/resume')
  },
  stopTrack() {
    return apiClient.post('/stop')
  },
  async listTracks() {
    const response = await apiClient.get('/tracks')
    return response.data
  },
  async getCurrentPlayerState() {
    const response = await apiClient.get('/state')
    return response.data
  },
  increaseVolume() {
    return apiClient.post('/volume/up')
  },
  decreaseVolume() {
    return apiClient.post('/volume/down')
  },
  muteVolume(isMuted: boolean) {
    return apiClient.post('/volume/mute', null, {
      params: { enable: isMuted }
    })
  },

  /**
   * Initialize API service with auto-discovery
   * Should be called during app initialization
   */
  async initializeAPI(): Promise<boolean> {
    try {
      // Attempt auto-discovery
      const discoveredURL = await networkService.discoverBackend()

      if (discoveredURL) {
        console.log('Backend discovered:', discoveredURL)
        apiClient.defaults.baseURL = discoveredURL
        return true
      }

      // Fallback to stored or default URL
      const baseURL = getBaseURL()
      apiClient.defaults.baseURL = baseURL
      console.log('Using configured URL:', baseURL)
      return false
    } catch (error) {
      console.error('Failed to initialize API:', error)
      return false
    }
  },

  /**
   * Get current API base URL
   */
  getBaseURL(): string {
    return apiClient.defaults.baseURL || getBaseURL()
  }
}

export default audioService
