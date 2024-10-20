export interface TrackModel {
  id: string
  name: string
  format: string
}

export interface MusicPlayerModel {
  currentTrack: TrackModel | null
  isPlaying: boolean
  isMuted: boolean
}
