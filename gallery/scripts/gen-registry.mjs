// Build registry.json from src/registry/jim: one item per file, dependencies
// read from imports, so the registry can't drift from the code.
// Then `shadcn build` turns it into public/r/*.json.
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const src = path.join(root, "src/registry/jim")
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"))
const version = pkg.version

const kinds = {
  ui: "registry:ui",
  hooks: "registry:hook",
  lib: "registry:lib",
}

const descriptions = {
  theme: "Tokens: values, semantic names, Tailwind mapping, motion, base styles",
  "preset-warm": "Preset: Notion-like warm greys",
  utils: "cn() with tailwind-merge taught the semantic type scale",
  guards: "Vitest guards: no raw colours, type floor, no native dialogs, contrast matrix",
}

const items = []
// Pin each dependency to the major the kit is built and tested against.
const all = { ...pkg.dependencies, ...pkg.devDependencies }
const pin = (name) => (all[name] ? `${name}@${all[name]}` : name)
const nameOf = (file) => path.basename(file).replace(/\.(tsx?|css)$/, "")

function deps(code) {
  const npm = new Set()
  const reg = new Set()
  for (const [, spec] of code.matchAll(/from\s+"([^"]+)"/g)) {
    if (spec.startsWith("@/registry/jim/")) reg.add(`@jim/${nameOf(spec)}`)
    else if (spec === "@/lib/utils") reg.add("@jim/utils")
    else if (!spec.startsWith(".") && !spec.startsWith("@/") && spec !== "react" && !spec.startsWith("react/")) {
      npm.add(spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0])
    }
  }
  return { dependencies: [...npm].sort().map(pin), registryDependencies: [...reg].sort() }
}

items.push({
  name: "utils",
  type: "registry:lib",
  description: descriptions.utils,
  dependencies: ["clsx", "tailwind-merge"].map(pin),
  files: [{ path: "src/lib/utils.ts", type: "registry:lib" }],
})

items.push({
  name: "theme",
  type: "registry:file",
  description: descriptions.theme,
  dependencies: ["@fontsource-variable/inter"].map(pin),
  files: [{ path: "src/registry/jim/theme/jim-theme.css", type: "registry:file", target: "src/styles/jim-theme.css" }],
})
for (const p of fs.readdirSync(path.join(src, "theme/presets"))) {
  const n = nameOf(p)
  items.push({
    name: `preset-${n}`,
    type: "registry:file",
    description: descriptions[`preset-${n}`],
    files: [{ path: `src/registry/jim/theme/presets/${p}`, type: "registry:file", target: `src/styles/presets/${p}` }],
  })
}

for (const [dir, type] of Object.entries(kinds)) {
  for (const f of fs.readdirSync(path.join(src, dir)).sort()) {
    if (f.endsWith(".test.ts")) continue
    const rel = `src/registry/jim/${dir}/${f}`
    const code = fs.readFileSync(path.join(root, rel), "utf8")
    const first = code.match(/\/\*\*?\s*\n?\s*\*?\s*([^\n*][^\n]*)/)
    items.push({
      name: nameOf(f),
      type,
      description: first ? first[1].trim() : undefined,
      ...deps(code),
      files: [{ path: rel, type }],
    })
  }
}

const guardFiles = fs.readdirSync(path.join(src, "guards")).filter((f) => f.endsWith(".ts"))
items.push({
  name: "guards",
  type: "registry:file",
  description: descriptions.guards,
  devDependencies: ["vitest", "culori", "@types/culori"].map(pin),
  files: guardFiles.map((f) => ({ path: `src/registry/jim/guards/${f}`, type: "registry:file", target: `tests/design/${f}` })),
})

// everything at once
items.push({
  name: "all",
  type: "registry:item",
  description: `jim-uiux ${version}: theme, every component, hooks and libs`,
  registryDependencies: items.filter((i) => !i.name.startsWith("preset-") && i.name !== "guards").map((i) => `@jim/${i.name}`),
})

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "jim",
  homepage: "https://github.com/linjiejim/jim-uiux",
  items: items.map((i) => Object.fromEntries(Object.entries(i).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0)))),
}
fs.writeFileSync(path.join(root, "registry.json"), JSON.stringify(registry, null, 2) + "\n")
console.log(`registry.json: ${items.length} items`)
