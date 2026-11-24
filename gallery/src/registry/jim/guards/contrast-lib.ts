/**
 * Contrast rules and the colour resolver behind them, shared by the guard
 * (contrast.test.ts) and the gallery's theme studio. Pure: no fs, no DOM.
 *
 * A theme file becomes "scopes" (light, dark, each data-theme preset, each
 * data-accent preset on top of those, each with data-contrast="more"); a scope
 * is the flat list of custom properties the root element ends up with. var()
 * and color-mix(in oklab, …) are resolved, translucent colours are flattened
 * over the surface they sit on, and every rule is a WCAG ratio floor.
 */
import { converter, formatRgb, parse, wcagContrast, type Color } from "culori"

export type Decls = Record<string, string>
export type Block = { selector: string; decls: Decls; media?: string }
export type Rule = [fg: string, bgs: string[], min: number]
export type Check = { fg: string; bg: string; ratio: number; min: number; ok: boolean; detail: string }

/* ---------- parsing ---------- */

/** Rule blocks with custom properties, in source order. `media` is the enclosing @media prelude, if any. */
export function parseBlocks(css: string): Block[] {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "")
  const out: Block[] = []
  const stack: string[] = []
  let buf = ""
  for (const ch of clean) {
    if (ch === "{") {
      stack.push(buf.split(";").pop()!.trim())
      buf = ""
    } else if (ch === "}") {
      const prelude = stack.pop() ?? ""
      const decls: Decls = {}
      for (const d of buf.matchAll(/(--[\w-]+)\s*:\s*([^;]+?)\s*(?:!important\s*)?(?:;|$)/g)) decls[d[1]] = d[2].trim()
      const media = stack.filter((p) => p.startsWith("@media")).join(" ") || undefined
      if (Object.keys(decls).length && !prelude.startsWith("@")) out.push({ selector: prelude, decls, media })
      buf = ""
    } else buf += ch
  }
  return out
}

/** `html[data-x]` and `:root[data-x]` mean the same element as `[data-x]`. */
const norm = (s: string) => s.trim().replace(/^(?:html|:root)(?=[.[:])/, "")

function pick(blocks: Block[], pred: (selector: string) => boolean): Decls {
  return blocks
    .filter((b) => !b.media && b.selector.split(",").some((s) => pred(norm(s))))
    .reduce<Decls>((acc, b) => ({ ...acc, ...b.decls }), {})
}

/** Values of `data-<attr>="…"` the blocks define (`theme` → neutral presets, `accent` → accent presets). */
export function presetNames(blocks: Block[], attr: "theme" | "accent"): string[] {
  return [...new Set(blocks.flatMap((b) => [...b.selector.matchAll(new RegExp(`data-${attr}="([\\w-]+)"`, "g"))].map((m) => m[1])))]
}

function layer(blocks: Block[], attr: string, v: string) {
  return {
    light: pick(blocks, (s) => s === `[data-${attr}="${v}"]`),
    dark: pick(blocks, (s) => s === `.dark[data-${attr}="${v}"]` || s === `[data-${attr}="${v}"].dark` || s === `[data-${attr}="${v}"] .dark`),
  }
}

/** What the root element ends up with for one combination of knobs. Later layers win, as in the cascade. */
export function composeScope(blocks: Block[], opts: { theme?: string; accent?: string; dark?: boolean; more?: boolean } = {}): Decls {
  const n = opts.theme ? layer(blocks, "theme", opts.theme) : { light: {}, dark: {} }
  const a = opts.accent ? layer(blocks, "accent", opts.accent) : { light: {}, dark: {} }
  const light = pick(blocks, (s) => s === ":root")
  const decls = opts.dark
    ? { ...light, ...pick(blocks, (s) => s === ".dark"), ...n.light, ...n.dark, ...a.light, ...a.dark }
    : { ...light, ...n.light, ...a.light }
  return opts.more ? { ...decls, ...moreLayer(blocks) } : decls
}

/** The data-contrast="more" declarations alone; they override whatever skin is underneath. */
export function moreLayer(blocks: Block[]): Decls {
  return pick(blocks, (s) => s === '[data-contrast="more"]')
}

export type Scope = { name: string; decls: Decls; more: boolean }

/**
 * Every combination a project can switch on: neutral preset (data-theme) × accent preset
 * (data-accent) × light / dark × data-contrast="more".
 */
export function themeScopes(blocks: Block[]): Scope[] {
  const hasMore = Object.keys(moreLayer(blocks)).length > 0
  const out: Scope[] = []
  for (const theme of ["", ...presetNames(blocks, "theme")]) {
    for (const accent of ["", ...presetNames(blocks, "accent")]) {
      const label = [theme, accent && `accent ${accent}`].filter(Boolean).join(" + ")
      for (const more of hasMore ? [false, true] : [false]) {
        for (const dark of [false, true]) {
          const name = `${label ? label + " " : ""}${dark ? "dark" : "light"}${more ? " + more contrast" : ""}`
          out.push({ name, decls: composeScope(blocks, { theme, accent, dark, more }), more })
        }
      }
    }
  }
  return out
}

/* ---------- colour ---------- */

const toLab = converter("oklab")
const toRgb = converter("rgb")

export function resolveColor(value: string, decls: Decls, depth = 0): Color {
  if (depth > 20) throw new Error(`var() cycle in ${value}`)
  const v = value.trim()
  const ref = v.match(/^var\((--[\w-]+)\)$/)
  if (ref) {
    if (!decls[ref[1]]) throw new Error(`undefined ${ref[1]}`)
    return resolveColor(decls[ref[1]], decls, depth + 1)
  }
  const mix = v.match(/^color-mix\(\s*in\s+oklab\s*,\s*(.+?)\s+(\d+(?:\.\d+)?)%\s*,\s*(.+)\)$/)
  if (mix) {
    const a = toLab(resolveColor(mix[1], decls, depth + 1))
    const b = toLab(resolveColor(mix[3], decls, depth + 1))
    const p = Number(mix[2]) / 100
    // CSS mixes premultiplied: mixing with `transparent` keeps the colour and lowers alpha.
    const [wa, wb] = [(a.alpha ?? 1) * p, (b.alpha ?? 1) * (1 - p)]
    const alpha = wa + wb
    const lerp = (x = 0, y = 0) => (alpha ? (x * wa + y * wb) / alpha : 0)
    return { mode: "oklab", l: lerp(a.l, b.l), a: lerp(a.a, b.a), b: lerp(a.b, b.b), alpha }
  }
  const c = parse(v)
  if (!c) throw new Error(`can't parse colour "${v}"`)
  return c
}

/** Composite a translucent colour over an opaque one. */
export function over(fg: Color, bg: Color): Color {
  const a = fg.alpha ?? 1
  if (a >= 1) return fg
  const f = toRgb(fg)
  const b = toRgb(bg)
  return { mode: "rgb", r: f.r * a + b.r * (1 - a), g: f.g * a + b.g * (1 - a), b: f.b * a + b.b * (1 - a) }
}

/* ---------- rules ---------- */

export const SURFACES = ["--background", "--sunken", "--popover"]

/** The floors: body text 7:1, secondary text and status colours 4.5:1, the accent and focus ring 3:1. */
export const RULES: Rule[] = [
  ["--foreground", [...SURFACES, "--muted", "--selected", "--destructive-subtle"], 7],
  ["--muted-foreground", [...SURFACES, "--muted", "--selected"], 4.5],
  ["--faint-foreground", SURFACES, 4.5],
  ["--primary-foreground", ["--primary"], 4.5],
  ["--background", ["--destructive"], 4.5],
  ["--inverse-foreground", ["--inverse"], 4.5],
  ["--destructive", ["--background", "--popover", "--destructive-subtle"], 4.5],
  ["--success", ["--background", "--popover", "--success-subtle"], 4.5],
  ["--warning", ["--background", "--popover", "--warning-subtle"], 4.5],
  ["--info", ["--background", "--popover", "--info-subtle"], 4.5],
  ["--primary", ["--background", "--popover"], 3],
  ["--ring", ["--background", "--popover"], 3],
]

/**
 * data-contrast="more" (and the OS's "increase contrast"): secondary text reaches AAA,
 * meta text 5.5:1, and control edges become visible boundaries (WCAG 1.4.11, 3:1).
 */
export const MORE_RULES: Rule[] = [
  ["--muted-foreground", [...SURFACES, "--muted"], 7],
  ["--faint-foreground", SURFACES, 5.5],
  ["--input", ["--background", "--popover"], 3],
]

/** Rules for a scope: the floors, every categorical colour it declares, and the stricter set under "more". */
export function rulesFor(decls: Decls, more = false): Rule[] {
  const cats = [...new Set(Object.keys(decls).flatMap((k) => k.match(/^--cat-([a-z]+)$/)?.[1] ?? []))]
  return [...RULES, ...cats.map((c): Rule => [`--cat-${c}`, [...SURFACES, `--cat-${c}-subtle`], 4.5]), ...(more ? MORE_RULES : [])]
}

/** Every pair a rule names, measured. A token that is missing or doesn't resolve is reported as a failed check. */
/** A colour rounded to what an 8-bit display shows. */
function to8bit(c: Color): Color {
  const { r, g, b } = toRgb(c)
  const q = (v: number) => Math.round(Math.min(1, Math.max(0, v ?? 0)) * 255) / 255
  return { mode: "rgb", r: q(r), g: q(g), b: q(b) }
}

export function checkContrast(decls: Decls, rules: Rule[] = rulesFor(decls)): Check[] {
  const out: Check[] = []
  let canvas: Color
  try {
    canvas = resolveColor("var(--background)", decls)
  } catch (e) {
    return [{ fg: "--background", bg: "--background", ratio: 0, min: 1, ok: false, detail: (e as Error).message }]
  }
  for (const [fg, bgs, min] of rules) {
    for (const bg of bgs) {
      try {
        // measured as the screen draws them: 8-bit sRGB (an exact mix can pass by 0.01 and the
        // rendered colour fail, as success on success-subtle did)
        const b = to8bit(over(resolveColor(`var(${bg})`, decls), canvas))
        const f = to8bit(over(resolveColor(`var(${fg})`, decls), b))
        const ratio = wcagContrast(f, b)
        out.push({ fg, bg, ratio, min, ok: ratio >= min, detail: `${formatRgb(f)} on ${formatRgb(b)}` })
      } catch (e) {
        out.push({ fg, bg, ratio: 0, min, ok: false, detail: (e as Error).message })
      }
    }
  }
  return out
}
