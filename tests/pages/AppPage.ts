import type { Page } from '@playwright/test'
import { PlayListPage } from './PlayListPage'
import { MusicPlayerPage } from './MusicPlayerPage'
import { TopMenuPage } from './TopMenuPage'
import { BottomNavPage } from './BottomNavPage'
import { SettingsPage } from './SettingsPage'
import { AddSongDialogPage } from './AddSongDialogPage'

/** Root Page Object: composes all sub-POMs. Use this in every test. */
export class AppPage {
  readonly page: Page
  readonly playlist: PlayListPage
  readonly player: MusicPlayerPage
  readonly topMenu: TopMenuPage
  readonly bottomNav: BottomNavPage
  readonly settings: SettingsPage
  readonly addSongDialog: AddSongDialogPage

  constructor(page: Page) {
    this.page = page
    this.playlist = new PlayListPage(page)
    this.player = new MusicPlayerPage(page)
    this.topMenu = new TopMenuPage(page)
    this.bottomNav = new BottomNavPage(page)
    this.settings = new SettingsPage(page)
    this.addSongDialog = new AddSongDialogPage(page)
  }

  async goto() {
    await this.page.goto('/')
  }
}
