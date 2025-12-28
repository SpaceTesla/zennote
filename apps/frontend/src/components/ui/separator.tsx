"use client"

import * as React from "react"
import { Separator as SeparatorRoot } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"

function SeparatorComponent({
  className,
  orientation = "horizontal",
  decorative,
  ...props
}: React.ComponentProps<typeof SeparatorRoot> & {
  decorative?: boolean
}) {
  return (
    <SeparatorRoot
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { SeparatorComponent as Separator }
