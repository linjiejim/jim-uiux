import * as React from "react"
import { Film, Image as ImageIcon, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDebouncedValue } from "@/registry/jim/hooks/use-debounced-value"
import { useDelayedFlag } from "@/registry/jim/hooks/use-delayed-flag"
import { catClass, type Categorical } from "@/registry/jim/lib/categorical"
import { Button } from "@/registry/jim/ui/button"
import { FacetFilter, facetCount, useFacetParams, type Facet, type FacetValue } from "@/registry/jim/ui/facet-filter"
import { FilterBar, SearchInput } from "@/registry/jim/ui/filter-bar"
import { Page, PageHeader } from "@/registry/jim/ui/page"
import { Skeleton } from "@/registry/jim/ui/skeleton"
import { StateView } from "@/registry/jim/ui/state"
import { UploadQueuePanel, UploadRejected, useUploadQueue } from "@/registry/jim/ui/upload-queue"
import { wait } from "../data"

/* ---------- a fake media library ---------- */

type Asset = {
  id: string
  name: string
  kind: "image" | "video"
  orientation: "landscape" | "portrait" | "square"
  owner: string
  tags: string[]
  ai: boolean
}

const tagList: { value: string; label: string; color: Categorical }[] = [
  { value: "product", label: "产品图", color: "blue" },
  { value: "lifestyle", label: "场景", color: "green" },
  { value: "banner", label: "横幅", color: "orange" },
  { value: "packaging", label: "包装", color: "purple" },
  { value: "social", label: "社媒", color: "pink" },
  { value: "draft", label: "草稿", color: "gray" },
]
const owners = ["林杰", "陈曦", "王蕾", "张弛"]
const orientations = ["landscape", "portrait", "square"] as const

const library: Asset[] = Array.from({ length: 150 }, (_, i) => ({
  id: `A-${2001 + i}`,
  name: `${["罗勒", "薄荷", "番茄", "生菜", "草莓", "辣椒"][i % 6]}-${String(i + 1).padStart(3, "0")}.${i % 7 === 0 ? "mp4" : "jpg"}`,
  kind: i % 7 === 0 ? "video" : "image",
  orientation: orientations[(i * 5) % 3],
  owner: owners[(i * 3) % owners.length],
  tags: tagList.filter((_, t) => (i + t * 3) % 5 === 0).map((t) => t.value),
  ai: i % 3 !== 0,
}))

const facets: Facet[] = [
  {
    key: "kind",
    label: "类型",
    kind: "single",
    options: [
      { value: "image", label: "图片" },
      { value: "video", label: "视频" },
    ],
  },
  { key: "tag", label: "标签", kind: "multi", options: tagList.map(({ value, label }) => ({ value, label })) },
  { key: "owner", label: "上传者", kind: "single", options: owners.map((o) => ({ value: o, label: o })) },
  {
    key: "orientation",
    label: "方向",
    kind: "single",
    options: [
      { value: "landscape", label: "横向" },
      { value: "portrait", label: "竖向" },
      { value: "square", label: "方形" },
    ],
  },
  { key: "ai", label: "已识别", kind: "boolean" },
]

const PAGE = 24

async function fetchAssets(q: string, f: FacetValue, offset: number) {
  await wait(offset ? 450 : 600)
  const has = (key: string, v: string) => !f[key]?.length || f[key]!.includes(v)
  const rows = library.filter(
    (a) =>
      (!q || a.name.includes(q)) &&
      has("kind", a.kind) &&
      has("owner", a.owner) &&
      has("orientation", a.orientation) &&
      (!f.tag?.length || a.tags.some((t) => f.tag!.includes(t))) &&
      (!f.ai?.length || a.ai === (f.ai[0] === "1")),
  )
  return { total: rows.length, rows: rows.slice(offset, offset + PAGE) }
}

/* ---------- page ---------- */

export function MediaGridPattern() {
  const [filters, setFilters] = useFacetParams(facets, { mode: "hash" })
  const [q, setQ] = React.useState("")
  const query = useDebouncedValue(q)
  const [items, setItems] = React.useState<Asset[]>([])
  const [total, setTotal] = React.useState(0)
  const [state, setState] = React.useState<"loading" | "more" | "idle" | "error">("loading")
  const [version, setVersion] = React.useState(0)
  const key = JSON.stringify([query, filters, version])
  const filtered = !!query || facetCount(filters) > 0
  const showSkeleton = useDelayedFlag(state === "loading")

  // Every new question starts a new generation; a response from an older one (first page or
  // load-more) is dropped, success or failure, so stale rows never land in a newer list.
  const generation = React.useRef(0)

  // first page whenever the question changes
  React.useEffect(() => {
    const gen = ++generation.current
    setState("loading")
    setItems([])
    fetchAssets(query, filters, 0)
      .then((r) => gen === generation.current && (setItems(r.rows), setTotal(r.total), setState("idle")))
      .catch(() => gen === generation.current && setState("error"))
    return () => {
      generation.current++
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // infinite scroll: a sentinel near the bottom loads the next 24
  const sentinel = React.useRef<HTMLDivElement>(null)
  const more = items.length < total
  React.useEffect(() => {
    const el = sentinel.current
    if (!el || state !== "idle" || !more) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        const gen = generation.current
        setState("more")
        fetchAssets(query, filters, items.length)
          .then((r) => gen === generation.current && (setItems((x) => [...x, ...r.rows]), setState("idle")))
          .catch(() => gen === generation.current && setState("error"))
      },
      { rootMargin: "400px" },
    )
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, more, items.length, key])

  const queue = useUploadQueue({ concurrency: 3, run: fakeUpload })

  return (
    <Page width="full">
      <PageHeader
        title="素材库"
        info="分面筛选写进地址栏；媒体网格用无限滚动；上传在右下角排队。"
        actions={
          <>
            <Button variant="primary" onClick={() => queue.add(fakeFiles())}>
              <Upload />
              上传素材
            </Button>
          </>
        }
      />
      <FilterBar active={filtered} onClear={() => (setQ(""), setFilters({}))}>
        <SearchInput value={q} onValueChange={setQ} placeholder="搜索文件名" />
        <FacetFilter facets={facets} value={filters} onValueChange={setFilters} />
      </FilterBar>

      {state === "error" && !items.length ? (
        <StateView kind="error" onRetry={() => setVersion((v) => v + 1)} />
      ) : state !== "loading" && !items.length ? (
        filtered ? (
          <StateView kind="no-match" onClearFilters={() => (setQ(""), setFilters({}))} />
        ) : (
          <StateView
            kind="empty"
            title="还没有素材"
            action={
              <Button variant="primary" size="sm">
                上传素材
              </Button>
            }
          />
        )
      ) : (
        <>
          <p className="mb-3 h-5 text-small text-muted-foreground tabular">{state !== "loading" && `共 ${total} 个`}</p>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-4">
            {items.map((a) => (
              <Tile key={a.id} a={a} />
            ))}
            {((state === "loading" && showSkeleton) || state === "more") &&
              Array.from({ length: state === "loading" ? 12 : 6 }, (_, i) => (
                <li key={`s${i}`}>
                  <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                  <Skeleton className="mt-2 h-3 w-3/5" />
                </li>
              ))}
          </ul>
          <div ref={sentinel} aria-hidden className="h-1" />
          {state === "error" && items.length > 0 && (
            <div className="py-6 text-center">
              <Button size="sm" onClick={() => setState("idle")}>
                加载失败，重试
              </Button>
            </div>
          )}
        </>
      )}
      <UploadQueuePanel queue={queue} />
    </Page>
  )
}

function Tile({ a }: { a: Asset }) {
  return (
    <li className="min-w-0">
      <div className="grid aspect-[4/3] place-items-center rounded-lg border bg-sunken text-faint-foreground [&_svg]:size-7">
        {a.kind === "video" ? <Film /> : <ImageIcon />}
      </div>
      <div className="mt-2 truncate text-small font-medium" title={a.name}>
        {a.name}
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {a.tags.slice(0, 2).map((t) => {
          const tag = tagList.find((x) => x.value === t)!
          const c = catClass(tag.color)
          return (
            <span key={t} className={cn("rounded-xs px-1.5 text-caption font-medium", c.fill, c.fg)}>
              {tag.label}
            </span>
          )
        })}
      </div>
    </li>
  )
}

/* ---------- a fake upload: progress, a duplicate, one network failure, one rejected file ---------- */

let attempt = 0
async function fakeUpload(file: File, report: (f: number) => void) {
  if (file.size > 20 * 1024 * 1024) throw new UploadRejected("文件超过 20 MB")
  const n = ++attempt
  for (let p = 0; p <= 1; p += 0.1 + Math.random() * 0.15) {
    report(p)
    await wait(180)
    if (n % 6 === 4 && p > 0.5) throw new Error("网络中断")
  }
  return file.name.startsWith("罗勒-001") ? ("exists" as const) : ("added" as const)
}

function fakeFiles() {
  const names = ["罗勒-001.jpg", "薄荷-新品.jpg", "番茄-横幅.png", "生菜-场景.jpg", "草莓-包装.jpg", "活动视频.mp4"]
  return names.map((n, i) => new File([new Uint8Array(i === 5 ? 21 * 1024 * 1024 : 1024)], n))
}
