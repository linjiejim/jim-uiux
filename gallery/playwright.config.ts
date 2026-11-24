import { defineConfig, devices } from "@playwright/test"

/*
 * Render-level checks on the gallery: axe on every page in four modes, interaction checks the
 * static guards can't see, and a few screenshots. Files are e2e/*.e2e.ts (vitest ignores them).
 *
 * Screenshots are compared only on Linux, against baselines made in the same Playwright image CI
 * runs in (fonts render differently elsewhere): `pnpm e2e:baselines` makes them in Docker.
 */
const PORT = 5199

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFileName}/{arg}{ext}",
  // never write a baseline by accident; `pnpm e2e:baselines` passes --update-snapshots=all
  updateSnapshots: "none",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  timeout: 30_000,
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled", caret: "hide" } },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    // locally, use the installed Chrome instead of downloading Playwright's
    ...(process.env.CI || process.platform === "linux" ? {} : { channel: "chrome" }),
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } }],
  webServer: {
    command: `pnpm exec vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
