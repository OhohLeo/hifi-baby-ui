import { test, expect } from '@playwright/test'
import {
  setupDefaultMocks,
  mockTracks,
  mockUploadSuccess,
  mockUploadFailure,
} from './fixtures/api-mocks'
import { TRACK_A, STOPPED_STATE } from './fixtures/test-data'
import { AppPage } from './pages/AppPage'

/**
 * A tiny valid MP3 file as a Buffer (used for setInputFiles without needing a real file on disk).
 * Playwright's setInputFiles accepts { name, mimeType, buffer }.
 */
const FAKE_AUDIO_FILE = {
  name: 'test-song.mp3',
  mimeType: 'audio/mpeg',
  buffer: Buffer.from('ID3fake mp3 content'),
}

// ─────────────────────────────────────────────────────────────────────────────
// Dialog open / close
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AddSongDialog — open and close', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [TRACK_A], STOPPED_STATE)
  })

  test('clicking the playlist header add button opens the dialog', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.playlist.headerAddButton.click()
    await expect(app.addSongDialog.dialog).toBeVisible()
  })

  test('dialog title reads "Add New Song"', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.playlist.headerAddButton.click()
    await expect(app.addSongDialog.dialog).toContainText('Add New Song')
  })

  test('clicking Cancel closes the dialog', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.playlist.headerAddButton.click()
    await expect(app.addSongDialog.dialog).toBeVisible()
    await app.addSongDialog.cancel()
    await expect(app.addSongDialog.dialog).not.toBeVisible()
  })

  test('Upload button is disabled when no file is selected', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.playlist.headerAddButton.click()
    await expect(app.addSongDialog.uploadButton).toBeDisabled()
  })

  test('supported formats hint is shown', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.playlist.headerAddButton.click()
    await expect(app.addSongDialog.dialog).toContainText('Supported formats')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Successful upload
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AddSongDialog — successful upload', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [TRACK_A], STOPPED_STATE)
    await mockUploadSuccess(page)
  })

  test('attaching a file enables the Upload button', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.playlist.headerAddButton.click()
    await app.addSongDialog.fileInput.setInputFiles([FAKE_AUDIO_FILE])
    await expect(app.addSongDialog.uploadButton).toBeEnabled()
  })

  test('uploading shows the success alert', async ({ page }) => {
    // After upload the playlist re-fetches — return updated list
    await mockTracks(page, [TRACK_A, { id: 'new-001', name: 'test-song.mp3', format: 'mp3', tags: [], duration: 0 }])

    const app = new AppPage(page)
    await app.goto()
    await app.playlist.headerAddButton.click()
    await app.addSongDialog.fileInput.setInputFiles([FAKE_AUDIO_FILE])
    await app.addSongDialog.submit()

    await expect(app.addSongDialog.successAlert).toBeVisible()
    await expect(app.addSongDialog.successAlert).toContainText('uploaded successfully')
  })

  test('dialog auto-closes after a successful upload', async ({ page }) => {
    await mockTracks(page, [TRACK_A])

    const app = new AppPage(page)
    await app.goto()
    await app.playlist.headerAddButton.click()
    await app.addSongDialog.fileInput.setInputFiles([FAKE_AUDIO_FILE])
    await app.addSongDialog.submit()

    // Dialog closes after the 1.5 s delay; wait up to 5 s
    await expect(app.addSongDialog.dialog).not.toBeVisible({ timeout: 5000 })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Failed upload
// ─────────────────────────────────────────────────────────────────────────────
test.describe('AddSongDialog — failed upload', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [TRACK_A], STOPPED_STATE)
    await mockUploadFailure(page)
  })

  test('server error shows an error alert', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.playlist.headerAddButton.click()
    await app.addSongDialog.fileInput.setInputFiles([FAKE_AUDIO_FILE])
    await app.addSongDialog.submit()

    await expect(app.addSongDialog.errorAlert).toBeVisible()
  })

  test('dialog stays open after a failed upload', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.playlist.headerAddButton.click()
    await app.addSongDialog.fileInput.setInputFiles([FAKE_AUDIO_FILE])
    await app.addSongDialog.submit()

    await expect(app.addSongDialog.errorAlert).toBeVisible()
    await expect(app.addSongDialog.dialog).toBeVisible()
  })
})
