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

export function useUploadQueue({ run, concurrency = 3 }: { run: UploadRun; concurrency?: number }) {
  const [items, setItems] = React.useState<UploadItem[]>([])
  // The ref is the source of truth so the pump sees every change at once; state mirrors it.
  const itemsRef = React.useRef(items)
  const running = React.useRef(new Set<string>())
  const runRef = React.useRef(run)
  runRef.current = run

  const commit = React.useCallback((next: UploadItem[]) => {
    itemsRef.current = next
    setItems(next)
  }, [])
  const patch = React.useCallback(
    (id: string, fields: Partial<UploadItem>) => commit(itemsRef.current.map((i) => (i.id === id ? { ...i, ...fields } : i))),
    [commit],
  )

  const pump = React.useCallback(() => {
    while (running.current.size < concurrency) {
      const item = itemsRef.current.find((i) => i.status === "waiting" && !running.current.has(i.id))
      if (!item) return
      running.current.add(item.id)
      patch(item.id, { status: "uploading", progress: undefined })
      runRef
        .current(item.file, (fraction) => patch(item.id, { progress: Math.max(0, Math.min(1, fraction)) }))
        .then((result) => patch(item.id, { status: result === "exists" ? "exists" : "added", progress: 1 }))
        .catch((e: unknown) =>
          patch(item.id, {
            status: "failed",
            error: e instanceof Error ? e.message : undefined,
            retryable: !(e instanceof UploadRejected),
          }),
        )
        .finally(() => {
          running.current.delete(item.id)
          pump()
        })
    }
  }, [concurrency, patch])

  const add = React.useCallback(
    (files: Iterable<File>) => {
      const added = [...files].map((file) => ({ id: `u${++nextId}`, file, status: "waiting" as const }))
      if (!added.length) return
      commit([...itemsRef.current, ...added])
      pump()
    },
    [commit, pump],
  )

  const retry = React.useCallback(
    (id: string) => {
      patch(id, { status: "waiting", progress: undefined, error: undefined })
      pump()
    },
    [patch, pump],
  )

  const clearFinished = React.useCallback(() => commit(itemsRef.current.filter((i) => ACTIVE.has(i.status))), [commit])

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
