"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { Command } from "cmdk"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { s } from "@/registry/jim/lib/strings"

/*
 * Command palette: ⌘K / Ctrl+K anywhere, the one top-anchored dialog.
 * 640×480, 120 from the top; the box keeps its size while results change,
 * only the list scrolls. Phones: full width under the safe area, shorter so
 * the keyboard fits. Groups are headed (页面、操作、最近); an item is a verb or
 * a place, with an optional icon, hint and shortcut. Choosing runs the item and
 * closes the palette; Esc closes it; focus returns where it was.
 * Search and jump only — no forms inside; an item that needs input opens its
 * own dialog.
 */
const CloseContext = React.createContext<() => void>(() => {})

export function CommandPalette({
  open,
  onOpenChange,
  placeholder = s().commandPlaceholder,
  empty = s().commandEmpty,
  label = s().commandPlaceholder,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  placeholder?: string
  empty?: React.ReactNode
  /** Accessible name of the dialog. */
  label?: string
  children: React.ReactNode
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          data-slot="scrim"
          className="fixed inset-0 z-50 bg-scrim data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden rounded-xl bg-popover shadow-overlay outline-none",
            "data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out",
            "sm:left-1/2 sm:top-[120px] sm:h-[min(480px,calc(100dvh-160px))] sm:w-[min(640px,calc(100vw-2rem))] sm:-translate-x-1/2",
            "max-sm:inset-x-3 max-sm:top-[max(12px,env(safe-area-inset-top))] max-sm:h-[min(480px,60dvh)]",
          )}
        >
          <DialogPrimitive.Title className="sr-only">{label}</DialogPrimitive.Title>
          <CloseContext.Provider value={() => onOpenChange(false)}>
            <Command loop className="flex min-h-0 flex-1 flex-col">
              <div className="flex shrink-0 items-center gap-2 border-b px-4">
                <Search className="size-4 text-faint-foreground" />
                <Command.Input
                  autoFocus
                  placeholder={placeholder}
                  className="h-12 w-full bg-transparent text-reading outline-none placeholder:text-faint-foreground"
                />
              </div>
              <Command.List className="min-h-0 flex-1 overflow-y-auto p-1.5 [scrollbar-gutter:stable]">
                <Command.Empty className="px-3 py-10 text-center text-body text-muted-foreground">{empty}</Command.Empty>
                {children}
              </Command.List>
              <div className="flex shrink-0 items-center gap-4 border-t px-4 py-2 text-caption text-faint-foreground max-sm:hidden">
                <span>
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd> {s().commandNavigate}
                </span>
                <span>
                  <Kbd>↵</Kbd> {s().commandRun}
                </span>
                <span>
                  <Kbd>esc</Kbd> {s().close}
                </span>
              </div>
            </Command>
          </CloseContext.Provider>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** A headed group of items. */
export function CommandGroup({ heading, children }: { heading: React.ReactNode; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-caption [&_[cmdk-group-heading]]:text-faint-foreground"
    >
      {children}
    </Command.Group>
  )
}

/** One command. Choosing it closes the palette, then runs `onSelect`. `keywords` widen the match (pinyin, synonyms). */
export function CommandItem({
  icon,
  hint,
  shortcut,
  keywords,
  value,
  onSelect,
  disabled,
  children,
}: {
  icon?: React.ReactNode
  hint?: React.ReactNode
  shortcut?: string
  keywords?: string[]
  /** Unique match value; defaults to the text content. */
  value?: string
  onSelect: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  const close = React.useContext(CloseContext)
  return (
    <Command.Item
      value={value}
      keywords={keywords}
      disabled={disabled}
      onSelect={() => {
        close()
        onSelect()
      }}
      className={cn(
        "flex min-h-(--control-lg) cursor-default items-center gap-3 rounded-md px-2.5 text-body outline-none",
        "data-[selected=true]:bg-accent data-[disabled=true]:text-faint-foreground",
        "[&_svg]:size-4 [&_svg]:text-muted-foreground",
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {hint && <span className="shrink-0 truncate text-small text-faint-foreground">{hint}</span>}
      {shortcut && <Kbd>{shortcut}</Kbd>}
    </Command.Item>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 inline-grid min-w-5 place-items-center rounded-xs border px-1 font-sans text-caption text-muted-foreground">
      {children}
    </kbd>
  )
}

/** Open / close state bound to ⌘K (Ctrl+K on Windows and Linux). */
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])
  return [open, setOpen] as const
}
