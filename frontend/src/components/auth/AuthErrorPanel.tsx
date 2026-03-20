import { ShieldAlert } from 'lucide-react'

interface AuthErrorPanelProps {
  message: string
}

export function AuthErrorPanel({ message }: AuthErrorPanelProps) {
  return (
    <div className="flex items-start gap-3 border border-zinc-800 bg-zinc-800/30 p-3">
      <ShieldAlert className="mt-0.5 h-4 w-4 text-zinc-500" />
      <div className="flex flex-col">
        <span className="font-mono text-[10px] font-bold uppercase text-zinc-400">Error 0x403: Forbidden</span>
        <span className="font-mono text-[9px] uppercase leading-tight text-zinc-500">{message}</span>
      </div>
    </div>
  )
}
