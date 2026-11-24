"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { CircleAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { s } from "@/registry/jim/lib/strings"
import { Spinner } from "@/registry/jim/ui/spinner"

/*
 * Rename in place: a name in a list, a title, a tab. Click, Enter or F2 turns the text into an
 * input of the same box (no layout jump). Enter or leaving the field saves, Esc puts the old
 * name back; Enter or Esc that only confirm an IME composition do nothing. Empty or invalid:
 * the error shows under it and editing goes on. Async save: the input stays, read-only, with a
 * spinner; a failure keeps it with the error. Focus goes back to the text afterwards.
 * Inside a clickable row, clicks and keys on it don't reach the row.
 */

export type RenameCheck = { kind: "same" } | { kind: "invalid"; error: string } | { kind: "save"; name: string }

/** What committing `draft` means: nothing changed, an error to show, or a trimmed name to save. */
export function checkRename(draft: string, current: string, validate?: (name: string) => string | null | undefined): RenameCheck {
  const name = draft.trim()
  if (name === current) return { kind: "same" }
  if (!name) return { kind: "invalid", error: s().nameRequired }
  const error = validate?.(name)
  return error ? { kind: "invalid", error } : { kind: "save", name }
}

/** Enter / Esc that only confirm or cancel an IME composition (Chinese, Japanese input). */
export function isComposing(e: { isComposing?: boolean; keyCode?: number }) {
  return !!e.isComposing || e.keyCode === 229
}

/** The message of a failed save: the Error's own (written for people), else 「重命名失败，请重试」. */
export function saveError(e: unknown) {
  return e instanceof Error && e.message ? e.message : s().renameFailed
}

const box = "col-start-1 row-start-1 min-w-12 rounded-md border px-1.5"
// The name's text lines up with the text around it; the box (padding + border) sticks out this far
// on each side. A container that clips, like a `truncate` cell, leaves that much room (DataTable
// does; your own: `-mx-2 px-2`). Pass `className="mx-0 max-w-full"` to keep the box inside instead.
// Focus rings and the input's halo are drawn inside the box, so the box is all that needs room.
const outset = "-mx-[calc(--spacing(1.5)+1px)] max-w-[calc(100%+2*(--spacing(1.5)+1px))]"
const ringInside = "focus-visible:outline-offset-[calc(var(--focus-width)*-1)]"

export function InlineRename({
  value,
  onSave,
  validate,
  "aria-label": label,
  editing: editingProp,
  onEditingChange,
  editOnClick = true,
  placeholder,
  maxLength,
  disabled,
  className,
}: {
  value: string
  /** Gets the trimmed new name. Throw (or reject) an Error with a plain-words message to keep editing and show it. */
  onSave: (name: string) => void | Promise<void>
  /** Return an error message to block the save (「已有同名文件」). Empty is checked already. */
  validate?: (name: string) => string | null | undefined
  /** Names the input (「文件名」). */
  "aria-label": string
  /** Controlled: start renaming from a menu item (「重命名」) or the row's F2. */
  editing?: boolean
  onEditingChange?: (editing: boolean) => void
  /** false: the text isn't a button (the row's click opens the item); start through `editing`. */
  editOnClick?: boolean
  /** Shown, faint, when the name is empty. */
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  className?: string
}) {
  const controlled = editingProp !== undefined
  const [inner, setInner] = React.useState(false)
  const editing = !disabled && (controlled ? editingProp : inner)
  const setEditing = (next: boolean) => {
    if (!controlled) setInner(next)
    onEditingChange?.(next)
  }

  const [draft, setDraft] = React.useState(value)
  const [error, setError] = React.useState<string>()
  const [pending, setPending] = React.useState(false)
  // A new editing session starts from the current name.
  const [was, setWas] = React.useState(editing)
  if (was !== editing) {
    setWas(editing)
    if (editing) {
      setDraft(value)
      setError(undefined)
      setPending(false)
    }
  }

  const inputRef = React.useRef<HTMLInputElement>(null)
  const textRef = React.useRef<HTMLElement>(null)
  const returnFocus = React.useRef(false)
  const session = React.useRef(0)
  const id = React.useId()

  const finish = () => {
    session.current++
    // back to the text only if the input still had focus (Enter, Esc, a save that finished there)
    returnFocus.current = document.activeElement === inputRef.current
    setPending(false)
    setEditing(false)
  }

  const commit = async (from: "enter" | "blur") => {
    if (pending) return
    const check = checkRename(draft, value, validate)
    if (check.kind === "same") return finish()
    if (check.kind === "invalid") {
      setError(check.error)
      if (from === "enter") inputRef.current?.select()
      return
    }
    setError(undefined)
    const mine = ++session.current
    try {
      const out = onSave(check.name)
      if (out instanceof Promise) {
        setPending(true)
        await out
      }
      if (mine === session.current) finish()
    } catch (e) {
      if (mine !== session.current) return
      setPending(false)
      setError(saveError(e))
    }
  }

  const cancel = () => {
    if (pending) return
    finish()
  }

  React.useLayoutEffect(() => {
    if (!editing) {
      if (returnFocus.current) textRef.current?.focus()
      returnFocus.current = false
      return
    }
    const input = inputRef.current
    if (!input) return
    const take = () => {
      input.focus()
      input.select()
    }
    // Started from a menu item: the menu hands focus back to its button as it closes. Take it after that.
    if (!document.activeElement?.closest('[role="menu"]')) return take()
    let done = false
    const go = () => {
      if (done) return
      done = true
      stop()
      if (input.isConnected) take()
    }
    const onFocusIn = (e: FocusEvent) => {
      if (e.target instanceof Element && e.target !== input && !e.target.closest('[role="menu"]')) setTimeout(go)
    }
    const poll = setInterval(() => !document.querySelector('[role="menu"]') && setTimeout(go, 50), 50)
    const cap = setTimeout(go, 1000)
    document.addEventListener("focusin", onFocusIn)
    function stop() {
      document.removeEventListener("focusin", onFocusIn)
      clearInterval(poll)
      clearTimeout(cap)
    }
    return () => {
      done = true
      stop()
    }
  }, [editing])

  // Esc here cancels the rename only: it mustn't also close the drawer or dialog around it
  // (Radix listens on document, capture phase; window capture runs first).
  React.useEffect(() => {
    if (!editing) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && e.target === inputRef.current) e.preventDefault()
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [editing])

  const shown = value || placeholder

  if (!editing) {
    const text = <span className={cn("truncate", !value && "text-faint-foreground")}>{shown}</span>
    if (disabled || !editOnClick)
      return (
        <span
          ref={textRef as React.Ref<HTMLSpanElement>}
          tabIndex={-1}
          data-slot="inline-rename"
          className={cn("inline-grid min-w-0 grid-cols-[minmax(0,auto)] align-middle", outset, ringInside, className)}
        >
          <span className={cn(box, "truncate border-transparent")}>{text}</span>
        </span>
      )
    return (
      <span data-slot="inline-rename" className={cn("inline-grid min-w-0 grid-cols-[minmax(0,auto)] align-middle", outset, className)}>
        <button
          ref={textRef as React.Ref<HTMLButtonElement>}
          type="button"
          title={value || undefined}
          aria-describedby={`${id}-hint`}
          onClick={(e) => {
            e.stopPropagation()
            setEditing(true)
          }}
          onKeyDown={(e) => {
            if (e.key === "F2") {
              e.preventDefault()
              setEditing(true)
            }
            // Enter and Space press the button; none of these reach the row
            if (e.key === "F2" || e.key === "Enter" || e.key === " ") e.stopPropagation()
          }}
          // hit area 44 on touch
          className={cn(
            box,
            "relative flex w-full cursor-text items-center border-transparent text-left hover:bg-accent",
            ringInside,
            "after:absolute after:inset-x-0 pointer-coarse:after:-inset-y-2.5",
          )}
        >
          {text}
        </button>
        <span id={`${id}-hint`} hidden>
          {s().renameHint}
        </span>
      </span>
    )
  }

  return (
    <PopoverPrimitive.Root open={!!error}>
      <PopoverPrimitive.Anchor asChild>
        <span
          data-slot="inline-rename"
          className={cn("relative inline-grid min-w-0 grid-cols-[minmax(0,auto)] align-middle", outset, className)}
          // the row under it doesn't see clicks or presses meant for the input
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          {/* sizes the box to the text, so the input is exactly as wide as the name was */}
          <span aria-hidden className={cn(box, "invisible h-0 overflow-hidden whitespace-pre border-transparent")}>
            {draft || placeholder}
          </span>
          <input
            ref={inputRef}
            size={1}
            value={draft}
            placeholder={placeholder}
            maxLength={maxLength}
            readOnly={pending}
            aria-label={label}
            aria-invalid={!!error || undefined}
            aria-busy={pending || undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(e) => {
              setDraft(e.target.value)
              setError(undefined)
            }}
            onKeyDown={(e) => {
              // keys typed into the name stay here (Tab and shortcuts still travel)
              if (e.key !== "Tab" && !e.metaKey && !e.ctrlKey) e.stopPropagation()
              if (isComposing(e.nativeEvent)) return
              if (e.key === "Enter") {
                e.preventDefault()
                void commit("enter")
              } else if (e.key === "Escape") {
                e.preventDefault()
                cancel()
              }
            }}
            onBlur={() => {
              // switching windows isn't leaving the field
              if (!document.hasFocus()) return
              void commit("blur")
            }}
            className={cn(
              box,
              "w-full bg-background text-foreground outline-none placeholder:text-faint-foreground",
              "border-input transition-[border-color,box-shadow] duration-(--duration-fast) focus:border-ring focus:ring-3 focus:ring-(color:--focus-halo) focus:ring-inset",
              "aria-invalid:border-destructive aria-invalid:focus:ring-destructive/15",
              pending && "text-muted-foreground",
            )}
          />
          {pending && (
            <span className="pointer-events-none absolute inset-y-px right-px flex items-center rounded-r-md bg-linear-to-l from-background from-60% to-transparent pl-4 pr-1.5">
              <Spinner label={s().saving} className="size-3.5 text-faint-foreground" />
            </span>
          )}
        </span>
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          role="presentation"
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          // the error points at the input; focus stays there
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="z-(--z-overlay) max-w-72 rounded-md bg-popover px-2.5 py-1.5 shadow-popover outline-none data-[state=open]:animate-drop-in"
        >
          <p id={`${id}-error`} role="alert" className="flex items-start gap-1 text-caption text-destructive">
            <CircleAlert className="mt-0.5 size-3.5" />
            <span>{error}</span>
          </p>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
