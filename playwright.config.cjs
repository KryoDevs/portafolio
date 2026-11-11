const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  testMatch: '*.spec.cjs',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:8000',
    browserName: 'chromium',
    launchOptions: process.env.CHROMIUM_EXECUTABLE_PATH ? {
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--no-zygote']
    } : {},
    trace: 'retain-on-failure'
  },
  webServer: { command: 'python -m http.server 8000 --bind 0.0.0.0', url: 'http://127.0.0.1:8000', reuseExistingServer: !process.env.CI }
});
