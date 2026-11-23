# 版本更新：提示与更新内容

用的人要知道两件事：有新版本了，要做什么（重启、刷新）；更新以后，改了什么。两件事都只说一次，都不打断手上的事。

改了什么只写一份：仓库根目录的 `CHANGELOG.md`。GitHub Release 的说明、更新清单里的 `notes`、应用里的「更新内容」，都从这一份来。

## 什么时候说什么

| 时机 | 说法 | 组件 |
| --- | --- | --- |
| 后台发现新版本，正在下载 | 不说 | — |
| 用户点了「检查更新」 | 下载中：「正在下载 Retrace 0.7.6…」；已是最新：「Retrace 0.7.5 是最新版本」；失败：原因 + 重试 | `notify.loading` / `notify.success` / `notify.error` |
| 自动检查失败 | 不说，记日志 | — |
| 桌面应用：新版本已经装好，等重启 | 「Retrace 0.7.6 已下载，重启后生效 · 重启」，一直留着 | `notify.prompt`，标题栏里也可以放一个「重启以更新」按钮 |
| Web：服务端已经是新版本，页面还是旧的 | 「新版本已发布，刷新后生效 · 刷新页面」，一直留着；不自动刷新，输入框里可能有没保存的内容 | `useNewVersionPrompt` |
| 第一次以新版本打开 | 「已更新到 0.7.6 · 查看更新内容」，8 秒 | `useReleaseNotes`（`notify.info` 带动作） |
| 点了「查看更新内容」 | 对话框列出上次看过之后的每一版，新的在前 | `ReleaseNotesDialog` |
| 设置里 | 「更新」一组：版本号、「检查更新」、「查看更新内容」（全部版本） | `SettingsSection` + `openAll()` |

- 首次安装不说「已更新」。新版本的更新内容里一条都没有时，也不说。
- 更新内容从不自己弹出来，只从 Toast 或设置里打开。启动时弹框盖住工作区，是这里最常见的打扰。
- 跳过了几版（上次是 0.7.3，这次是 0.7.6）：对话框里 0.7.4、0.7.5、0.7.6 都列出来，Toast 只说最新的版本号。
- 「注意」那一组（用户要做的事：重新登录、重新授权、某个设置换了位置）放在淡黄的 `Callout` 里，排在每一版最前面。
- 原生移动端：商店版本的「新功能」文字用同一节，OTA 更新后和 web 一样说「已更新」。
- 嵌入页、只读大屏这类地方：`useReleaseNotes({ toast: false })`，只记版本，不提示。

## 更新内容的写法

`CHANGELOG.md`，新的版本在上：

```markdown
# 更新记录

## 0.8.0 · 2026-11-23

一句话说这一版最值得知道的事（可选）。

### 注意

- 「自动获取」默认关掉了，要用的话到 **设置 › 更新** 打开。

### 新增

- **更新内容。** 更新后第一次打开，右上角会说更新到了哪一版，点「查看更新内容」看改了什么。

### 改进

- **大仓库打开快一倍。** 提交列表先出前 200 条，其余在后台读。

### 修复

- 关窗后再打开，窗口回到原来的位置。
```

- 四组，顺序固定：注意、新增、改进、修复（英文：Heads-up、New、Improved、Fixed）。没有内容的组不写。
- 一条说一件事：用的人现在能做什么，或者哪里不一样了。按钮、菜单、设置写界面上的原名，用「」或加粗。
- 可以用加粗的短句开头（「**更新内容。**」），后面一两句补充。一条不超过两句。
- 不写给开发者看的东西：提交号、PR 号、模块名、组件名、接口、重构、依赖升级、测试、CI。这些留在提交记录里。
- 修复写现在的样子（「窗口回到原来的位置」），不写「修复了窗口位置错乱的问题」。
- 文案规则同 `content.md`：不用感叹号，不写「全新」「重磅」「优化了体验」。
- 两种语言的应用：`CHANGELOG.md` 用 README 的语言，另一种写在 `CHANGELOG.<语言>.md`（和 `README.zh-CN.md` 一样），版本和分组一一对应。
- 给开发者用的库（jim-uiux 自己）可以不分组，直接列；但「升级时注意」照样要写。
- 已经发布的那一节不再改。写错了，在下一版里说。

`lib/changelog.ts` 的 `parseChangelog` 按这个格式读，也认 Keep a Changelog（Added / Changed / Fixed）和 release-please 生成的标题（`## [4.2.0](…) (2026-11-05)`），末尾的提交和 PR 链接在应用里不显示。

## 流程：从提交到应用里

1. **平时**：PR 标题就是 squash 后的提交说明，按 Conventional Commits 写，冒号后面写成用的人看得懂的一句话（「feat: 状态栏里列出所有项目」，不写「feat: add TrayMenu component」）。`feat`、`fix`、`perf` 会进更新内容的草稿，`chore`、`docs`、`test`、`ci`、`build`、`refactor` 不进。破坏性改动加 `!`，或在正文写 `BREAKING CHANGE: 用户要做什么`，它会进「注意」。
2. **发版**：
   ```bash
   node scripts/release-notes.mjs draft --write    # 从上一个 tag 以来的提交起草下一节，版本号按改动推算
   ```
   把草稿改成人话（合并同一件事、挪到对的组、删掉用的人感觉不到的），版本号写进 package.json 等处，提交 `chore(release): X.Y.Z`，打 tag。
3. **CI**（打 tag 触发的发布工作流）：
   ```bash
   node scripts/release-notes.mjs notes "$VERSION" --fallback > notes.md
   ```
   - 用作 GitHub Release 的说明（`gh release create --notes-file notes.md`），后面可以接下载表。草稿已经存在时不覆盖：发布前手改过的说明要留着。
   - 写进更新清单的 `notes`（Tauri 的 `latest.json`，自己签的清单也一样）。`notes` 不在签名范围里，改它不影响校验。
   - `--fallback`：这一版在 CHANGELOG 里没有，就从提交起草，并在工作流里留一条警告。发布永远不会是空白，但这只是兜底，草稿要在发布前改好。
   - 两种语言：`--also CHANGELOG.zh-CN.md`，两节之间用一条分隔线。
4. **应用**：构建时把 `CHANGELOG.md` 打进包里（Vite：`import changelog from "../CHANGELOG.md?raw"`），`parseChangelog` 读出来交给 `useReleaseNotes`。新版本自己带着自己的更新内容，不用联网。
5. **守门**：PR 的检查里跑 `node scripts/release-notes.mjs check`：package.json 的版本号在 CHANGELOG 里没有对应的一节就失败。

用 release-please 的项目，第 2、3 步它已经做了：Release PR 里的 CHANGELOG 就是草稿，合并前把条目改成人话，再合。它的分组（Added / Fixed）照样能读。

每次 push 都部署、没有版本号的 web 应用：只做「新版本已发布 · 刷新页面」（构建时把提交号写进 `/version.json` 和包里，`useNewVersionPrompt({ current: 提交号 })`）。要给用的人看更新内容，就开始按版本发，走上面的流程。

## 接入

```bash
npx shadcn add @jim/release-notes @jim/release-notes-script
```

- `@jim/release-notes`：`ReleaseNotesDialog`、`ReleaseNotes`、`useReleaseNotes`、`useNewVersionPrompt`，带上 `@jim/changelog`（`parseChangelog`、`unseenReleases`）。
- `@jim/release-notes-script`：`scripts/release-notes.mjs`，不依赖任何包。像 `@jim/guards` 一样不在 `@jim/all` 里。
- `aligned` 项目照这里的规则自己实现；脚本直接拷（`https://design.linjiejim.com/r/release-notes-script.json` 里有原文）。

```tsx
import changelog from "../CHANGELOG.md?raw"
import { parseChangelog } from "@/lib/changelog"
import { ReleaseNotesDialog, useReleaseNotes } from "@/components/ui/release-notes"

const releases = parseChangelog(changelog)

export function WhatsNew({ version }: { version: string | null }) {
  const notes = useReleaseNotes({ version, releases })
  return <ReleaseNotesDialog {...notes.dialog} moreHref="https://github.com/<owner>/<repo>/releases" />
}
```

在根组件里渲染一次，挨着 `<Toaster />`。设置里的「查看更新内容」调 `notes.openAll()`。版本号：Tauri 用 `getVersion()`，Electron 用 `app.getVersion()`，web 在构建时注入（`define: { __APP_VERSION__: … }`）。
