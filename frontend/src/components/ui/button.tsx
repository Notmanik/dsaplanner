import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 font-display text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-container text-primary-onContainer hover:brightness-110 hover:-translate-y-px',
        destructive: 'bg-destructive text-destructive-foreground hover:brightness-110 hover:-translate-y-px',
        outline: 'bg-surface-highest text-foreground border border-outline-variant/15 hover:bg-surface-high',
        secondary: 'bg-surface-highest text-foreground border border-outline-variant/15 hover:bg-surface-high',
        ghost: 'bg-transparent text-muted-foreground hover:bg-surface-low hover:text-foreground',
        link: 'bg-transparent px-0 text-primary-container underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
