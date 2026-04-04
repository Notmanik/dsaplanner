import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronRight,
  Settings,
  Terminal,
  UserRound,
  Wrench,
  Cpu,
  Activity,
  Zap,
} from 'lucide-react'
import api from '@/lib/api'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Input } from '@/components/ui/input'

const BASIC_TOPICS = [
  'Array', 'String', 'Hash Table', 'Math', 'Sorting',
  'Two Pointers', 'Binary Search', 'Sliding Window', 'Linked List', 'Matrix',
]

const ADVANCED_TOPICS = [
  'Dynamic Programming', 'Greedy', 'Tree', 'Binary Tree',
  'Depth-First Search', 'Breadth-First Search', 'Graph', 'Backtracking',
  'Stack', 'Queue', 'Heap', 'Bit Manipulation', 'Trie', 'Union Find',
  'Divide and Conquer', 'Geometry', 'Recursion',
]

const ALL_TOPICS = [...BASIC_TOPICS, ...ADVANCED_TOPICS]

const LEVEL_LABELS: Record<number, string> = {
  1: 'NOVICE',
  2: 'BASIC',
  3: 'INTERMEDIATE',
  4: 'ADVANCED',
  5: 'MASTER',
}

const STATUS_MESSAGES: Record<number, string[]> = {
  1: [
    '> SELECT_MODULES to configure your training payload...',
    '> Core modules are pre-loaded. Extend with advanced topics.',
    '> System ready. Awaiting module selection...',
  ],
  2: [
    '> CALIBRATING skill vectors... Set your proficiency per module.',
    '> Higher calibration yields optimized difficulty curves.',
    '> Skill matrix initialized. Awaiting input...',
  ],
  3: [
    '> FINALIZING operational parameters...',
    '> Configure name, duration, and start date to commit.',
    '> All systems nominal. Ready to generate plan.',
  ],
}

function useTypewriter(text: string, speed = 40) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        clearInterval(interval)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return displayed
}

export default function Onboarding() {
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [prevStep, setPrevStep] = useState(1)
  const [animating, setAnimating] = useState(false)
  const [advancedSelected, setAdvancedSelected] = useState<string[]>([])
  const [userLevels, setUserLevels] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    BASIC_TOPICS.forEach((t) => { init[t] = 1 })
    return init
  })
  const [duration, setDuration] = useState<number>(21)
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [planName, setPlanName] = useState<string>('My Plan')
  const [loading, setLoading] = useState(false)
  const [statusIndex, setStatusIndex] = useState(0)
  const activePlanId = localStorage.getItem('planId')

  // Rotate status messages
  useEffect(() => {
    const msgs = STATUS_MESSAGES[currentStep]
    setStatusIndex(0)
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % msgs.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [currentStep])

  const statusText = useTypewriter(STATUS_MESSAGES[currentStep][statusIndex], 25)

  const selectedTopics = useMemo(() => {
    const basics = BASIC_TOPICS.map((topic) => ({ topic, type: 'core' as const }))
    const advanced = advancedSelected.map((topic) => ({ topic, type: 'advanced' as const }))
    return [...basics, ...advanced]
  }, [advancedSelected])

  const canContinueFromTopics = selectedTopics.length > 0
  const canContinueFromCalibration = selectedTopics.length > 0

  const toggleAdvanced = (topic: string) => {
    setAdvancedSelected((prev) => {
      const isSelected = prev.includes(topic)
      if (isSelected) {
        const nextLevels = { ...userLevels }
        delete nextLevels[topic]
        setUserLevels(nextLevels)
        return prev.filter((t) => t !== topic)
      }
      setUserLevels((prevLevels) => ({ ...prevLevels, [topic]: 1 }))
      return [...prev, topic]
    })
  }

  const handleGenerate = async () => {
    if (Object.keys(userLevels).length < 10) return
    const normalizedName = planName.trim() || `Plan ${new Date().toISOString().split('T')[0]}`
    setLoading(true)
    try {
      const payload = {
        name: normalizedName,
        duration,
        startDate: new Date(startDate).toISOString(),
        userLevels,
      }
      const { data } = await api.post('/plans/generate', payload)
      localStorage.setItem('planId', data._id)
      navigate(`/plan/${data._id}`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const goToPlanWorkspace = () => {
    if (activePlanId) { navigate(`/plan/${activePlanId}`); return }
    navigate('/dashboard')
  }

  const transitionStep = (next: number) => {
    if (animating) return
    setAnimating(true)
    setPrevStep(currentStep)
    setTimeout(() => {
      setCurrentStep(next)
      setAnimating(false)
    }, 220)
  }

  const goToNextStep = () => transitionStep(Math.min(3, currentStep + 1))
  const goToPreviousStep = () => transitionStep(Math.max(1, currentStep - 1))

  const setTopicLevel = (topic: string, level: number) => {
    setUserLevels((prev) => ({ ...prev, [topic]: level }))
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#09090b] text-foreground">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.025]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)',
        }}
      />

      {/* Corner bracket decoration */}
      <div className="pointer-events-none fixed left-0 top-0 z-[2] h-16 w-16 border-l-2 border-t-2 border-primary-container/20" />
      <div className="pointer-events-none fixed bottom-0 right-0 z-[2] h-16 w-16 border-b-2 border-r-2 border-primary-container/20" />

      <AppSidebar />

      <main className="flex h-screen flex-1 flex-col bg-surface-dim lg:ml-64">

        {/* Header */}
        <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-zinc-800/30 bg-zinc-950/90 px-6 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-primary-container" />
              <span className="font-mono text-base font-black text-zinc-100">algo_core</span>
            </div>
            {activePlanId ? (
              <button
                onClick={goToPlanWorkspace}
                className="font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:text-primary-container"
              >
                ↗ View current plan
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            {/* Step indicators in header */}
            <div className="mr-2 hidden items-center gap-1 sm:flex">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    s === currentStep ? 'bg-primary-container scale-125' : s < currentStep ? 'bg-primary-container/40' : 'bg-zinc-700'
                  }`}
                />
              ))}
            </div>

            <div className="mr-2 flex items-center gap-2">
              <button
                className="group relative overflow-hidden bg-primary-container px-4 py-1.5 font-mono text-[10px] font-bold text-on-primary-container transition-all hover:opacity-90 active:scale-[0.97]"
                onClick={handleGenerate}
                disabled={loading}
              >
                <span className="relative z-10">{loading ? 'Executing...' : 'Execute'}</span>
                <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0" />
              </button>
            </div>

            <button className="text-zinc-400 transition-colors hover:text-primary-container">
              <Bell className="h-4 w-4" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 transition-colors hover:border-primary-container/40">
              <UserRound className="h-4 w-4 text-zinc-300" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="mx-auto max-w-6xl">

            {/* Title block */}
            <div className="mb-10 flex flex-col justify-between gap-6 border-b border-zinc-800/30 pb-6 lg:flex-row lg:items-end">
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary-container/60">
                  {'>'} algo_core / onboarding
                </p>
                <h1 className="text-4xl font-extrabold tracking-tighter text-zinc-100 lg:text-5xl">
                  Build your DSA plan
                </h1>
                <p className="mt-2 font-mono text-xs text-zinc-600">
                  Calibrate your training matrix in 3 steps
                </p>
              </div>

              <div className="flex gap-3">
                <ProgressStep label="STEP_01" state={currentStep === 1 ? 'active' : currentStep > 1 ? 'complete' : 'upcoming'} />
                <ProgressStep label="STEP_02" state={currentStep === 2 ? 'active' : currentStep > 2 ? 'complete' : 'upcoming'} />
                <ProgressStep label="STEP_03" state={currentStep === 3 ? 'active' : 'upcoming'} />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">

              {/* Sidebar */}
              <aside className="col-span-12 space-y-4 xl:col-span-4">
                {/* Summary card */}
                <div className="border border-primary-container/20 bg-surface-container p-5">
                  <h4 className="mb-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                    <Activity className="h-3 w-3" />
                    CALIBRATION_SUMMARY
                  </h4>
                  <div className="space-y-3">
                    <SummaryRow label="Selected Modules" value={`${selectedTopics.length} / ${ALL_TOPICS.length}`} valueClass="text-primary-container" />
                    <SummaryRow label="Core Modules" value={`${BASIC_TOPICS.length}`} valueClass="text-zinc-400" />
                    <SummaryRow label="Advanced Modules" value={`${advancedSelected.length}`} valueClass="text-zinc-400" />
                    <div className="pt-1">
                      <div className="mb-1 flex justify-between font-mono text-[9px] uppercase text-zinc-600">
                        <span>Module Coverage</span>
                        <span>{Math.round((selectedTopics.length / ALL_TOPICS.length) * 100)}%</span>
                      </div>
                      <div className="h-1 w-full bg-zinc-800">
                        <div
                          className="h-full bg-primary-container transition-all duration-500"
                          style={{ width: `${(selectedTopics.length / ALL_TOPICS.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plan preview card */}
                {currentStep === 3 && (
                  <div className="border border-primary-container/10 bg-primary-container/5 p-5">
                    <h4 className="mb-3 font-mono text-[9px] uppercase tracking-widest text-primary-container/60">PLAN_PREVIEW</h4>
                    <div className="space-y-2">
                      <p className="font-mono text-sm font-bold text-zinc-200">{planName || 'My Plan'}</p>
                      <p className="font-mono text-[10px] text-zinc-500">{duration} days · {selectedTopics.length} modules</p>
                      <p className="font-mono text-[10px] text-zinc-600">Starting {startDate}</p>
                    </div>
                  </div>
                )}
              </aside>

              {/* Main content */}
              <section
                className="col-span-12 border border-outline-variant/10 bg-surface-low p-8 xl:col-span-8"
                style={{
                  opacity: animating ? 0 : 1,
                  transform: animating
                    ? `translateX(${currentStep > prevStep ? '12px' : '-12px'})`
                    : 'translateX(0)',
                  transition: 'opacity 0.22s ease, transform 0.22s ease',
                }}
              >
                {currentStep === 1 && (
                  <>
                    <div className="mb-8 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 font-mono text-sm font-bold text-primary-container">
                        <Terminal className="h-4 w-4" />
                        01_CHOOSE_TOPICS
                      </h3>
                      <span className="font-mono text-[10px] text-zinc-600">
                        SELECTED: {selectedTopics.length}/{ALL_TOPICS.length}
                      </span>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                            Core Topics <span className="text-zinc-700 ml-2">— Always enabled</span>
                          </p>
                          <span className="font-mono text-[9px] text-zinc-700">{BASIC_TOPICS.length} modules</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {BASIC_TOPICS.map((topic) => (
                            <TopicChip key={topic} topic={topic} selected disabled />
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                            Advanced Topics
                          </p>
                          <span className="font-mono text-[9px] text-zinc-700">{advancedSelected.length} selected</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ADVANCED_TOPICS.map((topic) => {
                            const isSelected = advancedSelected.includes(topic)
                            return (
                              <TopicChip
                                key={topic}
                                topic={topic}
                                selected={isSelected}
                                onClick={() => toggleAdvanced(topic)}
                              />
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-zinc-800/30 pt-6">
                      <span className="font-mono text-[10px] text-zinc-600">
                        {selectedTopics.length} of {ALL_TOPICS.length} modules active
                      </span>
                      <button
                        type="button"
                        onClick={goToNextStep}
                        disabled={!canContinueFromTopics}
                        className="group flex items-center gap-3 bg-primary-container px-6 py-3 font-mono text-xs font-black uppercase tracking-widest text-on-primary-container transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Continue
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="mb-8 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 font-mono text-sm font-bold text-primary-container">
                        <Wrench className="h-4 w-4" />
                        02_SKILL_CALIBRATION
                      </h3>
                      <span className="font-mono text-[10px] text-zinc-600">
                        {selectedTopics.length} MODULES TO CALIBRATE
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                      {selectedTopics.map(({ topic, type }) => (
                        <SkillRow
                          key={topic}
                          topic={topic}
                          type={type}
                          level={userLevels[topic] || 1}
                          onSetLevel={(l) => setTopicLevel(topic, l)}
                        />
                      ))}
                    </div>

                    <div className="mt-8 flex justify-between border-t border-zinc-800/30 pt-6">
                      <button
                        type="button"
                        onClick={goToPreviousStep}
                        className="border border-zinc-700 px-5 py-3 font-mono text-xs uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={goToNextStep}
                        disabled={!canContinueFromCalibration}
                        className="group flex items-center gap-3 bg-primary-container px-6 py-3 font-mono text-xs font-black uppercase tracking-widest text-on-primary-container transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Continue
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <>
                    <div className="mb-8 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 font-mono text-sm font-bold text-primary-container">
                        <Settings className="h-4 w-4" />
                        03_OPERATIONAL_PARAMETERS
                      </h3>
                    </div>

                    <div className="space-y-7">
                      <div className="group">
                        <label className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                          <span>PLAN_NAME</span>
                          <span className="text-zinc-700">{planName.length}/80</span>
                        </label>
                        <Input
                          value={planName}
                          onChange={(e) => setPlanName(e.target.value)}
                          maxLength={80}
                          placeholder="My Plan"
                          className="font-mono border-zinc-800 focus:border-primary-container/50 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                          TRAINING_DURATION
                        </label>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                          {[21, 30, 45, 60, 75, 90].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setDuration(d)}
                              className={`py-3 font-mono text-xs transition-all ${
                                duration === d
                                  ? 'border border-primary-container bg-primary-container/10 text-primary-container'
                                  : 'border border-zinc-800 bg-surface-lowest text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                              }`}
                            >
                              {d}d
                            </button>
                          ))}
                        </div>
                        <p className="mt-2 font-mono text-[9px] text-zinc-600">
                          ~{Math.ceil((selectedTopics.length * 5) / duration)} problems/day at this window
                        </p>
                      </div>

                      <div>
                        <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                          START_DATE_STAMP
                        </label>
                        <input
                          className="w-full border border-zinc-800 bg-surface-lowest p-3 font-mono text-xs text-zinc-300 focus:border-primary-container/50 focus:outline-none transition-colors"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                        <p className="mt-2 font-mono text-[9px] text-zinc-600">
                          Plan ends: {(() => {
                            try {
                              const d = new Date(startDate)
                              d.setDate(d.getDate() + duration)
                              return d.toISOString().split('T')[0]
                            } catch { return '—' }
                          })()}
                        </p>
                      </div>

                      {/* Summary before submit */}
                      <div className="border border-zinc-800/40 bg-zinc-950/40 p-4">
                        <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-zinc-600">COMMIT_SUMMARY</p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {[
                            { label: 'Modules', val: selectedTopics.length },
                            { label: 'Duration', val: `${duration}d` },
                            { label: 'Core', val: BASIC_TOPICS.length },
                            { label: 'Advanced', val: advancedSelected.length },
                          ].map(({ label, val }) => (
                            <div key={label} className="border border-zinc-800/50 p-2 text-center">
                              <p className="font-mono text-xs font-bold text-primary-container">{val}</p>
                              <p className="font-mono text-[8px] uppercase text-zinc-600">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between border-t border-zinc-800/30 pt-6">
                      <button
                        type="button"
                        onClick={goToPreviousStep}
                        className="border border-zinc-700 px-5 py-3 font-mono text-xs uppercase tracking-widest text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="group relative flex items-center justify-center gap-3 overflow-hidden bg-primary-container px-8 py-3 font-mono text-xs font-black uppercase tracking-widest text-on-primary-container transition-all hover:opacity-90 active:scale-[0.99]"
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          {loading ? (
                            <>
                              <span className="animate-pulse">Committing</span>
                              <span className="flex gap-0.5">
                                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                              </span>
                            </>
                          ) : (
                            <>
                              Generate Plan
                              <Zap className="h-3.5 w-3.5" />
                            </>
                          )}
                        </span>
                        <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-300 group-hover:translate-x-0" />
                      </button>
                    </div>
                  </>
                )}
              </section>

              {/* Footer status bar */}
              <footer className="col-span-12 border border-zinc-800/50 bg-surface-lowest">
                <div className="flex items-center gap-4 px-4 py-2.5">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
                    <span className="font-mono text-[9px] uppercase text-zinc-600">SYS</span>
                  </div>
                  <span className="font-mono text-[9px] text-zinc-500 flex-1 truncate min-w-0">
                    {statusText}
                    <span className="ml-0.5 animate-pulse">▌</span>
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-[9px] uppercase text-zinc-700">
                      STEP {currentStep}/3
                    </span>
                    <span className="font-mono text-[9px] uppercase text-zinc-700">algo_core</span>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TopicChip({
  topic,
  selected,
  disabled,
  onClick,
}: {
  topic: string
  selected: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden px-3 py-1.5 font-mono text-xs transition-all duration-200 ${
        selected
          ? 'border border-primary-container/50 bg-primary-container/10 text-primary-container'
          : 'border border-zinc-800/50 bg-surface-highest text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
      } ${disabled ? 'cursor-default' : 'cursor-pointer active:scale-[0.97]'}`}
    >
      {selected && !disabled && (
        <span className="absolute inset-0 animate-[pulse_3s_ease-in-out_infinite] bg-primary-container/5" />
      )}
      <span className="relative">{topic}</span>
    </button>
  )
}

function SkillRow({
  topic,
  type,
  level,
  onSetLevel,
}: {
  topic: string
  type: 'core' | 'advanced'
  level: number
  onSetLevel: (l: number) => void
}) {
  return (
    <div className="rounded-sm border border-zinc-800/40 bg-zinc-950/20 p-4 transition-colors hover:border-zinc-700/50">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-zinc-300">
            {topic.toUpperCase().replace(/\s+/g, '_')}
          </span>
          {type === 'core' && (
            <span className="font-mono text-[8px] uppercase text-zinc-600 border border-zinc-800 px-1.5 py-0.5">
              core
            </span>
          )}
        </div>
        <span className="font-mono text-[10px] text-primary-container">
          {LEVEL_LABELS[level]}
        </span>
      </div>

      {/* Visual level bar with click zones */}
      <div className="relative h-2 w-full bg-zinc-800 rounded-sm overflow-hidden cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const pct = x / rect.width
          const newLevel = Math.max(1, Math.min(5, Math.ceil(pct * 5)))
          onSetLevel(newLevel)
        }}
      >
        <div
          className="h-full bg-primary-container transition-all duration-200"
          style={{ width: `${(level / 5) * 100}%` }}
        />
        {/* Tick marks */}
        {[1, 2, 3, 4].map((t) => (
          <div
            key={t}
            className="absolute top-0 h-full w-px bg-zinc-950/60"
            style={{ left: `${(t / 5) * 100}%` }}
          />
        ))}
      </div>

      {/* Number buttons */}
      <div className="mt-2 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onSetLevel(l)}
            className={`flex-1 py-1.5 font-mono text-[10px] transition-all ${
              level === l
                ? 'bg-primary-container text-on-primary-container'
                : 'border border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}

function ProgressStep({
  label,
  state,
}: {
  label: string
  state: 'active' | 'complete' | 'upcoming'
}) {
  return (
    <div className={`flex flex-col items-end transition-opacity duration-300 ${state === 'upcoming' ? 'opacity-30' : ''}`}>
      <div className="mb-1 flex items-center gap-1.5">
        <span className={`font-mono text-[10px] ${state === 'upcoming' ? 'text-zinc-500' : 'text-primary-container'}`}>
          {label}
        </span>
        {state === 'complete' && (
          <span className="font-mono text-[8px] text-primary-container/60">✓</span>
        )}
      </div>
      <div className="h-1 w-20 bg-zinc-800">
        <div
          className={`h-full bg-primary-container transition-all duration-500 ${
            state === 'active' ? 'w-1/3' : state === 'complete' ? 'w-full' : 'w-0'
          }`}
        />
      </div>
    </div>
  )
}

function SummaryRow({ label, value, valueClass }: { label: string; value: string; valueClass: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className={`font-mono text-xs ${valueClass}`}>{value}</span>
    </div>
  )
}
