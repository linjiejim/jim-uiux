/**
 * The theme studio's promises: at a preset it *is* that preset (values read from the shipped
 * CSS, nothing copied); whatever it is set to, the skin it exports passes the same contrast
 * guard a project runs; share links and stored state can't smuggle in anything else.
 */
import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { checkContrast, composeScope, parseBlocks, presetNames, rulesFor, themeScopes } from "@/registry/jim/guards/contrast-lib"
import { decodeState, encodeState, sanitizeState } from "@/gallery/studio/state"
import { DEFAULT_STATE, NEUTRAL_TOKENS, generate, isDefault, toCss, toPreviewCss, type StudioState } from "@/gallery/studio/theme-gen"

const dir = path.join(import.meta.dirname, "../registry/jim/theme")
const themeCss = fs.readFileSync(path.join(dir, "jim-theme.css"), "utf8")
const presetCss = fs
  .readdirSync(path.join(dir, "presets"))
  .map((f) => fs.readFileSync(path.join(dir, "presets", f), "utf8"))
const blocks = [themeCss, ...presetCss].flatMap((css) => parseBlocks(css))

/** Every check of a project that ships the theme plus this skin file. */
function guardFailures(css: string) {
  return themeScopes(parseBlocks(`${themeCss}\n${css}`)).flatMap((s) =>
    checkContrast(s.decls, rulesFor(s.decls, s.more))
      .filter((c) => !c.ok)
      .map((c) => `${s.name}: ${c.fg} on ${c.bg} ${c.ratio.toFixed(2)} < ${c.min}`),
  )
}

const resolved = (decls: Record<string, string>, t: string) => decls[t]?.toLowerCase()

describe("theme studio", () => {
  it("ships the presets it offers", () => {
    expect(presetNames(blocks, "theme")).toEqual(expect.arrayContaining(["warm", "slate", "sage", "mauve"]))
    expect(presetNames(blocks, "accent")).toEqual(expect.arrayContaining(["blue", "indigo", "violet", "pink", "teal"]))
  })

  it("at its defaults writes exactly the shipped theme, and nothing to the page", () => {
    const g = generate(DEFAULT_STATE, blocks)
    expect(isDefault(DEFAULT_STATE)).toBe(true)
    for (const mode of ["light", "dark"] as const) {
      const theme = composeScope(blocks, { dark: mode === "dark" })
      for (const t of NEUTRAL_TOKENS) expect(g[mode][t], `${mode} ${t}`).toBe(resolved(theme, t))
      expect(g[mode]["--primary"]).toBe(resolved(theme, "--primary"))
      expect(g[mode]["--primary-foreground"]).toBe(resolved(theme, "--primary-foreground"))
    }
    expect(g.adjusted).toEqual({ light: [], dark: [] })
    expect(g.root).toEqual({})
  })

  for (const theme of presetNames(blocks, "theme")) {
    it(`set to the ${theme} preset, writes the preset's own values`, () => {
      const g = generate({ ...DEFAULT_STATE, neutral: theme }, blocks)
      for (const mode of ["light", "dark"] as const) {
        const preset = composeScope(blocks, { theme, dark: mode === "dark" })
        for (const t of NEUTRAL_TOKENS) {
          const want = preset[t].startsWith("#") ? preset[t].toLowerCase() : undefined
          if (want) expect(g[mode][t], `${theme} ${mode} ${t}`).toBe(want)
        }
      }
      expect(g.adjusted).toEqual({ light: [], dark: [] })
    })
  }

  for (const accent of presetNames(blocks, "accent")) {
    it(`set to the ${accent} accent, writes the preset's own values`, () => {
      const g = generate({ ...DEFAULT_STATE, accent }, blocks)
      for (const mode of ["light", "dark"] as const) {
        const preset = composeScope(blocks, { accent, dark: mode === "dark" })
        expect(g[mode]["--primary"]).toBe(resolved(preset, "--primary"))
        expect(g[mode]["--primary-foreground"]).toBe(resolved(preset, "--primary-foreground"))
      }
    })
  }

  it("exports a skin that passes the contrast guard, whatever it is set to", () => {
    const states: StudioState[] = []
    const accents = ["", "#ffd400", "#2563eb", "#e11d48", "#a3e635", "#0a0a40", "#f5f5f5", "#7c3aed", "#00b3a4"]
    for (const hue of [0, 90, 160, 255, 305]) {
      for (const chroma of [0.006, 0.04]) {
        for (const contrast of [-100, 0, 100]) {
          for (const accentColor of accents) {
            states.push({ ...DEFAULT_STATE, neutral: "custom", hue, chroma, contrast, accent: accentColor ? "custom" : "", accentColor })
          }
        }
      }
    }
    for (const neutral of ["", ...presetNames(blocks, "theme")]) {
      for (const contrast of [-100, 100]) states.push({ ...DEFAULT_STATE, neutral, contrast, accent: "blue" })
    }
    const fails = states.flatMap((s) => {
      const g = generate(s, blocks)
      // a token written for one appearance only would leak into the other (:root is imported after .dark)
      const keys = (d: Record<string, string>) => Object.keys(d).sort().join()
      const leak = keys(g.light) === keys(g.dark) ? [] : [`light and dark write different tokens`]
      return [...leak, ...guardFailures(toCss(g, "test"))].map((f) => `${JSON.stringify(s)} → ${f}`)
    })
    expect(fails.slice(0, 10), `${fails.length} failures`).toEqual([])
  }, 60_000)

  it("moves contrast the way the slider says", () => {
    const soft = generate({ ...DEFAULT_STATE, contrast: -100 }, blocks)
    const high = generate({ ...DEFAULT_STATE, contrast: 100 }, blocks)
    const ratio = (g: typeof soft, mode: "light" | "dark", fg: string, bg: string) =>
      checkContrast(g.scopes[mode], [[fg, [bg], 1]])[0].ratio
    for (const mode of ["light", "dark"] as const) {
      expect(ratio(high, mode, "--input", "--background")).toBeGreaterThan(ratio(soft, mode, "--input", "--background"))
      expect(ratio(high, mode, "--muted-foreground", "--background")).toBeGreaterThan(ratio(soft, mode, "--muted-foreground", "--background"))
      // high contrast makes control edges real boundaries (WCAG 1.4.11)
      expect(ratio(high, mode, "--input", "--background")).toBeGreaterThanOrEqual(3)
    }
  })

  it("writes radius and font only when they differ, and previews above any preset attribute", () => {
    const g = generate({ ...DEFAULT_STATE, radius: 4, font: "system" }, blocks)
    expect(g.root["--radius"]).toBe("4px")
    expect(g.root["--font-sans"]).toContain("system-ui")
    const css = toPreviewCss(g)
    expect(css).toMatch(/^:root:root \{/)
    expect(css).toContain(":root:root.dark {")
  })
})

describe("theme studio state", () => {
  const presets = { neutral: presetNames(blocks, "theme"), accent: presetNames(blocks, "accent") }
  it("keeps only known keys with sane values", () => {
    const s = sanitizeState({ neutral: "nope", accent: "custom", accentColor: "javascript:alert(1)", radius: 99, contrast: -500, density: "huge", spacing: "relaxed", extra: 1 }, presets)
    expect(s).toEqual({ ...DEFAULT_STATE, accent: "custom", radius: 16, contrast: -100, spacing: "relaxed" })
    const state = { ...DEFAULT_STATE, neutral: "slate", accent: "custom", accentColor: "#0a7cff", contrast: 30 }
    expect(decodeState(encodeState(state), presets)).toEqual(state)
    expect(decodeState("not base64 json", presets)).toBeNull()
  })
})
