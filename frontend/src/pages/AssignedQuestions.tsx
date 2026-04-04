import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, ExternalLink, FolderOpen, Search, Terminal } from 'lucide-react'
import api from '@/lib/api'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type PlanQuestion = {
  status: 'pending' | 'completed' | 'skipped'
  score?: number
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
  dailyPlan: PlanDay[]
}

const difficultyClass = (difficulty: string) => {
  if (difficulty === 'Easy') return 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
  if (difficulty === 'Medium') return 'border border-amber-500/30 bg-amber-500/15 text-amber-400'
  return 'border border-red-500/30 bg-red-500/15 text-red-400'
}

const statusClass = (status: PlanQuestion['status']) => {
  if (status === 'completed') return 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
  if (status === 'skipped') return 'border border-amber-500/30 bg-amber-500/10 text-amber-400'
  return 'border border-zinc-700 bg-zinc-800/60 text-zinc-400'
}

export default function AssignedQuestions() {
  const navigate = useNavigate()

  const { data: activePlan, isLoading } = useQuery<ActivePlan | null>({
    queryKey: ['activePlan'],
    queryFn: () => api.get('/plans/me/active').then((res) => res.data),
  })

  const assignedQuestions = useMemo(() => {
    if (!activePlan?.dailyPlan?.length) return []

    return activePlan.dailyPlan.flatMap((day, dayIndex) =>
      day.questions
        .filter((entry) => Boolean(entry.questionId))
        .map((entry, questionIndex) => ({
          dayIndex,
          questionIndex,
          dateKey: day.date.split('T')[0],
          question: entry.questionId!,
          status: entry.status,
          score: entry.score ?? 0,
        }))
    )
  }, [activePlan])

  if (isLoading) {
    return <div className="h-screen animate-pulse bg-surface-low" />
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground">
      <AppSidebar />

      <header className="fixed right-0 top-0 z-40 h-16 w-full border-b border-zinc-800/20 bg-[#09090b]/80 px-4 shadow-ambient backdrop-blur-xl lg:w-[calc(100%-16rem)] lg:px-8">
        <div className="flex h-full items-center justify-between gap-4">
          <div className="hidden w-96 items-center gap-3 border border-zinc-800/30 bg-surface-lowest px-3 py-1.5 md:flex">
            <Search className="h-4 w-4 text-zinc-500" />
            <span className="font-mono text-xs text-zinc-500">All assigned questions</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 border border-zinc-800 px-3 py-1.5 md:flex">
              <Terminal className="h-4 w-4 text-primary-container" />
              <span className="font-mono text-[11px] text-zinc-300">algo_core</span>
            </div>
            <Button className="font-mono text-xs uppercase tracking-widest" onClick={() => navigate('/onboarding')}>
              Make DSA Plan
            </Button>
          </div>
        </div>
      </header>

      <main className="min-h-screen px-4 pb-10 pt-24 lg:ml-64 lg:p-8 lg:pt-24">
        <div className="mx-auto max-w-[1200px] space-y-6">
          <section className="bg-surface-low p-8 tm-ghost-border">
            <div className="flex flex-col gap-4 border-b border-zinc-800/30 pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">algo_core</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">Assigned Questions</h1>
                <p className="mt-2 text-sm text-zinc-400">
                  Review every question in your active plan and jump straight to the right study day.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Active Plan</p>
                  <p className="mt-1 font-medium text-zinc-200">{activePlan?.name || 'No active plan'}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Questions</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-primary-container">{assignedQuestions.length}</p>
                </div>
              </div>
            </div>

            {!activePlan || assignedQuestions.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60">
                  <FolderOpen className="h-7 w-7 text-zinc-500" />
                </div>
                <div className="max-w-md space-y-2">
                  <h2 className="text-xl font-semibold text-zinc-200">No assigned questions yet</h2>
                  <p className="text-sm text-zinc-500">
                    Create a study plan to generate your question list and start tracking day-by-day practice.
                  </p>
                </div>
                <Button className="font-mono text-xs uppercase tracking-widest" onClick={() => navigate('/onboarding')}>
                  Make DSA Plan
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-6">
                {assignedQuestions.map((entry) => (
                  <div
                    key={`${entry.dateKey}-${entry.question._id}-${entry.questionIndex}`}
                    className="border border-zinc-800/40 bg-zinc-950/40 p-5 transition-colors hover:border-zinc-700/60"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                            Day {String(entry.dayIndex + 1).padStart(2, '0')}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-600">{entry.dateKey}</span>
                          <Badge className={difficultyClass(entry.question.difficulty)}>{entry.question.difficulty}</Badge>
                          <Badge className={statusClass(entry.status)}>{entry.status}</Badge>
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-zinc-100">{entry.question.title}</h2>
                          <p className="mt-2 font-mono text-[11px] text-zinc-500">
                            {entry.question.related_topics?.slice(0, 4).join(', ') || 'Core practice'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-2 md:items-end">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                          Score {entry.score}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => navigate(`/plan/${activePlan._id}/day/${entry.dateKey}`)}
                            className="inline-flex items-center gap-2 border border-zinc-700 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-primary-container hover:text-primary-container"
                          >
                            Open Day
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                          {entry.question.url ? (
                            <a
                              href={entry.question.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 border border-zinc-700 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-primary-container hover:text-primary-container"
                            >
                              Open Problem
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
