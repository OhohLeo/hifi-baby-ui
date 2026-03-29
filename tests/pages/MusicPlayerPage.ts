import type { Page, Locator } from '@playwright/test'

export class MusicPlayerPage {
  readonly page: Page

  readonly footer: Locator
  readonly progressSlider: Locator
  readonly timeTicks: Locator
  readonly trackName: Locator
  readonly playPauseButton: Locator
  readonly stopButton: Locator
  readonly volumeButton: Locator

  constructor(page: Page) {
    this.page = page
    this.footer = page.locator('.music-player-footer')
    this.progressSlider = page.locator('.mini-player__slider-slim')
    // Two .time-tick spans: [0] = current time, [1] = duration
    this.timeTicks = page.locator('.time-tick')
    this.trackName = page.locator('.music-player__track-title')
    this.playPauseButton = page.locator('.play-pause-btn')
    this.stopButton = page.getByRole('button', { name: 'Stop' })
    this.volumeButton = page.getByRole('button', { name: 'Volume' })
  }

  /** No-op kept for test compatibility — the "more menu" design was replaced with standalone buttons. */
  async openMoreMenu() {
    // The previous "more options" menu no longer exists.
    // Stop and Mute are now standalone toolbar buttons; Volume opens its own dropdown.
  }

  // Stop is a standalone toolbar button (no menu needed).
  async clickStop() {
    await this.stopButton.click()
  }

  async clickMute() {
    await this.page.getByRole('button', { name: 'Mute' }).click()
  }

  async clickUnmute() {
    await this.page.getByRole('button', { name: 'Unmute' }).click()
  }

  // Volume up/down live inside the Volume dropdown menu.
  async clickVolumeUp() {
    await this.volumeButton.click()
    await this.page.locator('.music-player__volume-menu').getByText('Volume up').click()
  }

  async clickVolumeDown() {
    await this.volumeButton.click()
    await this.page.locator('.music-player__volume-menu').getByText('Volume down').click()
  }

  async currentTimeText(): Promise<string> {
    return (await this.timeTicks.nth(0).innerText()).trim()
  }

  async durationText(): Promise<string> {
    return (await this.timeTicks.nth(1).innerText()).trim()
  }
}
