import { expect, test } from "@playwright/test"
import type { Locator, Page } from "@playwright/test"
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

/**
 * Where a rename's text starts, and whether its box (hover fill, focus ring, the input's border)
 * fits inside every ancestor that clips. `root` is the [data-slot=inline-rename] element.
 */
async function renameGeometry(root: Locator) {
  return root.evaluate((el) => {
    const box = (el.querySelector("button, input") ?? el.firstElementChild) as HTMLElement
    let textLeft: number
    if (box instanceof HTMLInputElement) {
      const cs = getComputedStyle(box)
      textLeft = box.getBoundingClientRect().left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft)
    } else {
      const range = document.createRange()
      range.selectNodeContents(box)
      textLeft = range.getBoundingClientRect().left
    }
    const r = box.getBoundingClientRect()
    const clippedBy: string[] = []
    for (let a = box.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a)
      if (cs.overflowX === "visible" && cs.overflowY === "visible") continue
      const ar = a.getBoundingClientRect()
      const left = ar.left + parseFloat(cs.borderLeftWidth)
      const right = ar.right - parseFloat(cs.borderRightWidth)
      if (r.left < left - 0.5 || r.right > right + 0.5) clippedBy.push(`${a.tagName.toLowerCase()}.${a.className}`)
    }
    return { textLeft, clippedBy }
  })
}

/** Left edge of an element's text. */
const textStart = (el: Locator) =>
  el.evaluate((node) => {
    const range = document.createRange()
    range.selectNodeContents(node)
    return range.getBoundingClientRect().left
  })

test("a renamable name lines up with the text around it, and its box isn't clipped", async ({ page }) => {
  await open(page, "data")
  const table = page.getByRole("table", { name: "文件" })
  await expect(table.locator("tbody tr").first()).toHaveText(/\S/)
  await table.scrollIntoViewIfNeeded()
  const column = await textStart(table.getByRole("columnheader", { name: "名称" }))
  const name = table.locator("[data-slot=inline-rename]").first()

  const reading = await renameGeometry(name)
  expect(Math.abs(reading.textLeft - column)).toBeLessThanOrEqual(1)
  expect(reading.clippedBy).toEqual([])

  await name.getByRole("button").click()
  const input = table.getByRole("textbox", { name: "文件名" })
  await expect(input).toBeFocused()
  const editing = await renameGeometry(table.locator("[data-slot=inline-rename]").first())
  expect(Math.abs(editing.textLeft - column)).toBeLessThanOrEqual(1)
  expect(editing.clippedBy).toEqual([])
  await page.keyboard.press("Escape")

  // a title: the name starts where the heading would
  const heading = page.locator("h3").filter({ has: page.locator("[data-slot=inline-rename]") })
  const edge = await heading.evaluate((h) => h.getBoundingClientRect().left + parseFloat(getComputedStyle(h).paddingLeft))
  const title = await renameGeometry(heading.locator("[data-slot=inline-rename]"))
  expect(Math.abs(title.textLeft - edge)).toBeLessThanOrEqual(1)
  expect(title.clippedBy).toEqual([])
})
