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

export interface TimeParameters {
  startAt: string
  endAt: string
}

export interface AssignedParameters {
  assignedTo: string
}

export interface Tag {
  id: string
  name: string
  type: string
  parameters: TimeParameters | AssignedParameters
}
