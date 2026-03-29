export interface TrackModel {
  id: string
  name: string
  format: string
  tags: string[]
  duration: number
}

export interface MusicPlayerModel {
  currentTrack: TrackModel | null
  isPlaying: boolean
  isMuted: boolean
  position: number
}

