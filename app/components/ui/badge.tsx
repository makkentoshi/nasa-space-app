import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/app/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#53B175] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[#53B175] text-white shadow hover:bg-[#248A3D]",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200",
        destructive:
          "bg-red-500 text-white shadow hover:bg-red-600",
        outline: "border border-gray-200 text-gray-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
