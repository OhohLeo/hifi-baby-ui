import { vi } from 'vitest'

/**
 * Browser APIs used by Vuetify / layout code that jsdom does not implement.
 */
class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver = ResizeObserverMock

globalThis.matchMedia =
  globalThis.matchMedia ||
  ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

globalThis.IntersectionObserver = class IntersectionObserverMock {
  readonly root: Element | Document | null = null
  readonly rootMargin = ''
  readonly thresholds: readonly number[] = []
  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
  unobserve(): void {}
} as unknown as typeof IntersectionObserver
