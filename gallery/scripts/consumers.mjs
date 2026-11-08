// Check the downstream projects listed in ../../consumers.json against this
// registry: which version each one says it is on, which @jim files it has,
// which of those differ from the source here, and which UI components it
// added itself (candidates to bring back upstream).
//
//   pnpm consumers                          every project, read from GitHub (default branch)
//   pnpm consumers <name>                   one project
//   pnpm consumers <name> --path <dir>      read a local checkout instead (e.g. a sync branch)
//   pnpm consumers <name> --diff [item]     print the diffs: "-" is jim-uiux, "+" is the project
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
const { consumers } = JSON.parse(fs.readFileSync(path.join(repoRoot, "consumers.json"), "utf8"))
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

// adoption.md requires `@/*` → `./src/*`.
const aliasDir = (alias) => alias.replace(/^@\//, "src/")

function aliasesOf(cfg) {
  const a = cfg.aliases ?? {}
  return {
    ui: a.ui ?? `${a.components ?? "@/components"}/ui`,
    lib: a.lib ?? "@/lib",
    hooks: a.hooks ?? "@/hooks",
  }
}

function targetOf(file, cfg) {
  const a = aliasesOf(cfg)
  const base = path.posix.basename(file.path)
  if (file.type === "registry:ui") return `${aliasDir(a.ui)}/${base}`
  if (file.type === "registry:hook") return `${aliasDir(a.hooks)}/${base}`
  if (file.type === "registry:lib") return `${aliasDir(a.lib)}/${base}`
  // shadcn puts a file target under src/ in a src-dir project; "~/" means the project root.
  if (file.target.startsWith("~/")) return file.target.slice(2)
  return file.target.startsWith("src/") ? file.target : `src/${file.target}`
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

  const entries = registry.items.flatMap((item) =>
    (item.files ?? []).map((file) => ({ item: item.name, file, target: targetOf(file, cfg) })),
  )
  const have = new Set(files)
  const installed = entries.filter((e) => have.has(rel(e.target)))
  const installedNames = new Set(installed.map((e) => e.item))
  result.missing = registry.items.filter((i) => i.files?.length && !installedNames.has(i.name)).map((i) => i.name)

  result.files = await pool(installed, 4, async (e) => {
    const upstream = tidy(expected(fs.readFileSync(path.join(gallery, e.file.path), "utf8"), cfg))
    const project = tidy((await source.read(rel(e.target))) ?? "")
    return { ...e, upstream, project, ...(upstream === project ? { add: 0, del: 0 } : numstat(upstream, project)) }
  })

  const uiDir = rel(aliasDir(aliasesOf(cfg).ui)) + "/"
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
  console.log(`\n${c.name}  ·  ${c.mode}  ·  ${r.source.label}`)
  if (r.hasDesign === undefined) return console.log(`  ✗ ${r.error}`)
  const stamp = !r.hasDesign
    ? `找不到 ${c.design}`
    : r.stamped
      ? `${c.design} 标注 ${r.stamped}${r.stamped === version ? "" : `（当前 ${version}）`}`
      : `${c.design} 没写版本号（当前 ${version}）`
  console.log(`  ${stamp}`)
  if (r.error) return console.log(`  ✗ ${r.error}`)
  if (c.mode !== "registry") {
    console.log("  不装 registry：按 CHANGELOG 对照，改项目自己的 token 包和组件。")
    return
  }
  if (r.registryUrl !== "https://design.linjiejim.com/r/{name}.json") console.log(`  registry 地址：${r.registryUrl ?? "未配置"}`)
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
const takesValue = new Set(["--path", "--diff", "--owner", "--since"])
const positional = args.filter((a, i) => !a.startsWith("--") && !takesValue.has(args[i - 1]))

try {
  if (args.includes("--discover")) {
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
    if (diffItem === undefined) results.forEach(report)
  }
} catch (e) {
  console.error(`✗ ${e.message}`)
  if (/ENOENT.*gh|gh: /.test(e.message)) console.error("  需要 GitHub CLI：brew install gh && gh auth login")
  process.exit(1)
}
