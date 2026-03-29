import type { Page, Locator } from '@playwright/test'

export class AddSongDialogPage {
  readonly page: Page

  readonly dialog: Locator
  /** Hidden <input type="file"> inside Vuetify's v-file-input (web mode only). */
  readonly fileInput: Locator
  readonly uploadButton: Locator
  readonly cancelButton: Locator
  /** v-alert type="error" with class upload-error */
  readonly errorAlert: Locator
  /** v-alert type="success" with class upload-success */
  readonly successAlert: Locator

  constructor(page: Page) {
    this.page = page
    // v-dialog is rendered in a body-level Vuetify teleport
    this.dialog = page.locator('.v-dialog').filter({ has: page.locator('.add-song-card') })
    this.fileInput = this.dialog.locator('input[type="file"]')
    this.uploadButton = this.dialog.getByRole('button', { name: 'Upload' })
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' })
    this.errorAlert = this.dialog.locator('.upload-error')
    this.successAlert = this.dialog.locator('.upload-success')
  }

  async isVisible(): Promise<boolean> {
    return this.dialog.isVisible()
  }

  /**
   * Attach a file to the hidden file input.
   * Playwright can set files on hidden inputs without requiring visibility.
   */
  async attachFile(filePath: string) {
    await this.fileInput.setInputFiles(filePath)
  }

  async submit() {
    await this.uploadButton.click()
  }

  async cancel() {
    await this.cancelButton.click()
  }
}
