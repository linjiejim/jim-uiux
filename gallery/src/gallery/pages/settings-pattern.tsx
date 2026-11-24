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
import { t } from "../i18n"

const savedProfile = { name: t("林杰", "Jim Lin"), email: "jim@example.com" }

const appearanceOptions: { value: Appearance; label: string }[] = [
  { value: "system", label: t("跟随系统", "System") },
  { value: "light", label: t("浅色", "Light") },
  { value: "dark", label: t("深色", "Dark") },
]

const L = {
  task: t("任务分配给我", "Task assigned to me"),
  mention: t("有人提到我", "Someone mentions me"),
  digest: t("每周摘要", "Weekly digest"),
  digestDesc: t("每周一早上发送上周进展", "Last week's progress, every Monday morning"),
  deleteBody: t("所有项目、文件和成员都会被删除，无法恢复。", "All projects, files and members will be deleted. This can't be undone."),
  deleteWorkspace: t("删除工作区", "Delete workspace"),
}

export function SettingsPattern() {
  const { preference, setAppearance } = useAppearance()
  const [profile, setProfile] = React.useState(savedProfile)
  const [base, setBase] = React.useState(savedProfile)
  const [saving, setSaving] = React.useState(false)
  const [notif, setNotif] = React.useState({ task: true, mention: true, digest: false })
  const [language, setLanguage] = React.useState(t("zh-CN", "en"))
  const [deleting, setDeleting] = React.useState(false)
  const [prefsOpen, setPrefsOpen] = React.useState(false)
  const [browser, setBrowser] = React.useState("system")
  const dirty = profile.name !== base.name || profile.email !== base.email

  return (
    <Page width="narrow">
      <PageHeader
        title={t("设置", "Settings")}
        info={
          <div className="flex flex-col gap-2">
            {t(
              '开关和选择立即生效；改了文字，底部出现保存条。弹框里的设置用分组卡片（variant="grouped"）。',
              'Switches and selects apply at once; edited text waits for the save bar at the bottom. Settings in a dialog use grouped cards (variant="grouped").',
            )}
            <code className="font-mono text-caption text-faint-foreground">references/patterns/settings.md</code>
          </div>
        }
      />

      <SettingsSection title={t("账户", "Account")}>
        <SettingRow
          label={t("名称", "Name")}
          htmlFor="s-name"
          control={<Input id="s-name" className="w-64 max-sm:w-full" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />}
        />
        <SettingRow
          label={t("邮箱", "Email")}
          description={t("用于登录和接收通知", "For signing in and notifications")}
          htmlFor="s-email"
          control={<Input id="s-email" type="email" className="w-64 max-sm:w-full" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />}
        />
      </SettingsSection>

      <SettingsSection title={t("偏好", "Preferences")}>
        <SettingRow
          label={t("外观", "Appearance")}
          control={
            <Segmented<Appearance> size="sm" aria-label={t("外观", "Appearance")} value={preference} onValueChange={setAppearance} options={appearanceOptions} />
          }
        />
        <SettingRow
          label={t("语言", "Language")}
          control={
            <Select
              className="w-40 max-sm:w-full"
              aria-label={t("语言", "Language")}
              value={language}
              onValueChange={(v) => {
                setLanguage(v)
                notify.success(t("语言已切换，刷新后生效", "Language changed. Refresh to apply."))
              }}
              // each language in its own name
              options={[
                { value: "zh-CN", label: "简体中文" },
                { value: "en", label: "English" },
                { value: "ja", label: "日本語" },
              ]}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title={t("通知", "Notifications")}>
        {(
          [
            ["task", L.task, undefined],
            ["mention", L.mention, undefined],
            ["digest", L.digest, L.digestDesc],
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

      <SettingsSection title={t("危险操作", "Danger zone")}>
        <SettingRow
          label={L.deleteWorkspace}
          description={L.deleteBody}
          control={
            <Button variant="secondary" className="text-destructive" onClick={() => setDeleting(true)}>
              {L.deleteWorkspace}
            </Button>
          }
        />
      </SettingsSection>

      <SettingsSection title={t("在弹框里", "In a dialog")}>
        <SettingRow
          label={t("桌面 App 的偏好设置", "Desktop app preferences")}
          control={
            <Button variant="secondary" onClick={() => setPrefsOpen(true)}>
              {t("打开偏好设置", "Open preferences")}
            </Button>
          }
        />
      </SettingsSection>

      <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent size="lg">
          <DialogHeader title={t("设置", "Settings")} />
          <DialogBody className="pb-5">
            <SettingsSection variant="grouped" icon={<Palette />} title={t("外观", "Appearance")}>
              <SettingRow
                label={t("主题", "Theme")}
                control={
                  <Segmented<Appearance> size="sm" aria-label={t("主题", "Theme")} value={preference} onValueChange={setAppearance} options={appearanceOptions} />
                }
              />
            </SettingsSection>
            <SettingsSection variant="grouped" icon={<Bell />} title={t("通知", "Notifications")}>
              <SettingRow label={L.task} control={<Switch aria-label={L.task} checked={notif.task} onCheckedChange={(v) => setNotif({ ...notif, task: v })} />} />
              <SettingRow
                label={L.digest}
                description={L.digestDesc}
                control={<Switch aria-label={L.digest} checked={notif.digest} onCheckedChange={(v) => setNotif({ ...notif, digest: v })} />}
              />
            </SettingsSection>
            <SettingsSection variant="grouped" icon={<AppWindow />} title={t("打开方式", "Open with")}>
              <SettingRow
                label={t("浏览器", "Browser")}
                description={t("打开文档里的网页链接", "For web links in documents")}
                control={
                  <Select
                    className="w-44"
                    aria-label={t("浏览器", "Browser")}
                    value={browser}
                    onValueChange={setBrowser}
                    options={[
                      { value: "system", label: t("系统默认浏览器", "System default") },
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
          notify.success(t("已保存", "Saved"))
        }}
      />

      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        tone="danger"
        title={t("删除工作区「Acme」？", "Delete workspace “Acme”?")}
        description={L.deleteBody}
        confirmLabel={L.deleteWorkspace}
        onConfirm={async () => {
          await wait(800)
          notify(t("演示：没有真的删除", "Demo: nothing was deleted"))
        }}
      />
    </Page>
  )
}
