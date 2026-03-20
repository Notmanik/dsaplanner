import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Flag, LogOut, Play, Terminal } from 'lucide-react'
import api from '@/lib/api'

type Difficulty = 'Easy' | 'Medium' | 'Hard'

type PlanQuestion = {
  status: 'pending' | 'completed' | 'skipped'
  score: number
  questionId?: {
    _id: string
    difficulty: Difficulty
    related_topics?: string[]
  }
}

type PlanDay = {
  date: string
  questions: PlanQuestion[]
}

type Plan = {
  _id: string
  duration: number
  startDate: string
  dailyPlan: PlanDay[]
}

const isSolved = (status: PlanQuestion['status']) => status === 'completed' || status === 'skipped'

const dayTintClasses = (difficulty: Difficulty, isCompleted: boolean, totalCount: number) => {
  if (isCompleted) return 'bg-emerald-500/[0.08] border-emerald-500/30 hover:bg-emerald-500/[0.12]'
  if (totalCount === 0) return 'bg-surface-container border-outline-variant/5 hover:bg-surface-high'
  if (difficulty === 'Easy') return 'bg-emerald-500/[0.05] border-emerald-500/20 hover:bg-emerald-500/[0.08]'
  if (difficulty === 'Medium') return 'bg-amber-500/[0.05] border-amber-500/20 hover:bg-amber-500/[0.08]'
  return 'bg-red-500/[0.05] border-red-500/20 hover:bg-red-500/[0.08]'
}

export default function PlanView() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: plan, isLoading } = useQuery<Plan>({
    queryKey: ['plan', id],
    queryFn: () => api.get(`/plans/${id}`).then((res) => res.data),
    enabled: Boolean(id),
  })

  const todayKey = new Date().toISOString().split('T')[0]

  const summary = useMemo(() => {
    if (!plan?.dailyPlan?.length) {
      return {
        totalQuestions: 0,
        solvedQuestions: 0,
        completionPct: 0,
        moduleTags: ['ARRAYS', 'DP', 'TREES'],
        terminalDensity: 0,
      }
    }

    const allQuestions = plan.dailyPlan.flatMap((day) => day.questions)
    const totalQuestions = allQuestions.length
    const solvedQuestions = allQuestions.filter((q) => isSolved(q.status)).length
    const completionPct = totalQuestions > 0 ? (solvedQuestions / totalQuestions) * 100 : 0

    const topicCounts = new Map<string, number>()
    for (const question of allQuestions) {
      for (const topic of question.questionId?.related_topics ?? []) {
        const normalized = topic.trim().toUpperCase()
        topicCounts.set(normalized, (topicCounts.get(normalized) ?? 0) + 1)
      }
    }

    const moduleTags = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic)

    return {
      totalQuestions,
      solvedQuestions,
      completionPct,
      moduleTags: moduleTags.length > 0 ? moduleTags : ['ARRAYS', 'DP', 'TREES'],
      terminalDensity: plan.duration > 0 ? totalQuestions / plan.duration : 0,
    }
  }, [plan])

  const dayTiles = useMemo(() => {
    if (!plan?.dailyPlan?.length) return []

    return plan.dailyPlan.map((day, index) => {
      const dateKey = day.date.split('T')[0]
      const solvedCount = day.questions.filter((q) => isSolved(q.status)).length
      const totalCount = day.questions.length
      const isCompleted = totalCount > 0 && solvedCount === totalCount
      const isToday = dateKey === todayKey

      const difficultyCounts = day.questions.reduce(
        (acc, q) => {
          const diff = q.questionId?.difficulty
          if (diff === 'Easy') acc.easy += 1
          if (diff === 'Medium') acc.medium += 1
          if (diff === 'Hard') acc.hard += 1
          return acc
        },
        { easy: 0, medium: 0, hard: 0 }
      )

      const dominantDifficulty =
        difficultyCounts.hard >= difficultyCounts.medium && difficultyCounts.hard >= difficultyCounts.easy
          ? 'Hard'
          : difficultyCounts.medium >= difficultyCounts.easy
            ? 'Medium'
            : 'Easy'

      return {
        day,
        index,
        dateKey,
        solvedCount,
        totalCount,
        isCompleted,
        isToday,
        dominantDifficulty: dominantDifficulty as Difficulty,
        difficultyCounts,
      }
    })
  }, [plan, todayKey])

  const resumeTarget = useMemo(() => {
    const today = dayTiles.find((tile) => tile.isToday)
    if (today) return today

    const firstPending = dayTiles.find((tile) => tile.solvedCount < tile.totalCount)
    return firstPending ?? dayTiles[0]
  }, [dayTiles])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('planId')
    navigate('/login')
  }

  if (isLoading) {
    return <div className="h-screen animate-pulse bg-surface-low" />
  }

  if (!plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4">
        <div className="w-full max-w-xl bg-surface-low p-8 text-center tm-ghost-border">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">PLAN_NOT_FOUND</h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-zinc-500">
            Unable to resolve this plan ID from current session.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 bg-primary-container px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-on-primary-container"
          >
            RETURN_DASHBOARD
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-zinc-800/50 bg-surface px-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-bold tracking-tighter text-primary-container">DSA_TERMINAL</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border border-outline-variant/15 bg-surface-container px-3 py-1">
            <Terminal className="h-4 w-4 text-primary-container" />
            <span className="font-mono text-xs uppercase tracking-tight text-muted-foreground">Session_Active</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center rounded-sm p-2 transition-colors hover:bg-zinc-800/50"
          >
            <LogOut className="h-4 w-4 text-zinc-500" />
          </button>
        </div>
      </header>

      <main className="mx-auto mb-24 max-w-7xl px-4 py-8">
        <section className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 text-3xl font-semibold italic tracking-tight text-foreground">DSA_PLAN_V2</h1>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col">
                <span className="tm-label mb-1">Duration</span>
                <span className="font-mono text-sm text-primary">
                  {plan.duration} DAYS (PHASE_01)
                </span>
              </div>

              <div className="h-8 w-px bg-zinc-800" />

              <div className="flex flex-col">
                <span className="tm-label mb-1">Active Modules</span>
                <div className="flex gap-2">
                  {summary.moduleTags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-outline-variant/10 bg-surface-high px-2 py-0.5 font-mono text-[11px] text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 border border-outline-variant/10 bg-surface-low p-4">
            <div className="text-right">
              <span className="tm-label mb-1 block">Completion</span>
              <span className="font-mono text-2xl font-bold text-secondary">
                {summary.completionPct.toFixed(1)}%
              </span>
            </div>
            <div className="h-10 w-[2px] bg-zinc-800" />
            <button
              onClick={() => {
                if (!resumeTarget) return
                navigate(`/plan/${plan._id}/day/${resumeTarget.dateKey}`)
              }}
              className="flex items-center gap-2 rounded-sm bg-primary-container px-4 py-2 text-sm font-semibold uppercase tracking-tight text-on-primary-container transition-all hover:opacity-90 active:scale-[0.98]"
            >
              <Play className="h-4 w-4" />
              Resume Work
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {dayTiles.map((tile) => {
            const dayNumber = String(tile.index + 1).padStart(2, '0')
            const isFinalDay = tile.index === dayTiles.length - 1
            const gotoDay = () => navigate(`/plan/${plan._id}/day/${tile.dateKey}`)
            const segmentCount = Math.max(1, tile.totalCount || 3)

            if (tile.isToday) {
              return (
                <button
                  key={tile.day.date}
                  onClick={gotoDay}
                  className="group relative aspect-square cursor-pointer border-2 border-primary bg-zinc-900 p-3 text-left ring-4 ring-primary/10 transition-all hover:bg-zinc-800"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{dayNumber}</span>
                    <span className="bg-primary/20 px-1.5 py-0.5 text-[9px] uppercase tracking-tighter text-primary">
                      Today
                    </span>
                  </div>

                  <div className="mt-2 flex h-1.5 w-full gap-1">
                    {Array.from({ length: Math.max(1, tile.totalCount || 3) }).map((_, idx) => (
                      <div key={idx} className={`flex-1 rounded-full ${idx < tile.solvedCount ? 'bg-secondary' : 'bg-zinc-700'}`} />
                    ))}
                  </div>

                  <div className="mt-3 space-y-1">
                    <span className="font-mono text-[11px] font-bold text-foreground">
                      {tile.solvedCount} / {tile.totalCount} Qs
                    </span>
                    <div className="mt-1 flex gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    </div>
                  </div>
                </button>
              )
            }

            return (
              <button
                key={tile.day.date}
                onClick={gotoDay}
                className={`group relative aspect-square cursor-pointer border p-3 text-left transition-all ${dayTintClasses(
                  tile.dominantDifficulty,
                  tile.isCompleted,
                  tile.totalCount
                )}`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs text-zinc-500">{dayNumber}</span>

                  {tile.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-secondary" />
                  ) : isFinalDay ? (
                    <Flag className="h-4 w-4 text-primary-container" />
                  ) : null}
                </div>

                <div className="space-y-1">
                  {tile.isCompleted ? (
                    <>
                      <div className="h-1 w-full rounded-full bg-secondary" />
                      <span className="font-mono text-[10px] text-muted-foreground">{tile.totalCount} Qs COMPLETE</span>
                    </>
                  ) : tile.totalCount > 0 ? (
                    <>
                      <div className="flex h-1 w-full gap-1">
                        {Array.from({ length: segmentCount }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 rounded-full ${idx < tile.solvedCount ? 'bg-secondary' : 'bg-zinc-800'}`}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {tile.solvedCount} / {tile.totalCount} Qs
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">
                        {tile.totalCount - tile.solvedCount} Qs PENDING
                      </span>
                      <span
                        className={`block text-[9px] uppercase ${
                          tile.dominantDifficulty === 'Hard'
                            ? 'text-red-400'
                            : tile.dominantDifficulty === 'Medium'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                        }`}
                      >
                        Dominant: {tile.dominantDifficulty}
                      </span>
                    </>
                  ) : (
                    <span className="font-mono text-[10px] text-muted-foreground">No Tasks</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-zinc-800 pt-6">
          <LegendDot label="Easy" colorClass="bg-emerald-400" />
          <LegendDot label="Medium" colorClass="bg-amber-400" />
          <LegendDot label="Hard" colorClass="bg-red-400" />

          <div className="ml-auto">
            <span className="font-mono text-[11px] italic text-muted-foreground">
              Terminal Density: {summary.terminalDensity.toFixed(1)} ops/day
            </span>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-zinc-800 bg-[#09090b] px-4 pb-4 pt-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex flex-col items-center justify-center px-6 py-1 text-zinc-500 opacity-60 transition-all hover:text-zinc-200"
        >
          <Terminal className="mb-1 h-4 w-4" />
          <span className="font-mono text-[10px] uppercase tracking-widest">DASHBOARD</span>
        </button>

        <button className="flex flex-col items-center justify-center border border-zinc-700 bg-zinc-900 px-6 py-1 text-primary-container">
          <Terminal className="mb-1 h-4 w-4" />
          <span className="font-mono text-[10px] uppercase tracking-widest">MY_PLAN</span>
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="flex flex-col items-center justify-center px-6 py-1 text-zinc-500 opacity-60 transition-all hover:text-zinc-200"
        >
          <Terminal className="mb-1 h-4 w-4" />
          <span className="font-mono text-[10px] uppercase tracking-widest">ANALYTICS</span>
        </button>
      </nav>
    </div>
  )
}

function LegendDot({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
      <span className="tm-label text-muted-foreground">{label}</span>
    </div>
  )
}
