import type { Page, Locator } from '@playwright/test'

export class SettingsPage {
  readonly page: Page

  readonly card: Locator
  readonly cancelButton: Locator
  readonly validateButton: Locator

  // Desktop sidebar items (from i18n: settings.connect, .audio, .interface, .tags)
  readonly connectItem: Locator
  readonly audioItem: Locator
  readonly interfaceItem: Locator
  readonly tagsItem: Locator

  constructor(page: Page) {
    this.page = page
    this.card = page.locator('.settings-view')
    this.cancelButton = this.card.getByRole('button', { name: 'Cancel' })
    this.validateButton = this.card.getByRole('button', { name: 'Validate' })
    // Scoped to the desktop sidebar list (first role=list inside the card)
    const sidebarList = this.card.getByRole('list').first()
    this.connectItem = sidebarList.getByRole('listitem').filter({ hasText: /^Connect$/ })
    this.audioItem = sidebarList.getByRole('listitem').filter({ hasText: /^Audio$/ })
    this.interfaceItem = sidebarList.getByRole('listitem').filter({ hasText: /^Interface$/ })
    this.tagsItem = sidebarList.getByRole('listitem').filter({ hasText: /^Tags$/ })
  }

  async isVisible(): Promise<boolean> {
    return this.card.isVisible()
  }

  async close() {
    await this.cancelButton.click()
  }

  async validate() {
    await this.validateButton.click()
  }
}
