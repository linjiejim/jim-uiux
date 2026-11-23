import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * A group that needs its own boundary: a chart on a dashboard, an item in a card grid,
 * the card of a sign-in page. 1px line, rounded-lg, --space-card (16) inside. Never a
 * shadow, never a card inside a card; the sections of a page are not cards (Section).
 * `title` is the card's name (14 / 500), `actions` sit at its right (≤ 2, small).
 */
export function Card({
  title,
  actions,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & { title?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section data-slot="card" className={cn("min-w-0 rounded-lg border bg-card p-(--space-card)", className)} {...props}>
      {(title || actions) && (
        <div className="mb-3 flex min-h-(--control-sm) items-center gap-2">
          {title && <h3 className="min-w-0 flex-1 truncate text-body font-medium">{title}</h3>}
          {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

/**
 * Cards in a grid that fills the width: as many columns as fit at `min` (240 by default),
 * --space-card between them. For media, set the aspect on the image (16 / 9, 4 / 3, 1 / 1).
 */
export function CardGrid({ min = 240, className, style, ...props }: React.ComponentProps<"div"> & { min?: number }) {
  return (
    <div
      data-slot="card-grid"
      className={cn("grid gap-(--space-card)", className)}
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))`, ...style }}
      {...props}
    />
  )
}
