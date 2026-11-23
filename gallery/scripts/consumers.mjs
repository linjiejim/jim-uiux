// Check the downstream projects listed in ../../consumers.json (plus the
// uncommitted ../../consumers.local.json for private ones) against this
// registry: which version each one says it is on, which @jim files it has,
// which of those differ from the source here, and what it added itself
// (candidates to bring back upstream). See references/downstream.md.
//
//   pnpm consumers                          every project, read from GitHub (default branch)
//   pnpm consumers <name>                   one project
//   pnpm consumers <name> --path <dir>      read a local checkout instead (e.g. a sync branch)
//   pnpm consumers <name> --diff [item]     print the diffs: "-" is jim-uiux, "+" is the project
//   pnpm consumers --affected [ref]         which projects a change here touches (default: since origin/main)
//   pnpm consumers --discover [--owner o] [--since YYYY-MM-DD]
//                                           find repos that mention jim-uiux but are not listed
//
// Needs the GitHub CLI (`gh`) logged in; private repos work through it too.
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { execFile, spawnSync } from "node:child_process"
import { promisify } from "node:util"

const gallery = path.resolve(import.meta.dirname, "..")
const repoRoot = path.resolve(gallery, "..")
const readList = (file) =>
  fs.existsSync(path.join(repoRoot, file)) ? JSON.parse(fs.readFileSync(path.join(repoRoot, file), "utf8")).consumers : []
const consumers = [
  ...readList("consumers.json"),
  ...readList("consumers.local.json").map((c) => ({ ...c, private: true })),
]
const registry = JSON.parse(fs.readFileSync(path.join(gallery, "registry.json"), "utf8"))
const version = JSON.parse(fs.readFileSync(path.join(gallery, "package.json"), "utf8")).version
// jim-uiux 0.1.0 shipped on this day; nothing pushed earlier can use it.
const FIRST_RELEASE = "2026-11-01"

const run = promisify(execFile)
// `gh api` with retries. null only for a real 404 (or an empty repo); anything
// else retries, then throws, so a flaky read never looks like a deleted file.
async function gh(...args) {
  for (let attempt = 0; ; attempt++) {
    try {
      return (await run("gh", ["api", ...args], { maxBuffer: 64 << 20 })).stdout
    } catch (e) {
      const why = String(e.stderr || e.message).trim()
      if (/HTTP (404|409)/.test(why)) return null
      if (attempt >= 3) throw new Error(`gh api ${args.at(-1)} 失败：${why}`)
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt))
    }
  }
}

async function pool(items, n, fn) {
  const out = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker))
  return out
}

// ── where files come from ────────────────────────────────────────────────────

function githubSource(repo) {
  let tree
  return {
    label: `github.com/${repo}`,
    async files() {
      if (tree) return tree
      const res = await gh(`repos/${repo}/git/trees/HEAD?recursive=1`)
      if (res == null) throw new Error(`找不到 ${repo}，或仓库是空的`)
      tree = JSON.parse(res).tree.filter((e) => e.type === "blob").map((e) => e.path)
      return tree
    },
    read(p) {
      const url = `repos/${repo}/contents/${p.split("/").map(encodeURIComponent).join("/")}`
      return gh("-H", "Accept: application/vnd.github.raw", url)
    },
  }
}

function localSource(dir) {
  const abs = path.resolve(dir)
  return {
    label: abs,
    async files() {
      const r = spawnSync("git", ["-C", abs, "ls-files", "--cached", "--others", "--exclude-standard"], { encoding: "utf8" })
      if (r.status !== 0) throw new Error(`${abs} 不是 git 仓库`)
      return r.stdout.split("\n").filter(Boolean)
    },
    async read(p) {
      const f = path.join(abs, p)
      return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null
    },
  }
}

// ── registry → project paths ─────────────────────────────────────────────────

// tsconfig is JSON with comments and trailing commas. Strings are copied as they
// are, so the "/*" in "@/*" is not taken for a comment.
function parseJsonc(text) {
  let out = ""
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      let j = i + 1
      while (j < text.length && text[j] !== '"') j += text[j] === "\\" ? 2 : 1
      out += text.slice(i, j + 1)
      i = j
    } else if (ch === "/" && text[i + 1] === "/") {
      while (i + 1 < text.length && text[i + 1] !== "\n") i++
    } else if (ch === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2)
      i = end < 0 ? text.length : end + 1
    } else if (ch === "}" || ch === "]") {
      // A string always ends in a quote, so a comma left at the end is a trailing one.
      const t = out.trimEnd()
      out = (t.endsWith(",") ? t.slice(0, -1) : out) + ch
    } else out += ch
  }
  return JSON.parse(out.replace(/^\uFEFF/, ""))
}

// One tsconfig with what it extends, merged the way tsc does: the file's own
// options win, `paths` resolve against `baseUrl` if one is set, else against the
// file that wrote them. Extends from a package (node_modules) can't be read here.
async function tsconfig(source, file, chain = []) {
  if (chain.includes(file)) return null
  const text = await source.read(file)
  if (text == null) return null
  let json
  try {
    json = parseJsonc(text)
  } catch (e) {
    throw new Error(`读不懂 ${file}：${e.message}`)
  }
  const dir = path.posix.dirname(file)
  const opts = {}
  for (const ext of [json.extends ?? []].flat()) {
    if (!/^\.\.?\//.test(ext)) continue
    const parent = path.posix.join(dir, ext.endsWith(".json") ? ext : `${ext}.json`)
    Object.assign(opts, (await tsconfig(source, parent, [...chain, file]))?.opts)
  }
  const own = json.compilerOptions ?? {}
  if (own.paths) opts.paths = { map: own.paths, dir }
  if (own.baseUrl != null) opts.baseUrl = path.posix.join(dir, own.baseUrl)
  const refs = (json.references ?? []).map((r) => {
    const p = path.posix.join(dir, r.path)
    return p.endsWith(".json") ? p : path.posix.join(p, "tsconfig.json")
  })
  return { opts, refs }
}

// Where `@/` points, relative to the project root: tsconfig.json's
// `paths["@/*"]`, else the first project it references that sets one (Vite's
// tsconfig.app.json). Usually `src`, but an app can live elsewhere (`./web/src/*`);
// with no tsconfig saying otherwise it is `src`.
async function aliasRoot(source, root) {
  const seen = new Set()
  const find = async (file) => {
    if (seen.has(file)) return null
    seen.add(file)
    const t = await tsconfig(source, file)
    if (!t) return null
    const target = t.opts.paths?.map["@/*"]?.[0]
    if (target) return path.posix.join(t.opts.baseUrl ?? t.opts.paths.dir, target.replace(/\*$/, ""))
    for (const ref of t.refs) {
      const hit = await find(ref)
      if (hit) return hit
    }
    return null
  }
  const hit = await find(path.posix.join(root, "tsconfig.json"))
  return hit ? path.posix.relative(root, hit) || "." : "src"
}

const aliasDir = (alias, base) => (alias.startsWith("@/") ? path.posix.join(base, alias.slice(2)) : alias)

function aliasesOf(cfg) {
  const a = cfg.aliases ?? {}
  return {
    ui: a.ui ?? `${a.components ?? "@/components"}/ui`,
    lib: a.lib ?? "@/lib",
    hooks: a.hooks ?? "@/hooks",
  }
}

// Where a registry file can be in the project, relative to its root, most
// likely first; the first one the project has is the one compared. `base` is
// where `@/` points (aliasRoot).
function targetsOf(file, cfg, base) {
  const a = aliasesOf(cfg)
  const name = path.posix.basename(file.path)
  if (file.type === "registry:ui") return [`${aliasDir(a.ui, base)}/${name}`]
  if (file.type === "registry:hook") return [`${aliasDir(a.hooks, base)}/${name}`]
  if (file.type === "registry:lib") return [`${aliasDir(a.lib, base)}/${name}`]
  // "~/" means the project root. "src/" means the app's source, where `@/` points.
  if (file.target.startsWith("~/")) return [file.target.slice(2)]
  if (file.target.startsWith("src/")) return [path.posix.join(base, file.target.slice(4))]
  // Anything else shadcn puts under src/ when there is one, else at the root
  // (the guards: some projects run them from the root, next to vitest.config).
  return [...new Set([path.posix.join(base, file.target), file.target])]
}

// Undo what `shadcn add` rewrites, so only real differences are left.
function expected(code, cfg) {
  const a = aliasesOf(cfg)
  return code
    .replaceAll("@/registry/jim/ui/", `${a.ui}/`)
    .replaceAll("@/registry/jim/lib/", `${a.lib}/`)
    .replaceAll("@/registry/jim/hooks/", `${a.hooks}/`)
}

// Applied to both sides. Whether "use client" survives `shadcn add` depends on
// the CLI version and `rsc`, and it says nothing about the design.
const tidy = (s) =>
  s
    .replace(/\r\n/g, "\n")
    .replace(/^["']use client["'];?\s*\n/, "")
    .replace(/\s+$/, "") + "\n"

function numstat(a, b) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "jim-uiux-"))
  fs.writeFileSync(path.join(tmp, "a"), a)
  fs.writeFileSync(path.join(tmp, "b"), b)
  const r = spawnSync("git", ["diff", "--no-index", "--numstat", "a", "b"], { cwd: tmp, encoding: "utf8" })
  fs.rmSync(tmp, { recursive: true, force: true })
  const [add = 0, del = 0] = r.stdout.trim().split(/\s+/).map(Number)
  return { add, del }
}

function showDiff(name, target, a, b) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "jim-uiux-"))
  const up = path.join("jim-uiux", target)
  const down = path.join(name, target)
  for (const [p, c] of [[up, a], [down, b]]) {
    fs.mkdirSync(path.dirname(path.join(tmp, p)), { recursive: true })
    fs.writeFileSync(path.join(tmp, p), c)
  }
  spawnSync("git", ["--no-pager", "diff", "--no-index", "--no-prefix", up, down], { cwd: tmp, stdio: "inherit" })
  fs.rmSync(tmp, { recursive: true, force: true })
}

// ── check ────────────────────────────────────────────────────────────────────

async function check(c, source, diffItem) {
  const rel = (p) => path.posix.join(c.root ?? ".", p)
  const files = await source.files()
  const designDoc = c.design ? await source.read(c.design) : null
  const stamped = designDoc?.match(/jim-uiux[^\n\d]{0,40}?v?(\d+\.\d+\.\d+)/)?.[1]
  const result = { c, source, stamped, hasDesign: designDoc != null }
  if (c.mode !== "registry") return result

  const cfgText = await source.read(rel("components.json"))
  if (!cfgText) return { ...result, error: `找不到 ${rel("components.json")}` }
  const cfg = JSON.parse(cfgText)
  result.registryUrl = cfg.registries?.["@jim"]
  const base = (result.base = await aliasRoot(source, c.root ?? "."))

  const have = new Set(files)
  const entries = registry.items.flatMap((item) =>
    (item.files ?? []).map((file) => {
      const targets = targetsOf(file, cfg, base)
      return { item: item.name, file, target: targets.find((t) => have.has(rel(t))) ?? targets[0] }
    }),
  )
  const installed = entries.filter((e) => have.has(rel(e.target)))
  const installedNames = new Set(installed.map((e) => e.item))
  result.missing = registry.items.filter((i) => i.files?.length && !installedNames.has(i.name)).map((i) => i.name)

  result.files = await pool(installed, 4, async (e) => {
    const upstream = tidy(expected(fs.readFileSync(path.join(gallery, e.file.path), "utf8"), cfg))
    const project = tidy((await source.read(rel(e.target))) ?? "")
    return { ...e, upstream, project, ...(upstream === project ? { add: 0, del: 0 } : numstat(upstream, project)) }
  })

  const uiDir = rel(aliasDir(aliasesOf(cfg).ui, base)) + "/"
  const known = new Set(entries.filter((e) => e.file.type === "registry:ui").map((e) => rel(e.target)))
  result.ownUi = files.filter((f) => f.startsWith(uiDir) && !f.slice(uiDir.length).includes("/") && !known.has(f))

  if (diffItem !== undefined) {
    for (const f of result.files) {
      if (f.add + f.del === 0) continue
      if (diffItem && f.item !== diffItem) continue
      showDiff(c.name, f.target, f.upstream, f.project)
    }
  }
  return result
}

function report(r) {
  const { c } = r
  console.log(`\n${c.name}  ·  ${c.mode}${c.private ? "（私有）" : ""}  ·  ${r.source.label}`)
  if (r.hasDesign === undefined) return console.log(`  ✗ ${r.error}`)
  const stamp = !r.hasDesign
    ? `找不到 ${c.design}`
    : r.stamped
      ? `${c.design} 标注 ${r.stamped}${r.stamped === version ? "" : `（当前 ${version}）`}`
      : `${c.design} 没写版本号（当前 ${version}）`
  console.log(`  ${stamp}`)
  if (r.error) return console.log(`  ✗ ${r.error}`)
  if (c.own?.length) console.log(`  自己的：${c.own.join("；")}`)
  if (c.mode !== "registry") {
    console.log(`  跟的规范：${(c.follows ?? []).join("、") || "（没写 follows）"}`)
    console.log("  不装组件：上游改了这些规范时，按 CHANGELOG 在项目自己的组件里移植。")
    return
  }
  if (r.registryUrl !== "https://design.linjiejim.com/r/{name}.json") console.log(`  registry 地址：${r.registryUrl ?? "未配置"}`)
  if (r.base !== "src") console.log(`  @/ 指向 ${r.base}（tsconfig 的 paths）`)
  const same = r.files.filter((f) => f.add + f.del === 0)
  const diff = r.files.filter((f) => f.add + f.del > 0).sort((a, b) => b.add + b.del - (a.add + a.del))
  console.log(`  装了 ${r.files.length} 个文件：一致 ${same.length}，有差异 ${diff.length}`)
  if (diff.length) {
    console.log("  有差异（+ 项目多出的行，- 上游有而项目没有的行）：")
    const w = Math.max(...diff.map((f) => f.item.length))
    for (const f of diff) console.log(`    ${f.item.padEnd(w)}  +${String(f.add).padEnd(4)} -${String(f.del).padEnd(4)} ${f.target}`)
  }
  if (r.ownUi.length) {
    console.log("  项目自己加的 ui 组件（看看要不要提回上游）：")
    for (const f of r.ownUi) console.log(`    ${f}`)
  }
  if (r.missing.length) console.log(`  没装：${r.missing.join("、")}`)
}

// What projects added on top of the kit, across all of them. A file several
// projects added (or changed the same way) is the strongest case for upstream.
function candidates(results) {
  const byKey = new Map()
  const add = (key, project, what) => {
    if (!byKey.has(key)) byKey.set(key, [])
    byKey.get(key).push(`${project}（${what}）`)
  }
  for (const r of results) {
    if (!r.files) continue
    for (const f of r.ownUi) add(path.posix.basename(f).replace(/\.(tsx?|css)$/, ""), r.c.name, "自己加的组件")
    for (const f of r.files) if (f.add >= 2 && f.add > f.del) add(f.item, r.c.name, `多 ${f.add} 行`)
  }
  if (!byKey.size) return
  console.log("\n反哺候选（项目在 kit 上加的东西；--diff 看内容，评估记在 references/downstream.md）：")
  const rows = [...byKey].sort((a, b) => b[1].length - a[1].length)
  const w = Math.max(...rows.map(([k]) => k.length))
  for (const [key, from] of rows) console.log(`  ${key.padEnd(w)}  ${from.join("、")}${from.length > 1 ? "  ← 多个项目都有" : ""}`)
}

// ── affected ─────────────────────────────────────────────────────────────────

// The docs downstream projects implement. decisions / adoption / downstream /
// checklist are about running this repo, and SKILL.md only sums up these, so a
// change there asks nothing of a project.
const SPEC_DOC = /^(principles|tokens|components|content|patterns\/[\w-]+)$/

// A path in this repo → what downstream projects know it as.
function touched(file) {
  for (const item of registry.items) {
    if ((item.files ?? []).some((f) => path.posix.join("gallery", f.path) === file)) return { item: item.name }
  }
  const doc = file.match(/^references\/(.+)\.md$/)?.[1]
  return doc && SPEC_DOC.test(doc) ? { doc } : null
}

async function affected(ref) {
  const r = spawnSync("git", ["-C", repoRoot, "diff", "--name-only", ref], { encoding: "utf8" })
  if (r.status !== 0) throw new Error(`git diff ${ref} 失败：${r.stderr.trim()}`)
  const changes = r.stdout.split("\n").filter(Boolean).map(touched).filter(Boolean)
  const items = [...new Set(changes.flatMap((t) => (t.item ? [t.item] : [])))]
  const docs = [...new Set(changes.flatMap((t) => (t.doc ? [t.doc] : [])))]
  console.log(`相对 ${ref} 改了：`)
  console.log(`  组件 / 主题：${items.join("、") || "无"}`)
  console.log(`  规范文档：${docs.join("、") || "无"}`)
  if (!items.length && !docs.length) return

  const rows = await pool(consumers, 4, async (c) => {
    const why = []
    // registry projects take the whole system; aligned ones only what they follow.
    const docsHit = c.mode === "registry" ? docs : docs.filter((d) => (c.follows ?? []).includes(d))
    if (docsHit.length) why.push(`规范 ${docsHit.join("、")}`)
    if (c.mode === "registry" && items.length) {
      try {
        const src = githubSource(c.repo)
        const root = c.root ?? "."
        const cfg = JSON.parse((await src.read(path.posix.join(root, "components.json"))) ?? "{}")
        const base = await aliasRoot(src, root)
        const have = new Set(await src.files())
        const hit = items.filter((name) =>
          registry.items
            .find((i) => i.name === name)
            ?.files?.some((f) => targetsOf(f, cfg, base).some((t) => have.has(path.posix.join(root, t)))),
        )
        if (hit.length) why.push(`装了 ${hit.join("、")}`)
      } catch (e) {
        why.push(`读不了，没法判断装了哪些：${e.message}`)
      }
    }
    return { c, why }
  })
  console.log("\n要同步的项目：")
  for (const { c, why } of rows.filter((x) => x.why.length)) console.log(`  ${c.name.padEnd(12)} ${why.join("；")}`)
  const untouched = rows.filter((x) => !x.why.length).map((x) => x.c.name)
  if (untouched.length) console.log(`不受影响：${untouched.join("、")}`)
  console.log("\n每个项目单独提一个 PR，步骤见 references/adoption.md「升级」；aligned 项目在自己的组件里移植。")
}

// ── discover ─────────────────────────────────────────────────────────────────

const MENTION = /design\.linjiejim\.com|jim-uiux/i
const LIKELY = (f) =>
  f.split("/").length <= 4 &&
  (/(^|\/)components\.json$/.test(f) || /(^|\/)(DESIGN|AGENTS|CLAUDE|README|CONTRIBUTING)[^/]*\.md$/i.test(f))

async function discover(owners, since) {
  const listed = new Set(consumers.map((c) => c.repo.toLowerCase()))
  const repos = []
  for (const owner of owners) {
    const { stdout } = await run(
      "gh",
      ["repo", "list", owner, "--limit", "500", "--json", "nameWithOwner,pushedAt,isArchived"],
      { maxBuffer: 16 << 20 },
    )
    for (const r of JSON.parse(stdout)) {
      const name = r.nameWithOwner.toLowerCase()
      if (r.isArchived || r.pushedAt.slice(0, 10) < since || listed.has(name) || name.endsWith("/jim-uiux")) continue
      repos.push(r.nameWithOwner)
    }
  }
  console.log(`扫描 ${repos.length} 个 ${since} 之后推送过、还没登记的仓库（${owners.join("、")}）…`)
  const failed = []
  const found = await pool(repos, 6, async (repo) => {
    const src = githubSource(repo)
    try {
      const hits = []
      for (const f of (await src.files()).filter(LIKELY)) if (MENTION.test((await src.read(f)) ?? "")) hits.push(f)
      return hits.length ? { repo, hits } : null
    } catch (e) {
      if (!/仓库是空的/.test(e.message)) failed.push(`${repo}：${e.message}`)
      return null
    }
  })
  // A repo that could not be read may still be a consumer; say so instead of skipping it.
  if (failed.length) console.log(`\n读不了（没扫到，不代表没用）：\n  ${failed.join("\n  ")}`)
  const hits = found.filter(Boolean)
  if (!hits.length) return console.log("没有发现未登记的项目。")
  console.log("\n提到 jim-uiux 但没登记在 consumers.json 里：")
  for (const h of hits) console.log(`  ${h.repo}\n    ${h.hits.join("\n    ")}`)
  console.log("\n确认是下游项目后加进 consumers.json（字段见 references/adoption.md）。")
}

// ── main ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(name)
  if (i < 0) return undefined
  const v = args[i + 1]
  return v && !v.startsWith("--") ? v : ""
}
const flags = (name) => args.flatMap((a, i) => (a === name && args[i + 1] ? [args[i + 1]] : []))
const takesValue = new Set(["--path", "--diff", "--owner", "--since", "--affected"])
const positional = args.filter((a, i) => !a.startsWith("--") && !takesValue.has(args[i - 1]))

try {
  if (args.includes("--affected")) {
    await affected(flag("--affected") || "origin/main")
  } else if (args.includes("--discover")) {
    await discover(flags("--owner").length ? flags("--owner") : ["linjiejim"], flag("--since") || FIRST_RELEASE)
  } else {
    const [name] = positional
    const list = name ? consumers.filter((c) => c.name === name) : consumers
    if (!list.length) throw new Error(`consumers.json 里没有 ${name}；已登记：${consumers.map((c) => c.name).join("、")}`)
    const local = flag("--path")
    if (local !== undefined && !name) throw new Error("--path 要和项目名一起用")
    const diffItem = flag("--diff")
    if (diffItem !== undefined && !name) throw new Error("--diff 要和项目名一起用")
    console.log(`jim-uiux ${version}（本地源码）对照 ${list.length} 个下游项目`)
    const results = await pool(list, 4, (c) =>
      check(c, local ? localSource(local) : githubSource(c.repo), diffItem).catch((e) => ({ c, source: { label: c.repo }, error: e.message })),
    )
    if (diffItem === undefined) {
      results.forEach(report)
      candidates(results)
    }
  }
} catch (e) {
  console.error(`✗ ${e.message}`)
  if (/ENOENT.*gh|gh: /.test(e.message)) console.error("  需要 GitHub CLI：brew install gh && gh auth login")
  process.exit(1)
}
