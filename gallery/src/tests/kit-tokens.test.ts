import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

// Kit components take layering and the disabled look from tokens (jim-theme.css), so a project
// can retune them in one place. A table's own sticky header / column order (z-[1], z-[2]) is local.
const dir = path.resolve(import.meta.dirname, "../registry/jim/ui")
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".tsx"))
const read = (f: string) => fs.readFileSync(path.join(dir, f), "utf8")

describe("kit components use the layer and state tokens", () => {
  it("finds the components", () => expect(files.length).toBeGreaterThan(30))

  it.each(files)("%s: no raw z-index", (f) => {
    expect([...read(f).matchAll(/(?<![\w-])z-\d+(?![\w-])/g)].map((m) => m[0])).toEqual([])
  })

  it.each(files)("%s: disabled opacity comes from --disabled-opacity", (f) => {
    expect([...read(f).matchAll(/(?:disabled|data-disabled):opacity-\d+/g)].map((m) => m[0])).toEqual([])
  })
})
