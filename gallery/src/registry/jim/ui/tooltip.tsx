"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

// Radix throws when a Tooltip has no provider above it; this lets Tooltip bring its own.
const HasProvider = React.createContext(false)

/**
 * Put one at the app root so tooltips share one delay (moving between icon buttons shows the
 * next one at once). A Tooltip outside it still works: it brings its own provider.
 */
export function TooltipProvider({ delayDuration = 500, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <HasProvider.Provider value>
      <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={300} {...props} />
    </HasProvider.Provider>
  )
}

/**
 * Names an icon-only control or adds a short fact. Never the only place
 * for something the user must read, and never on touch-only paths.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  ...props
}: Omit<React.ComponentProps<typeof TooltipPrimitive.Root>, "children"> & {
  content: React.ReactNode
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
}) {
  const hasProvider = React.useContext(HasProvider)
  const tip = (
    <TooltipPrimitive.Root {...props}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          collisionPadding={8}
          className={cn(
            "z-(--z-overlay) max-w-xs rounded-sm bg-inverse px-2 py-1 text-caption text-inverse-foreground",
            "data-[state=delayed-open]:animate-fade-in data-[state=instant-open]:animate-fade-in data-[state=closed]:animate-fade-out",
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
  return hasProvider ? tip : <TooltipProvider>{tip}</TooltipProvider>
}
