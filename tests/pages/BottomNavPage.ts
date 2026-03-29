import type { Page, Locator } from '@playwright/test'

export class BottomNavPage {
  readonly page: Page

  readonly nav: Locator
  readonly songsButton: Locator
  readonly radiosButton: Locator
  readonly settingsButton: Locator

  constructor(page: Page) {
    this.page = page
    this.nav = page.locator('[aria-label="Primary navigation"]')
    // Buttons are plain <button> elements; matched by their visible text label
    this.songsButton = this.nav.locator('button', { hasText: 'Songs' })
    this.radiosButton = this.nav.locator('button', { hasText: 'Radios' })
    this.settingsButton = this.nav.locator('button', { hasText: 'Settings' })
  }

  async goToSongs() {
    await this.songsButton.click()
  }

  async goToSettings() {
    await this.settingsButton.click()
  }

  async isSongsActive(): Promise<boolean> {
    return this.songsButton.evaluate(el => el.classList.contains('nav-item--active'))
  }

  async isSettingsActive(): Promise<boolean> {
    return this.settingsButton.evaluate(el => el.classList.contains('nav-item--active'))
  }
}
