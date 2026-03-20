export function AuthFooterMeta() {
  return (
    <div className="flex items-center justify-between px-8 pb-8 pt-6">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.4)]" />
        <span className="font-mono text-[9px] uppercase text-zinc-600">Secure Node</span>
      </div>
      <div className="font-mono text-[9px] uppercase tracking-tighter text-zinc-700">DSA_OS // BUILD_1224_ALPHA</div>
    </div>
  )
}
