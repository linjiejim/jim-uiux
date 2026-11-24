"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { Command } from "cmdk"
import { Check, ChevronDown, Plus, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { s } from "@/registry/jim/lib/strings"
import { useDebouncedValue } from "@/registry/jim/hooks/use-debounced-value"
import { useDelayedFlag } from "@/registry/jim/hooks/use-delayed-flag"
import { Button } from "@/registry/jim/ui/button"
import { useFieldControl } from "@/registry/jim/ui/field"
import { controlClass } from "@/registry/jim/ui/input"
import { Spinner } from "@/registry/jim/ui/spinner"

export type ComboOption = { value: string; label: string; hint?: string }

type Common = {
  options: ComboOption[]
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
}

export type ComboboxSingleProps = Common & {
  multiple?: false
  /** Controlled. `undefined` here means "nothing picked" and shows the placeholder. */
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
}

export type ComboboxMultipleProps = Common & {
  multiple: true
  /** Controlled. `undefined` here means "nothing picked", same as []. */
  value?: string[]
  defaultValue?: string[]
  /** `options`: the picked options in order, labels included (also ones found by onSearch or created). */
  onValueChange?: (value: string[], options: ComboOption[]) => void
  /**
   * Server search, called 250ms after typing stops (and with "" on open). Resolve to the options
   * to show; reject to show 「搜索失败」 with Retry. With it, `options` only names what you
   * already know (at least the picked values), so chips have labels.
   */
  onSearch?: (query: string) => Promise<ComboOption[]>
  /** Offers 创建「…」 when nothing matches the query exactly; resolve to the new option. */
  onCreate?: (label: string) => ComboOption | Promise<ComboOption>
  /** Name when not inside a Field. */
  "aria-label"?: string
}

/**
 * Searchable select for more than ~8 options. `multiple`: picked items show as chips, as many
 * as fit on one line, then "+N"; the menu stays open while picking.
 */
export function Combobox(props: ComboboxSingleProps | ComboboxMultipleProps) {
  return props.multiple ? <MultiCombobox {...props} /> : <SingleCombobox {...props} />
}

function SingleCombobox(props: ComboboxSingleProps) {
  const {
    options,
    value: valueProp,
    defaultValue,
    onValueChange,
    placeholder = s().selectPlaceholder,
    searchPlaceholder = s().searchPlaceholder,
    disabled,
    className,
  } = props
  const [open, setOpen] = React.useState(false)
  const [inner, setInner] = React.useState(defaultValue)
  // Controlled whenever `value` is passed, even as undefined.
  const controlled = "value" in props
  const value = controlled ? valueProp : inner
  const field = useFieldControl()
  const current = options.find((o) => o.value === value)
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        {...field}
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        className={cn(
          controlClass,
          "flex h-(--control-md) items-center justify-between gap-2 px-2.5 text-left",
          !current && "text-faint-foreground",
          className,
        )}
      >
        <span className="truncate">{current?.label ?? placeholder}</span>
        <ChevronDown className="size-4 text-faint-foreground" />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className={cn(
            "z-(--z-overlay) w-(--radix-popover-trigger-width) min-w-56 overflow-hidden rounded-lg bg-popover shadow-popover",
            "data-[state=open]:animate-drop-in data-[state=closed]:animate-drop-out",
          )}
        >
          <Command>
            <div className="flex items-center gap-2 border-b px-2.5">
              <Search className="size-4 text-faint-foreground" />
              <Command.Input
                placeholder={searchPlaceholder}
                className="h-(--control-md) w-full bg-transparent text-body outline-none placeholder:text-faint-foreground"
              />
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-1">
              <Command.Empty className="px-2 py-6 text-center text-body text-muted-foreground">{s().noOptions}</Command.Empty>
              {options.map((o) => (
                <Command.Item
                  key={o.value}
                  value={`${o.label} ${o.hint ?? ""} ${o.value}`}
                  onSelect={() => {
                    if (!controlled) setInner(o.value)
                    onValueChange?.(o.value)
                    setOpen(false)
                  }}
                  className="relative flex min-h-(--control-md) cursor-default items-center gap-2 rounded-sm py-1 pl-2 pr-8 text-body outline-none data-[selected=true]:bg-accent"
                >
                  <span className="truncate">{o.label}</span>
                  {o.hint && <span className="ml-auto shrink-0 text-small text-faint-foreground">{o.hint}</span>}
                  {o.value === value && <Check className="absolute right-2 size-4" />}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

/* ---------- multiple: pure helpers (tested in tests/combobox-multi.test.ts) ---------- */

/** Local search: label, hint or value contains the query, case-insensitive. */
export function filterOptions(options: ComboOption[], query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return options
  return options.filter((o) => `${o.label}\n${o.hint ?? ""}\n${o.value}`.toLowerCase().includes(q))
}

/**
 * The menu's order: what was picked when it opened comes first, the rest keep their order
 * (Carbon's top-after-reopen). Picking while it's open moves nothing.
 */
export function orderOptions(options: ComboOption[], pinned: string[]) {
  const set = new Set(pinned)
  return [...options.filter((o) => set.has(o.value)), ...options.filter((o) => !set.has(o.value))]
}

/** 创建「…」 is offered when the query isn't empty and no option has exactly that label. */
export function canCreate(query: string, options: ComboOption[]) {
  const q = query.trim().toLowerCase()
  return !!q && !options.some((o) => o.label.trim().toLowerCase() === q)
}

/**
 * How many chips fit on one line of `room` px, leaving room for "+N" when some don't.
 * At least one shows (it truncates). Unmeasured (room ≤ 0): all.
 */
export function fitChips(widths: number[], room: number, gap: number, moreWidth: number) {
  if (room <= 0) return widths.length
  let used = 0
  for (let i = 0; i < widths.length; i++) {
    const next = used + (i ? gap : 0) + widths[i]
    const more = i < widths.length - 1 ? gap + moreWidth : 0
    if (next + more > room) return Math.max(1, i)
    used = next
  }
  return widths.length
}

/** Enter / Esc that only confirm or cancel an IME composition (Chinese, Japanese input). */
const composing = (e: { isComposing?: boolean; keyCode?: number }) => !!e.isComposing || e.keyCode === 229

type Item = { kind: "option"; option: ComboOption } | { kind: "create"; label: string }
const keyOf = (it: Item) => (it.kind === "create" ? "\u0000create" : it.option.value)

const chipClass = "inline-flex h-6 min-w-0 max-w-40 items-center rounded-sm bg-muted text-small text-foreground"

function MultiCombobox(props: ComboboxMultipleProps) {
  const {
    options,
    value: valueProp,
    defaultValue,
    onValueChange,
    placeholder = s().selectPlaceholder,
    searchPlaceholder = s().searchPlaceholder,
    disabled,
    className,
    onSearch,
    onCreate,
    "aria-label": ariaLabel,
  } = props
  const controlled = "value" in props
  const [inner, setInner] = React.useState<string[]>(defaultValue ?? [])
  const value = (controlled ? valueProp : inner) ?? []
  const valueRef = React.useRef(value)
  valueRef.current = value
  const field = useFieldControl()
  const listId = React.useId()

  // Labels met in search results or created here, so chips keep their names.
  const [seen, setSeen] = React.useState<ReadonlyMap<string, ComboOption>>(() => new Map())
  const known = React.useMemo(() => {
    const m = new Map(seen)
    for (const o of options) m.set(o.value, o)
    return m
  }, [seen, options])
  const optionOf = (v: string) => known.get(v) ?? { value: v, label: v }
  const picked = value.map(optionOf)
  const remember = (list: ComboOption[]) =>
    setSeen((m) => {
      const next = new Map(m)
      for (const o of list) next.set(o.value, o)
      return next
    })

  const commit = (next: string[], extra?: ComboOption) => {
    if (!controlled) setInner(next)
    onValueChange?.(next, next.map((v) => (extra?.value === v ? extra : optionOf(v))))
  }
  const toggle = (o: ComboOption) => {
    const cur = valueRef.current
    commit(cur.includes(o.value) ? cur.filter((v) => v !== o.value) : [...cur, o.value])
  }
  const remove = (v: string) => commit(valueRef.current.filter((x) => x !== v))

  const [open, setOpenState] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [pinned, setPinned] = React.useState<string[]>([])
  const setOpen = (next: boolean) => {
    if (next) setPinned(valueRef.current)
    else {
      setQuery("")
      setFailed(null)
      setCreateFailed(null)
    }
    setOpenState(next)
  }

  /* async search: the latest query wins; a stale answer is dropped */
  const searchRef = React.useRef(onSearch)
  searchRef.current = onSearch
  const q = query.trim()
  const debounced = useDebouncedValue(q, 250)
  const [remote, setRemote] = React.useState<{ query: string; options: ComboOption[] } | null>(null)
  const [failed, setFailed] = React.useState<string | null>(null)
  const [attempt, setAttempt] = React.useState(0)
  const remoteMode = !!onSearch
  React.useEffect(() => {
    if (!open || !remoteMode) return
    let live = true
    setFailed(null)
    Promise.resolve()
      .then(() => searchRef.current!(debounced))
      .then(
        (list) => {
          if (!live) return
          setRemote({ query: debounced, options: list })
          remember(list)
        },
        () => live && setFailed(debounced),
      )
    return () => {
      live = false
    }
  }, [open, remoteMode, debounced, attempt])
  const error = remoteMode && failed !== null && failed === q
  const loading = remoteMode && !error && remote?.query !== q
  const spinning = useDelayedFlag(open && loading)

  /* create */
  const [creating, setCreating] = React.useState(false)
  const [createFailed, setCreateFailed] = React.useState<string | null>(null)
  const create = async (label: string) => {
    if (!onCreate || creating) return
    setCreating(true)
    setCreateFailed(null)
    try {
      const o = await onCreate(label)
      remember([o])
      if (!valueRef.current.includes(o.value)) commit([...valueRef.current, o.value], o)
      setQuery("")
    } catch {
      setCreateFailed(label)
    } finally {
      setCreating(false)
    }
  }

  /* the list */
  // a failed search shows no stale results from the query before
  const base = error ? [] : remoteMode ? (remote?.options ?? []) : filterOptions(options, q)
  // With no query, what was picked at open stays on top even if the server's first page lacks it.
  const withPinned = q || error ? base : [...pinned.map(optionOf).filter((o) => !base.some((b) => b.value === o.value)), ...base]
  const list = orderOptions(withPinned, pinned)
  const items: Item[] = list.map((option) => ({ kind: "option", option }))
  if (onCreate && !loading && canCreate(q, [...list, ...picked])) items.push({ kind: "create", label: q })

  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const [activeKey, setActiveKey] = React.useState<string | null>(null)
  const activeIndex = Math.max(0, items.findIndex((it) => keyOf(it) === activeKey))
  const active = items[activeIndex] as Item | undefined
  const optionId = (i: number) => `${listId}-${i}`
  const moveTo = (i: number) => {
    const it = items[Math.min(items.length - 1, Math.max(0, i))]
    if (!it) return
    setActiveKey(keyOf(it))
    document.getElementById(optionId(items.indexOf(it)))?.scrollIntoView({ block: "nearest" })
  }
  const pick = (it: Item | undefined) => {
    if (!it) return
    if (it.kind === "create") void create(it.label)
    else toggle(it.option)
  }

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (composing(e.nativeEvent)) return
    switch (e.key) {
      case "ArrowDown":
        moveTo(activeIndex + 1)
        break
      case "ArrowUp":
        moveTo(activeIndex - 1)
        break
      case "Home":
        if (!items.length) return
        moveTo(0)
        break
      case "End":
        if (!items.length) return
        moveTo(items.length - 1)
        break
      case "Enter":
        pick(active)
        break
      case "Backspace":
        // empty search: Backspace takes off the last chip
        if (q || !valueRef.current.length) return
        remove(valueRef.current[valueRef.current.length - 1])
        break
      default:
        return
    }
    e.preventDefault()
  }

  /* chips: as many as fit on one line, then +N (measured off-screen) */
  const rowRef = React.useRef<HTMLDivElement>(null)
  const measureRef = React.useRef<HTMLDivElement>(null)
  const [shown, setShown] = React.useState(value.length)
  const labels = picked.map((o) => o.label).join("\n")
  React.useLayoutEffect(() => {
    const row = rowRef.current
    const measure = measureRef.current
    if (!row || !measure) return
    const fit = () => {
      const els = Array.from(measure.children) as HTMLElement[]
      const more = els.pop()
      const room = row.clientWidth - parseFloat(getComputedStyle(row).paddingLeft || "0")
      setShown(fitChips(els.map((el) => el.offsetWidth), room, 4, more?.offsetWidth ?? 0))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(row)
    return () => ro.disconnect()
  }, [labels, disabled])
  const visible = picked.slice(0, Math.max(shown, Math.min(1, picked.length)))
  const hidden = picked.length - visible.length

  const summary = picked.length ? new Intl.ListFormat(s().locale, { type: "conjunction" }).format(picked.map((o) => o.label)) : ""

  const chip = (o: ComboOption, live: boolean) => (
    <span key={o.value} className={cn(chipClass, disabled ? "px-1.5 text-faint-foreground" : "pl-1.5")}>
      <span className="truncate" aria-hidden={live || undefined}>
        {o.label}
      </span>
      {!disabled && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={s().removeItem(o.label)}
          // never takes focus: the search (or the trigger) keeps it
          onMouseDown={(e) => e.preventDefault()}
          onClick={live ? () => remove(o.value) : undefined}
          // hit area 44 on touch
          className="pointer-events-auto relative ml-0.5 grid size-5 shrink-0 place-items-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground after:absolute pointer-coarse:after:-inset-3"
        >
          <X className="size-3.5" />
        </button>
      )}
    </span>
  )

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <div data-slot="combobox-multiple" className={cn("relative min-w-0", className)}>
        <PopoverPrimitive.Trigger
          {...field}
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          // ↓ / ↑ open it too, as on any combobox
          onKeyDown={(e) => {
            if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !open) {
              e.preventDefault()
              setOpen(true)
            }
          }}
          className={cn(controlClass, "flex h-(--control-md) items-center justify-between gap-2 px-2.5 text-left")}
        >
          {picked.length ? (
            <span className="sr-only">{summary}</span>
          ) : (
            <span className="truncate text-faint-foreground">{placeholder}</span>
          )}
          <ChevronDown className="ml-auto size-4 text-faint-foreground" />
        </PopoverPrimitive.Trigger>
        {/* chips sit over the trigger: their labels let clicks through to it, their ✕ doesn't */}
        <div ref={rowRef} className="pointer-events-none absolute inset-y-0 left-0 right-8 flex items-center gap-1 overflow-hidden pl-1">
          {visible.map((o) => chip(o, true))}
          {hidden > 0 && (
            <span aria-hidden className={cn(chipClass, "shrink-0 px-1.5 tabular text-muted-foreground")}>
              +{hidden}
            </span>
          )}
        </div>
        <div ref={measureRef} aria-hidden className="invisible absolute left-0 top-0 flex h-0 w-max gap-1 overflow-hidden whitespace-nowrap *:shrink-0">
          {picked.map((o) => chip(o, false))}
          <span className={cn(chipClass, "shrink-0 px-1.5 tabular")}>+{picked.length}</span>
        </div>
      </div>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          collisionPadding={8}
          // a chip's ✕ belongs to the control: removing one leaves the menu open
          onInteractOutside={(e) => rowRef.current?.contains(e.target as Node) && e.preventDefault()}
          // Esc that cancels an IME composition doesn't close the menu
          onEscapeKeyDown={(e) => composing(e) && e.preventDefault()}
          className={cn(
            "z-(--z-overlay) w-(--radix-popover-trigger-width) min-w-56 overflow-hidden rounded-lg bg-popover shadow-popover",
            "data-[state=open]:animate-drop-in data-[state=closed]:animate-drop-out",
          )}
        >
          <div className="flex items-center gap-2 border-b px-2.5">
            <Search className="size-4 shrink-0 text-faint-foreground" />
            <input
              ref={searchInputRef}
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={active ? optionId(activeIndex) : undefined}
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveKey(null)
                setCreateFailed(null)
              }}
              onKeyDown={onSearchKeyDown}
              className="h-(--control-md) w-full min-w-0 bg-transparent text-body outline-none placeholder:text-faint-foreground"
            />
            {spinning && <Spinner label={s().searching} className="shrink-0 text-faint-foreground" />}
          </div>
          <div className="max-h-80 overflow-y-auto p-1">
            <div
              role="listbox"
              id={listId}
              aria-multiselectable
              aria-label={ariaLabel}
              aria-labelledby={ariaLabel || !field.id ? undefined : `${field.id}-label`}
            >
              {items.map((it, i) => {
                const on = it.kind === "option" && value.includes(it.option.value)
                return (
                  <div
                    key={keyOf(it)}
                    id={optionId(i)}
                    role="option"
                    aria-selected={on}
                    aria-disabled={(it.kind === "create" && creating) || undefined}
                    data-active={i === activeIndex || undefined}
                    onPointerMove={() => activeKey !== keyOf(it) && setActiveKey(keyOf(it))}
                    // keep focus in the search
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(it)}
                    className={cn(
                      "relative flex min-h-(--control-md) cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-body data-active:bg-accent",
                      loading && "text-muted-foreground",
                    )}
                  >
                    {it.kind === "option" ? (
                      <>
                        <span
                          aria-hidden
                          className={cn(
                            "grid size-4 shrink-0 place-items-center rounded-xs border",
                            on ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background",
                          )}
                        >
                          {on && <Check className="size-3 stroke-3" />}
                        </span>
                        <span className="truncate">{it.option.label}</span>
                        {it.option.hint && <span className="ml-auto shrink-0 text-small text-faint-foreground">{it.option.hint}</span>}
                      </>
                    ) : (
                      <>
                        {creating ? <Spinner className="text-faint-foreground" /> : <Plus className="size-4 shrink-0 text-muted-foreground" />}
                        <span className="truncate">{s().createOption(it.label)}</span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
            {createFailed !== null && createFailed === q && (
              <p role="alert" className="px-2 py-1.5 text-small text-destructive">
                {s().createFailed}
              </p>
            )}
            {error ? (
              <div role="alert" className="flex flex-col items-center gap-2 px-2 py-4 text-center text-body text-muted-foreground">
                {s().searchFailed}
                <Button
                  size="sm"
                  onClick={() => {
                    setAttempt((n) => n + 1)
                    searchInputRef.current?.focus()
                  }}
                >
                  {s().retry}
                </Button>
              </div>
            ) : loading && !items.length ? (
              // first answer still on its way: a quiet spinner, never "no results"
              <div role="status" className="flex min-h-18 items-center justify-center gap-2 text-body text-muted-foreground">
                {spinning && (
                  <>
                    <Spinner />
                    {s().searching}
                  </>
                )}
              </div>
            ) : (
              !items.length && (
                <p role="status" className="px-2 py-6 text-center text-body text-muted-foreground">
                  {s().noOptions}
                </p>
              )
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
