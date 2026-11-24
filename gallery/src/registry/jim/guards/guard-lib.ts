/**
 * Shared helpers for the design guards. Config comes from
 * design-guard.config.json at the project root (all keys optional):
 *   sourceDirs   folders to scan                      ["src"]
 *   themeFiles   files allowed to hold raw values     ["src/styles/jim-theme.css"]
 *   presetFiles  preset css files or folders          ["src/styles/presets"]
 *   uiDirs       kit folders allowed to build overlays ["src/components/ui"]
 *   ignore       path substrings to skip              []
 * Any line can opt out with a reason: `design-allow: <why>` on that line or
 * the line above. No reason, no exception.
 */
import fs from "node:fs"
import path from "node:path"

export type GuardConfig = {
  sourceDirs: string[]
  themeFiles: string[]
  presetFiles: string[]
  uiDirs: string[]
  ignore: string[]
}

export const root = process.cwd()

export function loadConfig(): GuardConfig {
  const file = path.join(root, "design-guard.config.json")
  const user = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {}
  return {
    sourceDirs: ["src"],
    themeFiles: ["src/styles/jim-theme.css"],
    presetFiles: ["src/styles/presets"],
    uiDirs: ["src/components/ui"],
    ignore: [],
    ...user,
  }
}

const exts = /\.(tsx?|jsx?|vue|svelte|css|scss)$/

export function walk(dir: string, out: string[] = []): string[] {
  const abs = path.join(root, dir)
  if (!fs.existsSync(abs)) return out
  if (fs.statSync(abs).isFile()) return exts.test(abs) ? [...out, dir] : out
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue
    const rel = path.join(dir, e.name)
    if (e.isDirectory()) walk(rel, out)
    else if (exts.test(e.name)) out.push(rel)
  }
  return out
}

export function themePaths(cfg: GuardConfig) {
  return [...cfg.themeFiles, ...cfg.presetFiles.flatMap((p) => walk(p))].map((p) => path.normalize(p))
}

export function sourceFiles(cfg: GuardConfig) {
  const theme = new Set(themePaths(cfg))
  return cfg.sourceDirs
    .flatMap((d) => walk(d))
    .filter((f) => !theme.has(path.normalize(f)))
    .filter((f) => !/\.test\.[tj]sx?$/.test(f) && !f.includes(`${path.sep}guards${path.sep}`))
    .filter((f) => !cfg.ignore.some((i) => f.includes(i)))
}

export type Hit = { file: string; line: number; text: string }

/** Lines matching `re`, minus those carrying a `design-allow: reason`. */
export function scan(files: string[], re: RegExp, keep: (m: RegExpMatchArray, line: string) => boolean = () => true): Hit[] {
  const hits: Hit[] = []
  for (const file of files) {
    const lines = fs.readFileSync(path.join(root, file), "utf8").split("\n")
    lines.forEach((line, i) => {
      const allowed = /design-allow:\s*\S/.test(line) || /design-allow:\s*\S/.test(lines[i - 1] ?? "")
      if (allowed) return
      for (const m of line.matchAll(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"))) {
        if (keep(m, line)) {
          hits.push({ file, line: i + 1, text: line.trim().slice(0, 140) })
          break
        }
      }
    })
  }
  return hits
}

/** A pattern plus an optional check on the match; a line hits when any match passes. */
export type Rule = { re: RegExp; keep?: (m: RegExpMatchArray, line: string) => boolean }

export function lineMatches(rule: Rule, line: string) {
  const re = new RegExp(rule.re.source, rule.re.flags.includes("g") ? rule.re.flags : rule.re.flags + "g")
  return [...line.matchAll(re)].some((m) => (rule.keep ? rule.keep(m, line) : true))
}

/** Lines hit by any of `rules` (once per line), minus comment-only lines and `design-allow` lines. */
export function scanRules(files: string[], rules: Rule[]): Hit[] {
  const seen = new Map<string, Hit>()
  for (const rule of rules)
    for (const h of scan(files, rule.re, (m, line) => !isCommentLine(line) && (rule.keep ? rule.keep(m, line) : true)))
      seen.set(`${h.file}:${h.line}`, h)
  return [...seen.values()]
}

const colorUtilities = "bg|text|border|border-[trblxy]|ring|ring-offset|outline|fill|stroke|from|via|to|divide|decoration|placeholder|caret|accent|shadow"

/**
 * Rules added in 1.10.0. Each one has bad and good fixtures in the kit's own tests.
 *   weight      nothing heavier than 600 (font-semibold): the type scale stops there
 *   layer       z-index 10 and up takes a layer token: z-(--z-sticky | float | overlay | toast);
 *               z-[1]–z-[9] stay free for order inside one component
 *   motion      durations and curves come from --duration-* / --ease-*, not literals
 *   darkColour  no dark: colour overrides; the tokens already flip, a dark: tweak drifts
 *   vagueLabel  buttons say what they do: not 确定 / 提交 / OK / Submit
 */
export const rules: Record<"weight" | "layer" | "motion" | "darkColour" | "vagueLabel", Rule[]> = {
  weight: [
    { re: /(?<![\w-])font-(?:bold|extrabold|black)(?![\w-])/ },
    { re: /font-weight:\s*(?:[7-9]00|bold(?:er)?)\b/ },
    { re: /fontWeight:\s*["']?(?:[7-9]00\b|bold)/ },
  ],
  layer: [
    { re: /(?<![\w-])z-(\d+)(?![\w-])/, keep: (m) => Number(m[1]) >= 10 },
    { re: /(?<![\w-])z-\[(\d+)\]/, keep: (m) => Number(m[1]) >= 10 },
    { re: /z-index:\s*(\d+)/, keep: (m) => Number(m[1]) >= 10 },
    { re: /zIndex:\s*["']?(\d+)/, keep: (m) => Number(m[1]) >= 10 },
  ],
  motion: [
    { re: /(?<![\w-])(?:duration|delay)-(?:\d+|\[[^\]]+\])(?![\w-])/ },
    { re: /(?<![\w-])ease-\[[^\]]+\]/ },
    { re: /(?:transition|animation)(?:-duration|-delay)?:[^;{}]*?\b\d+(?:\.\d+)?m?s\b/ },
  ],
  darkColour: [{ re: new RegExp(`(?<![\\w-])dark:(?:[\\w\\[\\]=-]+:)*(?:${colorUtilities})-`) }],
  vagueLabel: [
    { re: /<Button\b[^>]*>\s*(?:确定|提交|OK|Ok|Submit)\s*<\/Button>/ },
    { re: /\b(?:confirmLabel|actionLabel|submitLabel)=["'](?:确定|提交|OK|Ok|Submit)["']/ },
  ],
}

/** A line that is only a comment (`//`, `/*`, ` * `, `<!--`): it can't style anything. */
export function isCommentLine(line: string) {
  return /^\s*(?:\/\/|\/\*|\*|<!--)/.test(line)
}

export function report(hits: Hit[]) {
  return hits.map((h) => `  ${h.file}:${h.line}  ${h.text}`).join("\n")
}
