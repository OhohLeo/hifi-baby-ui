import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { MusicPlayerModel, TrackModel } from '@/models'
import { STATE_PAUSE, STATE_PLAY, useMusicPlayerStore } from '@/stores/MusicPlayer'

const apiMocks = vi.hoisted(() => ({
  playTrack: vi.fn().mockResolvedValue(undefined),
  pauseTrack: vi.fn().mockResolvedValue(undefined),
  resumeTrack: vi.fn().mockResolvedValue(undefined),
  stopTrack: vi.fn().mockResolvedValue(undefined),
  muteVolume: vi.fn().mockResolvedValue(undefined),
  getCurrentPlayerState: vi.fn(),
}))

vi.mock('@/services/api', () => ({
  default: apiMocks,
}))

describe('useMusicPlayerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('updatePlayerState maps API model to play / pause / stop', () => {
    const store = useMusicPlayerStore()
    const track: TrackModel = {
      id: 't1',
      name: 'Song',
      format: 'mp3',
      tags: [],
      duration: 120,
    }
    const playing: MusicPlayerModel = {
      currentTrack: track,
      isPlaying: true,
      isMuted: false,
      position: 10,
    }
    store.updatePlayerState(playing)
    expect(store.track).toEqual(track)
    expect(store.currentState).toBe(STATE_PLAY)
    expect(store.position).toBe(10)

    const paused: MusicPlayerModel = {
      ...playing,
      isPlaying: false,
    }
    store.updatePlayerState(paused)
    expect(store.currentState).toBe(STATE_PAUSE)

    const empty: MusicPlayerModel = {
      currentTrack: null,
      isPlaying: false,
      isMuted: false,
      position: 0,
    }
    store.updatePlayerState(empty)
    expect(store.track).toBeNull()
    expect(store.currentState).toBe('stop')
  })

  it('play calls the API and updates state', async () => {
    const store = useMusicPlayerStore()
    const track: TrackModel = {
      id: 'x',
      name: 'X',
      format: 'flac',
      tags: [],
      duration: 60,
    }
    await store.play(track)
    expect(apiMocks.playTrack).toHaveBeenCalledWith('x')
    expect(store.track).toEqual(track)
    expect(store.isPlaying).toBe(true)
  })
})
