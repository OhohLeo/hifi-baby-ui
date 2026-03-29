import { test, expect } from '@playwright/test'
import { setupDefaultMocks } from './fixtures/api-mocks'
import { TRACK_A, TRACK_B, TRACK_C, STOPPED_STATE } from './fixtures/test-data'
import { AppPage } from './pages/AppPage'

// ─────────────────────────────────────────────────────────────────────────────
// Bottom navigation
// ─────────────────────────────────────────────────────────────────────────────
test.describe('BottomNav', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [], STOPPED_STATE)
  })

  test('Songs button is active by default on page load', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    expect(await app.bottomNav.isSongsActive()).toBe(true)
    expect(await app.bottomNav.isSettingsActive()).toBe(false)
  })

  test('clicking Settings opens the settings overlay', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.bottomNav.goToSettings()
    await expect(app.settings.card).toBeVisible()
  })

  test('clicking Settings makes Settings nav item active', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.bottomNav.goToSettings()
    expect(await app.bottomNav.isSettingsActive()).toBe(true)
    expect(await app.bottomNav.isSongsActive()).toBe(false)
  })

  test('clicking Songs from Settings closes the overlay', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.bottomNav.goToSettings()
    await expect(app.settings.card).toBeVisible()
    await app.bottomNav.goToSongs()
    await expect(app.settings.card).not.toBeVisible()
  })

  test('clicking Songs from Settings restores Songs as active', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.bottomNav.goToSettings()
    await app.bottomNav.goToSongs()
    expect(await app.bottomNav.isSongsActive()).toBe(true)
  })

  test('Radios button is disabled', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.bottomNav.radiosButton).toBeDisabled()
  })

  test('Radios button has "Coming soon" title tooltip', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.bottomNav.radiosButton).toHaveAttribute('title', 'Coming soon')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Settings overlay
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Settings overlay', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [], STOPPED_STATE)
  })

  test('Settings card is visible after opening', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.bottomNav.goToSettings()
    await expect(app.settings.card).toBeVisible()
  })

  test('Cancel button closes settings', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.bottomNav.goToSettings()
    await app.settings.close()
    await expect(app.settings.card).not.toBeVisible()
  })

  test('Validate button closes settings', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.bottomNav.goToSettings()
    await app.settings.validate()
    await expect(app.settings.card).not.toBeVisible()
  })

  test('desktop sidebar shows Connect, Audio, Interface, Tags sections', async ({ page }) => {
    // Sidebar only renders at viewport widths >= 1145px (mobile layout uses a v-select picker)
    const viewport = page.viewportSize()
    test.skip((viewport?.width ?? 1280) < 1145, 'Sidebar only visible at desktop width (>= 1145px)')

    const app = new AppPage(page)
    await app.goto()
    await app.bottomNav.goToSettings()
    await expect(app.settings.connectItem).toBeVisible()
    await expect(app.settings.audioItem).toBeVisible()
    await expect(app.settings.interfaceItem).toBeVisible()
    await expect(app.settings.tagsItem).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TopMenu search
// ─────────────────────────────────────────────────────────────────────────────
test.describe('TopMenu — search', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [TRACK_A, TRACK_B, TRACK_C], STOPPED_STATE)
  })

  test('search bar is hidden by default', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.topMenu.searchBar).not.toBeVisible()
  })

  test('clicking search icon shows the search bar', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.topMenu.openSearch()
    await expect(app.topMenu.searchBar).toBeVisible()
    await expect(app.topMenu.searchInput).toBeVisible()
  })

  test('typing in search bar filters the playlist', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.topMenu.openSearch()
    await app.topMenu.typeSearch('hotel')
    await expect(app.playlist.trackRows()).toHaveCount(1)
  })

  test('closing search hides the search bar', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.topMenu.openSearch()
    await app.topMenu.closeSearch()
    await expect(app.topMenu.searchBar).not.toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Theme toggle
// ─────────────────────────────────────────────────────────────────────────────
test.describe('TopMenu — theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [], STOPPED_STATE)
  })

  test('page loads with the default hifiDark theme', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(page.locator('.v-application')).toHaveClass(/v-theme--hifiDark/)
  })

  test('clicking theme toggle switches to the light theme', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.topMenu.toggleTheme()
    await expect(page.locator('.v-application')).not.toHaveClass(/v-theme--hifiDark/)
  })

  test('theme choice is persisted to localStorage', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.topMenu.toggleTheme()
    const stored = await page.evaluate(() => localStorage.getItem('hifi-baby-theme'))
    expect(stored).not.toBe('hifiDark')
    expect(stored).not.toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Language selector
// ─────────────────────────────────────────────────────────────────────────────
test.describe('TopMenu — language selector', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [], STOPPED_STATE)
  })

  test('switching to FR persists locale in localStorage', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.topMenu.selectLanguage('FR')
    const stored = await page.evaluate(() => localStorage.getItem('locale'))
    expect(stored).toBe('fr')
  })

  test('switching back to EN persists EN locale', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.topMenu.selectLanguage('FR')
    await app.topMenu.selectLanguage('EN')
    const stored = await page.evaluate(() => localStorage.getItem('locale'))
    expect(stored).toBe('en')
  })
})
