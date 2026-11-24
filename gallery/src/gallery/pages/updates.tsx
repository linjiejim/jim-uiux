import * as React from "react"
import { RefreshCw } from "lucide-react"
import { parseChangelog, unseenReleases, type Release } from "@/registry/jim/lib/changelog"
import { s } from "@/registry/jim/lib/strings"
import { Button } from "@/registry/jim/ui/button"
import { ReleaseNotes, ReleaseNotesDialog } from "@/registry/jim/ui/release-notes"
import { SettingRow, SettingsSection } from "@/registry/jim/ui/settings"
import { Switch } from "@/registry/jim/ui/switch"
import { notify } from "@/registry/jim/ui/toast"
import { wait } from "../data"
import { DocPage, Example, Row, Rules, Spec } from "../doc"
import { kitReleases, RELEASES_URL } from "../changelog"
import { t } from "../i18n"

const version = __JIM_UIUX_VERSION__

// an app's CHANGELOG.md, written to the template
const sample = parseChangelog(
  t(
    `
## 0.8.0 · 2026-11-23

更新以后能看到改了什么，大仓库打开快了一倍。

### 注意

- 「自动获取」默认关掉了，要用的话到 **设置 › 更新** 打开。

### 新增

- **更新内容。** 更新后第一次打开，右上角会说更新到了哪一版，点「查看更新内容」看改了什么。设置里也能随时看。

### 改进

- **大仓库打开快一倍。** 提交列表先出前 200 条，其余在后台读。

### 修复

- 关窗后再打开，窗口回到原来的位置。
`,
    `
## 0.8.0 · 2026-11-23

See what changed after each update, and large repositories open twice as fast.

### Heads-up

- **Auto fetch** is now off by default. To use it, turn it on in **Settings › Updates**.

### New

- **Release notes.** The first time you open a new version, a note in the top right says which version you're on; click “See what's new” to read what changed. You can also find them in Settings anytime.

### Improved

- **Large repositories open twice as fast.** The commit list shows the first 200 commits right away and reads the rest in the background.

### Fixed

- Windows reopen where you left them.
`,
  ),
)
// what someone who last opened the gallery a few versions ago would be shown
const sinceOlder = kitReleases[3]?.version ?? null

export function UpdatesPattern() {
  const [shown, setShown] = React.useState<Release[] | null>(null)
  const [auto, setAuto] = React.useState(true)
  const [checking, setChecking] = React.useState(false)

  const updated = () => {
    const unseen = unseenReleases(kitReleases, sinceOlder, version)
    notify.info(s().updatedTo(version), { action: { label: s().seeWhatsNew, onClick: () => setShown(unseen) } })
  }
  const check = async () => {
    setChecking(true)
    await wait(900)
    setChecking(false)
    notify.success(t(`jim-uiux ${version} 是最新版本`, `jim-uiux ${version} is up to date`))
  }

  return (
    <DocPage
      title={t("版本更新", "Updates")}
      lead={t("新版本好了说一次要做什么，更新后说一次改了什么，都不打断手上的事。", "Say once what to do when a new version is ready, and once what changed after it. Never interrupt.")}
      info={t("改了什么只写在 CHANGELOG.md 一处，App 里的更新内容从它读出来。", "What changed is written once, in CHANGELOG.md; the app reads its release notes from there.")}
      source="registry/jim/ui/release-notes.tsx · lib/changelog.ts · scripts/release-notes.mjs"
    >
      <Example
        title={t("提示", "Prompts")}
        note={t(
          "「更新后第一次打开」显示的是 jim-uiux 自己的 CHANGELOG。",
          "“Open after updating” shows jim-uiux's own changelog, which is written in Chinese.",
        )}
        info={t(
          "等重启、等刷新的提示一直留着，同一件事只留一条；Web 不自动刷新，输入框里可能有没保存的内容。对话框列出上次看过之后的每一版，「注意」放在淡黄的提示框里。",
          "Restart and reload prompts stay until acted on, one per event; the web never reloads by itself, since a field may hold unsaved text. The dialog lists every version since the one last seen, with heads-up items in a yellow callout.",
        )}
      >
        <Row>
          <Button
            onClick={() =>
              notify.prompt("update-ready", t("Retrace 0.7.6 已下载，重启后生效", "Retrace 0.7.6 is downloaded. Restart to use it."), {
                label: t("重启", "Restart"),
                onClick: () => notify(t("正在重启", "Restarting")),
              })
            }
          >
            {t("桌面：已下载", "Desktop: downloaded")}
          </Button>
          <Button onClick={() => notify.prompt("jim:new-version", s().newVersionReady, { label: s().reload, onClick: () => window.location.reload() })}>
            {t("Web：已部署", "Web: deployed")}
          </Button>
          <Button onClick={updated}>{t("更新后第一次打开", "Open after updating")}</Button>
        </Row>
      </Example>

      <Example title={t("设置里", "In settings")}>
        <div className="max-w-xl">
          <SettingsSection variant="grouped" icon={<RefreshCw />} title={t("更新", "Updates")}>
            <SettingRow
              label={t("自动更新", "Automatic updates")}
              description={t("启动时和每隔几小时检查一次，装好后提示重启。", "Checks at launch and every few hours, then asks you to restart.")}
              control={<Switch aria-label={t("自动更新", "Automatic updates")} checked={auto} onCheckedChange={setAuto} />}
            />
            <SettingRow
              label={`jim-uiux ${version}`}
              control={
                <Button size="sm" loading={checking} onClick={() => void check()}>
                  {t("检查更新", "Check for updates")}
                </Button>
              }
            />
            <SettingRow
              label={s().whatsNew}
              description={t("每一版改了什么。", "What changed in each version.")}
              control={
                <Button size="sm" onClick={() => setShown(kitReleases)}>
                  {s().seeWhatsNew}
                </Button>
              }
            />
          </SettingsSection>
        </div>
      </Example>

      <Example
        title={t("更新内容", "Release notes")}
        note={t("一个应用 CHANGELOG.md 里的一节。", "One section of an app's CHANGELOG.md.")}
        info={t(
          "分组固定：注意、新增、改进、修复，没有内容的组不写。ReleaseNotes 也能直接放在关于页里。",
          "Groups are fixed: Heads-up, New, Improved, Fixed; leave out empty ones. ReleaseNotes also works on its own, on an About page.",
        )}
      >
        <div className="max-w-xl">
          <ReleaseNotes releases={sample} />
        </div>
      </Example>

      <Example title={t("怎么写", "How to write them")} canvas="none">
        <Rules
          dos={[
            t("写用的人现在能做什么，或者哪里不一样了", "Say what people can do now, or what's different"),
            t("界面上的名字原样写：「自动获取」「设置 › 更新」", "Use names exactly as on screen: “Auto fetch”, “Settings › Updates”"),
            t("修复写现在的样子：「窗口回到原来的位置」", "Write a fix as how it works now: “Windows reopen where you left them”"),
            t("用户要动手的事放进「注意」", "Put anything people must do under Heads-up"),
          ]}
          donts={[
            t("提交号、PR 号、组件名、接口、重构、依赖升级", "Commit hashes, PR numbers, component names, APIs, refactors, dependency bumps"),
            t("「修复了若干已知问题」「优化了用户体验」", "“Fixed some known issues”, “Improved the experience”"),
            t("启动时自己弹出更新内容", "Opening release notes on launch"),
            t("改已经发布的那一节", "Editing a section that's already released"),
          ]}
        />
      </Example>

      <Example title={t("什么时候用哪个", "Which to use when")} canvas="none">
        <Spec
          rows={[
            [
              t("后台下载", "Downloading in the background"),
              t("不说；用户点了「检查更新」才用 notify.loading，结果都要说", "Say nothing; use notify.loading only when the user clicked “Check for updates”, and always report the result"),
            ],
            [t("下载好，等重启", "Downloaded, waiting for a restart"), "notify.prompt"],
            [t("服务端有新版本", "New version deployed"), "useNewVersionPrompt"],
            [
              t("更新后第一次打开", "First open after updating"),
              t("useReleaseNotes，8 秒；首次安装、这一版没写更新内容时都不说", "useReleaseNotes, 8 seconds; nothing on a first install or when the version has no notes"),
            ],
          ]}
        />
      </Example>

      <ReleaseNotesDialog open={shown !== null} onOpenChange={(o) => !o && setShown(null)} releases={shown ?? []} moreHref={RELEASES_URL} />
    </DocPage>
  )
}
