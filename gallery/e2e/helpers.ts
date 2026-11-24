import type { Page } from "@playwright/test"

/** Every page in the sidebar plus the grid view of Lists (app.tsx routes, minus the #/filters alias). */
export const ROUTES = [
  "principles", "studio", "color", "type", "shape", "motion",
  "buttons", "forms", "overlays", "feedback", "data",
  "layouts", "crud", "media", "settings", "workbench", "updates",
] as const

export type Mode = { name: string; scheme?: "light" | "dark"; width?: number; more?: boolean; lang?: "zh" | "en"; reducedMotion?: boolean }

export const MODES: Mode[] = [
  { name: "light" },
  { name: "dark", scheme: "dark" },
  { name: "phone", width: 375 },
  { name: "more contrast", more: true },
]

/** Opens a route in a mode, with the clock fixed so dates and "this year" don't drift. */
export async function open(page: Page, route: string, mode: Mode = { name: "light" }) {
  await page.clock.setFixedTime(new Date("2026-11-24T10:00:00"))
  if (mode.width) await page.setViewportSize({ width: mode.width, height: 812 })
  await page.emulateMedia({ colorScheme: mode.scheme ?? "light", reducedMotion: mode.reducedMotion ? "reduce" : "no-preference" })
  await page.addInitScript((more) => {
    // a fresh profile: no saved studio skin; more contrast through the gallery's own switch
    if (more) localStorage.setItem("gallery:more-contrast", "1")
  }, !!mode.more)
  await page.goto(`/?lang=${mode.lang ?? "zh"}#/${route}`)
  await page.locator("h1").first().waitFor()
}
