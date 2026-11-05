import * as React from "react"
import { AppWindow, Bell, Palette } from "lucide-react"
import { useAppearance, type Appearance } from "@/registry/jim/lib/appearance"
import { Button } from "@/registry/jim/ui/button"
import { ConfirmDialog } from "@/registry/jim/ui/confirm-dialog"
import { Dialog, DialogBody, DialogContent, DialogHeader } from "@/registry/jim/ui/dialog"
import { Input } from "@/registry/jim/ui/input"
import { Page, PageHeader } from "@/registry/jim/ui/page"
import { Segmented } from "@/registry/jim/ui/segmented"
import { Select } from "@/registry/jim/ui/select"
import { SaveBar, SettingRow, SettingsSection } from "@/registry/jim/ui/settings"
import { Switch } from "@/registry/jim/ui/switch"
import { notify } from "@/registry/jim/ui/toast"
import { wait } from "../data"

const savedProfile = { name: "林杰", email: "jim@example.com" }

export function SettingsPattern() {
  const { preference, setAppearance } = useAppearance()
  const [profile, setProfile] = React.useState(savedProfile)
  const [base, setBase] = React.useState(savedProfile)
  const [saving, setSaving] = React.useState(false)
  const [notif, setNotif] = React.useState({ task: true, mention: true, digest: false })
  const [lang, setLang] = React.useState("zh-CN")
  const [deleting, setDeleting] = React.useState(false)
  const [prefsOpen, setPrefsOpen] = React.useState(false)
  const [browser, setBrowser] = React.useState("system")
  const dirty = profile.name !== base.name || profile.email !== base.email

  return (
    <Page width="narrow">
      <PageHeader title="设置" />

      <SettingsSection title="账户">
        <SettingRow
          label="名称"
          htmlFor="s-name"
          control={<Input id="s-name" className="w-64 max-sm:w-full" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />}
        />
        <SettingRow
          label="邮箱"
          description="用于登录和接收通知"
          htmlFor="s-email"
          control={<Input id="s-email" type="email" className="w-64 max-sm:w-full" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />}
        />
      </SettingsSection>

      <SettingsSection title="偏好">
        <SettingRow
          label="外观"
          control={
            <Segmented<Appearance>
              size="sm"
              aria-label="外观"
              value={preference}
              onValueChange={setAppearance}
              options={[
                { value: "system", label: "跟随系统" },
                { value: "light", label: "浅色" },
                { value: "dark", label: "深色" },
              ]}
            />
          }
        />
        <SettingRow
          label="语言"
          control={
            <Select
              className="w-40 max-sm:w-full"
              aria-label="语言"
              value={lang}
              onValueChange={(v) => {
                setLang(v)
                notify.success("语言已切换，刷新后生效")
              }}
              options={[
                { value: "zh-CN", label: "简体中文" },
                { value: "en", label: "English" },
                { value: "ja", label: "日本語" },
              ]}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="通知">
        {(
          [
            ["task", "任务分配给我", undefined],
            ["mention", "有人提到我", undefined],
            ["digest", "每周摘要", "每周一早上发送上周进展"],
          ] as const
        ).map(([k, label, desc]) => (
          <SettingRow
            key={k}
            label={label}
            description={desc}
            control={<Switch aria-label={label} checked={notif[k]} onCheckedChange={(v) => setNotif({ ...notif, [k]: v })} />}
          />
        ))}
      </SettingsSection>

      <SettingsSection title="危险操作">
        <SettingRow
          label="删除工作区"
          description="所有项目、文件和成员都会被删除，无法恢复。"
          control={
            <Button variant="secondary" className="text-destructive" onClick={() => setDeleting(true)}>
              删除工作区
            </Button>
          }
        />
      </SettingsSection>

      <SettingsSection title="在弹框里">
        <SettingRow
          label="桌面 App 的偏好设置"
          description={'弹框里用分组卡片（variant="grouped"），一眼看出哪几行是一组。'}
          control={
            <Button variant="secondary" onClick={() => setPrefsOpen(true)}>
              打开偏好设置
            </Button>
          }
        />
      </SettingsSection>

      <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent size="lg">
          <DialogHeader title="设置" />
          <DialogBody className="pb-5">
            <SettingsSection variant="grouped" icon={<Palette />} title="外观">
              <SettingRow
                label="主题"
                control={
                  <Segmented<Appearance>
                    size="sm"
                    aria-label="主题"
                    value={preference}
                    onValueChange={setAppearance}
                    options={[
                      { value: "system", label: "跟随系统" },
                      { value: "light", label: "浅色" },
                      { value: "dark", label: "深色" },
                    ]}
                  />
                }
              />
            </SettingsSection>
            <SettingsSection variant="grouped" icon={<Bell />} title="通知">
              <SettingRow label="任务分配给我" control={<Switch aria-label="任务分配给我" checked={notif.task} onCheckedChange={(v) => setNotif({ ...notif, task: v })} />} />
              <SettingRow label="每周摘要" description="每周一早上发送上周进展" control={<Switch aria-label="每周摘要" checked={notif.digest} onCheckedChange={(v) => setNotif({ ...notif, digest: v })} />} />
            </SettingsSection>
            <SettingsSection variant="grouped" icon={<AppWindow />} title="打开方式">
              <SettingRow
                label="浏览器"
                description="打开文档里的网页链接"
                control={
                  <Select
                    className="w-44"
                    aria-label="浏览器"
                    value={browser}
                    onValueChange={setBrowser}
                    options={[
                      { value: "system", label: "系统默认浏览器" },
                      { value: "safari", label: "Safari" },
                      { value: "chrome", label: "Google Chrome" },
                    ]}
                  />
                }
              />
            </SettingsSection>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onDiscard={() => setProfile(base)}
        onSave={async () => {
          setSaving(true)
          await wait(700)
          setBase(profile)
          setSaving(false)
          notify.success("已保存")
        }}
      />

      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        tone="danger"
        title="删除工作区「Acme」？"
        description="所有项目、文件和成员都会被删除，无法恢复。"
        confirmLabel="删除工作区"
        onConfirm={async () => {
          await wait(800)
          notify("演示：没有真的删除")
        }}
      />
    </Page>
  )
}
