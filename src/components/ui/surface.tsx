import * as React from "react"
import { cn } from "@/lib/utils"

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "page" | "section"
  children: React.ReactNode
}

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, variant = "page", children, ...props }, ref) => {
    const baseClasses = {
      page: "min-h-screen bg-background text-foreground",
      section: "bg-transparent text-foreground"
    }

    return (
      <div
        ref={ref}
        className={cn(baseClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Surface.displayName = "Surface"

export { Surface }
