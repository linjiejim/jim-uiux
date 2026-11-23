import { clampChroma, converter, formatHex } from "culori"
import { composeScope, resolveColor } from "@/registry/jim/guards/contrast-lib"
import { BLOCKS } from "./store"
import type { StudioState } from "./theme-gen"

const toOklch = converter("oklch")

/** A neutral's swatch: its tint at a readable mid-tone, chroma amplified so the hue shows. */
export function neutralSwatch(preset: string, s: StudioState, dark: boolean) {
  let h = s.hue
  let c = s.chroma
  if (preset !== "custom") {
    const o = toOklch(resolveColor("var(--faint-foreground)", composeScope(BLOCKS, { theme: preset || undefined, dark })))
    h = o.h ?? 0
    c = o.c ?? 0
  }
  return formatHex(clampChroma({ mode: "oklch", l: 0.6, c: Math.min(0.09, c * 4), h }, "oklch"))
}

export function accentSwatch(preset: string, s: StudioState, dark: boolean) {
  if (preset === "custom") return s.accentColor || "var(--primary)"
  const theme = s.neutral && s.neutral !== "custom" ? s.neutral : undefined
  return formatHex(resolveColor(preset ? "var(--primary)" : "var(--foreground)", composeScope(BLOCKS, { theme, accent: preset || undefined, dark })))
}

