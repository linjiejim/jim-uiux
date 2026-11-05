import * as React from "react"
import type { ColumnDef, SortingState } from "@tanstack/react-table"
import { Archive, Copy, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { useDebouncedValue } from "@/registry/jim/hooks/use-debounced-value"
import { Badge } from "@/registry/jim/ui/badge"
import { Button, IconButton } from "@/registry/jim/ui/button"
import { DiscardDialog, useConfirm } from "@/registry/jim/ui/confirm-dialog"
import { DataTable } from "@/registry/jim/ui/data-table"
import { DetailList, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from "@/registry/jim/ui/drawer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/registry/jim/ui/dropdown-menu"
import { FilterBar, FilterBoolean, FilterSelect, SearchInput } from "@/registry/jim/ui/filter-bar"
import { Input } from "@/registry/jim/ui/input"
import { Page, PageHeader } from "@/registry/jim/ui/page"
import { Select } from "@/registry/jim/ui/select"
import { notify } from "@/registry/jim/ui/toast"
import { fmtDate, fmtMoney, projects as seed, statusMeta, wait, type Project } from "../data"

/* ---------- a fake server, so loading and paging behave like the real thing ---------- */

let db = [...seed]
type Query = { q: string; status?: string; owner?: string; archived?: boolean; sort: SortingState; page: number; size: number }

async function fetchProjects(query: Query) {
  await wait(500)
  let rows = db.filter(
    (p) =>
      (!query.q || p.name.includes(query.q) || p.id.toLowerCase().includes(query.q.toLowerCase())) &&
      (!query.status || p.status === query.status) &&
      (!query.owner || p.owner === query.owner) &&
      (query.archived === undefined || p.archived === query.archived),
  )
  const s = query.sort[0]
  if (s) {
    const k = s.id as keyof Project
    rows = [...rows].sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * (s.desc ? -1 : 1))
  }
  return { total: rows.length, rows: rows.slice(query.page * query.size, (query.page + 1) * query.size) }
}

/* ---------- filters live in the URL: #/crud?q=…&status=… ---------- */

function useHashParams() {
  const read = () => new URLSearchParams(window.location.hash.split("?")[1] ?? "")
  const [params, setParams] = React.useState(read)
  React.useEffect(() => {
    const on = () => setParams(read())
    window.addEventListener("hashchange", on)
    return () => window.removeEventListener("hashchange", on)
  }, [])
  const update = (patch: Record<string, string | undefined>) => {
    const next = read()
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === "") next.delete(k)
      else next.set(k, v)
    }
    const base = window.location.hash.split("?")[0] || "#/crud"
    const qs = next.toString()
    history.replaceState(null, "", qs ? `${base}?${qs}` : base)
    setParams(next)
  }
  return [params, update] as const
}

const owners = [...new Set(seed.map((p) => p.owner))].map((o) => ({ value: o, label: o }))
const statusOptions = Object.entries(statusMeta).map(([value, m]) => ({ value, label: m.label }))

export function CrudPattern() {
  const [params, setParam] = useHashParams()
  const [q, setQ] = React.useState(params.get("q") ?? "")
  const debouncedQ = useDebouncedValue(q)
  const status = params.get("status") ?? undefined
  const owner = params.get("owner") ?? undefined
  const archivedParam = params.get("archived")
  const archived = archivedParam === null ? undefined : archivedParam === "1"
  const filtered = !!(debouncedQ || status || owner || archived !== undefined)

  React.useEffect(() => setParam({ q: debouncedQ || undefined }), [debouncedQ]) // eslint-disable-line react-hooks/exhaustive-deps

  const [sort, setSort] = React.useState<SortingState>([{ id: "updatedAt", desc: true }])
  const [page, setPage] = React.useState({ pageIndex: 0, pageSize: 20 })
  const [data, setData] = React.useState<{ total: number; rows: Project[] }>({ total: 0, rows: [] })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<unknown>(null)
  const [version, setVersion] = React.useState(0)
  const reload = () => setVersion((v) => v + 1)

  const [selection, setSelection] = React.useState({})
  // a new question: back to page 1, nothing selected
  React.useEffect(() => {
    setPage((p) => ({ ...p, pageIndex: 0 }))
    setSelection({})
  }, [debouncedQ, status, owner, archived])

  React.useEffect(() => {
    let live = true
    setLoading(true)
    setError(null)
    fetchProjects({ q: debouncedQ, status, owner, archived, sort, page: page.pageIndex, size: page.pageSize })
      .then((r) => live && setData(r))
      .catch((e) => live && setError(e))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [debouncedQ, status, owner, archived, sort, page, version])

  // One drawer for reading, editing and creating: same layout, values become editable in place.
  const [panel, setPanel] = React.useState<PanelState>(null)
  const panelId = panel && panel.mode !== "create" ? panel.id : undefined
  const { confirm, element: confirmElement } = useConfirm()
  const open = db.find((p) => p.id === panelId)

  const archive = (ids: string[]) => {
    const was = new Map(db.filter((p) => ids.includes(p.id)).map((p) => [p.id, p.archived]))
    db = db.map((p) => (ids.includes(p.id) ? { ...p, archived: true } : p))
    setSelection({})
    reload()
    notify.undo(ids.length > 1 ? `已归档 ${ids.length} 个项目` : "已归档 1 个项目", () => {
      // revert only what this action changed; later edits and deletions stay
      db = db.map((p) => (was.has(p.id) ? { ...p, archived: was.get(p.id)! } : p))
      reload()
    })
  }

  const remove = async (p: Project) => {
    const ok = await confirm({
      tone: "danger",
      title: `删除项目「${p.name}」？`,
      description: "项目里的任务和文件会一起删除，无法恢复。",
      confirmLabel: "删除项目",
      onConfirm: async () => {
        await wait(600)
        db = db.filter((x) => x.id !== p.id)
      },
    })
    if (ok) {
      if (panelId === p.id) setPanel(null)
      reload()
    }
  }

  const columns = React.useMemo<ColumnDef<Project, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "名称",
        cell: (c) => <span className="font-medium">{c.getValue()}</span>,
        meta: { pin: "left", mobile: "title" },
      },
      {
        accessorKey: "status",
        header: "状态",
        enableSorting: false,
        cell: (c) => {
          const m = statusMeta[c.getValue() as Project["status"]]
          return <Badge tone={m.tone}>{m.label}</Badge>
        },
        meta: { width: "7rem", mobile: "meta" },
      },
      { accessorKey: "owner", header: "负责人", enableSorting: false, meta: { width: "7rem", hideBelow: "lg", mobile: "meta" } },
      { accessorKey: "budget", header: "预算", cell: (c) => fmtMoney(c.getValue()), meta: { align: "right", width: "8rem", mobile: "hidden" } },
      { accessorKey: "progress", header: "进度", cell: (c) => `${c.getValue()}%`, meta: { align: "right", width: "6rem", hideBelow: "xl", mobile: "hidden" } },
      { accessorKey: "updatedAt", header: "更新时间", cell: (c) => fmtDate(c.getValue()), meta: { width: "9rem", hideBelow: "lg", mobile: "hidden" } },
    ],
    [],
  )

  return (
    <Page width="full" fill>
      <PageHeader
        title="项目"
        actions={
          <Button variant="primary" onClick={() => setPanel({ mode: "create" })}>
            <Plus />
            新建项目
          </Button>
        }
      />

      <FilterBar
        active={filtered}
        onClear={() => {
          setQ("")
          setParam({ q: undefined, status: undefined, owner: undefined, archived: undefined })
        }}
      >
        <SearchInput value={q} onValueChange={setQ} placeholder="搜索名称或编号" />
        <FilterSelect label="状态" value={status} onValueChange={(v) => setParam({ status: v })} options={statusOptions} />
        <FilterSelect label="负责人" value={owner} onValueChange={(v) => setParam({ owner: v })} options={owners} />
        <FilterBoolean label="已归档" value={archived} onValueChange={(v) => setParam({ archived: v === undefined ? undefined : v ? "1" : "0" })} />
      </FilterBar>

      <div className="-mx-6 min-h-0 flex-1 border-t max-sm:-mx-4">
        <DataTable
          aria-label="项目"
          className="h-full"
          columns={columns}
          data={data.rows}
          getRowId={(p) => p.id}
          loading={loading}
          error={error}
          onRetry={reload}
          filtered={filtered}
          onClearFilters={() => {
            setQ("")
            setParam({ q: undefined, status: undefined, owner: undefined, archived: undefined })
          }}
          empty={{
            title: "还没有项目",
            description: "项目把任务、文件和成员放在一起。",
            action: (
              <Button variant="primary" size="sm" onClick={() => setPanel({ mode: "create" })}>
                新建项目
              </Button>
            ),
          }}
          onRowClick={(p) => setPanel({ mode: "view", id: p.id })}
          activeRowId={panelId}
          selection={{ value: selection, onChange: setSelection }}
          bulkActions={(rows) => (
            <Button size="sm" onClick={() => archive(rows.map((r) => r.id))}>
              <Archive />
              归档
            </Button>
          )}
          rowActions={(p) => (
            <>
              <IconButton label="编辑" size="icon-sm" onClick={() => setPanel({ mode: "edit", id: p.id })} className="opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100">
                <Pencil />
              </IconButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton label="更多操作" size="icon-sm" tooltip={false}>
                    <MoreHorizontal />
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setPanel({ mode: "edit", id: p.id })}>
                    <Pencil />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => notify("链接已复制")}>
                    <Copy />
                    复制链接
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => archive([p.id])}>
                    <Archive />
                    归档
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem tone="danger" onSelect={() => remove(p)}>
                    <Trash2 />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          sorting={{ value: sort, onChange: setSort, manual: true }}
          pagination={{ ...page, total: data.total, onChange: setPage }}
          pageSizeKey="projects"
        />
      </div>

      <ProjectDrawer
        panel={panel}
        project={open}
        onPanelChange={setPanel}
        onDelete={remove}
        onSaved={(p, isNew) => {
          db = isNew ? [p, ...db] : db.map((x) => (x.id === p.id ? p : x))
          setPanel({ mode: "view", id: p.id })
          reload()
          if (isNew) notify.success(`已创建「${p.name}」`)
        }}
      />
      {confirmElement}
    </Page>
  )
}

/* ---------- view / edit / create, in one drawer ---------- */

type PanelState = { mode: "view" | "edit"; id: string } | { mode: "create" } | null
const emptyForm = { name: "", owner: "林杰", status: "draft", budget: "" }

function ProjectDrawer({
  panel,
  project,
  onPanelChange,
  onDelete,
  onSaved,
}: {
  panel: PanelState
  project: Project | undefined
  onPanelChange: (p: PanelState) => void
  onDelete: (p: Project) => void
  onSaved: (p: Project, isNew: boolean) => void
}) {
  const mode = panel?.mode
  const editing = mode === "edit" || mode === "create"
  const initial = React.useMemo(
    () =>
      mode === "create" || !project
        ? emptyForm
        : { name: project.name, owner: project.owner, status: project.status as string, budget: String(project.budget) },
    [mode, project],
  )
  const [form, setForm] = React.useState(initial)
  const [errors, setErrors] = React.useState<{ name?: string; budget?: string }>({})
  const [saving, setSaving] = React.useState(false)
  const [asking, setAsking] = React.useState(false)
  React.useEffect(() => {
    setForm(initial)
    setErrors({})
  }, [initial, editing])
  const dirty = editing && JSON.stringify(form) !== JSON.stringify(initial)

  const close = () => onPanelChange(null)
  // Cancel while editing goes back to reading (creating has nothing to go back to).
  const leaveEdit = () => (mode === "create" || !project ? close() : onPanelChange({ mode: "view", id: project.id }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const next = {
      name: form.name.trim() ? undefined : "请填写名称",
      budget: form.budget && !/^\d+$/.test(form.budget) ? "预算只能是整数，单位元" : undefined,
    }
    setErrors(next)
    if (next.name || next.budget) {
      const order = ["name", "budget"] as const
      const first = order.find((k) => next[k])!
      document.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus()
      return
    }
    setSaving(true)
    await wait(700)
    setSaving(false)
    const base = mode === "edit" && project ? project : { id: `P-${Date.now() % 100000}`, progress: 0, archived: false }
    onSaved(
      { ...base, name: form.name.trim(), owner: form.owner, status: form.status as Project["status"], budget: Number(form.budget || 0), updatedAt: new Date().toISOString() },
      mode === "create",
    )
  }

  const view = mode !== "create" && project
  const title = mode === "create" ? "新建项目" : project?.name

  return (
    <Drawer open={!!panel && (mode === "create" || !!project)} onOpenChange={(o) => !o && close()} dirty={dirty && !saving}>
      {panel && (mode === "create" || project) && (
        <DrawerContent>
          <form className="contents" onSubmit={save} noValidate>
            <DrawerHeader
              title={title}
              description={view ? `${project.id} · 更新于 ${fmtDate(project.updatedAt)}` : undefined}
              actions={
                mode === "view" && project ? (
                  <>
                    <IconButton type="button" label="编辑" size="icon-sm" onClick={() => onPanelChange({ mode: "edit", id: project.id })}>
                      <Pencil />
                    </IconButton>
                    <IconButton type="button" label="删除" size="icon-sm" onClick={() => onDelete(project)}>
                      <Trash2 />
                    </IconButton>
                  </>
                ) : undefined
              }
            />
            <DrawerBody>
              <DetailList
                editing={editing}
                items={[
                  {
                    label: "名称",
                    required: true,
                    value: project?.name,
                    error: errors.name,
                    edit: <Input data-field="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />,
                  },
                  {
                    label: "状态",
                    value: project && <Badge tone={statusMeta[project.status].tone}>{statusMeta[project.status].label}</Badge>,
                    edit: <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })} options={statusOptions} />,
                  },
                  {
                    label: "负责人",
                    value: project?.owner,
                    edit: <Select value={form.owner} onValueChange={(v) => setForm({ ...form, owner: v })} options={owners} />,
                  },
                  {
                    label: "预算（元）",
                    value: project && <span className="tabular">{fmtMoney(project.budget)}</span>,
                    error: errors.budget,
                    edit: (
                      <Input data-field="budget" inputMode="numeric" className="tabular" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                    ),
                  },
                  ...(view
                    ? [
                        { label: "进度", value: <span className="tabular">{project.progress}%</span> },
                        { label: "已归档", value: project.archived ? "是" : "否" },
                      ]
                    : []),
                ]}
              />
            </DrawerBody>
            {editing && (
              <DrawerFooter>
                <Button type="button" onClick={() => (dirty ? setAsking(true) : leaveEdit())} disabled={saving}>
                  取消
                </Button>
                <Button type="submit" variant="primary" loading={saving} disabled={mode === "edit" && !dirty}>
                  {mode === "create" ? "创建项目" : "保存修改"}
                </Button>
              </DrawerFooter>
            )}
          </form>
        </DrawerContent>
      )}
      <DiscardDialog
        open={asking}
        onKeep={() => setAsking(false)}
        onDiscard={() => {
          setAsking(false)
          leaveEdit()
        }}
      />
    </Drawer>
  )
}
