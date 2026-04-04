import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, ChevronRight, FolderKanban, Search, Target, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { AppSidebar } from '@/components/layout/AppSidebar'

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

export default function Plans() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: plans = [], isLoading } = useQuery<PlanSummary[]>({
    queryKey: ['plans'],
    queryFn: () => api.get('/plans/me').then((res) => res.data),
  })

  const { mutate: deletePlan, isPending: deletingPlan } = useMutation({
    mutationFn: (planId: string) => api.delete(`/plans/${planId}`).then((res) => res.data),
    onSuccess: async (data, deletedPlanId) => {
      if (localStorage.getItem('planId') === deletedPlanId) {
        if (data?.activePlanId) {
          localStorage.setItem('planId', data.activePlanId)
        } else {
          localStorage.removeItem('planId')
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['plans'] })
      await queryClient.invalidateQueries({ queryKey: ['activePlan'] })
    },
  })

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
            <span className="font-mono text-xs text-zinc-500">All saved plans</span>
          </div>
        </div>
      </header>

      <main className="min-h-screen px-4 pb-10 pt-24 lg:ml-64 lg:p-8 lg:pt-24">
        <div className="mx-auto max-w-[1200px] space-y-6">
          <section className="bg-surface-low p-8 tm-ghost-border">
            <div className="flex flex-col gap-3 border-b border-zinc-800/30 pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">algo_core</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">Plans</h1>
                <p className="mt-2 text-sm text-zinc-400">Open any saved study plan and continue from where you left off.</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Total Plans</p>
                <p className="mt-1 font-mono text-2xl font-bold text-primary-container">{plans.length}</p>
              </div>
            </div>

            {plans.length === 0 ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60">
                  <FolderKanban className="h-7 w-7 text-zinc-500" />
                </div>
                <div className="max-w-md space-y-2">
                  <h2 className="text-xl font-semibold text-zinc-200">No plans found</h2>
                  <p className="text-sm text-zinc-500">Create your first study plan to start building a schedule here.</p>
                </div>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="bg-primary-container px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-on-primary-container transition hover:opacity-90"
                >
                  Make DSA Plan
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-6">
                {plans.map((plan) => (
                  <div
                    key={plan._id}
                    className="w-full border border-zinc-800/40 bg-zinc-950/40 p-5 text-left transition-colors hover:border-zinc-700/60"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-3">
                        <div>
                          <h2 className="text-lg font-semibold text-zinc-100">{plan.name}</h2>
                          <p className="mt-2 flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {new Date(plan.startDate).toLocaleDateString()}
                            </span>
                            <span>{plan.duration} days</span>
                            <span>{plan.totalQuestions} questions</span>
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Solved</p>
                            <p className="mt-1 text-sm font-semibold text-zinc-200">{plan.solvedQuestions}</p>
                          </div>
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">Completion</p>
                            <p className="mt-1 text-sm font-semibold text-primary-container">{plan.completionPct}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex min-w-[180px] flex-col items-start gap-3 md:items-end">
                        <div className="w-full md:w-44">
                          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                            <span className="inline-flex items-center gap-1.5">
                              <Target className="h-3.5 w-3.5" />
                              Progress
                            </span>
                            <span>{plan.completionPct}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                            <div className="h-full bg-primary-container" style={{ width: `${plan.completionPct}%` }} />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              localStorage.setItem('planId', plan._id)
                              navigate(`/plan/${plan._id}`)
                            }}
                            className="inline-flex items-center gap-2 border border-zinc-700 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-zinc-300 transition-colors hover:border-primary-container hover:text-primary-container"
                          >
                            Open plan
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const confirmed = window.confirm(`Delete "${plan.name}"? This cannot be undone.`)
                              if (!confirmed) return
                              deletePlan(plan._id)
                            }}
                            disabled={deletingPlan}
                            className="inline-flex items-center gap-2 border border-red-500/30 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-red-400 transition-colors hover:border-red-500/60 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Delete
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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
