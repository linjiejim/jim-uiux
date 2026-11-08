import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Archive, Copy, FileText, FolderInput, LayoutGrid, List, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
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
import { Segmented } from "@/registry/jim/ui/segmented"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/jim/ui/tabs"
import { notify } from "@/registry/jim/ui/toast"
import { Tooltip } from "@/registry/jim/ui/tooltip"
import { DocPage, Example, Row, Rules, Spec } from "../doc"
import { fmtMoney, projects, statusMeta, type Project } from "../data"

const columns: ColumnDef<Project, any>[] = [
  { accessorKey: "name", header: "名称", cell: (c) => <span className="font-medium">{c.getValue()}</span> },
  {
    accessorKey: "status",
    header: "状态",
    enableSorting: false,
    cell: (c) => <Badge tone={statusMeta[c.getValue() as Project["status"]].tone}>{statusMeta[c.getValue() as Project["status"]].label}</Badge>,
    meta: { width: "7rem" },
  },
  { accessorKey: "owner", header: "负责人", meta: { width: "7rem", hideBelow: "lg" } },
  { accessorKey: "budget", header: "预算", cell: (c) => fmtMoney(c.getValue()), meta: { align: "right", width: "8rem" } },
]

export function DataDisplayPage() {
  const [view, setView] = React.useState<"list" | "board">("list")
  return (
    <DocPage title="数据展示" lead="表格、徽章、标签页、菜单。完整的列表页见「模式 · 列表与 CRUD」。" source="registry/jim/ui/data-table.tsx · badge.tsx · tabs.tsx · segmented.tsx · dropdown-menu.tsx · context-menu.tsx">
      <Example title="表格" note="悬停行变色，点击表头排序。数字右对齐用等宽数字。改变窗口宽度：lg 以下隐藏「负责人」，md 以下变成摘要列表。" canvas="none">
        <div className="h-[420px] overflow-hidden rounded-lg border">
          <DataTable
            aria-label="项目"
            columns={columns}
            data={projects.slice(0, 24)}
            getRowId={(p) => p.id}
            rowActions={() => <RowMenu />}
            pageSizeKey="gallery-demo"
          />
        </div>
      </Example>

      <Example title="表格规格" canvas="none">
        <Spec
          rows={[
            ["行高", "表头 36 · 行 44（紧凑 32 · 36）"],
            ["线", "只有行之间的细线；不画竖线，不加斑马纹"],
            ["对齐", "文字左对齐；数字、金额右对齐，等宽数字"],
            ["溢出", "不换行，截断，悬停显示全文"],
            ["固定", "表头吸顶；宽表格把名称列固定在左，操作列固定在右"],
            ["列数", "默认 ≤ 6 列，其余放进详情抽屉"],
            ["行操作", "最多露 2 个图标，其余收进 ⋯；危险项在菜单最后"],
            ["点击行", "打开右侧详情抽屉。不做双击编辑"],
            ["选择", "勾选后底部出现「已选 N 项」和批量操作"],
            ["分页", "20 / 50 / 100，记住选择。不做无限滚动（信息流除外）"],
            ["手机", "md 以下变成两行摘要列表"],
          ]}
        />
      </Example>

      <Example title="徽章与状态点" note="每个项目一套固定的状态词表和颜色映射。">
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
            <StatusDot tone="success">在线</StatusDot>
            <StatusDot tone="neutral">离线</StatusDot>
            <StatusDot tone="warning">待处理</StatusDot>
            <StatusDot tone="danger">故障</StatusDot>
          </Row>
        </div>
      </Example>

      <Example title="Tabs 与 Segmented" note="Tabs 切换页面的不同部分；Segmented 切换同一内容的不同视图。">
        <div className="flex flex-col gap-8">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="tasks">任务</TabsTrigger>
              <TabsTrigger value="members">成员</TabsTrigger>
              <TabsTrigger value="settings">设置</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-4 text-body text-muted-foreground">
              概览内容
            </TabsContent>
            <TabsContent value="tasks" className="pt-4 text-body text-muted-foreground">
              任务内容
            </TabsContent>
            <TabsContent value="members" className="pt-4 text-body text-muted-foreground">
              成员内容
            </TabsContent>
            <TabsContent value="settings" className="pt-4 text-body text-muted-foreground">
              设置内容
            </TabsContent>
          </Tabs>
          <Segmented
            aria-label="视图"
            value={view}
            onValueChange={setView}
            options={[
              { value: "list", label: "列表", icon: <List /> },
              { value: "board", label: "看板", icon: <LayoutGrid /> },
            ]}
          />
        </div>
      </Example>

      <Example title="菜单与提示">
        <Row>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                更多操作
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <MenuItems />
          </DropdownMenu>
          <Tooltip content="上次同步：10月31日 18:02">
            <Button variant="ghost">悬停看提示</Button>
          </Tooltip>
        </Row>
      </Example>

      <Example
        title="右键菜单与子菜单"
        note="在行上点右键，或点 ⋯：两个菜单是同一组项、同样的顺序（项只写一次，分别传 dropdownMenuParts 和 contextMenuParts）。右键只是快捷方式：触屏要长按，键盘用户靠 ⋯。子菜单只开一层，放一组同类的选项；键盘用 → 打开、← 收起。"
      >
        <FileRows />
      </Example>

      <Example title="用法" canvas="none">
        <Rules
          dos={["菜单 ≤ 7 项，用分隔线分组", "常用的在上，危险的在最后", "右键菜单和 ⋯ 菜单同一组项", "提示只放补充信息"]}
          donts={["表格里放卡片", "卡片套卡片", "只靠颜色区分状态", "操作只放在右键里", "子菜单再套子菜单", "提示里放必须看到的内容"]}
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
        编辑
        <DropdownMenuShortcut>E</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Copy />
        复制链接
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Archive />
        归档
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem tone="danger">
        <Trash2 />
        删除
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}

const folders = ["设计稿", "合同", "归档"]
const files = ["首页改版.fig", "报价单-11月.pdf", "品牌手册.pdf"]

/** One list of items, rendered in both the ⋯ menu and the right-click menu. */
function fileMenu(m: MenuParts, file: string) {
  return (
    <>
      <m.Item>
        <Pencil />
        重命名
        <m.Shortcut>F2</m.Shortcut>
      </m.Item>
      <m.Item onSelect={() => notify("链接已复制")}>
        <Copy />
        复制链接
      </m.Item>
      <m.Sub>
        <m.SubTrigger>
          <FolderInput />
          移到
        </m.SubTrigger>
        <m.SubContent>
          {folders.map((f) => (
            <m.Item key={f} onSelect={() => notify.undo(`已把「${file}」移到「${f}」`, () => notify("已移回"))}>
              {f}
            </m.Item>
          ))}
        </m.SubContent>
      </m.Sub>
      <m.Separator />
      <m.Item tone="danger">
        <Trash2 />
        删除
      </m.Item>
    </>
  )
}

function FileRows() {
  return (
    <div className="max-w-md divide-y rounded-lg border">
      {files.map((file) => (
        <ContextMenu key={file}>
          <ContextMenuTrigger asChild>
            <div className="flex items-center gap-3 py-1.5 pl-3 pr-1.5 text-body hover:bg-accent data-[state=open]:bg-accent">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{file}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton label={`「${file}」的更多操作`} size="icon-sm" tooltip={false}>
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
        <IconButton label="更多操作" size="icon-sm" tooltip={false}>
          <MoreHorizontal />
        </IconButton>
      </DropdownMenuTrigger>
      <MenuItems />
    </DropdownMenu>
  )
}
