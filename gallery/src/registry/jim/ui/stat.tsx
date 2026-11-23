import * as React from "react"
import { cn } from "@/lib/utils"
import { Info } from "@/registry/jim/ui/info"

/**
 * A number that matters on its own (a dashboard KPI): the label, ⓘ for how it is counted, the
 * value at display size in tabular figures, and one line of context (「较上周 +12%」「截至 9:00」).
 * The kit doesn't colour that line: what rising and falling look like belongs to the project
 * (in some markets red means up). Loading keeps the tile's height (Skeleton), never shows 0.
 */
export function Stat({
  label,
  info,
  value,
  meta,
  className,
}: {
  label: React.ReactNode
  info?: React.ReactNode
  value: React.ReactNode
  meta?: React.ReactNode
  className?: string
}) {
  return (
    <div data-slot="stat" className={cn("flex min-w-0 flex-col gap-1 rounded-lg border bg-card p-(--space-card)", className)}>
      <div className="flex min-h-5 items-center gap-1 text-small text-muted-foreground">
        <span className="truncate">{label}</span>
        {info && <Info>{info}</Info>}
      </div>
      <div className="tabular truncate text-display font-semibold">{value}</div>
      {meta && <div className="truncate text-caption text-faint-foreground">{meta}</div>}
    </div>
  )
}

/** A row of Stats: one column on phones, two from sm, four from xl. Keep it to one row of ≤ 4. */
export function StatGrid({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="stat-grid" className={cn("grid gap-(--space-card) sm:grid-cols-2 xl:grid-cols-4", className)} {...props} />
}
