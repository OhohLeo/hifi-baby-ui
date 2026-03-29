import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Vitest unit/component specs live under tests/unit/ — do not run them as Playwright files.
  testIgnore: ['**/unit/**'],
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    /* Test pour Bureau */
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    /* Test pour Mobile */
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
    /* Format spécifique personnalisé */
    {
      name: 'Tablet Landscape',
      use: {
        viewport: { width: 1024, height: 768 },
      },
    },
  ],
  // Lancer le serveur local automatiquement avant les tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
});
