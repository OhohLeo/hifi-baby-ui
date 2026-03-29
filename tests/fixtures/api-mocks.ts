/**
 * page.route() helpers.
 * The WiFi transport defaults to http://localhost:3000/audio (from .env.development).
 * All mocks target that origin, NOT the Vite dev server at port 3001.
 *
 * Route registration order matters: Playwright uses LIFO, so calling mockTracks()
 * AFTER setupDefaultMocks() correctly overrides the default empty-tracks mock.
 */

import type { Page, Route } from '@playwright/test'
import { STOPPED_STATE } from './test-data'

export const API = 'http://localhost:3000/audio'

async function jsonRoute(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

/** Register the two mandatory mocks every test needs to prevent real network calls on load. */
export async function setupDefaultMocks(
  page: Page,
  tracks: unknown[] = [],
  playerState: unknown = STOPPED_STATE,
) {
  await page.route(`${API}/tracks`, route => jsonRoute(route, tracks))
  await page.route(`${API}/state`, route => jsonRoute(route, playerState))
}

/** Override the tracks list mock (call after setupDefaultMocks). */
export async function mockTracks(page: Page, tracks: unknown[]) {
  await page.route(`${API}/tracks`, route => jsonRoute(route, tracks))
}

/** Mock all playback control endpoints: pause, resume, stop, volume, mute. */
export async function mockPlayerControls(page: Page) {
  await page.route(`${API}/pause`, route => jsonRoute(route, {}))
  await page.route(`${API}/resume`, route => jsonRoute(route, {}))
  await page.route(`${API}/stop`, route => jsonRoute(route, {}))
  await page.route(`${API}/volume/up`, route => jsonRoute(route, {}))
  await page.route(`${API}/volume/down`, route => jsonRoute(route, {}))
  await page.route(`${API}/volume/mute*`, route => jsonRoute(route, {}))
}

/** Mock a successful multipart upload (POST to the base /audio path). */
export async function mockUploadSuccess(
  page: Page,
  newTrack: unknown = { id: 'new-001', name: 'test.mp3', format: 'mp3', tags: [], duration: 0 },
) {
  // Axios posts to '/' relative to baseURL → http://localhost:3000/audio/
  await page.route(`${API}/`, route => {
    if (route.request().method() === 'POST') {
      return jsonRoute(route, newTrack)
    }
    return route.continue()
  })
  // Also match without trailing slash in case Axios resolves differently
  await page.route(API, route => {
    if (route.request().method() === 'POST') {
      return jsonRoute(route, newTrack)
    }
    return route.continue()
  })
}

/** Mock a failed upload (server returns 500). */
export async function mockUploadFailure(page: Page) {
  await page.route(`${API}/`, route => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 500, body: 'Internal Server Error' })
    }
    return route.continue()
  })
  await page.route(API, route => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 500, body: 'Internal Server Error' })
    }
    return route.continue()
  })
}

/** Mock DELETE /audio/:trackId */
export async function mockDeleteTrack(page: Page, trackId: string) {
  await page.route(`${API}/${trackId}`, route => {
    if (route.request().method() === 'DELETE') {
      return jsonRoute(route, {})
    }
    return route.continue()
  })
}
