import type { Page, Locator } from '@playwright/test'

export class MusicPlayerPage {
  readonly page: Page

  readonly footer: Locator
  readonly progressSlider: Locator
  readonly timeTicks: Locator
  readonly trackName: Locator
  readonly playPauseButton: Locator
  readonly skipNextButton: Locator
  readonly moreMenuButton: Locator

  constructor(page: Page) {
    this.page = page
    this.footer = page.locator('.music-player-footer')
    this.progressSlider = page.locator('.mini-player__slider-slim')
    // Two .time-tick spans: [0] = current time, [1] = duration
    this.timeTicks = page.locator('.time-tick')
    this.trackName = page.locator('.track-name')
    this.playPauseButton = page.locator('.play-pause-btn')
    // aria-labels come from i18n: "Next track" and "More options"
    this.skipNextButton = page.getByRole('button', { name: 'Next track' })
    this.moreMenuButton = page.getByRole('button', { name: 'More options' })
  }

  /** Open the more (…) menu. */
  async openMoreMenu() {
    await this.moreMenuButton.click()
  }

  // The player-more-menu list is rendered in a body-level Vuetify teleport.
  async clickStop() {
    await this.page.locator('.player-more-menu').getByText('Stop').click()
  }

  async clickMute() {
    await this.page.locator('.player-more-menu').getByText('Mute').click()
  }

  async clickUnmute() {
    await this.page.locator('.player-more-menu').getByText('Unmute').click()
  }

  async clickVolumeUp() {
    await this.page.locator('.player-more-menu').getByText('Volume up').click()
  }

  async clickVolumeDown() {
    await this.page.locator('.player-more-menu').getByText('Volume down').click()
  }

  async currentTimeText(): Promise<string> {
    return (await this.timeTicks.nth(0).innerText()).trim()
  }

  async durationText(): Promise<string> {
    return (await this.timeTicks.nth(1).innerText()).trim()
  }
}
