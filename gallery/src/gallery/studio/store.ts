/**
 * The gallery's theme state: one store for the sidebar knobs and the studio page. Applying it
 * writes the generated skin into a <style> (and data-density / data-spacing on <html>), so every
 * gallery page previews it; index.html replays the stored CSS before first paint.
 */
import * as React from "react"
import themeCss from "@/registry/jim/theme/jim-theme.css?raw"
import { parseBlocks, presetNames, type Block } from "@/registry/jim/guards/contrast-lib"
import { ACCENT_LABELS, NEUTRAL_LABELS } from "./meta"
import { decodeState as decodeStateWith, encodeState, sanitizeState } from "./state"
import { DEFAULT_STATE, generate, isDefault, toPreviewCss, type Generated, type StudioState } from "./theme-gen"

const presetCss = import.meta.glob<string>("/src/registry/jim/theme/presets/*.css", { query: "?raw", import: "default", eager: true })

/** The theme and every shipped preset, parsed: the generator's source of truth. */
export const BLOCKS: Block[] = [themeCss, ...Object.values(presetCss)].flatMap((css) => parseBlocks(css))

/** Shipped presets in the order the labels list them; one without a label goes last. */
const ordered = (names: string[], labels: Record<string, string>) => {
  const order = Object.keys(labels)
  const rank = (n: string) => (order.includes(n) ? order.indexOf(n) : order.length)
  return [...names].sort((a, b) => rank(a) - rank(b))
}
export const NEUTRAL_PRESETS = ordered(presetNames(BLOCKS, "theme"), NEUTRAL_LABELS)
export const ACCENT_PRESETS = ordered(presetNames(BLOCKS, "accent"), ACCENT_LABELS)

const KEY = "gallery:studio"
const CSS_KEY = "gallery:studio-css"
const MORE_KEY = "gallery:more-contrast"
const OLD_KEY = "gallery:knobs"

function load(): StudioState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return sanitize(JSON.parse(raw))
    // 1.7 and earlier: { theme, radius, density } as data-* attributes
    const old = JSON.parse(localStorage.getItem(OLD_KEY) || "null")
    if (old) {
      localStorage.removeItem(OLD_KEY)
      return sanitize({
        neutral: old.theme || "",
        radius: old.radius === "sharp" ? 4 : old.radius === "round" ? 12 : DEFAULT_STATE.radius,
        density: old.density === "compact" ? "compact" : "",
      })
    }
  } catch {
    /* fall through to the default */
  }
  return DEFAULT_STATE
}

export const sanitize = (input: unknown) => sanitizeState(input, { neutral: NEUTRAL_PRESETS, accent: ACCENT_PRESETS })

let state: StudioState = typeof localStorage === "undefined" ? DEFAULT_STATE : load()
let generated: Generated = generate(state, BLOCKS)
let more = typeof localStorage !== "undefined" && localStorage.getItem(MORE_KEY) === "1"
const listeners = new Set<() => void>()

function apply() {
  const root = document.documentElement
  // leftovers from the old attribute knobs would fight the generated values
  root.removeAttribute("data-theme")
  root.removeAttribute("data-radius")
  root.removeAttribute("data-accent")
  for (const knob of ["density", "spacing"] as const) {
    if (state[knob]) root.setAttribute(`data-${knob}`, state[knob])
    else root.removeAttribute(`data-${knob}`)
  }
  if (more) root.setAttribute("data-contrast", "more")
  else root.removeAttribute("data-contrast")

  let el = document.getElementById("jim-studio") as HTMLStyleElement | null
  if (isDefault(state)) {
    el?.remove()
    localStorage.removeItem(KEY)
    localStorage.removeItem(CSS_KEY)
    return
  }
  const css = toPreviewCss(generated)
  if (!el) {
    el = document.createElement("style")
    el.id = "jim-studio"
    document.head.appendChild(el)
  }
  el.textContent = css
  localStorage.setItem(KEY, JSON.stringify(state))
  localStorage.setItem(CSS_KEY, css)
}

function emit() {
  listeners.forEach((l) => l())
}

export function setStudio(patch: Partial<StudioState>) {
  state = sanitize({ ...state, ...patch })
  generated = generate(state, BLOCKS)
  apply()
  emit()
}

export function resetStudio() {
  setStudio(DEFAULT_STATE)
}

export function setMoreContrast(on: boolean) {
  more = on
  if (on) localStorage.setItem(MORE_KEY, "1")
  else localStorage.removeItem(MORE_KEY)
  apply()
  emit()
}

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useStudio() {
  const s = React.useSyncExternalStore(subscribe, () => state, () => DEFAULT_STATE)
  const g = React.useSyncExternalStore(subscribe, () => generated, () => generated)
  const m = React.useSyncExternalStore(subscribe, () => more, () => false)
  return { state: s, generated: g, more: m }
}

/** Run once at startup: the boot script restored the CSS; this re-derives it from the state. */
export function initStudio() {
  apply()
}

/* ---------- share links: #/studio?t=<base64url json> ---------- */

export { encodeState }
export const decodeState = (t: string) => decodeStateWith(t, { neutral: NEUTRAL_PRESETS, accent: ACCENT_PRESETS })
