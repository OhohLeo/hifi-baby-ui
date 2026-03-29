import { defineStore } from 'pinia'
import type { MusicPlayerModel, TrackModel } from '../models'
import audioService from '../services/api' // Assurez-vous que le chemin d'importation est correct

const STATE_STOP = "stop"

export const STATE_PLAY = "play"
export const STATE_PAUSE = "pause"

export const useMusicPlayerStore = defineStore('musicPlayer', {
  state: () => ({
    track: null as TrackModel | null,
    currentState: STATE_STOP,
    isMuted: false,
    position: 0,
    volume: 0.5, // Volume initial à 50%
  }),
  getters: {
    hasTrack: state => state.track != null,
    isCurrentTrack: state => {
      return (trackID: string) => state.track != null && state.track.id === trackID
    },
    isPlaying: state => {
      return (state.currentState === STATE_PLAY)
    },
    isStopped: state => {
      return (state.currentState === STATE_STOP)
    },
    currentStateIcon() {
      switch (this.currentState) {
        case STATE_PLAY: {
          return "mdi-play"
        }
        case STATE_PAUSE: {
          return "mdi-pause"
        }
        case STATE_STOP: {
          return "mdi-stop"
        }
      }
      return "mdi-music"
    },
  },
  actions: {
    async fetchCurrentTrack() {
      audioService.getCurrentPlayerState().then(currentPlayerState => {
        this.updatePlayerState(currentPlayerState)
      })
    },
    updatePlayerState(playerState: MusicPlayerModel) {
      this.track = playerState.currentTrack
      if (this.track == null) {
        this.currentState = STATE_STOP
        this.position = 0
      } else if (playerState.isPlaying) {
        this.currentState = STATE_PLAY
      } else {
        this.currentState = STATE_PAUSE
      }
      this.position = playerState.position
      this.isMuted = playerState.isMuted
    },
    async play(track: TrackModel) {
      await audioService.playTrack(track.id)
      this.track = track
      this.currentState = STATE_PLAY
      this.position = 0
    },
    async pause() {
      await audioService.pauseTrack()
      this.currentState = STATE_PAUSE
    },
    async resume() {
      await audioService.resumeTrack()
      this.currentState = STATE_PLAY
    },
    async stop() {
      await audioService.stopTrack()
      this.track = null
      this.position = 0
      this.currentState = STATE_STOP
    },
    async toggleMute() {
      this.isMuted = !this.isMuted
      await audioService.muteVolume(this.isMuted)
    },
    async updateVolume(newVolume: number) {
      if (!this.isMuted) {
        this.volume = newVolume
      }
    },
  },
})
