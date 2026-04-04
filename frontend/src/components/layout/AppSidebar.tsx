import { ClipboardList, FolderKanban, LogOut, PlusSquare } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    {
      label: 'Make DSA Plan',
      path: '/onboarding',
      icon: PlusSquare,
      onClick: () => navigate('/onboarding'),
      isActive: location.pathname === '/onboarding',
    },
    {
      label: 'Assigned Questions',
      path: '/questions',
      icon: ClipboardList,
      onClick: () => navigate('/questions'),
      isActive: location.pathname === '/questions',
    },
    {
      label: 'Plans',
      path: '/plans',
      icon: FolderKanban,
      onClick: () => navigate('/plans'),
      isActive: location.pathname === '/plans' || location.pathname.startsWith('/plan/'),
    },
  ]

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('planId')
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-zinc-800/30 bg-surface py-8 lg:flex">
      <div className="mb-10 px-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="font-mono text-lg font-black tracking-tighter text-primary-container"
        >
          algo_core
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <button
              key={item.path}
              onClick={item.onClick}
              className={`flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-medium transition-colors ${
                item.isActive
                  ? 'border-r-2 border-primary-container bg-surface-low text-primary-container'
                  : 'text-zinc-500 hover:bg-surface-container hover:text-zinc-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto px-6">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
