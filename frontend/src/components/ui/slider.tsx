import * as React from 'react'
import { cn } from '@/lib/utils'

export const Slider = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="range"
        className={cn(
          'h-1.5 w-full cursor-pointer appearance-none rounded-sm bg-surface-high accent-primary-container',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Slider.displayName = 'Slider'
