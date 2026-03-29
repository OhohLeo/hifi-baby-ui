import type { Page, Locator } from '@playwright/test'

export class PlayListPage {
  readonly page: Page

  // Empty state (no tracks at all)
  readonly emptyStateWrapper: Locator
  readonly noSongsHeading: Locator
  readonly addMusicCta: Locator

  // Track list
  readonly trackRowsContainer: Locator
  readonly songCountLabel: Locator

  // Search no-results state
  readonly searchNoResults: Locator

  // FAB
  readonly fabAddButton: Locator

  constructor(page: Page) {
    this.page = page
    this.emptyStateWrapper = page.locator('.empty-state-wrapper')
    this.noSongsHeading = page.locator('.empty-state-glass h2')
    this.addMusicCta = page.locator('.add-music-cta')
    this.trackRowsContainer = page.locator('.track-rows')
    this.songCountLabel = page.locator('.text-caption.text-medium-emphasis').first()
    this.searchNoResults = page.locator('.empty-state')
    this.fabAddButton = page.locator('.fab-add')
  }

  /** All track rows in the list. */
  trackRows(): Locator {
    return this.page.locator('.track-row')
  }

  /** Track row that contains the given display title text. */
  trackRowByTitle(displayTitle: string): Locator {
    return this.page.locator('.track-row', { hasText: displayTitle })
  }

  /** The currently active (playing/paused) track row. */
  activeTrackRow(): Locator {
    return this.page.locator('.track-row--active')
  }

  /** Open the 3-dot context menu for a specific track row. */
  async openTrackMenu(displayTitle: string) {
    const row = this.trackRowByTitle(displayTitle)
    await row.locator('.track-row__menu-btn').click()
  }

  /**
   * Open the track menu and click "Delete".
   * Caller must set up a dialog handler BEFORE calling this if a confirm() is expected.
   */
  async clickMenuDeleteFor(displayTitle: string) {
    await this.openTrackMenu(displayTitle)
    // Vuetify renders v-menu content in a body-level teleport
    await this.page.locator('.track-row-menu').getByText('Delete').click()
  }

  /** Open the track menu and click "Add tags". */
  async clickMenuAddTagsFor(displayTitle: string) {
    await this.openTrackMenu(displayTitle)
    await this.page.locator('.track-row-menu').getByText('Add tags').click()
  }

  /** Click a track row to toggle play/pause. */
  async clickTrackRow(displayTitle: string) {
    await this.trackRowByTitle(displayTitle).click()
  }
}
