import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

// The motion contract in jim-theme.css: every enter / exit fades, and only the movement
// (scale, translate) is multiplied by --motion, so prefers-reduced-motion leaves a plain fade.
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

  it.each(frames.map((k) => [k.name, k.body]))("%s fades fully, whatever --motion is", (_, body) => {
    for (const [, value] of body.matchAll(/opacity:\s*([^;]+);/g)) expect(value.trim()).toBe("0")
  })

  it.each(frames.map((k) => [k.name, k.body]))("%s scales its movement by --motion", (_, body) => {
    for (const [, value] of body.matchAll(/transform:\s*([^;]+);/g)) expect(value).toContain("var(--motion)")
  })

  it.each(animateTokens.map((t) => [t.name, t.value]))("--animate-%s uses a defined keyframe and the duration / ease tokens", (_, value) => {
    const [name, duration, ease] = value.trim().split(/\s+/)
    expect(frames.map((k) => k.name)).toContain(name)
    expect(duration).toMatch(/^var\(--duration-(fast|base|slow|exit)\)$/)
    expect(ease).toMatch(/^var\(--ease-[\w-]+\)$/)
  })
})
