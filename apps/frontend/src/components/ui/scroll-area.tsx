"use client"

import * as React from "react"
import { ScrollArea } from "@base-ui/react/scroll-area"

import { cn } from "@/lib/utils"

function ScrollAreaComponent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollArea.Root>) {
  return (
    <ScrollArea.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollArea.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollArea.Viewport>
      <ScrollBar />
      <ScrollArea.Corner />
    </ScrollArea.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollArea.Scrollbar>) {
  return (
    <ScrollArea.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollArea.Thumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollArea.Scrollbar>
  )
}

export { ScrollAreaComponent as ScrollArea, ScrollBar }
