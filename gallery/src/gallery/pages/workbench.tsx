import * as React from "react"
import { useLastDefined } from "@/registry/jim/hooks/use-last-defined"
import { CalendarDays, FileText, FolderKanban, Maximize2, MessageSquare, Pencil, Table2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/registry/jim/ui/badge"
import { Button, IconButton } from "@/registry/jim/ui/button"
import { DetailList, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, useInspectorStack } from "@/registry/jim/ui/drawer"
import { Input } from "@/registry/jim/ui/input"
import { Tooltip } from "@/registry/jim/ui/tooltip"
import { fmtDate, fmtMoney, projects, statusMeta, type Project } from "../data"
import { t } from "../i18n"

/*
 * A workbench shell in miniature: rail 72 · secondary column 264 · main · inspector.
 * The gallery's own sidebar sits to the left, so the frame is narrower than a real window;
 * the inspector still docks or floats by the viewport (≥ 1440 docks).
 */
const places = [
  { key: "chat", label: t("对话", "Chat"), icon: <MessageSquare /> },
  { key: "projects", label: t("项目", "Projects"), icon: <FolderKanban /> },
  { key: "docs", label: t("文档", "Docs"), icon: <FileText /> },
  { key: "tables", label: t("表格", "Tables"), icon: <Table2 /> },
  { key: "schedule", label: t("日程", "Calendar"), icon: <CalendarDays /> },
]
const groups = t(["全部项目", "我负责的", "本周更新", "已归档"], ["All projects", "Owned by me", "Updated this week", "Archived"])
const rows = projects.slice(0, 14)

export function WorkbenchPattern() {
  const inspector = useInspectorStack<string>()
  const [main, setMain] = React.useState<string | null>(null)
  const top = projects.find((p) => p.id === inspector.top)
  const shown = useLastDefined(top) // keep the last object while the floating panel slides out
  const focused = projects.find((p) => p.id === main)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-full min-h-0">
        {/* rail 72 */}
        <nav aria-label={t("地点", "Places")} className="flex w-[72px] shrink-0 flex-col items-center gap-1 border-r bg-sunken py-3 max-[760px]:hidden">
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
        <aside aria-label={t("项目分组", "Project groups")} className="flex w-[264px] shrink-0 flex-col border-r max-[1100px]:hidden">
          <div className="flex h-[52px] shrink-0 items-center border-b px-4 text-heading font-semibold">{t("项目", "Projects")}</div>
          <ul className="flex flex-col gap-0.5 p-2">
            {groups.map((g, i) => (
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
            <h1 className="min-w-0 flex-1 truncate text-heading font-semibold">{focused ? focused.name : groups[0]}</h1>
            {focused && (
              <Button size="sm" variant="ghost" onClick={() => setMain(null)}>
                {t("返回列表", "Back to list")}
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
        description={t(`${p.id} · 第 ${depth} 层`, `${p.id} · level ${depth}`)}
        onBack={depth > 1 ? onBack : undefined}
        actions={
          !editing && (
            <>
              <IconButton label={t("编辑", "Edit")} size="icon-sm" onClick={() => setEditing(true)}>
                <Pencil />
              </IconButton>
              <IconButton label={t("在主区打开", "Open in main area")} size="icon-sm" onClick={onPromote}>
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
              label: t("名称", "Name"),
              value: name,
              edit: <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />,
              required: true,
            },
            { label: t("状态", "Status"), value: <Badge tone={statusMeta[p.status].tone}>{statusMeta[p.status].label}</Badge> },
            { label: t("负责人", "Owner"), value: p.owner },
            { label: t("预算", "Budget"), value: <span className="tabular">{fmtMoney(p.budget)}</span> },
            { label: t("更新", "Updated"), value: fmtDate(p.updatedAt) },
          ]}
        />
        {!editing && related.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-1 text-small font-medium text-muted-foreground">{t(`${p.owner} 的其他项目`, `More from ${p.owner}`)}</h3>
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
            {t("取消", "Cancel")}
          </Button>
          <Button variant="primary" disabled={!name.trim()} onClick={() => setEditing(false)}>
            {t("保存修改", "Save changes")}
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
        { label: t("状态", "Status"), value: <Badge tone={statusMeta[p.status].tone}>{statusMeta[p.status].label}</Badge> },
        { label: t("负责人", "Owner"), value: p.owner },
        { label: t("预算", "Budget"), value: <span className="tabular">{fmtMoney(p.budget)}</span> },
        { label: t("进度", "Progress"), value: <span className="tabular">{p.progress}%</span> },
      ]}
    />
  )
}
