"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  threshold?: number
}

export function ScrollReveal({ children, className, threshold = 0.1 }: ScrollRevealProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { 
        threshold,
        rootMargin: "0px 0px -50px 0px"
      }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-1000 ease-out will-change-[opacity,transform]",
        isVisible 
          ? "opacity-100 translate-y-0 filter-none" 
          : "opacity-0 translate-y-8 blur-[2px]",
        className
      )}
    >
      {children}
    </div>
  )
}

