import { test, expect } from '@playwright/test'
import {
  setupDefaultMocks,
  mockTracks,
  mockPlayerControls,
  mockDeleteTrack,
  API,
} from './fixtures/api-mocks'
import {
  TRACK_A, TRACK_B, TRACK_C,
  DISPLAY_TITLE_A, DISPLAY_TITLE_B, DISPLAY_TITLE_C,
  STOPPED_STATE, PLAYING_STATE_A,
} from './fixtures/test-data'
import { AppPage } from './pages/AppPage'

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Playlist — empty state', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [], STOPPED_STATE)
  })

  test('shows "No songs yet" heading', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.playlist.noSongsHeading).toBeVisible()
    await expect(app.playlist.noSongsHeading).toHaveText('No songs yet')
  })

  test('shows the add-first-track description', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(
      page.getByText('Add your first track to start enjoying your music'),
    ).toBeVisible()
  })

  test('"Add Music" CTA button is visible', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.playlist.addMusicCta).toBeVisible()
    await expect(app.playlist.addMusicCta).toContainText('Add Music')
  })

  test('clicking "Add Music" CTA opens AddSongDialog', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.playlist.addMusicCta.click()
    await expect(page.locator('.add-song-card')).toBeVisible()
  })

  test('FAB button is NOT shown when track list is empty', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.playlist.fabAddButton).not.toBeVisible()
  })

  test('track list container is not rendered', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.playlist.trackRowsContainer).not.toBeAttached()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Track list display
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Playlist — track list display', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [TRACK_A, TRACK_B, TRACK_C], STOPPED_STATE)
  })

  test('renders a row for each track', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.playlist.trackRows()).toHaveCount(3)
  })

  test('shows cleaned display titles (no extension, no leading index)', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.playlist.trackRowByTitle(DISPLAY_TITLE_A)).toBeVisible()
    await expect(app.playlist.trackRowByTitle(DISPLAY_TITLE_B)).toBeVisible()
    await expect(app.playlist.trackRowByTitle(DISPLAY_TITLE_C)).toBeVisible()
  })

  test('shows plural song count label for multiple tracks', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.playlist.songCountLabel).toContainText('3')
    await expect(app.playlist.songCountLabel).toContainText('Songs', { ignoreCase: true })
  })

  test('shows singular "Song" label when only one track', async ({ page }) => {
    await mockTracks(page, [TRACK_A])
    const app = new AppPage(page)
    await app.goto()
    await expect(app.playlist.songCountLabel).toContainText('1')
    await expect(app.playlist.songCountLabel).toContainText('Song', { ignoreCase: true })
  })

  test('FAB add button is visible when tracks exist', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.playlist.fabAddButton).toBeVisible()
    await expect(app.playlist.fabAddButton).toHaveAttribute('aria-label', 'Add song')
  })

  test('each track row has a menu-dots button with correct aria-label', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    const menuBtns = page.locator('.track-row__menu-btn')
    await expect(menuBtns).toHaveCount(3)
    for (const btn of await menuBtns.all()) {
      await expect(btn).toHaveAttribute('aria-label', 'Track options')
    }
  })

  test('each track row has role="listitem"', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(page.getByRole('listitem')).toHaveCount(3)
  })

  test('the track list has role="list" with aria-label="Songs"', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(page.getByRole('list', { name: 'Songs' })).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Play / Pause from playlist
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Playlist — play and pause', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [TRACK_A, TRACK_B], STOPPED_STATE)
    await mockPlayerControls(page)
  })

  test('clicking a track row sends POST /play/:id', async ({ page }) => {
    let playCalled = false
    await page.route(`${API}/play/${TRACK_A.id}`, async (route) => {
      playCalled = true
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })

    const app = new AppPage(page)
    await app.goto()
    await app.playlist.clickTrackRow(DISPLAY_TITLE_A)

    expect(playCalled).toBe(true)
  })

  test('clicking a track row makes it active', async ({ page }) => {
    await page.route(`${API}/play/${TRACK_A.id}`, route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
    )

    const app = new AppPage(page)
    await app.goto()
    await app.playlist.clickTrackRow(DISPLAY_TITLE_A)

    await expect(app.playlist.activeTrackRow()).toBeVisible()
    await expect(app.playlist.activeTrackRow()).toContainText(DISPLAY_TITLE_A)
  })

  test('clicking the already-playing track sends POST /pause', async ({ page }) => {
    await setupDefaultMocks(page, [TRACK_A, TRACK_B], PLAYING_STATE_A)
    await mockPlayerControls(page)

    let pauseCalled = false
    await page.route(`${API}/pause`, async (route) => {
      pauseCalled = true
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })

    const app = new AppPage(page)
    await app.goto()

    // Track A row should be active because PLAYING_STATE_A is loaded
    await expect(app.playlist.activeTrackRow()).toContainText(DISPLAY_TITLE_A)

    await app.playlist.clickTrackRow(DISPLAY_TITLE_A)
    expect(pauseCalled).toBe(true)
  })

  test('clicking a different track sends POST /play/:newId', async ({ page }) => {
    await setupDefaultMocks(page, [TRACK_A, TRACK_B], PLAYING_STATE_A)

    let playBCalled = false
    await page.route(`${API}/play/${TRACK_B.id}`, async (route) => {
      playBCalled = true
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })

    const app = new AppPage(page)
    await app.goto()
    await app.playlist.clickTrackRow(DISPLAY_TITLE_B)

    expect(playBCalled).toBe(true)
  })

  test('Enter key on a track row triggers play', async ({ page }) => {
    let playCalled = false
    await page.route(`${API}/play/${TRACK_A.id}`, async (route) => {
      playCalled = true
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })

    const app = new AppPage(page)
    await app.goto()

    await app.playlist.trackRowByTitle(DISPLAY_TITLE_A).focus()
    await page.keyboard.press('Enter')

    expect(playCalled).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Delete track
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Playlist — delete track', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [TRACK_A, TRACK_B], STOPPED_STATE)
    await mockDeleteTrack(page, TRACK_A.id)
  })

  test('track menu contains "Delete" and "Add tags" items', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.playlist.openTrackMenu(DISPLAY_TITLE_A)
    await expect(page.locator('.track-row-menu').getByText('Delete')).toBeVisible()
    await expect(page.locator('.track-row-menu').getByText('Add tags')).toBeVisible()
  })

  test('confirming delete removes the track from the list', async ({ page }) => {
    // After deletion the API returns only TRACK_B
    await mockTracks(page, [TRACK_B])

    const app = new AppPage(page)
    await app.goto()

    // Accept the window.confirm() dialog
    page.once('dialog', dialog => dialog.accept())
    await app.playlist.clickMenuDeleteFor(DISPLAY_TITLE_A)

    await expect(app.playlist.trackRows()).toHaveCount(1)
    await expect(app.playlist.trackRowByTitle(DISPLAY_TITLE_A)).not.toBeAttached()
    await expect(app.playlist.trackRowByTitle(DISPLAY_TITLE_B)).toBeVisible()
  })

  test('dismissing the confirm dialog cancels deletion', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()

    page.once('dialog', dialog => dialog.dismiss())
    await app.playlist.clickMenuDeleteFor(DISPLAY_TITLE_A)

    // Both tracks still present
    await expect(app.playlist.trackRows()).toHaveCount(2)
  })

  test('clicking "Add tags" opens the tag dialog', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.playlist.clickMenuAddTagsFor(DISPLAY_TITLE_A)
    await expect(page.locator('.v-dialog').filter({ hasText: 'Add Tag' })).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Search filtering
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Playlist — search', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [TRACK_A, TRACK_B, TRACK_C], STOPPED_STATE)
  })

  test('typing in search field filters the track list in real time', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.topMenu.openSearch()
    await app.topMenu.typeSearch('bohemian')

    await expect(app.playlist.trackRows()).toHaveCount(1)
    await expect(app.playlist.trackRowByTitle(DISPLAY_TITLE_A)).toBeVisible()
  })

  test('search matches on the cleaned display title', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.topMenu.openSearch()
    await app.topMenu.typeSearch('stairway')

    await expect(app.playlist.trackRows()).toHaveCount(1)
    await expect(app.playlist.trackRowByTitle(DISPLAY_TITLE_B)).toBeVisible()
  })

  test('shows "No results found" card when search matches nothing', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.topMenu.openSearch()
    await app.topMenu.typeSearch('xyznonexistent')

    await expect(app.playlist.searchNoResults).toBeVisible()
    await expect(page.getByText('No results found')).toBeVisible()
    await expect(page.getByText('Try a different search query.')).toBeVisible()
  })

  test('closing search restores the full track list', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.topMenu.openSearch()
    await app.topMenu.typeSearch('bohemian')
    await expect(app.playlist.trackRows()).toHaveCount(1)

    await app.topMenu.closeSearch()
    await expect(app.playlist.trackRows()).toHaveCount(3)
  })

  test('search is case-insensitive', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await app.topMenu.openSearch()
    await app.topMenu.typeSearch('BOHEMIAN')

    await expect(app.playlist.trackRows()).toHaveCount(1)
    await expect(app.playlist.trackRowByTitle(DISPLAY_TITLE_A)).toBeVisible()
  })
})
