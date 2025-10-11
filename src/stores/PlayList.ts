import { defineStore } from 'pinia'
import type { TrackModel } from '../models'
import audioService from '../services/api' // Assurez-vous que le chemin d'importation est correct

export const usePlaylistStore = defineStore('playlist', {
  state: () => ({
    tracks: [] as TrackModel[],
  }),
  getters: {
    sortedTracks: (state) => {
      return state.tracks.slice().sort((a, b) => a.name.localeCompare(b.name));
    }
  },
  actions: {
    addTrack(track: TrackModel) {
      this.tracks.push(track)
    },
    removeTrack(trackID: string) {
      this.tracks = this.tracks.filter(t => t.id !== trackID)
    },
    async fetchTracks() {
      try {
        const response = await audioService.listTracks()
        // Validate response is an array and filter out invalid tracks
        if (Array.isArray(response)) {
          this.tracks = response.filter(track =>
            track && track.id && track.name
          )
        } else {
          console.error('fetchTracks: Expected array but got:', typeof response)
          this.tracks = []
        }
      } catch (error) {
        console.error('fetchTracks: Error fetching tracks:', error)
        this.tracks = []
      }
    },
  },
})
