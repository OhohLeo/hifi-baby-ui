/**
 * Capability detection types for cross-platform features
 */

export interface CapabilityState {
  available: boolean
  permission: 'granted' | 'denied' | 'prompt' | 'unknown'
  supported: boolean
  error?: string
}

export interface FileSystemCapability extends CapabilityState {
  type: 'native' | 'web'
}

export interface NetworkCapability extends CapabilityState {
  discovery: boolean
}

export interface Capabilities {
  bluetooth: CapabilityState
  camera: CapabilityState
  fileSystem: FileSystemCapability
  network: NetworkCapability
  localStorage: CapabilityState
  notifications: CapabilityState
}

export type PlatformType = 'web' | 'ios' | 'android'
