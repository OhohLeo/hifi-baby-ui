import { test, expect } from '@playwright/test'
import {
  setupDefaultMocks,
  mockPlayerControls,
  API,
} from './fixtures/api-mocks'
import {
  TRACK_A,
  DISPLAY_TITLE_A,
  STOPPED_STATE, PLAYING_STATE_A, PAUSED_STATE_A,
} from './fixtures/test-data'
import { AppPage } from './pages/AppPage'

// ─────────────────────────────────────────────────────────────────────────────
// Stopped state (no track loaded)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('MusicPlayer — stopped state', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [], STOPPED_STATE)
  })

  test('shows "No track playing" when state is stopped', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.player.trackName).toHaveText('No track playing')
  })

  test('play/pause button is disabled when no track is loaded', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.player.playPauseButton).toBeDisabled()
  })

  test('play/pause button has aria-label="Play" when stopped', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.player.playPauseButton).toHaveAttribute('aria-label', 'Play')
  })

  test('progress slider is visible in the footer', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.player.progressSlider).toBeVisible()
  })

  test('time ticks both show "0:00" when nothing is playing', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.player.timeTicks.nth(0)).toHaveText('0:00')
    await expect(app.player.timeTicks.nth(1)).toHaveText('0:00')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Playing state
// ─────────────────────────────────────────────────────────────────────────────
test.describe('MusicPlayer — playing state', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [TRACK_A], PLAYING_STATE_A)
    await mockPlayerControls(page)
  })

  test('shows the current track title', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.player.trackName).toHaveText(DISPLAY_TITLE_A)
  })

  test('play/pause button has aria-label="Pause" when playing', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.player.playPauseButton).toHaveAttribute('aria-label', 'Pause')
  })

  test('duration is formatted as mm:ss (354s → 5:54)', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.player.timeTicks.nth(1)).toHaveText('5:54')
  })

  test('clicking play/pause sends POST /pause and switches to "Play"', async ({ page }) => {
    let pauseCalled = false
    await page.route(`${API}/pause`, async (route) => {
      pauseCalled = true
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })

    const app = new AppPage(page)
    await app.goto()
    await app.player.playPauseButton.click()

    expect(pauseCalled).toBe(true)
    await expect(app.player.playPauseButton).toHaveAttribute('aria-label', 'Play')
  })

  test('play/pause button is enabled when a track is loaded', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.player.playPauseButton).toBeEnabled()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Paused state
// ─────────────────────────────────────────────────────────────────────────────
test.describe('MusicPlayer — paused state', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [TRACK_A], PAUSED_STATE_A)
    await mockPlayerControls(page)
  })

  test('play/pause button has aria-label="Play" when paused', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()
    await expect(app.player.playPauseButton).toHaveAttribute('aria-label', 'Play')
  })

  test('clicking play/pause sends POST /resume and switches to "Pause"', async ({ page }) => {
    let resumeCalled = false
    await page.route(`${API}/resume`, async (route) => {
      resumeCalled = true
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })

    const app = new AppPage(page)
    await app.goto()
    await app.player.playPauseButton.click()

    expect(resumeCalled).toBe(true)
    await expect(app.player.playPauseButton).toHaveAttribute('aria-label', 'Pause')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Footer mute & volume slider
// ─────────────────────────────────────────────────────────────────────────────
test.describe('MusicPlayer — footer volume', () => {
  test.beforeEach(async ({ page }) => {
    await setupDefaultMocks(page, [TRACK_A], PLAYING_STATE_A)
    await mockPlayerControls(page)
  })

  test('footer shows Mute and volume slider', async ({ page }) => {
    const app = new AppPage(page)
    await app.goto()

    await expect(page.getByRole('button', { name: 'Mute' })).toBeVisible()
    await expect(app.player.volumeSlider).toBeVisible()
  })

  test('clicking Mute sends POST /volume/mute?enable=true', async ({ page }) => {
    let muteParam = ''
    await page.route(`${API}/volume/mute*`, async (route) => {
      muteParam = new URL(route.request().url()).searchParams.get('enable') ?? ''
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })

    const app = new AppPage(page)
    await app.goto()
    await app.player.openMoreMenu()
    await app.player.clickMute()

    expect(muteParam).toBe('true')
  })

  test('clicking Unmute sends POST /volume/mute?enable=false', async ({ page }) => {
    let muteParam = ''
    await page.route(`${API}/volume/mute*`, async (route) => {
      muteParam = new URL(route.request().url()).searchParams.get('enable') ?? ''
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })

    const app = new AppPage(page)
    await app.goto()
    await app.player.openMoreMenu()
    // Currently playing (not muted) → click Mute first to toggle mute state
    await app.player.clickMute()
    // Reopen menu
    await app.player.openMoreMenu()
    await app.player.clickUnmute()

    expect(muteParam).toBe('false')
  })
})

