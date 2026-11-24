import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"
import { open } from "./helpers"

/** The first real row (the demo loads with fake latency; skeleton rows have no text). */
async function firstRow(page: Page) {
  const row = page.locator("tbody tr").first()
  await expect(row).toHaveText(/\S/)
  return row
}

// Behaviour the static guards can't see; each one was a real bug.

test("closing a drawer opened from a row gives focus back to the row", async ({ page }) => {
  await open(page, "crud")
  const row = await firstRow(page)
  await row.focus()
  await page.keyboard.press("Enter")
  const drawer = page.locator("[data-slot=drawer-content]")
  await expect(drawer).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(drawer).toHaveCount(0)
  await expect(row).toBeFocused()
})

test("the drawer slides out instead of vanishing", async ({ page }) => {
  await open(page, "crud")
  await (await firstRow(page)).click()
  const drawer = page.locator("[data-slot=drawer-content]")
  await expect(drawer).toBeVisible()
  await page.waitForTimeout(400)
  await page.keyboard.press("Escape")
  // still on screen, closing, with its content, while the exit animation runs
  await expect(drawer).toHaveAttribute("data-state", "closed")
  await expect(drawer.locator("h2")).not.toBeEmpty()
  await expect(drawer).toHaveCount(0)
})

test("arrow keys don't page away from unsaved edits", async ({ page }) => {
  await open(page, "crud")
  await (await firstRow(page)).click()
  const drawer = page.locator("[data-slot=drawer-content]")
  const title = await drawer.locator("h2").textContent()
  await drawer.getByRole("button", { name: /^编辑/ }).click()
  const name = drawer.locator("input").first()
  await name.fill(`${title} 改`)
  await drawer.getByRole("button", { name: /保存修改/ }).focus()
  await page.keyboard.press("ArrowDown")
  await expect(drawer.locator("h2")).toHaveText(title ?? "")
  await expect(name).toHaveValue(`${title} 改`)
})

test("under reduced motion the drawer fades instead of sliding", async ({ page }) => {
  await open(page, "crud", { name: "reduced", reducedMotion: true })
  await (await firstRow(page)).click()
  const drawer = page.locator("[data-slot=drawer-content]")
  await expect(drawer).toBeVisible()
  const style = await drawer.evaluate((el) => {
    const a = el.getAnimations()[0]
    a?.pause()
    if (a) a.currentTime = 60
    const cs = getComputedStyle(el)
    return { transform: cs.transform, opacity: Number(cs.opacity) }
  })
  expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(style.transform)
  expect(style.opacity).toBeLessThan(1)
})

test("EN switches the whole gallery to English and back", async ({ page }) => {
  await open(page, "principles")
  await page.getByRole("button", { name: "EN" }).click()
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await expect(page.getByRole("link", { name: "Principles" })).toBeVisible()
  await page.getByRole("button", { name: "中文" }).click()
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN")
})
