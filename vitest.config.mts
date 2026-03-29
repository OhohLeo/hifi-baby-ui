/// <reference types="vitest/config" />
import { mergeConfig, defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import viteConfig from './vite.config.mts'

/**
 * Unit / component tests (Vue Test Utils) run in jsdom with the same Vite
 * aliases and Vue plugins as the app.
 */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: [
        fileURLToPath(new URL('./tests/setup/vitest-setup.ts', import.meta.url)),
      ],
      include: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'tests/unit/**/*.{test,spec}.{ts,tsx}',
      ],
      css: true,
      server: {
        deps: {
          inline: ['vuetify'],
        },
      },
    },
  }),
)
