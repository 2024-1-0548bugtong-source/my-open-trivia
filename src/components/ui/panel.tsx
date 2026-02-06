import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "success"
  icon?: LucideIcon
  title?: string
  children: React.ReactNode
}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, variant = "info", icon: Icon, title, children, ...props }, ref) => {
    const variantClasses = {
      info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-200",
      warning: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-200",
      success: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-200"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg p-4 flex gap-3 items-start border",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {Icon && (
          <Icon className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={2} />
        )}
        <div className="space-y-1 flex-1">
          {title && (
            <p className="font-semibold text-sm">{title}</p>
          )}
          <div className="text-xs">
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Panel.displayName = "Panel"

export { Panel }
