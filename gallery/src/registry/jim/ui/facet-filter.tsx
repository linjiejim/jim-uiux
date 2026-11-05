"use client"

import * as React from "react"
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { s } from "@/registry/jim/lib/strings"
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/jim/ui/popover"

/*
 * Faceted filter: several dimensions at once (type, tag, owner, has-AI…).
 * Sits inside FilterBar, after the search box.
 *   - kinds: single (pick one), multi (checkbox list), boolean (是 / 否)
 *   - no "全部" option anywhere; a set facet clears with its ✕
 *   - a set facet reads "标签：值 ✕"; multi shows the first value + " 等 N 项"
 *   - more than `max` (4) facets: the first max − 1 stay in the bar, the rest go
 *     into a 「筛选」 popover whose button shows how many of them are set; a set
 *     facet from the popover also shows in the bar, so nothing filters unseen
 *   - state lives in the URL: useFacetParams (replaceState, no history spam)
 */

export type FacetOption = { value: string; label: string }

export type Facet =
  | { key: string; label: string; kind: "single" | "multi"; options: FacetOption[] }
  | { key: string; label: string; kind: "boolean"; yes?: string; no?: string }

/** Selected values per facet key. Boolean facets hold ["1"] or ["0"]. Empty or missing = not set. */
export type FacetValue = Record<string, string[] | undefined>

function optionsOf(f: Facet): FacetOption[] {
  if (f.kind !== "boolean") return f.options
  return [
    { value: "1", label: f.yes ?? s().yes },
    { value: "0", label: f.no ?? s().no },
  ]
}

const isSet = (v: FacetValue, key: string) => (v[key]?.length ?? 0) > 0

/** How many facets are set. */
export function facetCount(value: FacetValue) {
  return Object.values(value).filter((v) => v && v.length > 0).length
}

function summary(f: Facet, values: string[]) {
  const opts = optionsOf(f)
  const first = opts.find((o) => o.value === values[0])?.label ?? values[0]
  return values.length > 1 ? `${first}${s().andMore(values.length)}` : first
}

export function FacetFilter({
  facets,
  value,
  onValueChange,
  max = 4,
}: {
  facets: Facet[]
  value: FacetValue
  onValueChange: (next: FacetValue) => void
  /** Most controls in the bar before the rest collapse into 「筛选」. */
  max?: number
}) {
  const inline = facets.length <= max ? facets : facets.slice(0, max - 1)
  const overflow = facets.length <= max ? [] : facets.slice(max - 1)
  const set = (key: string, next: string[] | undefined) => onValueChange({ ...value, [key]: next && next.length ? next : undefined })
  const hiddenSet = overflow.filter((f) => isSet(value, f.key))

  return (
    <>
      {inline.map((f) => (
        <FacetChip key={f.key} facet={f} values={value[f.key] ?? []} onChange={(v) => set(f.key, v)} />
      ))}
      {overflow.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "inline-flex h-(--control-sm) items-center gap-1.5 rounded-md border px-2.5 text-small hover:bg-accent [&_svg]:size-3.5",
                hiddenSet.length
                  ? "border-input bg-selected font-medium text-foreground"
                  : "border-dashed border-input text-muted-foreground",
              )}
            >
              <SlidersHorizontal />
              {s().filters}
              {hiddenSet.length > 0 && <span className="tabular">{hiddenSet.length}</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent className="max-h-[min(480px,70dvh)] overflow-y-auto p-1">
            {overflow.map((f) => (
              <div key={f.key} className="py-1">
                <div className="px-2 pb-0.5 pt-1 text-caption text-faint-foreground">{f.label}</div>
                <OptionList facet={f} values={value[f.key] ?? []} onChange={(v) => set(f.key, v)} />
              </div>
            ))}
          </PopoverContent>
        </Popover>
      )}
      {hiddenSet.map((f) => (
        <FacetChip key={f.key} facet={f} values={value[f.key] ?? []} onChange={(v) => set(f.key, v)} />
      ))}
    </>
  )
}

/** One facet as a chip. Unset: "类型 ⌄" (dashed). Set: "类型：图片 ✕". */
export function FacetChip({ facet, values, onChange }: { facet: Facet; values: string[]; onChange: (next: string[] | undefined) => void }) {
  const [open, setOpen] = React.useState(false)
  const active = values.length > 0
  return (
    <div
      className={cn(
        "inline-flex h-(--control-sm) max-w-full items-center rounded-md border text-small",
        active ? "border-input bg-selected" : "border-dashed border-input",
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-full min-w-0 items-center gap-1 rounded-md px-2.5 hover:bg-accent",
              active ? "pr-1.5 font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            <span className="shrink-0">{facet.label}</span>
            {active ? <span className="truncate">：{summary(facet, values)}</span> : <ChevronDown className="size-3.5" />}
          </button>
        </PopoverTrigger>
        <PopoverContent className="max-h-80 w-56 overflow-y-auto p-1">
          <OptionList facet={facet} values={values} onChange={onChange} onPicked={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
      {active && (
        <button
          type="button"
          aria-label={`${s().clear} ${facet.label}`}
          onClick={() => onChange(undefined)}
          className="mr-1 grid size-5 shrink-0 place-items-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

function OptionList({
  facet,
  values,
  onChange,
  onPicked,
}: {
  facet: Facet
  values: string[]
  onChange: (next: string[] | undefined) => void
  /** Single choice closes its popover. */
  onPicked?: () => void
}) {
  const multi = facet.kind === "multi"
  return (
    <ul role="listbox" aria-label={facet.label} aria-multiselectable={multi || undefined}>
      {optionsOf(facet).map((o) => {
        const on = values.includes(o.value)
        return (
          <li key={o.value}>
            <button
              type="button"
              role="option"
              aria-selected={on}
              onClick={() => {
                if (multi) onChange(on ? values.filter((v) => v !== o.value) : [...values, o.value])
                else {
                  onChange(on ? undefined : [o.value])
                  onPicked?.()
                }
              }}
              className="relative flex min-h-(--control-md) w-full items-center gap-2 rounded-sm px-2 pr-8 text-left text-body hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
            >
              {multi && (
                // a drawn box, not <Checkbox>: a button can't hold another button
                <span
                  aria-hidden
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-xs border",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background",
                  )}
                >
                  {on && <Check className="size-3 stroke-3" />}
                </span>
              )}
              <span className="truncate">{o.label}</span>
              {!multi && on && <Check className="absolute right-2 size-4" />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Facet state in the URL, one parameter per facet key (multi repeats it: ?tag=a&tag=b).
 * `mode: "hash"` for hash routers (#/page?tag=a). Writes with replaceState and keeps other
 * parameters; back / forward and shared links restore the view.
 */
export function useFacetParams(facets: Facet[], { mode = "search" }: { mode?: "search" | "hash" } = {}) {
  const keys = facets.map((f) => f.key).join()
  const read = React.useCallback((): FacetValue => {
    const params = currentParams(mode)
    const out: FacetValue = {}
    for (const f of facets) {
      const all = params.getAll(f.key).filter(Boolean)
      if (all.length) out[f.key] = f.kind === "multi" ? all : all.slice(0, 1)
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys, mode])

  const [value, setValue] = React.useState<FacetValue>(read)

  React.useEffect(() => {
    const on = () => setValue(read())
    const event = mode === "hash" ? "hashchange" : "popstate"
    window.addEventListener(event, on)
    return () => window.removeEventListener(event, on)
  }, [read, mode])

  const update = React.useCallback(
    (next: FacetValue) => {
      setValue(next)
      const params = currentParams(mode)
      for (const f of facets) {
        params.delete(f.key)
        for (const v of next[f.key] ?? []) params.append(f.key, v)
      }
      const qs = params.toString()
      if (mode === "hash") {
        const base = window.location.hash.split("?")[0] || "#/"
        history.replaceState(history.state, "", qs ? `${base}?${qs}` : base)
      } else {
        history.replaceState(history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [keys, mode],
  )

  return [value, update] as const
}

function currentParams(mode: "search" | "hash") {
  return new URLSearchParams(mode === "hash" ? (window.location.hash.split("?")[1] ?? "") : window.location.search)
}
