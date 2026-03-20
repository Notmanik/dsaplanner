interface AuthModeTabsProps {
  isRegister: boolean
  onToggle: (next: boolean) => void
}

export function AuthModeTabs({ isRegister, onToggle }: AuthModeTabsProps) {
  return (
    <div className="flex bg-surface-low">
      <button
        type="button"
        onClick={() => onToggle(false)}
        className={`relative flex-1 py-4 text-center font-mono text-[10px] uppercase tracking-widest transition-colors ${
          !isRegister ? 'bg-surface-lowest text-primary-container' : 'text-zinc-500 hover:bg-surface-lowest/50 hover:text-zinc-300'
        }`}
      >
        SIGN_IN
        {!isRegister && <span className="absolute bottom-0 left-0 h-[2px] w-full bg-primary-container" />}
      </button>
      <button
        type="button"
        onClick={() => onToggle(true)}
        className={`relative flex-1 py-4 text-center font-mono text-[10px] uppercase tracking-widest transition-colors ${
          isRegister ? 'bg-surface-lowest text-primary-container' : 'text-zinc-500 hover:bg-surface-lowest/50 hover:text-zinc-300'
        }`}
      >
        SIGN_UP
        {isRegister && <span className="absolute bottom-0 left-0 h-[2px] w-full bg-primary-container" />}
      </button>
    </div>
  )
}
