const { defineConfig } = require('@playwright/test');

/** Configure direct-open browser tests for the standalone HTML fixture. */
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  workers: 1,
  reporter: [['list']],
  use: {
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  }
});
