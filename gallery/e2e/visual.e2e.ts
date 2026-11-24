import fs from "node:fs"
import path from "node:path"
import { expect, test } from "@playwright/test"
import { open, type Mode } from "./helpers"

// A few stable screenshots. Compared on Linux only, against baselines made in the Playwright image
// CI uses (`pnpm e2e:baselines`); fonts render differently elsewhere.
test.skip(process.platform !== "linux", "screenshot baselines are made on Linux (CI / pnpm e2e:baselines)")

const shots: [string, Mode][] = [
  ["principles", { name: "light" }],
  ["studio", { name: "light" }],
  ["crud", { name: "dark", scheme: "dark" }],
  ["motion", { name: "english", lang: "en" }],
  ["layouts", { name: "phone", width: 375 }],
  ["settings", { name: "more contrast", more: true }],
]

for (const [route, mode] of shots) {
  const file = `${route}-${mode.name.replace(/\s+/g, "-")}.png`
  test(`screenshot · ${route} · ${mode.name}`, async ({ page }) => {
    // a new shot waits for its baseline (pnpm e2e:baselines) instead of failing every PR
    const missing = !fs.existsSync(path.join(import.meta.dirname, "__screenshots__", "visual.e2e.ts", file))
    test.skip(missing && test.info().config.updateSnapshots === "none", `no baseline yet for ${file}: run pnpm e2e:baselines`)
    await open(page, route, mode)
    await page.waitForTimeout(300)
    await expect(page).toHaveScreenshot(file, {
      mask: [page.getByRole("button", { name: /^v\d/ })],
    })
  })
}
