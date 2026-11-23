import * as React from "react"
import { RefreshCw } from "lucide-react"
import { parseChangelog, unseenReleases, type Release } from "@/registry/jim/lib/changelog"
import { Button } from "@/registry/jim/ui/button"
import { ReleaseNotes, ReleaseNotesDialog } from "@/registry/jim/ui/release-notes"
import { SettingRow, SettingsSection } from "@/registry/jim/ui/settings"
import { Switch } from "@/registry/jim/ui/switch"
import { notify } from "@/registry/jim/ui/toast"
import { wait } from "../data"
import { DocPage, Example, Row, Rules, Spec } from "../doc"
import { kitReleases, RELEASES_URL } from "../changelog"

const version = __JIM_UIUX_VERSION__

// an app's CHANGELOG.md, written to the template
const sample = parseChangelog(`
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
`)
// what someone who last opened the gallery a few versions ago would be shown
const sinceOlder = kitReleases[3]?.version ?? null

export function UpdatesPattern() {
  const [shown, setShown] = React.useState<Release[] | null>(null)
  const [auto, setAuto] = React.useState(true)
  const [checking, setChecking] = React.useState(false)

  const updated = () => {
    const unseen = unseenReleases(kitReleases, sinceOlder, version)
    notify.info(`已更新到 ${version}`, { action: { label: "查看更新内容", onClick: () => setShown(unseen) } })
  }
  const check = async () => {
    setChecking(true)
    await wait(900)
    setChecking(false)
    notify.success(`jim-uiux ${version} 是最新版本`)
  }

  return (
    <DocPage
      title="版本更新"
      lead="有新版本时说一次要做什么，更新以后说一次改了什么。都不打断手上的事；改了什么只写在 CHANGELOG.md 一处。"
      source="registry/jim/ui/release-notes.tsx · lib/changelog.ts · scripts/release-notes.mjs"
    >
      <Example
        title="更新之后"
        note="第一次以新版本打开时，Toast 说一句「已更新到 x」，8 秒，带「查看更新内容」。首次安装、这一版没写更新内容时都不说。对话框列出上次看过之后的每一版，「注意」放在淡黄的提示框里。下面用的是 jim-uiux 自己的 CHANGELOG。"
      >
        <Row>
          <Button onClick={updated}>更新后第一次打开</Button>
        </Row>
      </Example>

      <Example title="等你重启、等你刷新" note="新版本已经在手边，只差用户动一下：一直留着，同一件事只留一条。Web 不自动刷新，输入框里可能有没保存的内容。">
        <Row>
          <Button onClick={() => notify.prompt("update-ready", "Retrace 0.7.6 已下载，重启后生效", { label: "重启", onClick: () => notify("正在重启") })}>
            桌面：已下载
          </Button>
          <Button onClick={() => notify.prompt("jim:new-version", "新版本已发布，刷新后生效", { label: "刷新页面", onClick: () => window.location.reload() })}>
            Web：已部署
          </Button>
        </Row>
      </Example>

      <Example title="设置里" note="「更新」一组：自动更新的开关、当前版本和「检查更新」、随时能看的更新内容。用户自己点的检查，结果都要说；自动检查只在装好以后说。">
        <div className="max-w-xl">
          <SettingsSection variant="grouped" icon={<RefreshCw />} title="更新">
            <SettingRow
              label="自动更新"
              description="启动时和每隔几小时检查一次，装好后提示重启。"
              control={<Switch checked={auto} onCheckedChange={setAuto} />}
            />
            <SettingRow
              label={`jim-uiux ${version}`}
              control={
                <Button size="sm" loading={checking} onClick={() => void check()}>
                  检查更新
                </Button>
              }
            />
            <SettingRow
              label="更新内容"
              description="每一版改了什么。"
              control={
                <Button size="sm" onClick={() => setShown(kitReleases)}>
                  查看更新内容
                </Button>
              }
            />
          </SettingsSection>
        </div>
      </Example>

      <Example title="更新内容" note="一个应用的 CHANGELOG.md 里的一节。分组固定：注意、新增、改进、修复，没有内容的组不写；「注意」是用的人要动手的事。ReleaseNotes 也能直接放在关于页里。">
        <div className="max-w-xl">
          <ReleaseNotes releases={sample} />
        </div>
      </Example>

      <Example title="什么时候说什么" canvas="none">
        <Spec
          rows={[
            ["后台下载", "不说；用户点了「检查更新」才用 notify.loading"],
            ["装好了等重启", "notify.prompt：「Retrace 0.7.6 已下载，重启后生效 · 重启」"],
            ["服务端是新版本", "useNewVersionPrompt：「新版本已发布，刷新后生效 · 刷新页面」"],
            ["更新后第一次打开", "useReleaseNotes：「已更新到 0.7.6 · 查看更新内容」，8 秒"],
            ["设置", "版本号、检查更新、查看更新内容（全部版本）"],
          ]}
        />
      </Example>

      <Example title="怎么写" canvas="none">
        <Rules
          dos={[
            "写用的人现在能做什么，或者哪里不一样了",
            "界面上的名字原样写：「自动获取」「设置 › 更新」",
            "修复写现在的样子：「窗口回到原来的位置」",
            "用户要动手的事放进「注意」",
          ]}
          donts={[
            "提交号、PR 号、组件名、接口、重构、依赖升级",
            "「修复了若干已知问题」「优化了用户体验」",
            "启动时自己弹出更新内容",
            "改已经发布的那一节",
          ]}
        />
      </Example>

      <ReleaseNotesDialog open={shown !== null} onOpenChange={(o) => !o && setShown(null)} releases={shown ?? []} moreHref={RELEASES_URL} />
    </DocPage>
  )
}
