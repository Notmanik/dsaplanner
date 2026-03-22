import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  LogOut,
  Send,
  Terminal,
  UserRound,
} from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'

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

type Plan = {
  _id: string
  name?: string
  dailyPlan: PlanDay[]
}

const isSolved = (status: PlanQuestion['status']) => status === 'completed' || status === 'skipped'

const difficultyClass = (difficulty: string) => {
  if (difficulty === 'Easy') return 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
  if (difficulty === 'Medium') return 'border border-amber-500/30 bg-amber-500/15 text-amber-400'
  return 'border border-red-500/30 bg-red-500/15 text-red-400'
}

export default function DayDetail() {
  const { id, date } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: plan, isLoading } = useQuery<Plan>({
    queryKey: ['plan', id],
    queryFn: () => api.get(`/plans/${id}`).then((res) => res.data),
    enabled: Boolean(id),
  })

  const { data: streakData } = useQuery({
    queryKey: ['streak'],
    queryFn: () => api.get('/users/me/streak').then((res) => res.data),
  })

  const { mutate: markDone, isPending } = useMutation({
    mutationFn: ({ questionId, score }: { questionId: string; score: number }) =>
      api.patch(`/plans/${id}/complete`, { questionId, score, status: 'completed' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['plan', id] })
      await queryClient.invalidateQueries({ queryKey: ['streak'] })
      await queryClient.invalidateQueries({ queryKey: ['analytics'] })
      await queryClient.invalidateQueries({ queryKey: ['activePlan'] })
    },
  })

  const dayObj = useMemo(() => plan?.dailyPlan.find((d) => d.date.startsWith(date || '')), [plan, date])

  const dashboardMeta = useMemo(() => {
    if (!dayObj) {
      return {
        pending: 0,
        solved: 0,
        total: 0,
        focus: 'Core Practice',
      }
    }

    const total = dayObj.questions.length
    const solved = dayObj.questions.filter((q) => isSolved(q.status)).length
    const pending = Math.max(0, total - solved)

    const topicCount = new Map<string, number>()
    for (const wrap of dayObj.questions) {
      for (const topic of wrap.questionId?.related_topics || []) {
        const normalized = topic.trim()
        topicCount.set(normalized, (topicCount.get(normalized) ?? 0) + 1)
      }
    }

    const focus = Array.from(topicCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([topic]) => topic)
      .join(' & ')

    return {
      pending,
      solved,
      total,
      focus: focus || 'Core Practice',
    }
  }, [dayObj])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('planId')
    navigate('/login')
  }

  if (isLoading) return <div className="h-screen animate-pulse bg-surface-low" />

  if (!dayObj) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-center">
        <div className="w-full max-w-xl bg-surface-low p-8 tm-ghost-border">
          <h1 className="text-2xl font-semibold tracking-tight">DAY_NOT_FOUND</h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-zinc-500">
            No questions found for this day in the selected plan.
          </p>
          <Button className="mt-6 font-mono text-xs uppercase tracking-widest" onClick={() => navigate(`/plan/${id}`)}>
            RETURN_TO_PLAN
          </Button>
        </div>
      </div>
    )
  }

  const isoDate = dayObj.date.split('T')[0]
  const dayNumber = plan?.dailyPlan.findIndex((d) => d.date === dayObj.date)

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground selection:bg-primary-container selection:text-on-primary-container">
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-surface">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/plan/${id}`)}
              className="flex h-8 w-8 items-center justify-center rounded-sm transition-colors hover:bg-zinc-800/50 active:scale-[0.99]"
            >
              <ArrowLeft className="h-4 w-4 text-primary-container" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xs font-semibold uppercase tracking-tight text-primary-container">
                DSA_TERMINAL{' '}
                <span className="ml-2 font-mono text-zinc-500">/ DAY_{String((dayNumber ?? 0) + 1).padStart(2, '0')}</span>
              </h1>
              <p className="font-mono text-[10px] tracking-tighter text-zinc-400">{isoDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-zinc-800">
              <UserRound className="h-4 w-4 text-zinc-300" />
            </div>
            <button onClick={logout} className="text-zinc-500 transition-colors hover:text-primary-container">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto mb-24 max-w-5xl p-4 pb-32">
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-8 flex min-h-[160px] flex-col justify-between border border-zinc-800/20 bg-surface-low p-6">
            <div>
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Current Focus</span>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{dashboardMeta.focus}</h2>
            </div>
            <div className="mt-4 flex gap-6">
              <Metric value={dashboardMeta.pending} label="Pending" className="text-primary-container" />
              <Metric value={dashboardMeta.solved} label="Solved" className="text-secondary" />
              <Metric value={dashboardMeta.total} label="Total" className="text-zinc-600" />
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col items-center justify-center border border-zinc-800/20 bg-surface-container p-6 text-center">
            <span className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Daily Streak</span>
            <span className="font-mono text-5xl font-extrabold text-primary-container">{streakData?.streak ?? 0}</span>
            <span className="mt-2 text-[10px] uppercase tracking-widest text-zinc-400">Days of consistency</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="mb-4 px-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Active Queue</h3>

          {dayObj.questions.map((qWrap) => {
            const q = qWrap.questionId
            if (!q) return null
            const completed = isSolved(qWrap.status)

            return (
              <QuestionCard
                key={q._id}
                q={q}
                qWrap={qWrap}
                completed={completed}
                isPending={isPending}
                onComplete={(score) => markDone({ questionId: q._id, score })}
              />
            )
          })}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-zinc-800 bg-[#09090b] px-4 pb-4 pt-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex flex-col items-center justify-center px-6 py-1 text-zinc-500 opacity-60 transition-all duration-100 hover:text-zinc-200"
        >
          <Terminal className="mb-1 h-4 w-4" />
          <span className="font-mono text-[10px] uppercase tracking-widest">DASHBOARD</span>
        </button>
        <button
          onClick={() => navigate(`/plan/${id}`)}
          className="flex flex-col items-center justify-center rounded-sm border border-zinc-700 bg-zinc-900 px-6 py-1 text-primary-container"
        >
          <Terminal className="mb-1 h-4 w-4" />
          <span className="font-mono text-[10px] uppercase tracking-widest">MY_PLAN</span>
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex flex-col items-center justify-center px-6 py-1 text-zinc-500 opacity-60 transition-all duration-100 hover:text-zinc-200"
        >
          <Terminal className="mb-1 h-4 w-4" />
          <span className="font-mono text-[10px] uppercase tracking-widest">ANALYTICS</span>
        </button>
      </nav>
    </div>
  )
}

function Metric({ value, label, className }: { value: number; label: string; className: string }) {
  return (
    <div>
      <span className={`font-mono text-xl font-bold ${className}`}>{String(value).padStart(2, '0')}</span>
      <span className="block text-[10px] uppercase tracking-widest text-zinc-500">{label}</span>
    </div>
  )
}

function QuestionCard({
  q,
  qWrap,
  completed,
  isPending,
  onComplete,
}: {
  q: {
    _id: string
    title: string
    url: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    related_topics?: string[]
  }
  qWrap: PlanQuestion
  completed: boolean
  isPending: boolean
  onComplete: (score: number) => void
}) {
  const [score, setScore] = useState(3)

  if (completed) {
    return (
      <div className="border border-zinc-800/40 bg-surface-lowest opacity-80">
        <div className="p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-3">
                <span className="font-mono text-xs text-zinc-600">#{q._id.slice(-4)}</span>
                <h4 className="text-lg font-semibold text-zinc-400 line-through decoration-zinc-700">{q.title}</h4>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={difficultyClass(q.difficulty)}>{q.difficulty}</Badge>
                {q.related_topics?.slice(0, 3).map((topic) => (
                  <Badge key={topic} variant="outline" className="text-[10px] uppercase tracking-wider text-zinc-600">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border border-secondary/20 bg-secondary/10 px-4 py-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Logged</span>
                <CheckCircle2 className="h-4 w-4 text-secondary" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase text-zinc-600">Performance</span>
                <span className="font-mono text-sm text-secondary">Level {qWrap.score ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group border-l-2 border-primary-container bg-surface-low transition-all hover:bg-surface-container">
      <div className="p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-3">
              <span className="font-mono text-xs text-zinc-500">#{q._id.slice(-4)}</span>
              <h4 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary-container">{q.title}</h4>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={difficultyClass(q.difficulty)}>{q.difficulty}</Badge>
              {q.related_topics?.slice(0, 4).map((topic) => (
                <Badge key={topic} variant="outline" className="text-[10px] uppercase tracking-wider">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right md:block">
              <span className="block text-[10px] uppercase text-zinc-500">Success Rate</span>
              <span className="font-mono text-sm">42.8%</span>
            </div>
            <a
              href={q.url}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:text-primary-container"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-800/50 pt-6">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Confidence Metric</span>
            <span className="font-mono text-xs text-primary-container">
              Rating: <span className="font-bold">{score}</span>
            </span>
          </div>

          <div className="px-2">
            <Slider
              min={0}
              max={5}
              step={1}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="h-1.5 bg-zinc-800 accent-primary-container"
            />

            <div className="mt-4 flex justify-between">
              {['Blackout', 'Wrong', 'Familiar', 'Difficult', 'Correct', 'Perfect'].map((label, idx) => (
                <div key={label} className="flex w-12 flex-col items-center text-center">
                  <span className={`font-mono text-[10px] ${idx === score ? 'font-bold text-primary-container' : 'text-zinc-600'}`}>
                    {idx}
                  </span>
                  <span className={`mt-1 text-[9px] uppercase tracking-tighter leading-none ${idx === score ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={() => onComplete(score)}
              disabled={isPending}
              className="gap-2 px-6 py-2.5 font-display text-xs font-bold uppercase tracking-widest"
            >
              {isPending ? 'Submitting...' : 'Submit Rating'}
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
