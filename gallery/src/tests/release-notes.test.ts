/** Release notes: the CHANGELOG format reads the same in the app and in CI, and drafts come out in the template. */
import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { compareVersions, parseChangelog, unseenReleases, type Release } from "@/registry/jim/lib/changelog"
import {
  findSection,
  groupCommits,
  insertSection,
  nextVersion,
  parseCommit,
  renderBody,
  renderSection,
} from "@/registry/jim/scripts/release-notes.mjs"

const app = `# 更新记录

## 0.8.0 · 2026-11-23

项目栏更简洁，更新后能看到改了什么。

### 注意

- 「自动获取」默认关掉了，要用的话到 **设置 › 更新** 打开。

### 新增

- **更新内容。** 更新后第一次打开，右上角会说更新到了哪一版，点「查看更新内容」看这一版改了什么。
  设置里也能随时看。

### 修复

- 关窗后再打开，窗口回到原来的位置。 ([#12](https://github.com/o/r/pull/12))

## 0.7.6 · 2026-11-20

- 项目栏去掉标题，「添加」收进一个加号下拉。

## 0.7.5 · 2026-11-19

### 新增

- 菜单栏里列出所有项目。

---

更早的版本见 GitHub Releases。
`

describe("parseChangelog", () => {
  it("reads versions, dates, the summary, groups and items", () => {
    const [latest, mid, old] = parseChangelog(app)
    expect(latest).toMatchObject({ version: "0.8.0", date: "2026-11-23", summary: "项目栏更简洁，更新后能看到改了什么。" })
    expect(latest.groups.map((g) => [g.kind, g.title, g.items.length])).toEqual([
      ["heads-up", "注意", 1],
      ["new", "新增", 1],
      ["fixed", "修复", 1],
    ])
    // a continuation line joins its item; a trailing PR link is dropped
    expect(latest.groups[1].items[0]).toMatch(/看这一版改了什么。 设置里也能随时看。$/)
    expect(latest.groups[2].items[0]).toBe("关窗后再打开，窗口回到原来的位置。")
    // items before any ### are one untitled group
    expect(mid.groups).toEqual([{ kind: "other", title: "", items: ["项目栏去掉标题，「添加」收进一个加号下拉。"] }])
    // prose after the items belongs to the file, not to the release
    expect(old.summary).toBeUndefined()
  })

  it("reads release-please and Keep a Changelog headings", () => {
    const md = `# Changelog

## [4.2.0](https://github.com/linjiejim/greenhouse/compare/v4.1.0...v4.2.0) (2026-11-05)


### ⚠ BREAKING CHANGES

* **api:** GET /api/platform/apps returns 404.

### Added

* plugin media seams and the asset library plugin ([#105](https://github.com/linjiejim/greenhouse/issues/105)) ([1aaa8f5](https://github.com/linjiejim/greenhouse/commit/1aaa8f5e))

## [Unreleased]

## [4.0.0-rc.2](https://example.com) (2026-10-28)

### Fixed

* x
`
    const releases = parseChangelog(md)
    expect(releases.map((r) => [r.version, r.date])).toEqual([
      ["4.2.0", "2026-11-05"],
      ["4.0.0-rc.2", "2026-10-28"],
    ])
    expect(releases[0].groups.map((g) => g.kind)).toEqual(["heads-up", "new"])
    expect(releases[0].groups[1].items).toEqual(["plugin media seams and the asset library plugin"])
  })

  it("reads this repo's own CHANGELOG", () => {
    const own = parseChangelog(fs.readFileSync(path.resolve(import.meta.dirname, "../../../CHANGELOG.md"), "utf8"))
    expect(own.length).toBeGreaterThan(5)
    expect(own.every((r) => r.groups.length > 0)).toBe(true)
    expect(own.map((r) => r.version)).toEqual([...own.map((r) => r.version)].sort((a, b) => compareVersions(b, a)))
  })

  // the gallery shows CHANGELOG.en.md in English: a release written only in Chinese fails here
  it("CHANGELOG.en.md matches CHANGELOG.md, version for version and item for item", () => {
    const read = (file: string) => parseChangelog(fs.readFileSync(path.resolve(import.meta.dirname, "../../..", file), "utf8"))
    const shape = (releases: Release[]) =>
      releases.map((r) => ({ version: r.version, date: r.date, summary: !!r.summary, groups: r.groups.map((g) => [g.kind, g.items.length]) }))
    expect(shape(read("CHANGELOG.en.md"))).toEqual(shape(read("CHANGELOG.md")))
  })
})

describe("versions", () => {
  it("compares by SemVer precedence", () => {
    expect(compareVersions("0.10.0", "0.9.9")).toBe(1)
    expect(compareVersions("1.0.0-rc.2", "1.0.0")).toBe(-1)
    expect(compareVersions("1.0.0-rc.10", "1.0.0-rc.2")).toBe(1)
    expect(compareVersions("v1.2.3", "1.2.3")).toBe(0)
  })

  it("unseen: what came after the last version seen, up to this one, with something to say", () => {
    const releases = parseChangelog(app)
    expect(unseenReleases(releases, "0.7.5", "0.8.0").map((r) => r.version)).toEqual(["0.8.0", "0.7.6"])
    expect(unseenReleases(releases, "0.7.6", "0.7.6")).toEqual([])
    // a first install, a downgrade, junk in storage: nothing to catch up on
    expect(unseenReleases(releases, null, "0.8.0")).toEqual([])
    expect(unseenReleases(releases, "0.8.0", "0.7.6")).toEqual([])
    expect(unseenReleases(releases, "garbage", "0.8.0")).toEqual([])
  })

  it("unseen: a current build that isn't a version (dev, a commit) says nothing instead of throwing", () => {
    const releases = parseChangelog(app)
    expect(() => unseenReleases(releases, "0.7.5", "dev")).not.toThrow()
    expect(unseenReleases(releases, "0.7.5", "dev")).toEqual([])
    expect(unseenReleases(releases, "0.7.5", "1a2b3c4")).toEqual([])
    expect(unseenReleases(releases, "0.7.5", "")).toEqual([])
    // a hand-made list with a bad version skips that entry
    const odd = [...releases, { version: "next", groups: [{ kind: "new" as const, title: "", items: ["x"] }] }]
    expect(unseenReleases(odd, "0.7.5", "0.8.0").map((r) => r.version)).toEqual(["0.8.0", "0.7.6"])
  })
})

describe("release-notes.mjs", () => {
  const log = [
    { subject: "feat: 状态栏项目菜单、关窗不退出 (#9)", body: "" },
    { subject: "fix(ui): 拖完不再亮着焦点线", body: "" },
    { subject: "perf: 大仓库打开快一倍", body: "" },
    { subject: "feat(api)!: 去掉旧的导出接口", body: "BREAKING CHANGE: 旧的 /export 不再可用，改用「导出」菜单。" },
    { subject: "chore(release): 0.7.5", body: "" },
    { subject: "docs(site): 官网写上新功能", body: "" },
    { subject: "feat(site): 官网加了截图", body: "" },
    { subject: "Merge pull request #3 from x/y", body: "" },
    { subject: "feat: 状态栏项目菜单、关窗不退出", body: "" },
  ]

  it("keeps feat / fix / perf and breaking changes, drops the rest and duplicates", () => {
    expect(parseCommit("chore: bump deps")).toBeNull()
    expect(parseCommit("refactor!: drop the v1 reader")).toMatchObject({ kind: null, breaking: "drop the v1 reader" })
    expect(groupCommits(log, { skipScopes: ["site"] })).toEqual({
      "heads-up": ["旧的 /export 不再可用，改用「导出」菜单。"],
      new: ["状态栏项目菜单、关窗不退出", "去掉旧的导出接口"],
      improved: ["大仓库打开快一倍"],
      fixed: ["拖完不再亮着焦点线"],
    })
  })

  it("drafts a section in the template that the app reads back", () => {
    const groups = groupCommits(log, { skipScopes: ["site"] })
    const section = renderSection("0.8.0", "2026-11-23", renderBody(groups, "zh"))
    const [r] = parseChangelog(`# 更新记录\n\n${section}`)
    expect(r.groups.map((g) => [g.kind, g.title])).toEqual([
      ["heads-up", "注意"],
      ["new", "新增"],
      ["improved", "改进"],
      ["fixed", "修复"],
    ])
    expect(renderBody({ "heads-up": [], new: ["menu bar projects"], improved: [], fixed: [] }, "en")).toBe("### New\n\n- Menu bar projects")
  })

  it("bumps by what changed; breaking before 1.0 bumps the minor", () => {
    const none = { "heads-up": [], new: [], improved: [], fixed: [] }
    expect(nextVersion("0.7.6", { ...none, fixed: ["x"] })).toBe("0.7.7")
    expect(nextVersion("0.7.6", { ...none, new: ["x"] })).toBe("0.8.0")
    expect(nextVersion("0.7.6", { ...none, "heads-up": ["x"] })).toBe("0.8.0")
    expect(nextVersion("1.6.0", { ...none, "heads-up": ["x"] })).toBe("2.0.0")
  })

  it("finds a version's body without the rule that ends it, and inserts above the newest", () => {
    expect(findSection(app, "0.7.5")?.body).toBe("### 新增\n\n- 菜单栏里列出所有项目。")
    expect(findSection(app, "0.9.0")).toBeNull()
    const next = insertSection(app, renderSection("0.8.1", "2026-11-24", "- x"))
    expect(parseChangelog(next).map((r) => r.version)).toEqual(["0.8.1", "0.8.0", "0.7.6", "0.7.5"])
    expect(next.startsWith("# 更新记录\n\n## 0.8.1")).toBe(true)
  })
})
