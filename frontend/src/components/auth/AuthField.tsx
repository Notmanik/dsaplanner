import type { LucideIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface AuthFieldProps {
  label?: string
  placeholder: string
  type: 'text' | 'password'
  value: string
  minLength?: number
  onChange: (value: string) => void
  icon: LucideIcon
}

export function AuthField({ label, placeholder, type, value, minLength, onChange, icon: Icon }: AuthFieldProps) {
  return (
    <div className="space-y-2">
      {label ? <label className="tm-label block">{label}</label> : null}
      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-600 group-focus-within:text-primary-container">
          <Icon className="h-4 w-4" />
        </div>
        <Input
          type={type}
          value={value}
          required
          minLength={minLength}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 border-0 ring-1 ring-zinc-800/80 focus-visible:ring-1 focus-visible:ring-primary/40 pl-10"
        />
      </div>
    </div>
  )
}
