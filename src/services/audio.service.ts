import { apiClient } from '@/services/api.service'

const audioService = {
  addTrack(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  removeTrack(trackID: string) {
    return apiClient.delete(`/audio/${trackID}`)
  },
  playTrack(trackID: string) {
    return apiClient.post(`/audio/play/${trackID}`)
  },
  pauseTrack() {
    return apiClient.post('/audio/pause')
  },
  resumeTrack() {
    return apiClient.post('/audio/resume')
  },
  stopTrack() {
    return apiClient.post('/audio/stop')
  },
  async listTracks() {
    const response = await apiClient.get('/audio/tracks')
    return response.data
  },
  async getCurrentPlayerState() {
    const response = await apiClient.get('/audio/state')
    return response.data
  },
  increaseVolume() {
    return apiClient.post('/audio/volume/up')
  },
  decreaseVolume() {
    return apiClient.post('/audio/volume/down')
  },
  muteVolume(isMuted: boolean) {
    return apiClient.post('/audio/volume/mute', null, {
      params: { enable: isMuted }
    })
  }
}

export default audioService
