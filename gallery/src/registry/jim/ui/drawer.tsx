"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { ChevronDown, ChevronLeft, ChevronUp, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { s } from "@/registry/jim/lib/strings"
import { useGuardedOpen } from "@/registry/jim/hooks/use-guarded-open"
import { IconButton } from "@/registry/jim/ui/button"
import { Kbd } from "@/registry/jim/ui/kbd"
import { DiscardDialog } from "@/registry/jim/ui/confirm-dialog"
import { useReturnFocus } from "@/registry/jim/hooks/use-return-focus"
import { FieldControlProvider } from "@/registry/jim/ui/field"
import { ResizeHandle } from "@/registry/jim/ui/resize-handle"

/*
 * Side drawer from the right: view, edit (in place, see DetailList) and
 * create a list object; a filter panel. The page behind keeps its context.
 * One drawer at a time — never stack a second one; navigate inside instead.
 *
 * Widths: sm 400 (filters, small settings), md 560 (details, default),
 * lg min(60vw, 960) (rich details). Full width on phones.
 *
 * mode="dock" is the workbench inspector: non-modal, no scrim, the main pane
 * stays clickable. From 1440 (DOCK_MIN) it docks as a column beside the main
 * pane (place <Drawer mode="dock"> last in a flex row); below it floats over
 * the page and a click outside closes it. Width 360–520 (default 400), dragged
 * from its left edge and remembered per `storageKey` (one per place). Esc
 * closes the top layer only. Nested objects: useInspectorStack (≤ 3 deep).
 */
let openCount = 0

export const DOCK_MIN = 1440
export const INSPECTOR_WIDTH = { min: 360, default: 400, max: 520 } as const

type DrawerMode = "modal" | "dock"
type DrawerCtx = {
  mode: DrawerMode
  dirty: boolean
  focus: ReturnType<typeof useReturnFocus> | null
  /** Leave the current item (paging): asks first when there are unsaved edits, like closing. */
  leave: (go: () => void) => void
}
const DrawerContext = React.createContext<DrawerCtx>({ mode: "modal", dirty: false, focus: null, leave: (go) => go() })

/** Marks drawer panels, so useListPaging can tell the drawer from a layer above it. */
const DRAWER = '[data-slot="drawer-content"]'

export function Drawer({
  mode = "modal",
  dirty = false,
  open,
  defaultOpen,
  onOpenChange,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root> & { dirty?: boolean; mode?: DrawerMode }) {
  const g = useGuardedOpen({ open, defaultOpen, onOpenChange, dirty })
  const focus = useReturnFocus(g.open)
  const [leaving, setLeaving] = React.useState<(() => void) | null>(null)
  const leave = React.useCallback((go: () => void) => (dirty ? setLeaving(() => go) : go()), [dirty])
  const ctx = React.useMemo(() => ({ mode, dirty, focus, leave }), [mode, dirty, focus, leave])

  React.useEffect(() => {
    if (!g.open) return
    openCount++
    // No bundler-specific env check: the kit must typecheck in Vite and Next alike.
    if (openCount > 1) console.warn("[jim-uiux] Two drawers are open. Use one drawer and navigate inside it.")
    return () => {
      openCount--
    }
  }, [g.open])

  return (
    <>
      <DialogPrimitive.Root open={g.open} onOpenChange={g.onOpenChange} modal={mode !== "dock"} {...props}>
        <DrawerContext.Provider value={ctx}>{children}</DrawerContext.Provider>
      </DialogPrimitive.Root>
      <DiscardDialog
        open={g.discard.open || leaving !== null}
        onKeep={() => {
          setLeaving(null)
          g.discard.keep()
        }}
        onDiscard={() => {
          if (!leaving) return g.discard.discard()
          setLeaving(null)
          leaving()
        }}
      />
    </>
  )
}

export const DrawerTrigger = DialogPrimitive.Trigger
export const DrawerClose = DialogPrimitive.Close

const widths = {
  sm: "sm:w-[400px]",
  md: "sm:w-[560px]",
  lg: "sm:w-[min(60vw,960px)] sm:min-w-[560px]",
}

export function DrawerContent({
  size = "md",
  storageKey,
  className,
  children,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  size?: keyof typeof widths
  /** dock mode: remembers the width under this key (one per place). */
  storageKey?: string
}) {
  const { mode, dirty, focus } = React.useContext(DrawerContext)
  if (mode === "dock") {
    return (
      <DockContent storageKey={storageKey} className={className} onOpenAutoFocus={onOpenAutoFocus} onCloseAutoFocus={onCloseAutoFocus} {...props}>
        {children}
      </DockContent>
    )
  }
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay data-slot="scrim" className="fixed inset-0 z-(--z-overlay) bg-scrim data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
      <DialogPrimitive.Content
        data-slot="drawer-content"
        data-dirty={dirty || undefined}
        // Details are read first: focus the panel, not the first icon button (which would pop its
        // tooltip). A field marked autoFocus (creating, editing) keeps its focus.
        onOpenAutoFocus={(e) => {
          onOpenAutoFocus?.(e)
          if (e.defaultPrevented) return
          e.preventDefault()
          const panel = e.currentTarget as HTMLElement
          if (!panel.contains(document.activeElement)) panel.focus()
        }}
        onCloseAutoFocus={(e) => {
          onCloseAutoFocus?.(e)
          focus?.restore(e)
        }}
        className={cn(
          "fixed inset-y-0 right-0 z-(--z-overlay) flex h-dvh w-full max-w-full flex-col bg-popover shadow-overlay outline-none",
          "data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right",
          widths[size],
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

/** Title, optional meta line, actions (≤2 icon buttons), then ✕. `onBack` adds ← for a nested inspector object. */
export function DrawerHeader({
  title,
  description,
  actions,
  onBack,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  onBack?: () => void
  className?: string
}) {
  return (
    <div className={cn("flex shrink-0 items-start gap-2 border-b px-5 py-3.5", onBack && "pl-3", className)}>
      {onBack && (
        <IconButton label={s().back} size="icon-sm" tooltip={false} onClick={onBack} className="-my-0.5 text-muted-foreground">
          <ChevronLeft />
        </IconButton>
      )}
      <div className="min-w-0 flex-1 py-0.5">
        <DialogPrimitive.Title className="truncate text-heading font-semibold">{title}</DialogPrimitive.Title>
        {description ? (
          <DialogPrimitive.Description className="mt-0.5 truncate text-small text-muted-foreground">{description}</DialogPrimitive.Description>
        ) : (
          <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
        )}
      </div>
      {actions}
      <DialogPrimitive.Close asChild>
        <IconButton label={s().close} size="icon-sm" tooltip={false} className="text-muted-foreground">
          <X />
        </IconButton>
      </DialogPrimitive.Close>
    </div>
  )
}

function useMinWidth(px: number) {
  const query = `(min-width: ${px}px)`
  return React.useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query)
      mq.addEventListener("change", cb)
      return () => mq.removeEventListener("change", cb)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

const clampWidth = (w: number) => Math.round(Math.min(INSPECTOR_WIDTH.max, Math.max(INSPECTOR_WIDTH.min, w)))

function useStoredWidth(storageKey?: string) {
  const key = `inspector:width:${storageKey ?? "default"}`
  const [width, setWidth] = React.useState<number>(() => {
    const saved = typeof localStorage !== "undefined" ? Number(localStorage.getItem(key)) : NaN
    return Number.isFinite(saved) && saved > 0 ? clampWidth(saved) : INSPECTOR_WIDTH.default
  })
  const save = React.useCallback((w: number) => localStorage.setItem(key, String(w)), [key])
  return [width, setWidth, save] as const
}

function DockContent({
  storageKey,
  className,
  children,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onInteractOutside,
  onFocusOutside,
  style,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { storageKey?: string }) {
  const { dirty, focus } = React.useContext(DrawerContext)
  const docked = useMinWidth(DOCK_MIN)
  const [width, setWidth, saveWidth] = useStoredWidth(storageKey)

  return (
    <DialogPrimitive.Content
      data-slot="drawer-content"
      data-dirty={dirty || undefined}
      data-mode="dock"
      data-docked={docked || undefined}
      // Docked, the inspector is part of the page: opening it leaves focus where it was (the row),
      // and clicks or focus in the main pane never close it. Floating, it behaves like a light drawer.
      onOpenAutoFocus={(e) => {
        onOpenAutoFocus?.(e)
        if (e.defaultPrevented) return
        e.preventDefault()
        if (!docked) (e.currentTarget as HTMLElement).focus()
      }}
      onInteractOutside={(e) => {
        onInteractOutside?.(e)
        if (docked) e.preventDefault()
      }}
      onFocusOutside={(e) => {
        onFocusOutside?.(e)
        // Closing later gives focus back to where the user went in the page, not the first opener.
        focus?.track(e.detail.originalEvent.target)
        if (docked) e.preventDefault()
      }}
      onCloseAutoFocus={(e) => {
        onCloseAutoFocus?.(e)
        focus?.restore(e)
      }}
      style={{ ...style, ["--inspector-w" as string]: `${width}px` }}
      className={cn(
        "flex flex-col outline-none sm:w-(--inspector-w)",
        docked
          ? "relative h-full shrink-0 border-l bg-background"
          : "fixed inset-y-0 right-0 z-(--z-float) h-dvh w-full max-w-full bg-popover shadow-overlay data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right",
        className,
      )}
      {...props}
    >
      <ResizeHandle
        side="left"
        value={width}
        min={INSPECTOR_WIDTH.min}
        max={INSPECTOR_WIDTH.max}
        defaultValue={INSPECTOR_WIDTH.default}
        onValueChange={setWidth}
        onValueCommit={saveWidth}
        className="max-sm:hidden"
      />
      {children}
    </DialogPrimitive.Content>
  )
}

/**
 * The inspector's history: `show` opens an object from the main pane (a new stack), `push`
 * opens one linked from inside the inspector (≤ `max` deep; the next one replaces the top),
 * `back` returns, `close` empties it. Promoting the top object to the main pane is the caller's
 * navigation followed by `close()`.
 */
export function useInspectorStack<T>(max = 3) {
  const [stack, setStack] = React.useState<T[]>([])
  return {
    stack,
    top: stack.at(-1),
    depth: stack.length,
    show: React.useCallback((item: T) => setStack([item]), []),
    push: React.useCallback((item: T) => setStack((s) => (s.length >= max ? [...s.slice(0, max - 1), item] : [...s, item])), [max]),
    back: React.useCallback(() => setStack((s) => s.slice(0, -1)), []),
    close: React.useCallback(() => setStack([]), []),
  }
}

export function DrawerBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-4 [scrollbar-gutter:stable]", className)} {...props} />
}

export function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex shrink-0 items-center justify-end gap-2 border-t px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]", className)}
      {...props}
    />
  )
}

export type DetailItem = {
  label: React.ReactNode
  /** Shown when reading. Full contrast, selectable. */
  value: React.ReactNode
  /** Control shown in the same place while editing. Omit for read-only rows (ID, timestamps). */
  edit?: React.ReactNode
  error?: React.ReactNode
  required?: boolean
}

/**
 * Key–value details that edit in place. Reading and editing share one layout:
 * every row is at least one control tall and values start where an input's
 * text starts, so switching modes moves nothing — the values just become
 * editable. Use it in a drawer for view → edit → save; creating uses the same
 * list with `editing` and empty values.
 */
export function DetailList({ items, editing = false, className }: { items: DetailItem[]; editing?: boolean; className?: string }) {
  const base = React.useId()
  return (
    <dl className={cn("grid grid-cols-[minmax(6rem,auto)_1fr] gap-x-6 gap-y-1.5 text-body", className)}>
      {items.map((it, i) => {
        const id = `${base}-${i}`
        const live = editing && it.edit !== undefined
        return (
          <React.Fragment key={i}>
            <dt className="flex min-h-(--control-md) items-center self-start text-muted-foreground">
              {live ? (
                // id as in Field: RadioGroup, Slider, SwatchPicker are named via aria-labelledby
                <label id={`${id}-label`} htmlFor={id}>
                  {it.label}
                  {it.required && (
                    <span className="ml-0.5 text-destructive" aria-hidden>
                      *
                    </span>
                  )}
                </label>
              ) : (
                it.label
              )}
            </dt>
            <dd className="flex min-h-(--control-md) min-w-0 flex-col justify-center">
              {live ? (
                <FieldControlProvider id={id} invalid={!!it.error} required={it.required} describedBy={it.error ? `${id}-error` : undefined}>
                  {it.edit}
                  {/* always mounted so a new error is announced (same as Field); sr-only while empty */}
                  <p
                    id={it.error ? `${id}-error` : undefined}
                    aria-live="polite"
                    className={it.error ? "mt-1 text-caption text-destructive" : "sr-only"}
                  >
                    {it.error}
                  </p>
                </FieldControlProvider>
              ) : (
                // 11px = an input's 1px border + 10px padding, so text doesn't jump when editing starts
                <div className="break-words py-1 pl-[11px] select-text">{it.value}</div>
              )}
            </dd>
          </React.Fragment>
        )
      })}
    </dl>
  )
}

/** Keys page only from the drawer (or the page beside a docked one), never past unsaved edits. */
function pagingAllowed(target: HTMLElement | null) {
  if (document.querySelector(`${DRAWER}[data-dirty]`)) return false
  const layer = target?.closest('[role="dialog"], [role="alertdialog"]')
  if (layer) return layer.matches(DRAWER)
  // focus outside every layer (the page, or <body>): only when nothing is open above the drawer
  return !document.querySelector(`[role="alertdialog"], [role="dialog"]:not(${DRAWER})`)
}

/**
 * List → detail drawer paging. While a drawer shows one item of a list, ↑ / ↓ (also ← / →, K / J)
 * step to the previous / next item without closing. Pass the list in on-screen order (a board:
 * column by column, top to bottom). Keys typed into a field, or with ⌘ / Ctrl / Alt, are left alone,
 * and so are keys meant for a layer above the drawer (a Dialog, a ConfirmDialog). While the drawer
 * holds unsaved edits (`dirty`) the keys don't page and DrawerPager's buttons ask first, like closing.
 *
 * While the drawer is open, paging follows the list as it was when the drawer opened, even if opening
 * an item reorders it (read items sort down or drop out); the new order applies once it closes.
 */
export function useListPaging<T extends string>({
  items,
  current,
  onChange,
}: {
  items: readonly T[]
  current: T | null | undefined
  onChange: (item: T) => void
}) {
  // Page through the list as it looked when the drawer opened: opening often reorders it
  // (read items sort down, or drop out) and the current item must not jump.
  const before = React.useRef<readonly T[]>(items)
  const opened = React.useRef<readonly T[] | null>(null)
  if (!current) {
    opened.current = null
    before.current = items
  } else if (!opened.current?.includes(current)) {
    opened.current = before.current.includes(current) ? before.current : items
  }
  const list = opened.current ?? items

  const index = current ? list.indexOf(current) : -1
  const prev = index > 0 ? list[index - 1] : undefined
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : undefined
  const goPrev = React.useCallback(() => {
    if (prev !== undefined) onChange(prev)
  }, [prev, onChange])
  const goNext = React.useCallback(() => {
    if (next !== undefined) onChange(next)
  }, [next, onChange])

  React.useEffect(() => {
    if (!current) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return
      const t = e.target instanceof HTMLElement ? e.target : null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      if (!pagingAllowed(t)) return
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "j") {
        e.preventDefault()
        goNext()
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "k") {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [current, goPrev, goNext])

  return { index, total: list.length, hasPrev: prev !== undefined, hasNext: next !== undefined, goPrev, goNext }
}

/** Position and previous / next buttons for `DrawerHeader actions`. Renders nothing when there's nothing to page. */
export function DrawerPager({
  index,
  total,
  hasPrev,
  hasNext,
  goPrev,
  goNext,
}: Pick<ReturnType<typeof useListPaging>, "index" | "total" | "hasPrev" | "hasNext" | "goPrev" | "goNext">) {
  const { leave } = React.useContext(DrawerContext)
  if (index < 0 || total < 2) return null
  const t = s()
  // aria-disabled, not disabled: a button that disables itself under focus drops focus to <body>
  const endClass = "text-muted-foreground aria-disabled:cursor-not-allowed aria-disabled:bg-transparent aria-disabled:text-faint-foreground"
  return (
    <span className="flex shrink-0 items-center gap-0.5">
      <span className="mr-1 text-caption text-faint-foreground tabular-nums">{t.itemPosition(index + 1, total)}</span>
      <IconButton
        label={t.previousItem}
        tooltip={
          <>
            {t.previousItem} <Kbd>↑</Kbd>
          </>
        }
        size="icon-sm"
        className={endClass}
        aria-disabled={!hasPrev}
        onClick={() => hasPrev && leave(goPrev)}
      >
        <ChevronUp />
      </IconButton>
      <IconButton
        label={t.nextItem}
        tooltip={
          <>
            {t.nextItem} <Kbd>↓</Kbd>
          </>
        }
        size="icon-sm"
        className={endClass}
        aria-disabled={!hasNext}
        onClick={() => hasNext && leave(goNext)}
      >
        <ChevronDown />
      </IconButton>
    </span>
  )
}
