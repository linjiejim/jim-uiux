"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"
import { useFieldControl } from "@/registry/jim/ui/field"

/**
 * A number in a range where the feel matters more than the exact digit: a radius, a volume,
 * a threshold. The value reads beside the track (`format`); when the exact number matters, put
 * an Input next to it. Keyboard: ← → one step, PageUp / PageDown ten, Home / End the ends.
 * `onValueChange` runs while dragging (update the view); store on `onValueCommit`.
 * Inside a Field the label names the thumb; otherwise pass `aria-label`.
 */
export function Slider({
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  format,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  value?: number
  defaultValue?: number
  onValueChange?: (v: number) => void
  onValueCommit?: (v: number) => void
  min?: number
  max?: number
  step?: number
  /** The readout beside the track (and what a screen reader says): `(v) => \`${v}px\``. */
  format?: (v: number) => string
  disabled?: boolean
  className?: string
  "aria-label"?: string
}) {
  const field = useFieldControl()
  const [inner, setInner] = React.useState(defaultValue ?? min)
  const current = value ?? inner
  const text = format?.(current)
  return (
    <div data-slot="slider" className={cn("flex h-(--control-md) items-center gap-3", className)}>
      <SliderPrimitive.Root
        value={[current]}
        onValueChange={([v]) => {
          if (value === undefined) setInner(v)
          onValueChange?.(v)
        }}
        onValueCommit={([v]) => onValueCommit?.(v)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="relative flex h-full min-w-0 flex-1 touch-none select-none items-center data-disabled:opacity-(--disabled-opacity)"
      >
        <SliderPrimitive.Track className="relative h-1 grow overflow-hidden rounded-full bg-muted">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          id={field.id}
          aria-label={ariaLabel}
          aria-labelledby={!ariaLabel && field.id ? `${field.id}-label` : undefined}
          aria-describedby={field["aria-describedby"]}
          aria-invalid={field["aria-invalid"]}
          aria-valuetext={text}
          className={cn(
            "relative block size-4 rounded-full border border-input bg-background shadow-popover",
            "transition-[box-shadow,border-color] duration-(--duration-fast) hover:border-faint-foreground",
            "focus-visible:border-primary data-disabled:cursor-not-allowed",
            "after:absolute after:-inset-2 pointer-coarse:size-5 pointer-coarse:after:-inset-3",
          )}
        />
      </SliderPrimitive.Root>
      {text !== undefined && (
        <span aria-hidden className="tabular min-w-10 shrink-0 text-right text-small text-muted-foreground">
          {text}
        </span>
      )}
    </div>
  )
}
