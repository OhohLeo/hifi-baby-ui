import type { Page, Locator } from '@playwright/test'

export class TopMenuPage {
  readonly page: Page

  readonly searchToggleButton: Locator
  readonly themeToggleButton: Locator
  readonly languageSelector: Locator
  readonly searchBar: Locator
  readonly searchInput: Locator
  readonly searchCloseButton: Locator

  constructor(page: Page) {
    this.page = page
    // aria-labels come from i18n
    this.searchToggleButton = page.locator('.search-toggle')
    this.themeToggleButton = page.locator('[aria-label="Toggle theme"]')
    // The v-select for language has aria-label="Select language"
    this.languageSelector = page.locator('.language-selector')
    this.searchBar = page.locator('.search-below-bar')
    this.searchInput = page.locator('.search-below-bar__field input')
    this.searchCloseButton = page.locator('.search-below-bar__close')
  }

  async openSearch() {
    await this.searchToggleButton.click()
    await this.searchBar.waitFor({ state: 'visible' })
  }

  async closeSearch() {
    await this.searchCloseButton.click()
    await this.searchBar.waitFor({ state: 'hidden' })
  }

  async typeSearch(query: string) {
    await this.searchInput.fill(query)
  }

  async clearSearch() {
    await this.searchInput.clear()
  }

  async toggleTheme() {
    await this.themeToggleButton.click()
  }

  /**
   * Select a language from the Vuetify v-select language selector.
   * Clicks the selector to open, then selects the matching option from the overlay.
   */
  async selectLanguage(label: 'EN' | 'FR') {
    await this.languageSelector.click()
    // Vuetify v-select renders options in a body-level overlay
    await this.page.locator('.v-overlay--active .v-list-item', { hasText: label }).click()
  }
}
