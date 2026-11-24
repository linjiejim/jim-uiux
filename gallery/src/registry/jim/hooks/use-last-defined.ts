"use client"

/**
 * Keeps an overlay's content on screen while it animates out: returns `value`, or the last value
 * that wasn't null / undefined. `open={!!item}` closes the drawer; render the content from
 * `useLastDefined(item)`, so it doesn't go blank (or unmount) before the exit animation ends.
 */

import { useRef } from "react"

export function useLastDefined<T>(value: T | null | undefined): T | null | undefined {
  const last = useRef(value)
  if (value != null) last.current = value
  return value ?? last.current
}
