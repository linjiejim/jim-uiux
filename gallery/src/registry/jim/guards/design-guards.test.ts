/**
 * Design guards: values come from the theme, overlays from the kit, copy says what it does.
 * Fix the code, or add `design-allow: <reason>` on the line (or the line above).
 */
import { describe, expect, it } from "vitest"
import path from "node:path"
import { isCommentLine, loadConfig, report, rules, scan, scanRules, sourceFiles } from "./guard-lib"

const cfg = loadConfig()
const files = sourceFiles(cfg)

const palette =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose"
const utilities = "bg|text|border|border-[trblxy]|ring|ring-offset|outline|fill|stroke|from|via|to|divide|decoration|placeholder|caret|accent|shadow"

describe("design guards", () => {
  it("scans some files", () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it("uses no raw colours outside the theme", () => {
    // Comments are skipped: "(#123)" there is an issue or PR number, not a colour.
    const hex = scan(files, /(^|[\s"'`(:,=[])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\w-])/, (_, line) => !isCommentLine(line))
    const fn = scan(files, /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(\s*[\d.]/)
    const named = scan(files, new RegExp(`(?<![\\w-])(?:${utilities})-(?:white|black|(?:${palette})-\\d{2,3})(?![\\w-])`))
    const arbitrary = scan(files, new RegExp(`(?<![\\w-])(?:${utilities})-\\[(?:#|rgb|hsl|oklch)`))
    const hits = [...hex, ...fn, ...named, ...arbitrary]
    expect(hits, `Raw colours — use semantic tokens (bg-background, text-muted-foreground, …):\n${report(hits)}`).toEqual([])
  })

  it("keeps text at 12px or larger, from the type scale", () => {
    const small = (px: string) => Number(px) < 12
    const tw = scan(files, /\btext-\[(\d+(?:\.\d+)?)px\]/, (m) => small(m[1]))
    const tw2 = scan(files, /\btext-\[\d/, () => true) // any arbitrary size, small or not
    const css = scan(files, /font-size:\s*(\d+(?:\.\d+)?)px/, (m) => small(m[1]))
    const rn = scan(files, /fontSize:\s*(\d+(?:\.\d+)?)/, (m) => small(m[1]))
    const tiny = scan(files, /\btext-(?:2xs|\[0?\.\d+rem\])/)
    const hits = [...new Map([...tw, ...tw2, ...css, ...rn, ...tiny].map((h) => [`${h.file}:${h.line}`, h])).values()]
    expect(hits, `Type outside the scale — use text-caption … text-hero:\n${report(hits)}`).toEqual([])
  })

  it("uses the kit for dialogs and overlays", () => {
    // Bare calls only: a method of the same name (notify.prompt) is fine; window.* is caught below.
    const native = scan(files, /(?<![.\w$])(?:alert|confirm|prompt)\(\s*["'`]/)
    const winNative = scan(files, /\bwindow\.(?:alert|confirm|prompt)\(/)
    const uiDirs = cfg.uiDirs.map((d) => path.normalize(d) + path.sep)
    const outsideKit = files.filter((f) => !uiDirs.some((d) => path.normalize(f).startsWith(d)))
    const handRolled = scan(outsideKit, /\bfixed\s+inset-0\b/)
    const hits = [...native, ...winNative, ...handRolled]
    expect(hits, `Use Dialog / Drawer / ConfirmDialog / notify from the kit:\n${report(hits)}`).toEqual([])
  })

  it("keeps weights at 600 or lighter", () => {
    const hits = scanRules(files, rules.weight)
    expect(hits, `Heavier than font-semibold — the type scale stops at 600:\n${report(hits)}`).toEqual([])
  })

  it("stacks on the layer tokens", () => {
    const hits = scanRules(files, rules.layer)
    expect(hits, `z-index 10+ — use z-(--z-sticky | --z-float | --z-overlay | --z-toast); z-[1]–z-[9] for order inside one component:\n${report(hits)}`).toEqual([])
  })

  it("takes durations and curves from the motion tokens", () => {
    const hits = scanRules(files, rules.motion)
    expect(hits, `Literal duration or curve — use duration-(--duration-*) and ease-out / ease-in / ease-drawer:\n${report(hits)}`).toEqual([])
  })

  it("adds no dark: colour overrides", () => {
    const hits = scanRules(files, rules.darkColour)
    expect(hits, `dark: colour override — the semantic tokens already change in dark mode:\n${report(hits)}`).toEqual([])
  })

  it("labels buttons with what they do", () => {
    const hits = scanRules(files, rules.vagueLabel)
    expect(hits, `Vague button label — use verb + object (「删除项目」「保存修改」):\n${report(hits)}`).toEqual([])
  })

  it("uses no emoji as icons", () => {
    const hits = scan(files, /\p{Emoji_Presentation}/u, (_m, line) => !line.trim().startsWith("//") && !line.trim().startsWith("*"))
    expect(hits, `Icons come from lucide-react, not emoji:\n${report(hits)}`).toEqual([])
  })
})
