import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

// The motion contract in jim-theme.css: movement (scale, translate) is multiplied by --motion, and
// at --motion: 0 (prefers-reduced-motion) every keyframe still fades fully, so each enter / exit is a
// plain fade. Slides may stay solid at normal motion (opacity: var(--motion)). Exits hold their end state.
const css = fs.readFileSync(path.resolve(import.meta.dirname, "../registry/jim/theme/jim-theme.css"), "utf8")

function keyframes(src: string) {
  const out: { name: string; body: string }[] = []
  for (const m of src.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    let depth = 1
    let i = m.index! + m[0].length
    for (; i < src.length && depth; i++) depth += src[i] === "{" ? 1 : src[i] === "}" ? -1 : 0
    out.push({ name: m[1], body: src.slice(m.index! + m[0].length, i - 1) })
  }
  return out
}

const frames = keyframes(css).filter((k) => k.name.startsWith("jim-"))
const animateTokens = [...css.matchAll(/--animate-([\w-]+):\s*([^;]+);/g)].map((m) => ({ name: m[1], value: m[2] }))

describe("motion tokens", () => {
  it("finds the keyframes and animate tokens", () => {
    expect(frames.length).toBeGreaterThan(5)
    expect(animateTokens.length).toBeGreaterThan(5)
  })

  // evaluates an opacity like "0", "var(--motion)" or "calc(1 - var(--motion))" for a given --motion
  const opacityAt = (value: string, motion: number) => {
    const expr = value.replace(/var\(--motion\)/g, String(motion)).replace(/calc/g, "")
    if (!/^[\d\s.()+*/-]+$/.test(expr)) throw new Error(`can't evaluate ${value}`)
    return Function(`return (${expr})`)() as number
  }

  it.each(frames.map((k) => [k.name, k.body]))("%s is a full fade under reduced motion", (_, body) => {
    const values = [...body.matchAll(/opacity:\s*([^;]+);/g)].map((m) => m[1].trim())
    expect(values.length).toBeGreaterThan(0)
    for (const v of values) expect(opacityAt(v, 0)).toBe(0)
  })

  it.each(frames.map((k) => [k.name, k.body]))("%s scales its movement by --motion", (_, body) => {
    for (const [, value] of body.matchAll(/transform:\s*([^;]+);/g)) expect(value).toContain("var(--motion)")
  })

  it.each(animateTokens.map((t) => [t.name, t.value]))("--animate-%s uses a defined keyframe and the duration / ease tokens", (_, value) => {
    const [name, duration, ease, fill] = value.trim().split(/\s+/)
    expect(frames.map((k) => k.name)).toContain(name)
    // an exit holds its end state, so an unmount that lands a frame late can't flash the panel back
    expect(fill).toBe(/-out(-|$)/.test(_) ? "forwards" : undefined)
    expect(duration).toMatch(/^var\(--duration-(fast|base|slow|exit)\)$/)
    expect(ease).toMatch(/^var\(--ease-[\w-]+\)$/)
  })
})
