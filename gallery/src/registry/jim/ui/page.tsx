"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Info } from "@/registry/jim/ui/info"

/*
 * Page widths are fixed, never invented per page:
 *   narrow 720   forms, settings, reading
 *   wide   1200  lists, dashboards
 *   full         tables that need every pixel, canvases
 * Content is left-aligned in the main area. "fill" makes the page exactly
 * the viewport tall so a table scrolls inside and the page doesn't.
 * The page edge is --space-page (24; data-spacing moves it), 16 on phones.
 * Which layout goes inside: references/patterns/page-layouts.md.
 */
const widths = { narrow: "max-w-[720px]", wide: "max-w-[1200px]", full: "max-w-none" }

export function Page({
  width = "wide",
  fill,
  className,
  ...props
}: React.ComponentProps<"main"> & { width?: keyof typeof widths; fill?: boolean }) {
  return (
    <main
      className={cn(
        "w-full px-(--space-page) pb-10 pt-(--space-page) max-sm:px-4 max-sm:pt-4",
        widths[width],
        fill && "flex h-full min-h-0 flex-col pb-0",
        className,
      )}
      {...props}
    />
  )
}

/**
 * Title + the page's primary action. No subtitle sentence: if the page needs
 * explaining, put it behind ⓘ (`info`).
 */
export function PageHeader({
  title,
  info,
  actions,
  back,
  className,
}: {
  title: React.ReactNode
  info?: React.ReactNode
  actions?: React.ReactNode
  back?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn("mb-5 flex min-h-(--control-lg) shrink-0 flex-wrap items-center gap-x-3 gap-y-2", className)}>
      {back}
      {/* basis 12rem: on a phone the actions wrap under the title instead of squeezing it to nothing */}
      <div className="flex min-w-0 flex-[1_1_12rem] items-center gap-1.5">
        <h1 className="truncate text-title-lg font-semibold">{title}</h1>
        {info && <Info>{info}</Info>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}

/** Section inside a page: heading + content. --space-section (32) between sections. */
export function Section({
  title,
  actions,
  className,
  children,
}: {
  title?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("mt-(--space-section) first:mt-0", className)}>
      {(title || actions) && (
        <div className="mb-3 flex items-center gap-2">
          {title && <h2 className="flex-1 text-heading font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

/**
 * A main column and a side column (properties, related items, help) on one page. The side
 * column is 320 and stays in view while the main column scrolls, once the columns themselves
 * have room (≥ 896, so the main column keeps ≥ 544 whatever the shell takes); narrower, it drops
 * under the main column. --space-section between them. For a list object prefer the drawer:
 * a page with columns is for objects with their own tabs or sub-lists, or a URL.
 */
export function PageColumns({
  aside,
  asideLabel,
  className,
  children,
}: {
  aside: React.ReactNode
  /** Names the side column for screen readers (「属性」「相关项目」). */
  asideLabel?: string
  className?: string
  children: React.ReactNode
}) {
  // a container query, not a viewport breakpoint: the sidebar or a workbench rail eats the width
  return (
    <div data-slot="page-columns" className={cn("@container", className)}>
      <div className="grid gap-(--space-section) @4xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">{children}</div>
        <aside aria-label={asideLabel} className="min-w-0 @4xl:sticky @4xl:top-(--space-page) @4xl:self-start">
          {aside}
        </aside>
      </div>
    </div>
  )
}
