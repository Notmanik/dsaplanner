import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest',
  {
    variants: {
      variant: {
        default: 'bg-primary-container/15 text-primary-container',
        secondary: 'bg-surface-high text-muted-foreground',
        destructive: 'bg-transparent text-red-400',
        outline: 'bg-transparent text-muted-foreground border border-outline-variant/15',
        low: 'bg-surface-high text-emerald-400',
        medium: 'bg-surface-high text-amber-400',
        high: 'bg-transparent text-red-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
