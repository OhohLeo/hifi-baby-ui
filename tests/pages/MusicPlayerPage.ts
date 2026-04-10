import type { Page, Locator } from '@playwright/test'

export class MusicPlayerPage {
  readonly page: Page

  readonly footer: Locator
  readonly progressSlider: Locator
  readonly volumeSlider: Locator
  readonly timeTicks: Locator
  readonly trackName: Locator
  readonly playPauseButton: Locator

  constructor(page: Page) {
    this.page = page
    this.footer = page.locator('.music-player-footer')
    // Position slider only (class is shared with volume slider on `.mini-player__slider-slim`).
    this.progressSlider = page.locator('.music-player__position-slider')
    this.volumeSlider = page.getByRole('slider', { name: 'Volume' })
    // Two .time-tick spans: [0] = current time, [1] = duration
    this.timeTicks = page.locator('.time-tick')
    this.trackName = page.locator('.music-player__track-title')
    this.playPauseButton = page.locator('.play-pause-btn')
  }

  /** No-op kept for test compatibility — legacy "more menu" was removed. */
  async openMoreMenu() {
    // Mute and volume are inline in the footer (no menu).
  }

  async clickMute() {
    await this.page.getByRole('button', { name: 'Mute' }).click()
  }

  async clickUnmute() {
    await this.page.getByRole('button', { name: 'Unmute' }).click()
  }

  async currentTimeText(): Promise<string> {
    return (await this.timeTicks.nth(0).innerText()).trim()
  }

  async durationText(): Promise<string> {
    return (await this.timeTicks.nth(1).innerText()).trim()
  }
}
