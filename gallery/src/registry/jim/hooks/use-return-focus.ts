"use client"

/**
 * Focus return for overlays opened from code (a row's Enter, a menu item, useConfirm): closing gives focus back.
 */

import * as React from "react"

const LAYER = '[role="dialog"], [role="alertdialog"]'
const CLOSING_LAYER = '[role="dialog"][data-state="closed"], [role="alertdialog"][data-state="closed"]'

/** What has focus now. An item of a menu that closes as the overlay opens resolves to the menu's button. */
function focusedOpener() {
  const active = document.activeElement
  let el = active instanceof HTMLElement && active !== document.body ? active : null
  for (let i = 0; el && i < 3; i++) {
    const by = el.closest('[role="menu"]')?.getAttribute("aria-labelledby")
    const trigger = by ? document.getElementById(by) : null
    if (!trigger) break
    el = trigger
  }
  return el ? { el, layer: el.closest<HTMLElement>(LAYER) } : null
}

/**
 * Focus return for overlays, also when opened from code. Radix only returns focus to a Trigger, so
 * without one (a row's Enter, a menu item, useConfirm) focus would land on <body>. Remembers what
 * had focus as `open` turns true; `restore` (Content's onCloseAutoFocus) gives it back, or the layer
 * below if that element is gone, unless focus has already moved on (to something the action opened).
 * `track` replaces it (a non-modal panel the user left for the page).
 */
export function useReturnFocus(open: boolean) {
  const from = React.useRef<{ el: HTMLElement; layer: HTMLElement | null } | null>(null)
  const wasOpen = React.useRef(false) // mounting open counts as opening (useConfirm)
  // Read while rendering, before the commit that opens it: that commit may blur the opener
  // (a list re-sorting as an item opens) and an autoFocus field takes focus in it.
  if (open && !wasOpen.current && typeof document !== "undefined") from.current = focusedOpener()
  wasOpen.current = open
  const restore = React.useCallback((e: Event) => {
    if (e.defaultPrevented) return
    const now = document.activeElement
    const content = e.currentTarget instanceof Node ? e.currentTarget : null
    const unclaimed = !now || now === document.body || !!content?.contains(now) || !!now.closest(CLOSING_LAYER)
    if (!unclaimed) return e.preventDefault()
    // the opener, else (gone, or disabled meanwhile) the layer it was in
    for (const to of [from.current?.el, from.current?.layer]) {
      if (!to?.isConnected) continue
      e.preventDefault()
      to.focus()
      if (document.activeElement === to) return
    }
  }, [])
  const track = React.useCallback((target: EventTarget | null) => {
    if (target instanceof HTMLElement) from.current = { el: target, layer: null }
  }, [])
  return React.useMemo(() => ({ restore, track }), [restore, track])
}
