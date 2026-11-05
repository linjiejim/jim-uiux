import * as React from "react"
import { CalendarDays, FileText, FolderKanban, Maximize2, MessageSquare, Pencil, Table2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/registry/jim/ui/badge"
import { Button, IconButton } from "@/registry/jim/ui/button"
import { DetailList, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, useInspectorStack } from "@/registry/jim/ui/drawer"
import { Input } from "@/registry/jim/ui/input"
import { Tooltip } from "@/registry/jim/ui/tooltip"
import { fmtDate, fmtMoney, projects, statusMeta, type Project } from "../data"

/*
 * A workbench shell in miniature: rail 72 · secondary column 264 · main · inspector.
 * The gallery's own sidebar sits to the left, so the frame is narrower than a real window;
 * the inspector still docks or floats by the viewport (≥ 1440 docks).
 */
const places = [
  { key: "chat", label: "对话", icon: <MessageSquare /> },
  { key: "projects", label: "项目", icon: <FolderKanban /> },
  { key: "docs", label: "文档", icon: <FileText /> },
  { key: "tables", label: "表格", icon: <Table2 /> },
  { key: "schedule", label: "日程", icon: <CalendarDays /> },
]
const rows = projects.slice(0, 14)

export function WorkbenchPattern() {
  const inspector = useInspectorStack<string>()
  const [main, setMain] = React.useState<string | null>(null)
  const top = projects.find((p) => p.id === inspector.top)
  const last = React.useRef(top)
  if (top) last.current = top
  const shown = top ?? last.current
  const focused = projects.find((p) => p.id === main)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-full min-h-0">
        {/* rail 72 */}
        <nav aria-label="地点" className="flex w-[72px] shrink-0 flex-col items-center gap-1 border-r bg-sunken py-3 max-[760px]:hidden">
          {places.map((p) => (
            <Tooltip key={p.key} content={p.label} side="right">
              <button
                type="button"
                aria-label={p.label}
                aria-current={p.key === "projects" ? "page" : undefined}
                className={cn(
                  "grid size-11 place-items-center rounded-lg text-muted-foreground hover:bg-accent [&_svg]:size-5",
                  p.key === "projects" && "bg-pressed text-foreground",
                )}
              >
                {p.icon}
              </button>
            </Tooltip>
          ))}
        </nav>

        {/* secondary column 264, gone below 1100 */}
        <aside aria-label="项目分组" className="flex w-[264px] shrink-0 flex-col border-r max-[1100px]:hidden">
          <div className="flex h-[52px] shrink-0 items-center border-b px-4 text-heading font-semibold">项目</div>
          <ul className="flex flex-col gap-0.5 p-2">
            {["全部项目", "我负责的", "本周更新", "已归档"].map((g, i) => (
              <li key={g}>
                <button
                  type="button"
                  className={cn(
                    "flex h-(--nav-item-h) w-full items-center rounded-md px-2.5 text-left text-body hover:bg-accent",
                    i === 0 && "bg-pressed font-medium",
                  )}
                >
                  {g}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* main */}
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[52px] shrink-0 items-center gap-2 border-b px-5">
            <h1 className="min-w-0 flex-1 truncate text-heading font-semibold">{focused ? focused.name : "全部项目"}</h1>
            {focused && (
              <Button size="sm" variant="ghost" onClick={() => setMain(null)}>
                返回列表
              </Button>
            )}
          </header>
          {focused ? (
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <ProjectFields p={focused} />
            </div>
          ) : (
            <ul className="min-h-0 flex-1 overflow-y-auto">
              {rows.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => inspector.show(p.id)}
                    className={cn(
                      "flex h-(--row-h) w-full items-center gap-3 border-b px-5 text-left text-body hover:bg-accent",
                      inspector.stack[0] === p.id && "bg-selected",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    <Badge tone={statusMeta[p.status].tone}>{statusMeta[p.status].label}</Badge>
                    <span className="shrink-0 whitespace-nowrap text-right text-small text-muted-foreground tabular max-sm:hidden">
                      {fmtDate(p.updatedAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* inspector: non-modal, docks ≥ 1440, floats below */}
        <Drawer mode="dock" open={!!top} onOpenChange={(o) => !o && inspector.close()}>
          {/* keep the last object while the floating panel slides out */}
          <DrawerContent storageKey="gallery-workbench">
            {shown && (
              <Inspector
                key={shown.id}
                p={shown}
                depth={inspector.depth}
                onBack={inspector.back}
                onOpen={inspector.push}
                onPromote={() => {
                  setMain(shown.id)
                  inspector.close()
                }}
              />
            )}
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}

function Inspector({
  p,
  depth,
  onBack,
  onOpen,
  onPromote,
}: {
  p: Project
  depth: number
  onBack: () => void
  onOpen: (id: string) => void
  onPromote: () => void
}) {
  const [editing, setEditing] = React.useState(false)
  const [name, setName] = React.useState(p.name)
  const related = projects.filter((x) => x.owner === p.owner && x.id !== p.id).slice(0, 3)
  return (
    <>
      <DrawerHeader
        title={name}
        description={`${p.id} · 第 ${depth} 层`}
        onBack={depth > 1 ? onBack : undefined}
        actions={
          !editing && (
            <>
              <IconButton label="编辑" size="icon-sm" onClick={() => setEditing(true)}>
                <Pencil />
              </IconButton>
              <IconButton label="在主区打开" size="icon-sm" onClick={onPromote}>
                <Maximize2 />
              </IconButton>
            </>
          )
        }
      />
      <DrawerBody>
        <DetailList
          editing={editing}
          items={[
            {
              label: "名称",
              value: name,
              edit: <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />,
              required: true,
            },
            { label: "状态", value: <Badge tone={statusMeta[p.status].tone}>{statusMeta[p.status].label}</Badge> },
            { label: "负责人", value: p.owner },
            { label: "预算", value: <span className="tabular">{fmtMoney(p.budget)}</span> },
            { label: "更新", value: fmtDate(p.updatedAt) },
          ]}
        />
        {!editing && related.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-1 text-small font-medium text-muted-foreground">{p.owner} 的其他项目</h3>
            <ul>
              {related.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(r.id)}
                    className="flex h-(--control-md) w-full items-center rounded-md px-2 text-left text-body hover:bg-accent"
                  >
                    {r.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DrawerBody>
      {editing && (
        <DrawerFooter>
          <Button
            onClick={() => {
              setName(p.name)
              setEditing(false)
            }}
          >
            取消
          </Button>
          <Button variant="primary" disabled={!name.trim()} onClick={() => setEditing(false)}>
            保存修改
          </Button>
        </DrawerFooter>
      )}
    </>
  )
}

function ProjectFields({ p }: { p: Project }) {
  return (
    <DetailList
      className="max-w-[560px]"
      items={[
        { label: "状态", value: <Badge tone={statusMeta[p.status].tone}>{statusMeta[p.status].label}</Badge> },
        { label: "负责人", value: p.owner },
        { label: "预算", value: <span className="tabular">{fmtMoney(p.budget)}</span> },
        { label: "进度", value: <span className="tabular">{p.progress}%</span> },
      ]}
    />
  )
}
