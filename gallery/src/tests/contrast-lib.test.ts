/**
 * The shared contrast library catches what it should: a failing preset, a missing token, the
 * more-contrast layer, and the order a project's layers win in.
 */
import { describe, expect, it } from "vitest"
import { checkContrast, composeScope, parseBlocks, rulesFor, themeScopes } from "@/registry/jim/guards/contrast-lib"

const base = `
:root { --background: #ffffff; --foreground: #1a1a1a; --primary: var(--foreground); --muted: #f0f0f0; }
.dark { --background: #191919; --foreground: #ececec; }
[data-theme="pale"] { --foreground: #b0b0b0; }
html[data-accent="sky"] { --primary: #7dd3fc; }
html.dark[data-accent="sky"] { --primary: #0369a1; }
[data-contrast="more"] { --muted: color-mix(in oklab, var(--foreground) 10%, var(--background)) !important; }
@media (prefers-contrast: more) { :root { --muted: red; } }
`

describe("contrast lib", () => {
  const blocks = parseBlocks(base)

  it("keeps @media blocks out of the plain scopes", () => {
    expect(composeScope(blocks)["--muted"]).toBe("#f0f0f0")
    expect(blocks.find((b) => b.media)?.media).toContain("prefers-contrast")
  })

  it("layers presets in cascade order and strips !important", () => {
    expect(composeScope(blocks, { theme: "pale", dark: true })["--foreground"]).toBe("#b0b0b0")
    expect(composeScope(blocks, { accent: "sky", dark: true })["--primary"]).toBe("#0369a1")
    expect(composeScope(blocks, { more: true })["--muted"]).toBe("color-mix(in oklab, var(--foreground) 10%, var(--background))")
  })

  it("names every combination", () => {
    const names = themeScopes(blocks).map((s) => s.name)
    expect(names).toContain("pale + accent sky dark + more contrast")
    expect(names).toHaveLength(2 * 2 * 2 * 2)
  })

  it("fails a pale foreground and a light accent", () => {
    const pale = composeScope(blocks, { theme: "pale" })
    const fails = checkContrast(pale, [["--foreground", ["--background"], 7]]).filter((c) => !c.ok)
    expect(fails).toHaveLength(1)
    const sky = composeScope(blocks, { accent: "sky" })
    expect(checkContrast(sky, [["--primary", ["--background"], 3]])[0].ok).toBe(false)
  })

  it("reports a missing token as a failed check instead of skipping it", () => {
    const c = checkContrast(composeScope(blocks), rulesFor({}))
    expect(c.some((x) => !x.ok && x.detail.includes("undefined --sunken"))).toBe(true)
  })

  it("mixes with transparent the way CSS does (premultiplied)", () => {
    const decls = { "--background": "#ffffff", "--fg": "#000000", "--a": "color-mix(in oklab, var(--fg) 50%, transparent)" }
    // half-transparent black over white, not a darkened mix
    const [c] = checkContrast(decls, [["--a", ["--background"], 1]])
    expect(c.ratio).toBeGreaterThan(3)
    expect(c.ratio).toBeLessThan(5)
  })
})
