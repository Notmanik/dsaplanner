import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BarChart3,
  Bell,
  ChevronRight,
  FileText,
  Flame,
  GitBranch,
  LogOut,
  Plus,
  Search,
  Settings,
  Sword,
  Terminal,
} from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'

type TopicStat = {
  topic: string
  averageScore: number
  questionsCompleted: number
}

type PlanQuestion = {
  status: 'pending' | 'completed' | 'skipped'
  score: number
  questionId?: {
    _id: string
    title: string
    url: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    related_topics?: string[]
  }
}

type PlanDay = {
  date: string
  questions: PlanQuestion[]
}

type ActivePlan = {
  _id: string
  name?: string
  startDate: string
  duration: number
  dailyPlan: PlanDay[]
}

type PlanSummary = {
  _id: string
  name: string
  duration: number
  startDate: string
  createdAt: string
  totalQuestions: number
  solvedQuestions: number
  completionPct: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: activePlan, isLoading: planLoading } = useQuery<ActivePlan | null>({
    queryKey: ['activePlan'],
    queryFn: () => api.get('/plans/me/active').then((res) => res.data),
  })

  const { data: plans = [] } = useQuery<PlanSummary[]>({
    queryKey: ['plans'],
    queryFn: () => api.get('/plans/me').then((res) => res.data),
  })

  const { mutate: selectPlan, isPending: selectingPlan } = useMutation({
    mutationFn: (planId: string) => api.post(`/plans/${planId}/select`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['activePlan'] })
      await queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })

  const { data: streakData, isLoading: streakLoading } = useQuery({
    queryKey: ['streak'],
    queryFn: () => api.get('/users/me/streak').then((res) => res.data),
  })

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.get('/users/me/analytics').then((res) => res.data),
  })

  const todayFocus = useMemo(() => {
    if (!activePlan?.dailyPlan?.length) return null

    const todayKey = new Date().toISOString().split('T')[0]
    const todayDay = activePlan.dailyPlan.find((day) => day.date.startsWith(todayKey))
    return todayDay ?? activePlan.dailyPlan[0]
  }, [activePlan])

  const visibleQuestions = (todayFocus?.questions ?? [])
    .filter((q) => Boolean(q.questionId))
    .slice(0, 4)

  const topicRows: TopicStat[] = (analyticsData?.weakTopics ?? []).slice(0, 4)

  const streak = streakData?.streak ?? 0

  const isStreakActive = (() => {
    if (!streakData?.lastActiveDate) return false
    const lastActive = new Date(streakData.lastActiveDate)
    const now = new Date()
    return lastActive.toDateString() === now.toDateString()
  })()

  const contributionCells = Array.from({ length: 84 }, (_, index) => {
    const bucket = ((index * 13 + streak * 3) % 9)
    if (bucket <= 3) return 'bg-zinc-800/50'
    if (bucket <= 5) return 'bg-primary-container/20'
    if (bucket <= 7) return 'bg-primary-container/50'
    return 'bg-primary-container'
  })

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('planId')
    navigate('/login')
  }

  if (planLoading) {
    return <div className="h-screen animate-pulse bg-surface-low" />
  }

  if (activePlan?._id) {
    localStorage.setItem('planId', activePlan._id)
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground">
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-zinc-800/30 bg-surface py-8 lg:flex">
        <div className="mb-10 px-6">
          <span className="font-mono text-lg font-black tracking-tighter text-primary-container">ALGO_CORE</span>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">v1.0.4_ACTIVE</p>
        </div>

        <nav className="flex-1 space-y-1">
          <button className="flex w-full items-center gap-3 border-r-2 border-primary-container bg-surface-low px-6 py-4 text-left font-display text-[11px] font-semibold uppercase tracking-widest text-primary-container">
            <Terminal className="h-4 w-4" />
            Terminal
          </button>
          <button className="flex w-full items-center gap-3 px-6 py-4 text-left font-display text-[11px] font-semibold uppercase tracking-widest text-zinc-500 transition-colors hover:bg-surface-container hover:text-zinc-200">
            <GitBranch className="h-4 w-4" />
            Algorithms
          </button>
          <button className="flex w-full items-center gap-3 px-6 py-4 text-left font-display text-[11px] font-semibold uppercase tracking-widest text-zinc-500 transition-colors hover:bg-surface-container hover:text-zinc-200">
            <Sword className="h-4 w-4" />
            Arena
          </button>
          <button className="flex w-full items-center gap-3 px-6 py-4 text-left font-display text-[11px] font-semibold uppercase tracking-widest text-zinc-500 transition-colors hover:bg-surface-container hover:text-zinc-200">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </button>
          <button className="flex w-full items-center gap-3 px-6 py-4 text-left font-display text-[11px] font-semibold uppercase tracking-widest text-zinc-500 transition-colors hover:bg-surface-container hover:text-zinc-200">
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </nav>

        <div className="mt-auto space-y-4 px-6">
          <button className="flex w-full items-center gap-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 transition-colors hover:text-zinc-200">
            <FileText className="h-4 w-4" />
            Documentation
          </button>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 transition-colors hover:text-zinc-200"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <header className="fixed right-0 top-0 z-40 h-16 w-full border-b border-zinc-800/20 bg-[#09090b]/80 px-4 shadow-ambient backdrop-blur-xl lg:w-[calc(100%-16rem)] lg:px-8">
        <div className="flex h-full items-center justify-between gap-4">
          <div className="hidden w-96 items-center gap-3 border border-zinc-800/30 bg-surface-lowest px-3 py-1.5 md:flex">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              className="w-full border-none bg-transparent font-mono text-xs text-zinc-300 outline-none placeholder:text-zinc-600"
              placeholder="SEARCH_DATABASE..."
              type="text"
            />
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">⌘K</span>
          </div>

          <div className="ml-auto flex items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2 lg:gap-4">
              <button className="rounded-sm p-2 text-zinc-400 transition-all duration-200 hover:bg-zinc-800/40 hover:text-primary-container active:scale-95">
                <Bell className="h-4 w-4" />
              </button>
              <button className="rounded-sm p-2 text-zinc-400 transition-all duration-200 hover:bg-zinc-800/40 hover:text-primary-container active:scale-95">
                <Terminal className="h-4 w-4" />
              </button>
            </div>

            <div className="hidden h-6 w-px bg-zinc-800 md:block" />

            <div className="hidden items-center gap-3 md:flex">
              <button className="border border-zinc-800 px-4 py-1.5 font-mono text-[11px] text-zinc-400 transition-all active:scale-95 hover:bg-zinc-800/40">
                DEBUG
              </button>
              <div className="flex items-center gap-2">
                {plans.length > 0 ? (
                  <select
                    value={activePlan?._id || ''}
                    onChange={(e) => selectPlan(e.target.value)}
                    disabled={selectingPlan}
                    className="h-8 min-w-[180px] border border-zinc-800 bg-surface-lowest px-2 font-mono text-[10px] uppercase tracking-widest text-zinc-300"
                  >
                    {plans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.name || `Plan ${new Date(plan.startDate).toLocaleDateString()}`}
                      </option>
                    ))}
                  </select>
                ) : null}
                <button
                  className="bg-primary-container px-4 py-1.5 font-mono text-[11px] font-bold text-on-primary-container transition-all active:scale-95 hover:brightness-110"
                  onClick={() => navigate('/onboarding')}
                >
                  {activePlan ? 'NEW_PLAN' : 'INITIALIZE_PLAN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen px-4 pb-10 pt-24 lg:ml-64 lg:p-8 lg:pt-24">
        <div className="mx-auto max-w-[1400px] space-y-6">
          <div className="grid grid-cols-12 gap-6">
            <section className="relative col-span-12 overflow-hidden bg-surface-low p-8 tm-ghost-border md:col-span-4">
              <div className="relative z-10">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Active Session</span>
                <h2 className="mt-2 flex items-baseline gap-2 font-mono text-5xl font-black text-foreground">
                  {streakLoading ? '...' : streak}
                  <span className="text-sm font-normal text-zinc-500">DAYS</span>
                </h2>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-4">
                <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full border border-primary-container/20 bg-primary-container/10">
                  <Flame className={`h-5 w-5 ${isStreakActive ? 'text-primary-container' : 'text-zinc-500'}`} />
                </div>
                <div>
                  <p className="font-mono text-xs text-primary-container">{isStreakActive ? 'STREAK_STABLE' : 'STREAK_IDLE'}</p>
                  <p className="font-mono text-[10px] uppercase tracking-tighter text-zinc-500">
                    Consistency: {Math.min(99, 60 + streak)}%
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-primary-container/5 blur-[80px]" />
            </section>

            <section className="col-span-12 flex flex-col bg-surface-low tm-ghost-border md:col-span-8">
              <div className="flex items-center justify-between px-6 py-4">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  {activePlan ? "Today's Focus" : 'No Active Plan'}
                </span>
                <button
                  className="flex items-center gap-1 font-mono text-[10px] text-primary-container hover:underline"
                  onClick={() => (activePlan ? navigate(`/plan/${activePlan._id}`) : navigate('/onboarding'))}
                >
                  {activePlan ? 'PLAN_DETAIL' : 'INITIALIZE_PLAN'}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {activePlan ? (
                <div className="grid flex-1 grid-cols-1 md:grid-cols-2">
                  {visibleQuestions.length === 0 ? (
                    <div className="col-span-full p-6 font-mono text-xs uppercase tracking-widest text-zinc-500">
                      No tasks scheduled for the current focus day.
                    </div>
                  ) : (
                    visibleQuestions.map((qWrap, index) => {
                      const question = qWrap.questionId
                      if (!question) return null

                      const solved = qWrap.status === 'completed' || qWrap.status === 'skipped'
                      const difficultyClass =
                        question?.difficulty === 'Easy'
                          ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                          : question?.difficulty === 'Hard'
                            ? 'border border-red-500/30 bg-red-500/15 text-red-400'
                            : 'border border-amber-500/30 bg-amber-500/15 text-amber-400'
                      const statusClass = solved
                        ? 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                        : 'border border-zinc-700 bg-zinc-800/60 text-zinc-400'

                      return (
                        <button
                          key={question?._id ?? index}
                          onClick={() =>
                            navigate(
                              `/plan/${activePlan._id}/day/${(todayFocus?.date || activePlan.dailyPlan[0]?.date || '').split('T')[0]}`
                            )
                          }
                          className={`p-4 text-left transition-colors hover:bg-zinc-800/20 ${solved ? 'bg-emerald-500/[0.03]' : ''}`}
                        >
                          <div className="mb-1 flex items-start justify-between">
                            <span className="font-mono text-[10px] text-zinc-500">#{question?._id?.slice(-3) ?? index + 1}</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 text-[10px] ${difficultyClass}`}>{question?.difficulty ?? 'TASK'}</span>
                              <span className={`px-2 py-0.5 font-mono text-[9px] uppercase ${statusClass}`}>
                                {solved ? 'Solved' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          <h3 className="text-sm font-semibold transition-colors hover:text-primary-container">{question?.title ?? 'Untitled Problem'}</h3>
                          <p className="mt-2 font-mono text-[11px] text-zinc-500">
                            {question?.related_topics?.slice(0, 2).join(', ') || 'Core Practice'}
                          </p>
                        </button>
                      )
                    })
                  )}
                </div>
              ) : (
                <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 p-8 text-center">
                  <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                    PLAN_NOT_INITIALIZED. PREPARE YOUR FIRST STUDY MATRIX.
                  </p>
                  <Button
                    className="h-10 gap-2 font-mono text-xs uppercase tracking-widest"
                    onClick={() => navigate('/onboarding')}
                  >
                    <Plus className="h-4 w-4" /> EXECUTE_PLAN_SETUP
                  </Button>
                </div>
              )}
            </section>
          </div>

          <section className="bg-surface-low tm-ghost-border">
            <div className="flex items-center justify-between px-8 py-6">
              <div>
                <h3 className="text-lg font-bold tracking-tight">Performance Analytics</h3>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">Skill Matrix Decomposition</p>
              </div>
              <div className="hidden gap-4 sm:flex">
                <LegendDot label="MASTERY" colorClass="bg-secondary" />
                <LegendDot label="STABLE" colorClass="bg-primary-container" />
                <LegendDot label="CRITICAL" colorClass="bg-error" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-12 gap-y-6 p-8 lg:grid-cols-2">
              {analyticsLoading ? (
                <div className="col-span-full h-24 animate-pulse bg-surface-container" />
              ) : topicRows.length > 0 ? (
                topicRows.map((item) => {
                  const pct = Math.max(0, Math.min(100, Math.round((item.averageScore / 5) * 100)))
                  const colorClass = pct >= 75 ? 'bg-secondary text-secondary' : pct >= 50 ? 'bg-primary-container text-primary-container' : 'bg-error text-error'

                  return (
                    <div key={item.topic} className="space-y-2">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-zinc-300">{item.topic}</span>
                        <span className={`font-mono text-[11px] ${colorClass.split(' ')[1]}`}>{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div className={`h-full ${colorClass.split(' ')[0]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="col-span-full font-mono text-xs uppercase tracking-widest text-zinc-500">
                  ANALYTICS_BUFFER_EMPTY. COMPLETE PROBLEMS TO GENERATE SIGNALS.
                </div>
              )}
            </div>
          </section>

          <section className="bg-surface-low p-8 tm-ghost-border">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">Contribution_Log_2024</h3>
              <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-600">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="h-2.5 w-2.5 border border-zinc-800/30 bg-zinc-800/50" />
                  <div className="h-2.5 w-2.5 border border-primary-container/20 bg-primary-container/20" />
                  <div className="h-2.5 w-2.5 border border-primary-container/30 bg-primary-container/40" />
                  <div className="h-2.5 w-2.5 border border-primary-container/40 bg-primary-container/70" />
                  <div className="h-2.5 w-2.5 border border-primary-container/60 bg-primary-container" />
                </div>
                <span>More</span>
              </div>
            </div>

            <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2">
              {contributionCells.map((cell, index) => (
                <div key={index} className={`h-3 w-3 rounded-[1px] ${cell}`} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <button
        className="group fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center bg-primary-container text-on-primary-container shadow-ambient transition-transform hover:scale-105 active:scale-95"
        onClick={() => navigate('/onboarding')}
      >
        <Plus className="h-6 w-6" />
        <span className="absolute right-full mr-4 whitespace-nowrap bg-surface-highest px-3 py-1 font-mono text-[10px] opacity-0 transition-opacity group-hover:opacity-100">
          NEW_ENTRY
        </span>
      </button>
    </div>
  )
}

function LegendDot({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${colorClass}`} />
      <span className="font-mono text-[10px] text-zinc-500">{label}</span>
    </div>
  )
}
