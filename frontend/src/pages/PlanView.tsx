import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, CheckCircle2, Flag, LogOut, Play, Sparkles } from 'lucide-react'
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
  name?: string
  duration: number
  startDate: string
  dailyPlan: PlanDay[]
}

const isSolved = (status: PlanQuestion['status']) => status === 'completed' || status === 'skipped'

const dayTintClasses = (difficulty: Difficulty, isCompleted: boolean, totalCount: number) => {
  if (isCompleted) return 'border-emerald-500/25 bg-emerald-500/[0.06] hover:border-emerald-500/40'
  if (totalCount === 0) return 'border-zinc-800/60 bg-zinc-950/40 hover:border-zinc-700'
  if (difficulty === 'Easy') return 'border-emerald-500/20 bg-emerald-500/[0.04] hover:border-emerald-500/35'
  if (difficulty === 'Medium') return 'border-amber-500/20 bg-amber-500/[0.04] hover:border-amber-500/35'
  return 'border-red-500/20 bg-red-500/[0.04] hover:border-red-500/35'
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
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-[#09090b]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-zinc-800 bg-zinc-950/60 transition-colors hover:border-zinc-700"
            >
              <ArrowLeft className="h-4 w-4 text-primary-container" />
            </button>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">algo_core</p>
              <h1 className="text-lg font-semibold text-zinc-100">{plan.name || 'Study plan'}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-sm border border-zinc-800 bg-zinc-950/60 px-3 py-2 md:flex">
              <CalendarDays className="h-4 w-4 text-primary-container" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-300">{plan.duration} days</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center rounded-sm p-2 transition-colors hover:bg-zinc-800/50"
            >
              <LogOut className="h-4 w-4 text-zinc-500" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 pb-16">
        <section className="overflow-hidden border border-zinc-800/40 bg-surface-low">
          <div className="grid gap-6 p-8 lg:grid-cols-[1.6fr_0.9fr]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Plan overview</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-100">{plan.name || 'Study plan'}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                Track progress across the full schedule, jump back into today’s work, and scan where the heavier practice days land.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {summary.moduleTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm border border-zinc-700/70 bg-zinc-950/60 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-zinc-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 rounded-sm border border-zinc-800/50 bg-zinc-950/50 p-6">
              <div className="grid grid-cols-2 gap-4">
                <PlanMetric label="Completion" value={`${summary.completionPct.toFixed(1)}%`} accent="text-secondary" />
                <PlanMetric label="Questions" value={String(summary.totalQuestions)} accent="text-primary-container" />
                <PlanMetric label="Solved" value={String(summary.solvedQuestions)} accent="text-zinc-100" />
                <PlanMetric label="Duration" value={`${plan.duration}d`} accent="text-zinc-100" />
              </div>

              <button
                onClick={() => {
                  if (!resumeTarget) return
                  navigate(`/plan/${plan._id}/day/${resumeTarget.dateKey}`)
                }}
                className="flex items-center justify-center gap-2 rounded-sm bg-primary-container px-4 py-3 text-sm font-semibold uppercase tracking-tight text-on-primary-container transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <Play className="h-4 w-4" />
                Resume work
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryStrip title="Plan density" value={`${summary.terminalDensity.toFixed(1)}`} note="questions per day" icon={<Sparkles className="h-4 w-4" />} />
          <SummaryStrip title="Start date" value={new Date(plan.startDate).toLocaleDateString()} note="scheduled kickoff" icon={<CalendarDays className="h-4 w-4" />} />
          <SummaryStrip title="Pending days" value={String(dayTiles.filter((tile) => tile.solvedCount < tile.totalCount).length)} note="still in progress" icon={<Flag className="h-4 w-4" />} />
          <SummaryStrip title="Completed days" value={String(dayTiles.filter((tile) => tile.isCompleted).length)} note="fully wrapped" icon={<CheckCircle2 className="h-4 w-4" />} />
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Schedule</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-100">Daily roadmap</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dayTiles.map((tile) => {
              const dayNumber = String(tile.index + 1).padStart(2, '0')
              const isFinalDay = tile.index === dayTiles.length - 1
              const gotoDay = () => navigate(`/plan/${plan._id}/day/${tile.dateKey}`)
              const segmentCount = Math.max(1, tile.totalCount || 4)

              return (
                <button
                  key={tile.day.date}
                  onClick={gotoDay}
                  className={`group relative min-h-[220px] cursor-pointer border p-5 text-left transition-all ${tile.isToday ? 'ring-2 ring-primary-container/30' : ''} ${dayTintClasses(
                    tile.dominantDifficulty,
                    tile.isCompleted,
                    tile.totalCount
                  )}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`font-mono text-xs ${tile.isToday ? 'text-primary-container' : 'text-zinc-500'}`}>Day {dayNumber}</span>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">{tile.dateKey}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {tile.isToday ? (
                        <span className="rounded-sm bg-primary-container/15 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-primary-container">
                          Today
                        </span>
                      ) : null}
                      {tile.isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                      ) : isFinalDay ? (
                        <Flag className="h-4 w-4 text-primary-container" />
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-3xl font-semibold tracking-tight text-zinc-100">
                      {tile.solvedCount}
                      <span className="ml-2 text-base text-zinc-500">/ {tile.totalCount}</span>
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {tile.totalCount > 0 ? `${tile.totalCount - tile.solvedCount} questions still pending` : 'No questions scheduled'}
                    </p>
                  </div>

                  <div className="mt-5 flex h-2 w-full gap-1">
                    {Array.from({ length: segmentCount }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 rounded-full ${idx < tile.solvedCount ? 'bg-secondary' : 'bg-zinc-800'}`}
                      />
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span
                      className={`font-mono text-[10px] uppercase tracking-widest ${
                        tile.dominantDifficulty === 'Hard'
                          ? 'text-red-400'
                          : tile.dominantDifficulty === 'Medium'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                      }`}
                    >
                      {tile.totalCount > 0 ? `${tile.dominantDifficulty} focus` : 'Open day'}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">
                      View day
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-zinc-800 pt-6">
          <LegendDot label="Easy" colorClass="bg-emerald-400" />
          <LegendDot label="Medium" colorClass="bg-amber-400" />
          <LegendDot label="Hard" colorClass="bg-red-400" />

          <div className="ml-auto">
            <span className="font-mono text-[11px] italic text-muted-foreground">
              Plan density: {summary.terminalDensity.toFixed(1)} questions per day
            </span>
          </div>
        </div>
      </main>
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

function PlanMetric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-sm border border-zinc-800/60 bg-zinc-950/60 p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${accent}`}>{value}</p>
    </div>
  )
}

function SummaryStrip({
  title,
  value,
  note,
  icon,
}: {
  title: string
  value: string
  note: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-sm border border-zinc-800/40 bg-surface-low p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{title}</span>
        <span className="text-primary-container">{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-zinc-100">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{note}</p>
    </div>
  )
}
