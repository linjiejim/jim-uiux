"use client"

import * as React from "react"
import { ChevronDown, ChevronUp, CircleAlert, CircleCheck, Copy, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { s } from "@/registry/jim/lib/strings"
import { Button, IconButton } from "@/registry/jim/ui/button"
import { Spinner } from "@/registry/jim/ui/spinner"

/*
 * Upload queue: files go up a few at a time while the user keeps working.
 *   - one row per file; the state words are fixed:
 *     等待 / 上传中 x% / 已添加 / 已存在 / 失败（重试）
 *   - progress is a real fraction from `report`; unknown progress shows a spinner, never a fake bar
 *   - a panel at the bottom right (phones: full width above the safe area), collapsible
 *   - the header counts while running (上传中 · 3/10) and sums up when settled, leaving out
 *     zero counts (已添加 8 个，失败 1 个)
 *   - collapses by itself 4s after everything succeeded; never while a failure remains
 *   - ✕ appears once nothing is running; it clears the finished rows
 *   - leaving the page mid-upload asks first (beforeunload)
 * Errors are plain words from `run` (throw new Error("文件超过 20 MB")); throw UploadRejected
 * for a file that can never succeed (too large, wrong type) so it shows no Retry.
 */

export type UploadStatus = "waiting" | "uploading" | "added" | "exists" | "failed"

export type UploadItem = {
  id: string
  file: File
  status: UploadStatus
  /** 0–1 while uploading; undefined when `run` never reports. */
  progress?: number
  error?: string
  retryable?: boolean
}

/** A file that will fail again on retry (too large, unsupported). */
export class UploadRejected extends Error {}

export type UploadRun = (file: File, report: (fraction: number) => void) => Promise<"added" | "exists" | void>

const ACTIVE: ReadonlySet<UploadStatus> = new Set(["waiting", "uploading"])
let nextId = 0

export type UploadQueueConfig = { run: UploadRun; concurrency?: number }

/**
 * The queue without React: holds the items, runs up to `concurrency` at a time and reports every
 * change through `onChange`. `config` is read on every pump, so a caller may swap `run` or
 * `concurrency` in place. useUploadQueue wraps it; it is exported for tests and non-React use.
 */
export function createUploadQueue(config: UploadQueueConfig, onChange: (items: UploadItem[]) => void) {
  let items: UploadItem[] = []
  const running = new Set<string>()

  const commit = (next: UploadItem[]) => {
    items = next
    onChange(items)
  }
  const patch = (id: string, fields: Partial<UploadItem>) => commit(items.map((i) => (i.id === id ? { ...i, ...fields } : i)))

  function pump() {
    while (running.size < (config.concurrency ?? 3)) {
      const item = items.find((i) => i.status === "waiting" && !running.has(i.id))
      if (!item) return
      running.add(item.id)
      patch(item.id, { status: "uploading", progress: undefined })
      const report = (fraction: number) => patch(item.id, { progress: Math.max(0, Math.min(1, fraction)) })
      // Start the runner inside a continuation: a runner that throws before returning a promise
      // (UploadRejected on a size check) still ends in the same failure path and frees its slot.
      Promise.resolve()
        .then(() => config.run(item.file, report))
        .then(
          (result) => patch(item.id, { status: result === "exists" ? "exists" : "added", progress: 1 }),
          (e: unknown) =>
            patch(item.id, {
              status: "failed",
              error: e instanceof Error ? e.message : undefined,
              retryable: !(e instanceof UploadRejected),
            }),
        )
        .finally(() => {
          running.delete(item.id)
          pump()
        })
    }
  }

  return {
    get items() {
      return items
    },
    add(files: Iterable<File>) {
      const added = [...files].map((file) => ({ id: `u${++nextId}`, file, status: "waiting" as const }))
      if (!added.length) return
      commit([...items, ...added])
      pump()
    },
    retry(id: string) {
      patch(id, { status: "waiting", progress: undefined, error: undefined })
      pump()
    },
    clearFinished() {
      commit(items.filter((i) => ACTIVE.has(i.status)))
    },
  }
}

export function useUploadQueue({ run, concurrency = 3 }: UploadQueueConfig) {
  const [items, setItems] = React.useState<UploadItem[]>([])
  const config = React.useRef<UploadQueueConfig>({ run, concurrency })
  config.current.run = run
  config.current.concurrency = concurrency
  const [queue] = React.useState(() => createUploadQueue(config.current, setItems))

  const add = React.useCallback((files: Iterable<File>) => queue.add(files), [queue])
  const retry = React.useCallback((id: string) => queue.retry(id), [queue])
  const clearFinished = React.useCallback(() => queue.clearFinished(), [queue])

  const active = items.filter((i) => ACTIVE.has(i.status)).length

  React.useEffect(() => {
    if (!active) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [active])

  return { items, active, add, retry, clearFinished }
}

export type UploadQueue = ReturnType<typeof useUploadQueue>

function statusText(item: UploadItem) {
  const t = s()
  switch (item.status) {
    case "waiting":
      return t.uploadWaiting
    case "uploading":
      return item.progress === undefined ? t.uploadUploading : t.uploadPercent(Math.round(item.progress * 100))
    case "added":
      return t.uploadAdded
    case "exists":
      return t.uploadExists
    case "failed":
      return item.error ? `${t.uploadFailed}：${item.error}` : t.uploadFailed
  }
}

export function UploadQueuePanel({ queue, className }: { queue: UploadQueue; className?: string }) {
  const { items, active, retry, clearFinished } = queue
  const [collapsed, setCollapsed] = React.useState(false)
  const count = (st: UploadStatus) => items.filter((i) => i.status === st).length
  const failed = count("failed")
  const settled = items.length > 0 && active === 0

  // New files open the panel again.
  const total = items.length
  const prevTotal = React.useRef(total)
  React.useEffect(() => {
    if (total > prevTotal.current) setCollapsed(false)
    prevTotal.current = total
  }, [total])

  // All done and nothing failed: get out of the way after 4s.
  React.useEffect(() => {
    if (!settled || failed) return
    const t = setTimeout(() => setCollapsed(true), 4000)
    return () => clearTimeout(t)
  }, [settled, failed])

  if (!items.length) return null
  const t = s()
  const title = active ? t.uploadProgress(items.length - active, items.length) : t.uploadSummary(count("added"), count("exists"), failed)

  return (
    <section
      aria-label={t.uploadTitle}
      className={cn(
        "fixed bottom-4 right-4 z-40 flex max-h-[60vh] w-[360px] flex-col overflow-hidden rounded-lg bg-popover shadow-overlay",
        "max-sm:inset-x-3 max-sm:bottom-[max(12px,env(safe-area-inset-bottom))] max-sm:w-auto",
        "animate-slide-in-up",
        className,
      )}
    >
      <header className="flex h-11 shrink-0 items-center gap-1 pl-4 pr-1.5">
        <span aria-live="polite" className={cn("min-w-0 flex-1 truncate text-small font-medium", failed && settled && "text-destructive")}>
          {title}
        </span>
        <IconButton label={collapsed ? t.expand : t.collapse} size="icon-sm" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronUp /> : <ChevronDown />}
        </IconButton>
        {settled && (
          <IconButton label={t.close} size="icon-sm" onClick={clearFinished}>
            <X />
          </IconButton>
        )}
      </header>
      {!collapsed && (
        <ul className="min-h-0 flex-1 overflow-y-auto border-t">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 border-b px-4 py-2 last:border-b-0">
              <div className="min-w-0 flex-1">
                <div className="truncate text-body" title={item.file.name}>
                  {item.file.name}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  {item.status === "uploading" && item.progress !== undefined && (
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-(--duration-base)"
                        style={{ width: `${Math.round(item.progress * 100)}%` }}
                      />
                    </div>
                  )}
                  <span
                    className={cn(
                      "truncate text-caption tabular",
                      item.status === "failed" ? "min-w-0 text-destructive" : "shrink-0 text-muted-foreground",
                    )}
                    title={item.error}
                  >
                    {statusText(item)}
                  </span>
                </div>
              </div>
              <span className="shrink-0 [&_svg]:size-4">
                {item.status === "uploading" && item.progress === undefined && <Spinner />}
                {item.status === "added" && <CircleCheck className="text-success" aria-hidden />}
                {item.status === "exists" && <Copy className="text-faint-foreground" aria-hidden />}
                {item.status === "failed" &&
                  (item.retryable ? (
                    <Button size="sm" variant="ghost" onClick={() => retry(item.id)}>
                      {t.retry}
                    </Button>
                  ) : (
                    <CircleAlert className="text-destructive" aria-hidden />
                  ))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
