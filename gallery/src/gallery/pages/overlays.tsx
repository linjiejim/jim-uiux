import * as React from "react"
import { Archive, Copy, FileText, Moon, Pencil, Plus, Settings, Trash2 } from "lucide-react"
import { BottomSheet, BottomSheetBody, BottomSheetContent, BottomSheetFooter, BottomSheetHeader, BottomSheetTrigger, BottomSheetClose } from "@/registry/jim/ui/bottom-sheet"
import { Button, IconButton } from "@/registry/jim/ui/button"
import { ConfirmDialog } from "@/registry/jim/ui/confirm-dialog"
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@/registry/jim/ui/dialog"
import { DetailList, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerPager, DrawerTrigger, useListPaging } from "@/registry/jim/ui/drawer"
import { cn } from "@/lib/utils"
import { useLastDefined } from "@/registry/jim/hooks/use-last-defined"
import { Field, FieldGroup } from "@/registry/jim/ui/field"
import { Info } from "@/registry/jim/ui/info"
import { Input, Textarea } from "@/registry/jim/ui/input"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/registry/jim/ui/popover"
import { ResizeHandle } from "@/registry/jim/ui/resize-handle"
import { getAppearance, resolveAppearance, setAppearance } from "@/registry/jim/lib/appearance"
import { Badge } from "@/registry/jim/ui/badge"
import { CommandGroup, CommandItem, CommandPalette } from "@/registry/jim/ui/command-palette"
import { Segmented } from "@/registry/jim/ui/segmented"
import { notify } from "@/registry/jim/ui/toast"
import { fmtDate, fmtMoney, projects, statusMeta } from "../data"
import { DocPage, Example, Row, Rules } from "../doc"
import { t } from "../i18n"

const project = projects[0]

export function OverlaysPage() {
  return (
    <DocPage
      title={t("弹层", "Overlays")}
      lead={t("同一个意图永远用同一种弹层。", "One intent, one kind of overlay.")}
      info={t(
        "命令菜单（DropdownMenu：行操作、「更多」）和右键菜单（ContextMenu：同一组命令的快捷方式）的演示在「数据」页。",
        "Command menus (DropdownMenu for row actions and More; ContextMenu, a right-click shortcut to the same commands) are on the Data page.",
      )}
      source="registry/jim/ui/dialog.tsx · drawer.tsx · bottom-sheet.tsx · confirm-dialog.tsx · popover.tsx · info.tsx · context-menu.tsx · resize-handle.tsx"
    >
      <Example
        title={t("弹框", "Dialog")}
        note={t("不属于列表对象的短任务：重命名、邀请成员、新建标签。", "Short tasks that aren't about a list item: rename, invite, new tag.")}
        info={
          <>
            <p>
              {t(
                "尺寸：sm 400 · md 480（默认）· lg 640 · xl 工作区。最高 85dvh，内容区单独滚动。手机上从底部升起。在「新建标签」里写了内容再关闭，会先问一句。",
                "Sizes: sm 400 · md 480 (default) · lg 640 · xl workspace. Up to 85dvh; the body scrolls. Rises from the bottom on phones. Type in “New tag”, then close it: it asks first.",
              )}
            </p>
            <p className="mt-2">
              {t(
                "fixed：弹框里要切标签、筛列表或分步填写时加。md、lg 高度固定（560、640，最多 85dvh），框不随内容跳；sm 仍随内容，xl 一直固定。",
                "fixed: for tabs, filtered lists or steps inside a dialog. md and lg get a set height (560, 640, up to 85dvh) so the box doesn't jump; sm still fits its content, xl is always fixed.",
              )}
            </p>
          </>
        }
      >
        <Row>
          <EditDialog />
          <SizeDialog size="sm" />
          <SizeDialog size="lg" />
          <FixedDialog />
        </Row>
      </Example>

      <Example
        title={t("抽屉", "Drawer")}
        note={t("查看、编辑、新建列表里的一个对象，列表留在旁边。", "View, edit or create a list item while the list stays in view.")}
        info={
          <>
            <p>
              {t(
                "宽度：sm 400 · md 560（默认）· lg min(60vw, 960)，手机上全宽。标题行最多 2 个图标操作。一次只开一层。完整流程见「列表」页。",
                "Widths: sm 400 · md 560 (default) · lg min(60vw, 960); full width on phones. At most 2 icon actions in the header. One at a time. The full flow is on the Lists page.",
              )}
            </p>
            <p className="mt-2">
              {t(
                "停靠式（mode=\"dock\"，Inspector）：工作台的详情栏，不模态、没有遮罩。视口 ≥ 1440 时停靠在主区旁，更窄时浮起、点外面关闭。宽 360–520，拖左边缘调整（双击复位 400），按地点记住。里面的关联对象最多叠 3 层，可以提升到主区。",
                "Docked (mode=\"dock\", Inspector): the workbench's detail pane, not modal, no scrim. At 1440 and wider it docks beside the main area; narrower, it floats and closes on an outside click. 360–520 wide, drag the left edge (double-click resets to 400), remembered per place. Related items stack up to 3 deep and can be promoted to the main area.",
              )}
            </p>
          </>
        }
      >
        <Row>
          <DetailDrawer />
          <Button asChild variant="link">
            <a href="#/workbench">{t("停靠式：看工作台", "Docked: see the workbench")}</a>
          </Button>
        </Row>
      </Example>

      <Example
        title={t("列表详情：翻页", "List detail with paging")}
        note={t("点一条打开，再按 ↑ / ↓ 翻到上一条、下一条。", "Open an item, then press ↑ / ↓ to step through the list.")}
        info={t(
          "一条一条看（读信息流、分诊、审阅）时用。模态抽屉加遮罩，点遮罩、Esc、✕ 都能关；← / →、K / J 也能翻，头部显示位置。这个列表未读在前：看过的变成已读、换了位置，翻页仍按打开时的顺序，关掉后才用新顺序。",
          "For going through items one by one: a feed, triage, review. A modal drawer with a scrim; the scrim, Esc and ✕ close it. ← / → and K / J also page, and the header shows the position. Unread items sort first here: what you've seen turns read and moves, but paging keeps the order you opened with until you close.",
        )}
      >
        <ListDetailDemo />
      </Example>

      <Example
        title={t("拖动调宽", "Resize handle")}
        note={t("拖侧栏的右边缘，或聚焦后按方向键；双击复位。", "Drag the sidebar's right edge, or focus it and use the arrow keys. Double-click to reset.")}
        info={t(
          "面板边缘上 8px 宽的拖动区：悬停显示细线，聚焦和拖动时用强调色。方向键每步 16px，Home / End 到最小 / 最大。拖动时只改界面，松手才保存（按地点记住）。停靠式抽屉用的就是它。",
          "An 8px hit area on a panel's edge: a hairline on hover, the accent color on focus and while dragging. Arrow keys move 16px; Home / End jump to min / max. Dragging only changes the view; it saves on release (per place). The docked drawer uses it.",
        )}
      >
        <SplitDemo />
      </Example>

      <Example
        title={t("命令面板", "Command palette")}
        note={t("⌘K（Windows 上 Ctrl+K）在任何页面打开，本站也行。", "⌘K (Ctrl+K on Windows) opens it on any page, this site too.")}
        info={t(
          "唯一顶部对齐的弹框：640×480，距顶部 120。结果变化时框不动，只有列表滚动。分组有标题，选中即执行并关闭。",
          "The only top-aligned dialog: 640×480, 120 from the top. The box stays put as results change; only the list scrolls. Groups have headings; choosing an item runs it and closes.",
        )}
      >
        <Row>
          <PaletteDemo />
        </Row>
      </Example>

      <Example
        title={t("确认框", "Confirm dialog")}
        note={t("只给不可逆的最后一步。可逆的直接做，给撤销。", "Only for an irreversible last step. If it can be undone, just do it and offer Undo.")}
        info={t(
          "标题是问题，正文说后果，按钮重复标题里的动词。焦点默认在「取消」。确认可以是异步的：失败时不关闭，原因显示在框里。",
          "The title is a question, the body states the consequence, the button repeats the verb. Focus starts on Cancel. Confirming can be async: on failure it stays open and shows why.",
        )}
      >
        <Row>
          <DeleteConfirm fail={false} />
          <DeleteConfirm fail />
        </Row>
      </Example>

      <Example
        title={t("底部弹层", "Bottom sheet")}
        note={t("触屏上的选项、操作和短表单。用手机宽度看最好。", "Options, actions and short forms on touch screens. Best at phone width.")}
        info={t(
          "把手 36×5，顶部圆角 24，最高 92dvh。下拉或点遮罩关闭。原生 App 用系统 sheet。",
          "Handle 36×5, top radius 24, up to 92dvh. Drag down or tap the scrim to close. Native apps use the system sheet.",
        )}
      >
        <Row>
          <ShareSheet />
          <FeedbackSheet />
        </Row>
      </Example>

      <Example
        title={t("浮层", "Popover")}
        note={t("挂在触发点上的小面板，不阻断页面：筛选、选择器、快速改一个值。", "A small panel on its trigger that doesn't block the page: filters, pickers, a quick edit.")}
        info={t(
          "画布上的点、文字里的一个词这类位置，用 PopoverAnchor 锚到一个点；点换了就传一个新的 virtualRef，Radix 才会重新定位。它每次现量画布位置，页面滚动时跟着走。画布本身仍是触发器，所以键盘能用（回车加在中心），关闭后焦点回到画布。",
          "To open at a point (on a canvas, a word in text), anchor it with PopoverAnchor and pass a new virtualRef for each point so Radix repositions. It measures the canvas each time, so it follows scrolling. The canvas stays the trigger, so the keyboard works (Enter adds at the center) and focus returns to it on close.",
        )}
      >
        <div className="flex flex-col gap-4">
          <Row>
            <RenamePopover />
          </Row>
          <PinCanvas />
        </div>
      </Example>

      <Example
        title={t("ⓘ 说明", "ⓘ Info")}
        note={t("指上去稍等就打开，点一下固定。只放文字，不放操作。", "Hover to open, click to pin. Text only, no actions.")}
        info={t(
          "放在页面标题、字段标签、指标旁边：口径、这个设置会改变什么、注意事项。触屏点按、键盘回车也能固定；点别处或 Esc 关闭。PageHeader 和 Field 的 info 用的就是它。",
          "Next to page titles, field labels and figures: how a number is counted, what a setting changes, a caveat. A tap or Enter pins it too; a click elsewhere or Esc closes it. PageHeader and Field use it for their info.",
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-title font-semibold">{t("本月净利润", "Net profit this month")}</span>
            <Info>
              {t(
                "按结算口径：已签收的订单扣除平台佣金、物流和退款。当天的数据次日 10 点前更新。",
                "On a settled basis: delivered orders minus platform fees, shipping and refunds. Each day's figures update by 10:00 the next day.",
              )}
            </Info>
          </div>
          <Field
            label={t("保留天数", "Retention (days)")}
            info={t("超过这个天数的记录会移进归档，仍可在归档里搜索和恢复。", "Older records move to the archive, where you can still search and restore them.")}
            className="max-w-60"
          >
            <Input defaultValue="90" inputMode="numeric" />
          </Field>
        </div>
      </Example>

      <Example title={t("用法", "Usage")} canvas="none">
        <Rules
          dos={[
            t("Esc、点遮罩、✕ 都能关闭", "Esc, the scrim and ✕ all close it"),
            t("关闭后焦点回到触发按钮", "Focus returns to the trigger on close"),
            t("弹框里的表单按回车提交", "Enter submits a form in a dialog"),
          ]}
          donts={[
            t("弹框里再开弹框（确认框除外）", "A dialog on top of a dialog (except a confirm)"),
            t("两个抽屉叠在一起", "Two drawers stacked"),
            // design-allow: 文档里列出的反例
            t("手写 fixed inset-0 遮罩", "A hand-rolled fixed inset-0 scrim"),
            // design-allow: 文档里列出的反例
            t("alert()、window.confirm()", "alert() or window.confirm()"),
            t("遮罩模糊", "A blurred scrim"),
          ]}
        />
      </Example>
    </DocPage>
  )
}

type Pin = { x: number; y: number }

function SplitDemo() {
  const [width, setWidth] = React.useState(240)
  const [saved, setSaved] = React.useState(240)
  return (
    <div className="flex h-48 overflow-hidden rounded-lg border">
      <aside className="relative shrink-0 border-r bg-sunken p-3 text-small text-muted-foreground" style={{ width }}>
        <div className="tabular">{t(`侧栏 ${width}px · 已存 ${saved}px`, `Sidebar ${width}px · saved ${saved}px`)}</div>
        <ResizeHandle
          side="right"
          value={width}
          min={160}
          max={360}
          defaultValue={240}
          onValueChange={setWidth}
          onValueCommit={setSaved}
          label={t("调整侧栏宽度", "Resize sidebar")}
        />
      </aside>
      <div className="min-w-0 flex-1 p-3 text-small text-muted-foreground">{t("主区", "Main area")}</div>
    </div>
  )
}

function RenamePopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>{t("重命名", "Rename")}</Button>
      </PopoverTrigger>
      <PopoverContent>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            notify.success(t("已更新名称", "Name updated"))
          }}
        >
          <Field label={t("名称", "Name")}>
            <Input defaultValue={project.name} autoFocus />
          </Field>
          <Button type="submit" variant="primary" size="sm" className="self-end">
            {t("保存", "Save")}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

function PinCanvas() {
  const canvas = React.useRef<HTMLButtonElement>(null)
  const [draft, setDraft] = React.useState<Pin | null>(null)
  const [pins, setPins] = React.useState<(Pin & { note: string })[]>([])
  // A new anchor for each point, so Radix re-measures. It reads the canvas's box
  // each time, so the panel follows the canvas when the page scrolls.
  const anchor = React.useMemo(() => {
    const p = draft ?? { x: 0, y: 0 }
    return {
      current: {
        getBoundingClientRect: () => {
          const r = canvas.current?.getBoundingClientRect()
          return DOMRect.fromRect({ x: (r?.x ?? 0) + p.x, y: (r?.y ?? 0) + p.y, width: 0, height: 0 })
        },
      },
    }
  }, [draft])
  return (
    <Popover open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
      <PopoverAnchor virtualRef={anchor} />
      <PopoverTrigger asChild>
        <button
          ref={canvas}
          type="button"
          aria-label={t("在画布上加备注", "Add a note on the canvas")}
          className="relative block h-48 w-full max-w-md cursor-crosshair rounded-lg border bg-sunken text-small text-muted-foreground"
          onClick={(e) => {
            e.preventDefault() // place (or move) the note instead of toggling
            const r = e.currentTarget.getBoundingClientRect()
            // detail 0: Enter or Space, so put it in the middle
            setDraft(e.detail === 0 ? { x: r.width / 2, y: r.height / 2 } : { x: e.clientX - r.left, y: e.clientY - r.top })
          }}
        >
          {pins.length === 0 && t("点画布上任意位置加备注", "Click anywhere on the canvas to add a note")}
          {[...pins, ...(draft ? [{ ...draft, note: "" }] : [])].map((p, i) => (
            <span
              key={i}
              title={p.note || undefined}
              className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-background"
              style={{ left: p.x, top: p.y }}
            />
          ))}
        </button>
      </PopoverTrigger>
      <PopoverContent side="right">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            const note = String(new FormData(e.currentTarget).get("note") ?? "").trim()
            if (draft && note) setPins((ps) => [...ps, { ...draft, note }])
            setDraft(null)
          }}
        >
          <Field label={t("备注", "Note")}>
            <Input name="note" autoFocus />
          </Field>
          <Button type="submit" variant="primary" size="sm" className="self-end">
            {t("添加备注", "Add note")}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

function EditDialog() {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [desc, setDesc] = React.useState("")
  const [saving, setSaving] = React.useState(false)
  const dirty = name !== "" || desc !== ""
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) {
          setName("")
          setDesc("")
        }
      }}
      dirty={dirty && !saving}
    >
      <DialogTrigger asChild>
        <Button variant="primary">{t("新建标签", "New tag")}</Button>
      </DialogTrigger>
      <DialogContent>
        <form
          className="contents"
          onSubmit={(e) => {
            e.preventDefault()
            setSaving(true)
            setTimeout(() => {
              setSaving(false)
              setOpen(false)
              notify.success(t("已创建标签", "Tag created"))
            }, 900)
          }}
        >
          <DialogHeader title={t("新建标签", "New tag")} />
          <DialogBody>
            <FieldGroup>
              <Field label={t("名称", "Name")} required>
                <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              </Field>
              <Field label={t("描述", "Description")}>
                <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
              </Field>
            </FieldGroup>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">{t("取消", "Cancel")}</Button>
            </DialogClose>
            <Button type="submit" variant="primary" loading={saving} disabled={!name.trim()}>
              {t("创建标签", "Create tag")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SizeDialog({ size }: { size: "sm" | "lg" }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{size === "sm" ? "sm 400" : "lg 640"}</Button>
      </DialogTrigger>
      <DialogContent size={size}>
        <DialogHeader
          title={size === "sm" ? t("重命名文件", "Rename file") : t("导入成员", "Import members")}
          description={size === "lg" ? t("支持 CSV，第一行为表头。", "CSV, with a header row.") : undefined}
        />
        <DialogBody>
          {size === "sm" ? (
            <Input defaultValue={t("季度报告.pdf", "Quarterly report.pdf")} aria-label={t("文件名", "File name")} />
          ) : (
            <div className="grid h-40 place-items-center rounded-lg border border-dashed text-body text-muted-foreground">
              {t("拖入文件，或点击选择", "Drop a file here, or click to choose one")}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button>{t("取消", "Cancel")}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="primary">{size === "sm" ? t("重命名", "Rename") : t("导入成员", "Import members")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// the sample owners from data.ts, plus a few more
const MEMBERS = Array.from(new Set(projects.map((p) => p.owner))).concat(
  t(["钱多", "吴桐", "郑好", "冯远"], ["Duo Qian", "Tong Wu", "Hao Zheng", "Yuan Feng"]),
)

function FixedDialog() {
  const [tab, setTab] = React.useState("members")
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{t("项目成员（md fixed）", "Project members (md fixed)")}</Button>
      </DialogTrigger>
      <DialogContent fixed>
        <DialogHeader title={t("项目成员", "Project members")} />
        <div className="shrink-0 px-5 pb-2">
          <Segmented
            size="sm"
            value={tab}
            onValueChange={setTab}
            options={[
              { value: "members", label: t(`成员 ${MEMBERS.length}`, `Members ${MEMBERS.length}`) },
              { value: "invites", label: t("邀请 1", "Invites 1") },
            ]}
          />
        </div>
        <DialogBody>
          {tab === "members" ? (
            <ul className="divide-y">
              {MEMBERS.map((m) => (
                <li key={m} className="flex h-11 items-center justify-between text-body">
                  {m}
                  <span className="text-small text-muted-foreground">{t("成员", "Member")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul>
              <li className="flex h-11 items-center justify-between text-body">
                chen@example.com
                <span className="text-small text-muted-foreground">{t("待接受", "Pending")}</span>
              </li>
            </ul>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button>{t("关闭", "Close")}</Button>
          </DialogClose>
          <Button variant="primary">{t("邀请成员", "Invite members")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PaletteDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t("打开命令面板", "Open command palette")}</Button>
      <CommandPalette open={open} onOpenChange={setOpen}>
        <CommandGroup heading={t("操作", "Actions")}>
          <CommandItem icon={<Plus />} shortcut="N" onSelect={() => notify(t("已新建项目", "Project created"))}>
            {t("新建项目", "New project")}
          </CommandItem>
          <CommandItem
            icon={<Archive />}
            onSelect={() => notify.undo(t("已归档 1 个项目", "Archived 1 project"), () => notify(t("已恢复", "Restored")))}
          >
            {t("归档当前项目", "Archive this project")}
          </CommandItem>
          <CommandItem
            icon={<Moon />}
            keywords={["dark", "深色"]}
            onSelect={() => setAppearance(resolveAppearance(getAppearance()) === "dark" ? "light" : "dark")}
          >
            {t("切换深色模式", "Toggle dark mode")}
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading={t("最近", "Recent")}>
          {projects.slice(0, 4).map((p) => (
            <CommandItem key={p.id} icon={<FileText />} hint={t("项目", "Project")} onSelect={() => notify(t(`已打开「${p.name}」`, `Opened “${p.name}”`))}>
              {p.name}
            </CommandItem>
          ))}
          <CommandItem icon={<Settings />} shortcut="⌘," onSelect={() => notify(t("已打开设置", "Opened settings"))}>
            {t("设置", "Settings")}
          </CommandItem>
        </CommandGroup>
      </CommandPalette>
    </>
  )
}

function DetailDrawer() {
  const status = statusMeta[project.status]
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>{t("查看详情", "View details")}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader
          title={project.name}
          description={`${project.id} · ${t("更新于", "Updated")} ${fmtDate(project.updatedAt)}`}
          actions={
            <>
              <IconButton label={t("复制链接", "Copy link")} size="icon-sm">
                <Copy />
              </IconButton>
              <IconButton label={t("编辑", "Edit")} size="icon-sm">
                <Pencil />
              </IconButton>
            </>
          }
        />
        <DrawerBody>
          <DetailList
            items={[
              { label: t("状态", "Status"), value: <Badge tone={status.tone}>{status.label}</Badge> },
              { label: t("负责人", "Owner"), value: project.owner },
              { label: t("预算", "Budget"), value: <span className="tabular">{fmtMoney(project.budget)}</span> },
              {
                label: t("描述", "Description"),
                value: t("重做首页和产品页，统一到新的设计系统，移动端优先。", "Rebuild the home and product pages on the new design system, mobile first."),
              },
            ]}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

function DeleteConfirm({ fail }: { fail: boolean }) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Trash2 />
        {fail ? t("删除（会失败）", "Delete (fails)") : t("删除项目", "Delete project")}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        tone="danger"
        title={t(`删除项目「${project.name}」？`, `Delete project “${project.name}”?`)}
        description={t("项目里的 12 个任务和 3 个文件会一起删除，无法恢复。", "Its 12 tasks and 3 files will be deleted too. This can't be undone.")}
        confirmLabel={t("删除项目", "Delete project")}
        onConfirm={async () => {
          await new Promise((r) => setTimeout(r, 900))
          if (fail) throw new Error(t("网络连接中断，项目没有删除。请重试。", "Connection lost. The project wasn't deleted. Try again."))
          notify.success(t(`已删除「${project.name}」`, `Deleted “${project.name}”`))
        }}
      />
    </>
  )
}

const SHARE = [
  { label: t("复制链接", "Copy link"), done: t("已复制链接", "Link copied") },
  { label: t("发送给成员", "Send to members"), done: t("已发送给成员", "Sent to members") },
  { label: t("导出 PDF", "Export PDF"), done: t("已导出 PDF", "PDF exported") },
]

function ShareSheet() {
  return (
    <BottomSheet>
      <BottomSheetTrigger asChild>
        <Button>{t("分享", "Share")}</Button>
      </BottomSheetTrigger>
      <BottomSheetContent>
        <BottomSheetHeader title={t("分享项目", "Share project")} />
        <BottomSheetBody>
          <ul className="-mx-2 flex flex-col">
            {SHARE.map((a) => (
              <li key={a.label}>
                <BottomSheetClose asChild>
                  <button
                    className="flex min-h-12 w-full items-center rounded-md px-2 text-left text-reading active:bg-pressed"
                    onClick={() => notify.success(a.done)}
                  >
                    {a.label}
                  </button>
                </BottomSheetClose>
              </li>
            ))}
          </ul>
        </BottomSheetBody>
        <BottomSheetFooter>
          <BottomSheetClose asChild>
            <Button size="lg">{t("取消", "Cancel")}</Button>
          </BottomSheetClose>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  )
}

function FeedbackSheet() {
  const [open, setOpen] = React.useState(false)
  const [text, setText] = React.useState("")
  return (
    <BottomSheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setText("")
      }}
      dirty={text.trim() !== ""}
    >
      <BottomSheetTrigger asChild>
        <Button>{t("写反馈", "Write feedback")}</Button>
      </BottomSheetTrigger>
      <BottomSheetContent>
        <BottomSheetHeader title={t("写反馈", "Write feedback")} description={t("写了内容再关闭，会先确认。", "Type something, then close: it asks first.")} />
        <BottomSheetBody>
          <Textarea
            aria-label={t("反馈", "Feedback")}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("哪里不好用？", "What isn't working?")}
          />
        </BottomSheetBody>
        <BottomSheetFooter>
          <BottomSheetClose asChild>
            <Button size="lg">{t("取消", "Cancel")}</Button>
          </BottomSheetClose>
          <Button
            size="lg"
            variant="primary"
            disabled={!text.trim()}
            onClick={() => {
              setOpen(false)
              setText("")
              notify.success(t("已发送反馈", "Feedback sent"))
            }}
          >
            {t("发送反馈", "Send feedback")}
          </Button>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  )
}

const INBOX = [
  {
    id: "m1",
    title: t("数据看板：图表方案二选一", "Analytics dashboard: pick a chart option"),
    from: t("设计 · 08:40", "Design · 08:40"),
    body: t(
      "两个方案都写进交付文档了。A 改动小；B 对长时间序列更顺，但要换图表库。",
      "Both options are in the handoff doc. A is the smaller change; B handles long time series better but needs a new chart library.",
    ),
  },
  {
    id: "m2",
    title: t("PR 482 等你 review", "PR 482 needs your review"),
    from: t("GitHub · 2 小时前", "GitHub · 2 hr ago"),
    body: t("登录流程重构，+320 −85，CI 已通过。", "Sign-in flow rework, +320 −85, CI passed."),
  },
  {
    id: "m3",
    title: t("每日新闻速递 · 11月17日", "Daily news digest · Nov 17"),
    from: t("新闻 · 09:10", "News · 09:10"),
    body: t("精选 10 条、热门项目 4 个。", "10 picks and 4 trending projects."),
  },
  {
    id: "m4",
    title: t("本周销售周报", "Weekly sales report"),
    from: t("运营 · 16:31", "Operations · 16:31"),
    body: t("环比 +6%，两个渠道待跟进。", "Up 6% on last week; two channels need follow-up."),
  },
  {
    id: "m5",
    title: t("下周选题待定", "Next week's topics to decide"),
    from: t("内容 · 10:06", "Content · 10:06"),
    body: t("入池 2 条待审。", "2 new pitches waiting for review."),
  },
  {
    id: "m6",
    title: t("数据库备份完成", "Database backup complete"),
    from: t("运维 · 04:15", "Ops · 04:15"),
    body: t("完整性校验通过，保留 14 份。", "Integrity check passed; 14 copies kept."),
  },
]

/** Unread first, so opening an item moves it: paging keeps the order it was opened from. */
function ListDetailDemo() {
  const [open, setOpen] = React.useState<string | null>(null)
  const [read, setRead] = React.useState<ReadonlySet<string>>(new Set(["m6"]))
  const show = React.useCallback((id: string) => {
    setOpen(id)
    setRead((r) => new Set(r).add(id))
  }, [])
  const items = [...INBOX].sort((a, b) => Number(read.has(a.id)) - Number(read.has(b.id)))
  const paging = useListPaging({ items: items.map((i) => i.id), current: open, onChange: show })
  // keep the last item while the drawer slides out
  const cur = useLastDefined(INBOX.find((i) => i.id === open))
  return (
    <>
      <div className="w-full max-w-[560px] divide-y overflow-hidden rounded-lg border">
        {items.map((i) => (
          <button
            key={i.id}
            type="button"
            onClick={() => show(i.id)}
            className={cn(
              "flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-body transition-colors duration-(--duration-fast) hover:bg-accent",
              open === i.id && "bg-pressed hover:bg-pressed",
            )}
          >
            <span className={cn("size-1.5 shrink-0 rounded-full", read.has(i.id) ? "bg-transparent" : "bg-foreground")} />
            <span className={cn("min-w-0 flex-1 truncate", read.has(i.id) ? "text-muted-foreground" : "font-medium")}>{i.title}</span>
            <span className="shrink-0 text-caption text-faint-foreground">{i.from}</span>
          </button>
        ))}
      </div>
      <Drawer open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DrawerContent>
          {cur && (
            <>
              <DrawerHeader title={cur.title} description={cur.from} actions={<DrawerPager {...paging} />} />
              <DrawerBody>
                <p className="text-reading">{cur.body}</p>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}
