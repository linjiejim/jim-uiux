import * as React from "react"
import { Bell, ChevronDown, Folder, Home, Inbox, MoreHorizontal, Plus, Search, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { CHART_SERIES, catClass } from "@/registry/jim/lib/categorical"
import { Badge, StatusDot } from "@/registry/jim/ui/badge"
import { Button, IconButton } from "@/registry/jim/ui/button"
import { Callout } from "@/registry/jim/ui/callout"
import { Checkbox } from "@/registry/jim/ui/checkbox"
import { Field } from "@/registry/jim/ui/field"
import { Input } from "@/registry/jim/ui/input"
import { Kbd } from "@/registry/jim/ui/kbd"
import { Progress } from "@/registry/jim/ui/progress"
import { Segmented } from "@/registry/jim/ui/segmented"
import { Slider } from "@/registry/jim/ui/slider"
import { SwatchPicker, categoricalOptions } from "@/registry/jim/ui/swatch-picker"
import { Switch } from "@/registry/jim/ui/switch"
import { fmtMoney, projects, statusMeta } from "../data"

/*
 * The studio's preview: one screen that puts every token role next to its neighbours, so a
 * skin is judged as a product, not as swatches. Real components where they are interactive;
 * the floating layers (menu, toast, tooltip) are drawn in place, open, so they can be compared.
 */
const rows = projects.slice(0, 5)

export function StudioPreview() {
  const [view, setView] = React.useState("list")
  const [tag, setTag] = React.useState("blue")
  const [notify, setNotify] = React.useState(true)
  const [level, setLevel] = React.useState(60)
  return (
    <div className="flex flex-col gap-4">
      <AppFrame view={view} setView={setView} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="表单">
          <div className="flex flex-col gap-4">
            <Field label="项目名称" hint="2–40 个字">
              <Input defaultValue="官网改版" />
            </Field>
            <Field label="邮箱" error="邮箱格式不对">
              <Input defaultValue="jim@" />
            </Field>
            <Field label="标签颜色">
              <SwatchPicker value={tag} onValueChange={setTag} options={categoricalOptions()} />
            </Field>
            <Field label="提醒阈值">
              <Slider value={level} onValueChange={setLevel} min={0} max={100} step={5} format={(v) => `${v}%`} />
            </Field>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="pv-notify" className="text-body">
                有人提到我时通知
              </label>
              <Switch id="pv-notify" checked={notify} onCheckedChange={setNotify} />
            </div>
            <label className="flex items-center gap-2 text-body">
              <Checkbox defaultChecked />
              同时发到邮箱
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="ghost">取消</Button>
              <Button variant="primary">保存修改</Button>
            </div>
          </div>
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel title="反馈">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {Object.values(statusMeta).map((m) => (
                  <Badge key={m.label} tone={m.tone}>
                    {m.label}
                  </Badge>
                ))}
                <Badge tone="outline">外部</Badge>
              </div>
              <Callout tone="info">新成员加入后会收到一封邀请邮件。</Callout>
              <Callout tone="warning">密钥只显示这一次，请现在复制。</Callout>
              <Callout tone="danger">删除失败：网络中断，请重试。</Callout>
              <div className="flex items-center gap-3">
                <Progress value={312} max={1204} aria-label="导出进度" className="flex-1" />
                <span className="tabular text-small text-muted-foreground">312 / 1,204</span>
              </div>
            </div>
          </Panel>

          <Panel title="浮层" sunken>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-popover p-1 shadow-popover">
                {[
                  ["重命名", "R"],
                  ["复制链接", "⌘C"],
                  ["移到…", ""],
                ].map(([label, key], i) => (
                  <div
                    key={label}
                    className={cn("flex h-(--control-md) items-center justify-between rounded-sm px-2 text-body", i === 1 && "bg-accent")}
                  >
                    {label}
                    {key && <Kbd>{key}</Kbd>}
                  </div>
                ))}
                <div className="my-1 h-px bg-border" />
                <div className="flex h-(--control-md) items-center rounded-sm px-2 text-body text-destructive">删除项目</div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2 rounded-lg bg-popover p-3 text-small shadow-overlay">
                  <span className="mt-0.5 size-2 shrink-0 rounded-full bg-success" />
                  <span className="flex-1">已归档「官网改版」</span>
                  <button type="button" className="font-medium text-foreground underline-offset-4 hover:underline">
                    撤销
                  </button>
                </div>
                <span className="self-start rounded-sm bg-inverse px-2 py-1 text-caption text-inverse-foreground">导出为 CSV</span>
                <div className="flex flex-wrap gap-1.5">
                  {CHART_SERIES.slice(0, 5).map((c) => (
                    <span key={c} className={cn("rounded-xs px-1.5 text-small font-medium", catClass(c).fill, catClass(c).fg)}>
                      {categoricalOptions().find((o) => o.value === c)?.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function Panel({ title, sunken, children }: { title: string; sunken?: boolean; children: React.ReactNode }) {
  return (
    <section className={cn("rounded-lg border p-4", sunken && "bg-sunken")}>
      <h3 className="mb-3 text-small font-medium text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

/** A miniature app: sidebar, title bar, filters, a table with a selected row. */
function AppFrame({ view, setView }: { view: string; setView: (v: string) => void }) {
  const [selected, setSelected] = React.useState(rows[1].id)
  return (
    <div className="flex h-[400px] overflow-hidden rounded-lg border bg-background max-sm:h-auto">
      <aside className="flex w-48 shrink-0 flex-col gap-px border-r bg-sunken p-2 max-md:hidden">
        <div className="mb-2 flex h-8 items-center px-2 text-body font-semibold">苗圃</div>
        {[
          [<Home key="i" />, "首页", false],
          [<Inbox key="i" />, "收件箱", false],
          [<Folder key="i" />, "项目", true],
          [<Bell key="i" />, "通知", false],
          [<Settings key="i" />, "设置", false],
        ].map(([icon, label, active]) => (
          <div
            key={label as string}
            className={cn(
              "flex h-(--nav-item-h) items-center gap-2 rounded-md px-2 text-body text-muted-foreground [&_svg]:size-4",
              active && "bg-pressed font-medium text-foreground",
            )}
          >
            {icon}
            {label}
          </div>
        ))}
        <div className="mt-auto px-2 text-caption text-faint-foreground">v2.4 · 已同步</div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 px-5 pb-3 pt-4">
          <h2 className="flex-1 truncate text-title font-semibold">项目</h2>
          <IconButton label="更多操作" size="icon-sm">
            <MoreHorizontal />
          </IconButton>
          <Button variant="primary" size="sm">
            <Plus />
            新建项目
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-5 pb-3">
          <div className="relative w-52 max-sm:w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-faint-foreground" />
            <Input placeholder="搜索名称或编号" className="h-(--control-sm) pl-8 text-small" />
          </div>
          <span className="inline-flex h-(--control-sm) items-center gap-1 rounded-md bg-selected px-2.5 text-small font-medium">
            状态：进行中 <ChevronDown className="size-3.5 text-faint-foreground" />
          </span>
          <span className="inline-flex h-(--control-sm) items-center gap-1 rounded-md border border-dashed border-input px-2.5 text-small text-muted-foreground">
            负责人 <ChevronDown className="size-3.5" />
          </span>
          <Segmented
            size="sm"
            className="ml-auto max-sm:ml-0"
            aria-label="视图"
            value={view}
            onValueChange={setView}
            options={[
              { value: "list", label: "列表" },
              { value: "board", label: "看板" },
            ]}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-auto border-t">
          <table className="w-full text-body">
            <thead className="sticky top-0 bg-background">
              <tr className="h-(--row-head-h) border-b text-left text-small font-medium text-muted-foreground">
                <th className="px-5 font-medium">名称</th>
                <th className="px-3 font-medium max-sm:hidden">状态</th>
                <th className="px-3 font-medium max-md:hidden">负责人</th>
                <th className="px-5 text-right font-medium">预算</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={cn("h-(--row-h) cursor-pointer border-b hover:bg-accent", p.id === selected && "bg-selected hover:bg-selected")}
                >
                  <td className="px-5">
                    <div className="truncate">{p.name}</div>
                  </td>
                  <td className="px-3 max-sm:hidden">
                    <StatusDot tone={statusMeta[p.status].tone}>{statusMeta[p.status].label}</StatusDot>
                  </td>
                  <td className="px-3 text-muted-foreground max-md:hidden">{p.owner}</td>
                  <td className="tabular px-5 text-right">{fmtMoney(p.budget)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-5 py-2.5 text-small text-faint-foreground">
            <span>共 57 条</span>
            <span className="tabular">1 / 3</span>
          </div>
        </div>
      </div>
    </div>
  )
}
