import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * A real, known amount done: bytes uploaded, items processed, steps of a run.
 * `value` out of `max` (100 by default; pass `max={1}` for a fraction or the
 * total count). Unknown progress is a Spinner, never a bar that moves on a
 * timer. Give it a name (`aria-label`, or `aria-labelledby` pointing at the
 * text beside it), and show the number in text too when it matters.
 */
export function Progress({
  value,
  max = 100,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { value: number; max?: number }) {
  const done = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(max, Math.max(0, value))}
      data-slot="progress"
      className={cn("h-1 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-(--duration-base) motion-reduce:transition-none"
        style={{ width: `${done * 100}%` }}
      />
    </div>
  )
}
