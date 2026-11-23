/**
 * Studio state from outside (localStorage, a shared link): keep known keys with sane values,
 * so a link can only ever set the knobs the studio has. Pure, for tests.
 */
import { DEFAULT_STATE, type StudioState } from "./theme-gen"

export type Presets = { neutral: string[]; accent: string[] }

export function sanitizeState(input: unknown, presets: Presets): StudioState {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>
  const num = (v: unknown, min: number, max: number, d: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : d)
  const oneOf = (v: unknown, list: string[], d: string) => (typeof v === "string" && list.includes(v) ? v : d)
  return {
    neutral: oneOf(o.neutral, ["", "custom", ...presets.neutral], ""),
    hue: num(o.hue, 0, 360, DEFAULT_STATE.hue),
    chroma: num(o.chroma, 0, 0.04, DEFAULT_STATE.chroma),
    accent: oneOf(o.accent, ["", "custom", ...presets.accent], ""),
    accentColor: typeof o.accentColor === "string" && /^#[0-9a-f]{6}$/i.test(o.accentColor) ? o.accentColor.toLowerCase() : "",
    contrast: num(o.contrast, -100, 100, 0),
    radius: num(o.radius, 0, 16, DEFAULT_STATE.radius),
    density: o.density === "compact" ? "compact" : "",
    spacing: o.spacing === "compact" || o.spacing === "relaxed" ? o.spacing : "",
    font: o.font === "system" ? "system" : "",
  }
}

/* share links: #/studio?t=<base64url json of what differs from the default> */

export function encodeState(s: StudioState): string {
  const diff = Object.fromEntries(Object.entries(s).filter(([k, v]) => DEFAULT_STATE[k as keyof StudioState] !== v))
  return btoa(JSON.stringify(diff)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export function decodeState(t: string, presets: Presets): StudioState | null {
  try {
    return sanitizeState({ ...DEFAULT_STATE, ...JSON.parse(atob(t.replace(/-/g, "+").replace(/_/g, "/"))) }, presets)
  } catch {
    return null
  }
}
