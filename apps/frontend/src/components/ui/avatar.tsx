"use client"

import * as React from "react"
import { Avatar } from "@base-ui/react/avatar"

import { cn } from "@/lib/utils"

function AvatarRoot({
  className,
  ...props
}: React.ComponentProps<typeof Avatar.Root>) {
  return (
    <Avatar.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof Avatar.Image>) {
  return (
    <Avatar.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof Avatar.Fallback>) {
  return (
    <Avatar.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { AvatarRoot as Avatar, AvatarImage, AvatarFallback }
