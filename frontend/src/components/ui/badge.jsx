import * as React from "react"

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

const badgeVariants = {
  default: "bg-slate-900 text-slate-50",
  secondary: "bg-slate-100 text-slate-900",
  destructive: "bg-red-500 text-slate-50",
  success: "bg-green-500 text-slate-50",
  outline: "border border-slate-200 text-slate-950"
}

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants }