export interface AudioSettings {
  baseVolume: Number
  defaultVolume: Number
  minVolume: Number
  maxVolume: Number
  volumeStep: Number
  silentEnabled: boolean
}

export interface NetworkSettings {
  ssid: string
  password: string
  encryptionType: string
  dhcpEnabled: boolean
  ip: string 
  ipMask: string
  ipGateway: string
}

export interface Settings {
  id: string
  name: string
  audio: AudioSettings
  network: NetworkSettings
}

export interface TrackModel {
  id: string
  name: string
  format: string
  tags: string[]
}

export interface MusicPlayerModel {
  currentTrack: TrackModel | null
  isPlaying: boolean
  isMuted: boolean
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
