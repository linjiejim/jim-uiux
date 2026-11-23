/**
 * Contrast matrix for every theme scope: light and dark, each neutral preset
 * (data-theme), each accent preset (data-accent) on top of each of those, and
 * each again under data-contrast="more". Reads the CSS, resolves var() and
 * color-mix(in oklab, …), flattens alpha over the surface, and checks WCAG
 * ratios (contrast-lib.ts). Turning a knob that breaks legibility fails here,
 * not in production.
 */
import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { checkContrast, parseBlocks, rulesFor, themeScopes } from "./contrast-lib"
import { loadConfig, root, themePaths } from "./guard-lib"

const cfg = loadConfig()

const blocks = themePaths(cfg)
  .filter((f) => fs.existsSync(path.join(root, f)))
  .flatMap((f) => parseBlocks(fs.readFileSync(path.join(root, f), "utf8")))

// A token a rule names that is missing or doesn't resolve fails its check:
// that means broken focus rings or invisible text, not a skipped rule.
const scopes = themeScopes(blocks)

describe("theme contrast", () => {
  it("finds the theme", () => {
    const light = scopes.find((s) => s.name === "light")
    expect(Object.keys(light?.decls ?? {}).length, `no :root tokens in ${cfg.themeFiles.join(", ")}`).toBeGreaterThan(10)
  })

  it('the OS "increase contrast" setting and data-contrast="more" set the same values', () => {
    const os = blocks.filter((b) => b.media?.includes("prefers-contrast: more")).map((b) => b.decls)
    const attr = blocks.filter((b) => !b.media && /\[data-contrast="more"\]/.test(b.selector)).map((b) => b.decls)
    expect(os).toEqual(attr)
  })

  // one test per neutral × accent, covering light, dark and "more contrast" for each
  const groups = new Map<string, typeof scopes>()
  for (const s of scopes) {
    const key = s.name.replace(/ ?(light|dark)( \+ more contrast)?$/, "") || "default"
    groups.set(key, [...(groups.get(key) ?? []), s])
  }

  for (const [group, list] of groups) {
    it(`${group}: text and accents meet WCAG`, () => {
      const fails = list.flatMap((s) =>
        checkContrast(s.decls, rulesFor(s.decls, s.more))
          .filter((c) => !c.ok)
          .map((c) => `${s.name}: ${c.fg} on ${c.bg}: ${c.ratio.toFixed(2)} < ${c.min}  (${c.detail})`),
      )
      expect(fails, fails.join("\n")).toEqual([])
    })
  }
})
