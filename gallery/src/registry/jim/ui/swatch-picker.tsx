"use client"

import { RadioGroup as RadioPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"
import { CATEGORICAL, catVar, type Categorical } from "@/registry/jim/lib/categorical"
import { s } from "@/registry/jim/lib/strings"
import { useFieldControl } from "@/registry/jim/ui/field"
import { Tooltip } from "@/registry/jim/ui/tooltip"

/**
 * Pick one colour from a fixed set: a tag or project colour (the nine categorical colours,
 * stored by name — `categoricalOptions()`), a theme preset. One tab stop for the row; arrow
 * keys move and choose. The chosen swatch gets a ring, so the choice never rests on colour
 * alone, and every swatch names itself (tooltip, screen reader). For user data there is no
 * free colour input: store the name.
 */
export function SwatchPicker<T extends string>({
  options,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  /** `color` is any CSS colour expression: `catVar("blue")`, `var(--primary)`. */
  options: { value: T; label: string; color: string; disabled?: boolean }[]
  value?: T
  defaultValue?: T
  onValueChange?: (v: T) => void
  size?: "sm" | "md"
  disabled?: boolean
  className?: string
  "aria-label"?: string
}) {
  const field = useFieldControl()
  return (
    <RadioPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => onValueChange?.(v as T)}
      disabled={disabled}
      orientation="horizontal"
      aria-label={ariaLabel}
      aria-labelledby={!ariaLabel && field.id ? `${field.id}-label` : undefined}
      aria-describedby={field["aria-describedby"]}
      data-slot="swatch-picker"
      className={cn("flex flex-wrap items-center", size === "sm" ? "gap-2" : "gap-2.5", "pointer-coarse:gap-3", className)}
    >
      {options.map((o) => (
        <Tooltip key={o.value} content={o.label}>
          <RadioPrimitive.Item
            value={o.value}
            disabled={o.disabled}
            aria-label={o.label}
            style={{ background: o.color }}
            className={cn(
              "relative shrink-0 rounded-full transition-shadow duration-(--duration-fast)",
              size === "sm" ? "size-5" : "size-6",
              // a hairline edge so white and near-canvas swatches still read as swatches
              "after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--foreground)_14%,transparent)]",
              "before:absolute before:-inset-1.5 pointer-coarse:before:-inset-2.5",
              // aria-checked, not data-state: the Tooltip trigger writes its own data-state onto the swatch
              "aria-checked:ring-2 aria-checked:ring-foreground aria-checked:ring-offset-2 aria-checked:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />
        </Tooltip>
      ))}
    </RadioPrimitive.Root>
  )
}

/** The nine categorical colours as SwatchPicker options, named from `strings.ts` (`colorName`). */
export function categoricalOptions(labels: Partial<Record<Categorical, string>> = s().colorName) {
  return CATEGORICAL.map((name) => ({ value: name, label: labels[name] ?? name, color: catVar(name) }))
}
