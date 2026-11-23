/**
 * Theme studio: a handful of inputs → a skin (values for the semantic names), light and dark.
 *
 * The shipped CSS is the source. The default theme and every preset are read from the theme
 * files (`blocks`), never copied here, so the studio set to a preset *is* that preset. Inputs
 * move values in OKLCH (tint = hue + chroma on the neutral ramp; contrast = lightness gaps
 * between surfaces, lines and text); then every result is held to the same floors as the
 * guard (contrast-lib), nudging text and the accent until each pair passes, in both
 * appearances and under "more contrast". What you export is what passed.
 */
import { clampChroma, converter, formatHex, wcagContrast, type Color, type Oklch } from "culori"
import { checkContrast, composeScope, moreLayer, MORE_RULES, resolveColor, rulesFor, type Block, type Decls } from "@/registry/jim/guards/contrast-lib"

export type StudioState = {
  /** "" = the default neutral grey, a `data-theme` preset, or "custom" (hue + chroma below). */
  neutral: string
  hue: number
  /** OKLCH chroma of the tint (the foreground's, in light), 0–0.04. Greys are 0; the warm preset is about 0.011. */
  chroma: number
  /** "" = ink (the foreground colour, the default), a `data-accent` preset, or "custom". */
  accent: string
  /** Hex for a custom accent; "" until one is picked. */
  accentColor: string
  /** −100 (soft) … 0 (the theme's own values) … 100 (high). */
  contrast: number
  /** px; the whole radius scale follows (tokens.md 圆角). */
  radius: number
  density: "" | "compact"
  /** Layout whitespace (page edge, sections, fields, cards): data-spacing on <html>. */
  spacing: "" | "compact" | "relaxed"
  font: "" | "system"
}

export const DEFAULT_STATE: StudioState = {
  neutral: "",
  hue: 250,
  chroma: 0.012,
  accent: "",
  accentColor: "",
  contrast: 0,
  radius: 8,
  density: "",
  spacing: "",
  font: "",
}

export const isDefault = (s: StudioState) =>
  !s.neutral && !s.accent && s.contrast === 0 && s.radius === DEFAULT_STATE.radius && !s.density && !s.spacing && !s.font

/** The neutral ramp: what tint and contrast move. Everything else derives from these in the theme. */
export const NEUTRAL_TOKENS = [
  "--background",
  "--sunken",
  "--muted",
  "--popover",
  "--inverse",
  "--inverse-foreground",
  "--foreground",
  "--muted-foreground",
  "--faint-foreground",
  "--border",
  "--input",
] as const

type Mode = "light" | "dark"
type Delta = [soft: number, high: number]

/**
 * OKLCH lightness moved at contrast −100 (soft) and +100 (high); linear in between, 0 at 0.
 * Soft closes the gaps between surfaces, lines and text (Notion's softer black lives here);
 * high opens them until control edges reach 3:1 and secondary text nears AAA.
 */
const CONTRAST: Record<Mode, Partial<Record<(typeof NEUTRAL_TOKENS)[number], Delta>>> = {
  light: {
    "--sunken": [0.008, -0.012],
    "--muted": [0.01, -0.02],
    "--border": [0.025, -0.07],
    "--input": [0.04, -0.21],
    "--foreground": [0.11, -0.08],
    "--muted-foreground": [0.05, -0.13],
    "--faint-foreground": [0.03, -0.11],
    "--inverse": [0.06, -0.06],
    "--inverse-foreground": [0, 0.03],
  },
  dark: {
    "--background": [0.02, -0.03],
    "--sunken": [0.01, -0.025],
    "--popover": [0.007, -0.02],
    "--muted": [0.005, -0.005],
    "--border": [-0.006, 0.06],
    "--input": [-0.025, 0.2],
    "--foreground": [-0.06, 0.05],
    "--muted-foreground": [-0.03, 0.12],
    "--faint-foreground": [-0.02, 0.12],
    "--inverse": [-0.06, 0.05],
    "--inverse-foreground": [0.02, -0.03],
  },
}

/**
 * How much of the tint each token takes, as a share of the chroma setting (which is the
 * foreground's chroma in light). Near-white surfaces hold little before they read as tinted
 * paper; dark surfaces a little more. Calibrated against the warm preset (Notion's greys).
 */
const TINT: Record<Mode, Record<(typeof NEUTRAL_TOKENS)[number], number>> = {
  light: {
    "--background": 0,
    "--popover": 0,
    "--sunken": 0.35,
    "--muted": 0.45,
    "--border": 0.35,
    "--input": 0.7,
    "--foreground": 1,
    "--muted-foreground": 0.55,
    "--faint-foreground": 0.65,
    "--inverse": 0.6,
    "--inverse-foreground": 0.3,
  },
  dark: {
    "--background": 0.3,
    "--popover": 0.3,
    "--sunken": 0.4,
    "--muted": 0.5,
    "--border": 0.45,
    "--input": 0.6,
    "--foreground": 0.35,
    "--muted-foreground": 0.5,
    "--faint-foreground": 0.55,
    "--inverse": 0.35,
    "--inverse-foreground": 0.3,
  },
}

/** Text-like tokens the solver may darken or lighten to reach a floor. */
const NUDGEABLE = /^--(?:foreground|muted-foreground|faint-foreground|inverse-foreground|destructive|success|warning|info|cat-[a-z]+)$/

const toOklch = converter("oklch")
const hex = (c: Color) => formatHex(clampChroma(c, "oklch"))
const white: Color = { mode: "rgb", r: 1, g: 1, b: 1 }

function oklch(value: string, decls: Decls): Oklch {
  const c = toOklch(resolveColor(value, decls))
  return { mode: "oklch", l: c.l, c: c.c ?? 0, h: c.h ?? 0 }
}

export type Generated = {
  /** Values a skin file assigns, per appearance (hex). */
  light: Decls
  dark: Decls
  /** Appearance-independent: radius, font. */
  root: Decls
  /** The full scopes the values land in, for the contrast report. */
  scopes: { light: Decls; dark: Decls; lightMore: Decls; darkMore: Decls }
  /** Tokens the solver had to move to pass a floor, per appearance. */
  adjusted: { light: string[]; dark: string[] }
}

export const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif'

export function generate(state: StudioState, blocks: Block[]): Generated {
  const out = { light: {}, dark: {}, adjusted: { light: [], dark: [] } } as Pick<Generated, "light" | "dark" | "adjusted">
  const scopes = {} as Generated["scopes"]
  const more = moreLayer(blocks)
  for (const mode of ["light", "dark"] as const) {
    const dark = mode === "dark"
    const preset = state.neutral && state.neutral !== "custom" ? state.neutral : undefined
    const accentPreset = state.accent && state.accent !== "custom" ? state.accent : undefined
    // the theme as shipped for this combination of presets: the starting point
    const base = composeScope(blocks, { theme: preset, accent: accentPreset, dark })
    const decls: Decls = { ...base }
    const values: Decls = {}

    for (const t of NEUTRAL_TOKENS) {
      const c = oklch(`var(${t})`, base)
      if (state.neutral === "custom") {
        c.h = state.hue
        c.c = state.chroma * TINT[mode][t]
      }
      const d = CONTRAST[mode][t]
      if (d && state.contrast) c.l = Math.min(1, Math.max(0, c.l + (state.contrast < 0 ? d[0] : d[1]) * (Math.abs(state.contrast) / 100)))
      values[t] = hex(c)
    }
    Object.assign(decls, values)

    // the accent: ink follows the foreground; a preset keeps its values; a custom colour is solved
    if (!state.accent) {
      values["--primary"] = values["--foreground"]
      values["--primary-foreground"] = values["--background"]
    } else if (accentPreset) {
      values["--primary"] = hex(resolveColor("var(--primary)", base))
      values["--primary-foreground"] = hex(resolveColor("var(--primary-foreground)", base))
    } else {
      Object.assign(values, solveAccent(state.accentColor || hex(resolveColor("var(--primary)", base)), decls, mode))
    }
    Object.assign(decls, values)

    // status and categorical colours are written out only where the solver had to move them
    const adjusted = enforce(decls, mode, more)
    for (const t of adjusted) values[t] = decls[t]
    out[mode] = values
    out.adjusted[mode] = adjusted
    scopes[mode] = decls
    scopes[dark ? "darkMore" : "lightMore"] = { ...decls, ...more }
  }
  // A skin's :root block is imported after the theme's .dark, so a token written for one
  // appearance only would leak into the other: write every moved token in both.
  for (const [mode, other] of [["light", "dark"], ["dark", "light"]] as const) {
    for (const t of Object.keys(out[mode])) if (!(t in out[other])) out[other][t] = hex(resolveColor(`var(${t})`, scopes[other]))
  }
  const root: Decls = {}
  if (state.radius !== DEFAULT_STATE.radius) root["--radius"] = `${state.radius}px`
  if (state.font === "system") root["--font-sans"] = SYSTEM_FONT
  return { ...out, root, scopes }
}

/**
 * The accent for one appearance: keep the hue and as much chroma as fits, move lightness
 * as little as possible until it stands 3:1 off the canvas and floating surfaces and carries
 * its label at 4.5:1. White labels are preferred; a dark label only when the colour is light
 * (a yellow, a pastel) and darkening it would change it too much.
 */
export function solveAccent(input: string, decls: Decls, mode: Mode): { "--primary": string; "--primary-foreground": string } {
  const src = toOklch(resolveColor(input, decls))
  const want = { l: src.l, c: src.c ?? 0, h: src.h ?? 0 }
  const bg = resolveColor("var(--background)", decls)
  const pop = resolveColor("var(--popover)", decls)
  const labels = { light: hex(white), dark: hex(resolveColor(mode === "dark" ? "var(--background)" : "var(--foreground)", decls)) }
  const best: Record<"light" | "dark", { l: number; color: string } | undefined> = { light: undefined, dark: undefined }
  for (const kind of ["light", "dark"] as const) {
    for (let l = 0.02; l <= 0.985; l += 0.0025) {
      const color = hex({ mode: "oklch", l, c: want.c, h: want.h })
      const ok =
        wcagContrast(color, bg) >= 3.05 && wcagContrast(color, pop) >= 3.05 && wcagContrast(labels[kind], color) >= 4.6
      if (ok && (!best[kind] || Math.abs(l - want.l) < Math.abs(best[kind]!.l - want.l))) best[kind] = { l, color }
    }
  }
  const { light, dark } = best
  // no lightness works with either label (surfaces this extreme don't occur in a sane skin): keep the input
  if (!light && !dark) return { "--primary": hex(src), "--primary-foreground": labels.light }
  const pickDark = !light || (!!dark && Math.abs(dark.l - want.l) + 0.12 < Math.abs(light.l - want.l))
  const chosen = pickDark ? dark! : light!
  return { "--primary": chosen.color, "--primary-foreground": pickDark ? labels.dark : labels.light }
}

/**
 * Hold a scope to the floors, in its own appearance and under "more contrast". Text-like
 * tokens step away from the surface they fail on; an accent that fails is solved again;
 * "more contrast" derives from the foreground, so a failure there strengthens the foreground.
 * Returns the tokens it moved.
 */
function enforce(decls: Decls, mode: Mode, more: Decls): string[] {
  const moved = new Set<string>()
  for (let pass = 0; pass < 80; pass++) {
    const fails = [
      ...checkContrast(decls, rulesFor(decls)).filter((c) => !c.ok),
      ...checkContrast({ ...decls, ...more }, MORE_RULES)
        .filter((c) => !c.ok)
        .map((c) => ({ ...c, fg: "--foreground", bg: "--background" })),
    ]
    if (!fails.length) break
    const seen = new Set<string>()
    for (const f of fails) {
      let token = f.fg
      let against = f.bg
      if (token === "--background" && against === "--destructive") [token, against] = ["--destructive", "--background"]
      if (token === "--primary" || token === "--ring" || token === "--primary-foreground") {
        if (seen.has("--primary")) continue
        seen.add("--primary")
        Object.assign(decls, solveAccent(hex(resolveColor("var(--primary)", decls)), decls, mode))
        moved.add("--primary").add("--primary-foreground")
        continue
      }
      if (!NUDGEABLE.test(token) || seen.has(token) || !/^#/.test(decls[token] ?? "")) continue
      seen.add(token)
      const c = oklch(`var(${token})`, decls)
      const away = oklch(`var(${against})`, decls).l > c.l ? -0.01 : 0.01
      decls[token] = hex({ ...c, l: Math.min(1, Math.max(0, c.l + away)) })
      moved.add(token)
    }
  }
  return [...moved]
}

/* ---------- output ---------- */

const block = (selector: string, decls: Decls) =>
  `${selector} {\n${Object.entries(decls)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n")}\n}`

/** A skin file for a project: import it after jim-theme.css (tokens.md「换一整套皮肤」). */
export function toCss(g: Generated, comment: string): string {
  return `/*\n${comment
    .replaceAll("*/", "* /")
    .split("\n")
    .map((l) => ` * ${l}`.trimEnd())
    .join("\n")}\n */\n\n${block(":root", { ...g.root, ...g.light })}\n\n${block(".dark", g.dark)}\n`
}

/**
 * The same values for the live preview: `:root:root` outranks the theme (and leftover preset
 * attributes) whatever order the style tags end up in; "more contrast" still wins (!important).
 */
export function toPreviewCss(g: Generated): string {
  return `${block(":root:root", { ...g.root, ...g.light })}\n${block(":root:root.dark", g.dark)}\n`
}
