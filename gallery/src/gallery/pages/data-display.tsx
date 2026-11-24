import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Archive, Copy, FileText, FolderInput, LayoutGrid, List, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { formatDate } from "@/registry/jim/lib/format"
import { Badge, StatusDot } from "@/registry/jim/ui/badge"
import { Button, IconButton } from "@/registry/jim/ui/button"
import { ContextMenu, ContextMenuContent, ContextMenuTrigger, contextMenuParts } from "@/registry/jim/ui/context-menu"
import { DataTable } from "@/registry/jim/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  dropdownMenuParts,
  type MenuParts,
} from "@/registry/jim/ui/dropdown-menu"
import { InlineRename } from "@/registry/jim/ui/inline-rename"
import { Segmented } from "@/registry/jim/ui/segmented"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/jim/ui/tabs"
import { notify } from "@/registry/jim/ui/toast"
import { Tooltip } from "@/registry/jim/ui/tooltip"
import { DocPage, Example, Row, Rules, Spec } from "../doc"
import { fmtMoney, projects, statusMeta, type Project } from "../data"
import { t } from "../i18n"

const columns: ColumnDef<Project, any>[] = [
  { accessorKey: "name", header: t("名称", "Name"), cell: (c) => <span className="font-medium">{c.getValue()}</span> },
  {
    accessorKey: "status",
    header: t("状态", "Status"),
    enableSorting: false,
    cell: (c) => <Badge tone={statusMeta[c.getValue() as Project["status"]].tone}>{statusMeta[c.getValue() as Project["status"]].label}</Badge>,
    meta: { width: "7rem" },
  },
  { accessorKey: "owner", header: t("负责人", "Owner"), meta: { width: "7rem", hideBelow: "lg" } },
  { accessorKey: "budget", header: t("预算", "Budget"), cell: (c) => fmtMoney(c.getValue()), meta: { align: "right", width: "8rem" } },
]

const tabs = t(
  [
    ["overview", "概览"],
    ["tasks", "任务"],
    ["members", "成员"],
    ["settings", "设置"],
  ],
  [
    ["overview", "Overview"],
    ["tasks", "Tasks"],
    ["members", "Members"],
    ["settings", "Settings"],
  ],
)

export function DataDisplayPage() {
  const [view, setView] = React.useState<"list" | "board">("list")
  return (
    <DocPage
      title={t("数据展示", "Data display")}
      info={t(
        "完整的列表页（筛选、批量操作、详情抽屉）见「页面 · 列表」。",
        "For a full list page (filters, bulk actions, a detail drawer), see Pages · Lists.",
      )}
      source="registry/jim/ui/data-table.tsx · badge.tsx · tabs.tsx · segmented.tsx · dropdown-menu.tsx · context-menu.tsx"
    >
      <Example
        title={t("表格", "Table")}
        note={t("点表头排序。窗口变窄时先隐藏「负责人」，再变成摘要列表。", "Click a header to sort. Narrow the window: Owner hides first, then rows become a summary list.")}
        canvas="none"
      >
        <div className="h-[420px] overflow-hidden rounded-lg border">
          <DataTable
            aria-label={t("项目", "Projects")}
            columns={columns}
            data={projects.slice(0, 24)}
            getRowId={(p) => p.id}
            rowActions={() => <RowMenu />}
            pageSizeKey="gallery-demo"
          />
        </div>
      </Example>

      <Example title={t("表格规格", "Table spec")} canvas="none">
        <Spec
          rows={t<[string, string][]>(
            [
              ["行高", "表头 36 · 行 44（紧凑 32 · 36）"],
              ["线", "只有行之间的细线；不画竖线，不加斑马纹"],
              ["对齐", "文字左对齐；数字、金额右对齐，等宽数字"],
              ["溢出", "不换行，截断，悬停显示全文"],
              ["固定", "表头吸顶；宽表格把名称列固定在左，操作列固定在右"],
              ["列数", "默认 ≤ 6 列，其余放进详情抽屉；md 以下变成两行摘要列表"],
              ["行操作", "最多露 2 个图标，其余收进 ⋯；危险项在菜单最后"],
              ["点击行", "打开右侧详情抽屉，不做双击编辑"],
              ["选择", "勾选后底部出现「已选 N 项」和批量操作"],
              ["分页", "20 / 50 / 100，记住选择；不做无限滚动（信息流除外）"],
            ],
            [
              ["Row height", "Header 36 · row 44 (compact 32 · 36)"],
              ["Lines", "Thin lines between rows only; no vertical lines, no stripes"],
              ["Alignment", "Text left; numbers and money right, in tabular figures"],
              ["Overflow", "One line, truncated, full text on hover"],
              ["Sticky", "Header sticks; wide tables pin the name left and actions right"],
              ["Columns", "6 at most by default, the rest in the detail drawer; below md, a two-line summary list"],
              ["Row actions", "2 icons at most, the rest in ⋯; destructive items last"],
              ["Row click", "Opens the detail drawer on the right; no double-click editing"],
              ["Selection", "Checking rows brings up “N selected” and bulk actions at the bottom"],
              ["Pages", "20 / 50 / 100, remembered; no infinite scroll (except feeds)"],
            ],
          )}
        />
      </Example>

      <Example
        title={t("原位改名", "Inline rename")}
        note={t(
          "点名字就地改名。试试已有的名字，或带「网络」看保存失败。",
          "Click a name to rename it. Try a taken name, or add “offline” to see a failed save.",
        )}
        info={t(
          "Enter 或点别处保存，Esc 还原；输入法选字时的回车不算。聚焦后按 Enter 或 F2、或从 ⋯ 选「重命名」也能开始。点行的其他地方是打开。",
          "Enter or clicking away saves, Esc reverts; Enter while picking characters in an IME doesn't count. Enter or F2 on a focused name, or Rename in ⋯, also starts it. Clicking elsewhere on the row opens the file.",
        )}
        canvas="none"
      >
        <RenameDemo />
      </Example>

      <Example
        title={t("徽章与状态点", "Badges and status dots")}
        info={t("每个项目定一套固定的状态词表和颜色映射，全产品通用。", "Each product keeps one fixed set of status words and colors, used everywhere.")}
      >
        <div className="flex flex-col gap-4">
          <Row>
            {Object.values(statusMeta).map((m) => (
              <Badge key={m.label} tone={m.tone}>
                {m.label}
              </Badge>
            ))}
            <Badge tone="outline">v2.4</Badge>
          </Row>
          <Row>
            <StatusDot tone="success">{t("在线", "Online")}</StatusDot>
            <StatusDot tone="neutral">{t("离线", "Offline")}</StatusDot>
            <StatusDot tone="warning">{t("待处理", "Pending")}</StatusDot>
            <StatusDot tone="danger">{t("故障", "Down")}</StatusDot>
          </Row>
        </div>
      </Example>

      <Example
        title={t("标签页与分段控件", "Tabs and Segmented")}
        note={t("标签页切换页面的不同部分；分段控件切换同一内容的不同视图。", "Tabs switch between parts of a page; Segmented switches views of the same content.")}
      >
        <div className="flex flex-col gap-8">
          <Tabs defaultValue="overview">
            <TabsList>
              {tabs.map(([value, label]) => (
                <TabsTrigger key={value} value={value}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map(([value, label]) => (
              <TabsContent key={value} value={value} className="pt-4 text-body text-muted-foreground">
                {t(`${label}内容`, `${label} content`)}
              </TabsContent>
            ))}
          </Tabs>
          <Segmented
            aria-label={t("视图", "View")}
            className="self-start"
            value={view}
            onValueChange={setView}
            options={[
              { value: "list", label: t("列表", "List"), icon: <List /> },
              { value: "board", label: t("看板", "Board"), icon: <LayoutGrid /> },
            ]}
          />
        </div>
      </Example>

      <Example
        title={t("菜单与提示", "Menus and tooltips")}
        note={t("点 ⋯ 或在行上点右键：两个菜单是同一组项。", "Click ⋯ or right-click a row: both menus hold the same items.")}
        info={t(
          "项只写一次，分别传 dropdownMenuParts 和 contextMenuParts。右键只是快捷方式：触屏要长按，键盘用户靠 ⋯。子菜单只开一层，放一组同类的选项；键盘用 → 打开、← 收起。",
          "Write the items once and pass dropdownMenuParts or contextMenuParts. Right-click is only a shortcut: touch needs a long press, and keyboard users rely on ⋯. Submenus go one level deep and hold one kind of option; → opens, ← closes.",
        )}
      >
        <div className="flex flex-col items-start gap-4">
          <FileRows />
          <Tooltip content={`${t("上次同步：", "Last synced ")}${formatDate(new Date(2026, 9, 31, 18, 2), { time: true })}`}>
            <Button variant="ghost">{t("悬停看提示", "Hover for a tooltip")}</Button>
          </Tooltip>
        </div>
      </Example>

      <Example title={t("用法", "Usage")} canvas="none">
        <Rules
          dos={t(
            ["菜单 ≤ 7 项，用分隔线分组", "常用的在上，危险的在最后", "右键菜单和 ⋯ 菜单同一组项", "提示只放补充信息"],
            ["Menus: 7 items at most, grouped with separators", "Common items first, destructive last", "Same items in the right-click and ⋯ menus", "Tooltips only add detail"],
          )}
          donts={t(
            ["表格里放卡片", "卡片套卡片", "只靠颜色区分状态", "操作只放在右键里", "子菜单再套子菜单", "提示里放必须看到的内容"],
            ["Cards inside tables", "Cards inside cards", "Status shown by color alone", "Actions only in the right-click menu", "Submenus inside submenus", "Must-read content in tooltips"],
          )}
        />
      </Example>
    </DocPage>
  )
}

function MenuItems() {
  return (
    <DropdownMenuContent>
      <DropdownMenuItem>
        <Pencil />
        {t("编辑", "Edit")}
        <DropdownMenuShortcut>E</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Copy />
        {t("复制链接", "Copy link")}
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Archive />
        {t("归档", "Archive")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem tone="danger">
        <Trash2 />
        {t("删除", "Delete")}
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}

const folders = t(["设计稿", "合同", "归档"], ["Designs", "Contracts", "Archive"])
const files = t(["首页改版.fig", "报价单-11月.pdf", "品牌手册.pdf"], ["Homepage redesign.fig", "Quote-November.pdf", "Brand guidelines.pdf"])

/** One list of items, rendered in both the ⋯ menu and the right-click menu. */
function fileMenu(m: MenuParts, file: string) {
  return (
    <>
      <m.Item>
        <Pencil />
        {t("重命名", "Rename")}
        <m.Shortcut>F2</m.Shortcut>
      </m.Item>
      <m.Item onSelect={() => notify(t("链接已复制", "Link copied"))}>
        <Copy />
        {t("复制链接", "Copy link")}
      </m.Item>
      <m.Sub>
        <m.SubTrigger>
          <FolderInput />
          {t("移到", "Move to")}
        </m.SubTrigger>
        <m.SubContent>
          {folders.map((f) => (
            <m.Item
              key={f}
              onSelect={() => notify.undo(t(`已把「${file}」移到「${f}」`, `Moved “${file}” to ${f}`), () => notify(t("已移回", "Moved back")))}
            >
              {f}
            </m.Item>
          ))}
        </m.SubContent>
      </m.Sub>
      <m.Separator />
      <m.Item tone="danger">
        <Trash2 />
        {t("删除", "Delete")}
      </m.Item>
    </>
  )
}

const moreFor = (name: string) => t(`「${name}」的更多操作`, `More actions for “${name}”`)

function FileRows() {
  return (
    <div className="w-full max-w-md divide-y rounded-lg border">
      {files.map((file) => (
        <ContextMenu key={file}>
          <ContextMenuTrigger asChild>
            <div className="flex items-center gap-3 py-1.5 pl-3 pr-1.5 text-body hover:bg-accent data-[state=open]:bg-accent">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{file}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton label={moreFor(file)} size="icon-sm" tooltip={false}>
                    <MoreHorizontal />
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>{fileMenu(dropdownMenuParts, file)}</DropdownMenuContent>
              </DropdownMenu>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>{fileMenu(contextMenuParts, file)}</ContextMenuContent>
        </ContextMenu>
      ))}
    </div>
  )
}

function RowMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton label={t("更多操作", "More actions")} size="icon-sm" tooltip={false}>
          <MoreHorizontal />
        </IconButton>
      </DropdownMenuTrigger>
      <MenuItems />
    </DropdownMenu>
  )
}

type DemoFile = { id: string; name: string; size: string; updated: string }

const day = (m: number, d: number) => formatDate(new Date(2026, m - 1, d))
const demoFiles: DemoFile[] = [
  { id: "f1", name: t("首页改版.fig", "Homepage redesign.fig"), size: "12.4 MB", updated: day(11, 20) },
  { id: "f2", name: t("报价单-11月.pdf", "Quote-November.pdf"), size: "860 KB", updated: day(11, 18) },
  { id: "f3", name: t("品牌手册.pdf", "Brand guidelines.pdf"), size: "4.2 MB", updated: day(11, 2) },
  { id: "f4", name: t("用户访谈记录.docx", "User interview notes.docx"), size: "96 KB", updated: day(10, 28) },
]

/** A pretend save: 600ms, a name with 「网络」 ("offline") fails. */
async function saveName(name: string) {
  await new Promise((r) => setTimeout(r, 600))
  if (name.toLowerCase().includes(t("网络", "offline"))) throw new Error(t("没有保存：网络连接中断，请重试", "Not saved: the connection dropped. Try again."))
}

type RenameState = {
  files: DemoFile[]
  renaming: string | null
  setRenaming: (id: string | null) => void
  rename: (id: string, name: string) => Promise<void>
}
const RenameContext = React.createContext<RenameState | null>(null)

/** The name cell. Columns stay module-level: a new `cell` function each render would remount the cell mid-rename. */
function FileName({ file: f }: { file: DemoFile }) {
  const { files, renaming, setRenaming, rename } = React.useContext(RenameContext)!
  return (
    <InlineRename
      aria-label={t("文件名", "File name")}
      value={f.name}
      editing={renaming === f.id}
      onEditingChange={(on) => setRenaming(on ? f.id : null)}
      validate={(name) => (files.some((x) => x.id !== f.id && x.name === name) ? t("已有同名文件，换一个名字", "A file with this name exists. Try another.") : undefined)}
      onSave={(name) => rename(f.id, name)}
    />
  )
}

const fileColumns: ColumnDef<DemoFile, any>[] = [
  { accessorKey: "name", header: t("名称", "Name"), cell: (c) => <FileName file={c.row.original} />, meta: { mobile: "title" } },
  { accessorKey: "size", header: t("大小", "Size"), meta: { align: "right", width: "7rem" } },
  { accessorKey: "updated", header: t("修改时间", "Modified"), meta: { width: "8rem", hideBelow: "md" } },
]

function RenameDemo() {
  const [title, setTitle] = React.useState(t("第四季度设计评审", "Q4 design review"))
  const [files, setFiles] = React.useState(demoFiles)
  const [renaming, setRenaming] = React.useState<string | null>(null)
  const rename = async (id: string, name: string) => {
    await saveName(name)
    setFiles((all) => all.map((x) => (x.id === id ? { ...x, name } : x)))
  }

  return (
    <RenameContext.Provider value={{ files, renaming, setRenaming, rename }}>
      <div className="flex max-w-xl flex-col gap-4">
        <h3 className="text-title font-semibold">
          <InlineRename aria-label={t("标题", "Title")} value={title} onSave={setTitle} />
        </h3>
        <div className="overflow-hidden rounded-lg border">
          <DataTable
            aria-label={t("文件", "Files")}
            columns={fileColumns}
            data={files}
            getRowId={(f) => f.id}
            onRowClick={(f) => notify(t(`打开「${f.name}」`, `Opened “${f.name}”`))}
            rowActions={(f) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton label={moreFor(f.name)} size="icon-sm" tooltip={false}>
                    <MoreHorizontal />
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setRenaming(f.id)}>
                    <Pencil />
                    {t("重命名", "Rename")}
                    <DropdownMenuShortcut>F2</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => notify(t("链接已复制", "Link copied"))}>
                    <Copy />
                    {t("复制链接", "Copy link")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </div>
      </div>
    </RenameContext.Provider>
  )
}
