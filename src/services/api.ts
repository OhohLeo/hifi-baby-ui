import axios from 'axios'
import localStorageService from '@/services/storage'

function getDomainName(): string {
  let storedDomainName = localStorageService.get<string>('domainName')
  let domainName = storedDomainName != '' ? storedDomainName : 'hifi-baby.local'
  return 'http://' + domainName + ':3000/audio'
}

const apiClient = axios.create({
  baseURL: getDomainName(),
  headers: {
    'Content-Type': 'application/json'
  }
})

const audioService = {
  setBaseURL(newBaseURL: string) {
    apiClient.defaults.baseURL = 'http://' + newBaseURL + ':3000/audio'
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
  }
}

export default audioService
