import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  ChevronRight,
  Code2,
  Plus,
  Settings,
  Swords,
  Terminal,
  UserRound,
  Wrench,
} from 'lucide-react'
import api from '@/lib/api'
import { Input } from '@/components/ui/input'

const BASIC_TOPICS = [
  'Array',
  'String',
  'Hash Table',
  'Math',
  'Sorting',
  'Two Pointers',
  'Binary Search',
  'Sliding Window',
  'Linked List',
  'Matrix',
]

const ADVANCED_TOPICS = [
  'Dynamic Programming',
  'Greedy',
  'Tree',
  'Binary Tree',
  'Depth-First Search',
  'Breadth-First Search',
  'Graph',
  'Backtracking',
  'Stack',
  'Queue',
  'Heap',
  'Bit Manipulation',
  'Trie',
  'Union Find',
  'Divide and Conquer',
  'Geometry',
  'Recursion',
]

const ALL_TOPICS = [...BASIC_TOPICS, ...ADVANCED_TOPICS]

export default function Onboarding() {
  const navigate = useNavigate()

  const [advancedSelected, setAdvancedSelected] = useState<string[]>([])
  const [userLevels, setUserLevels] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    BASIC_TOPICS.forEach((t) => {
      init[t] = 1
    })
    return init
  })
  const [duration, setDuration] = useState<number>(14)
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [planName, setPlanName] = useState<string>('My Plan')
  const [loading, setLoading] = useState(false)
  const activePlanId = localStorage.getItem('planId')

  const selectedTopics = useMemo(() => {
    const basics = BASIC_TOPICS.map((topic) => ({ topic, type: 'core' as const }))
    const advanced = advancedSelected.map((topic) => ({ topic, type: 'advanced' as const }))
    return [...basics, ...advanced]
  }, [advancedSelected])

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
    if (activePlanId) {
      navigate(`/plan/${activePlanId}`)
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#09090b] text-foreground">
      <aside className="sticky left-0 top-0 hidden h-screen w-64 flex-col border-r border-zinc-800/50 bg-[#09090b] lg:flex">
        <div className="p-6">
          <div className="font-mono text-lg font-bold tracking-tighter text-primary-container">DSA_CORE</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">v2.4.0-stable</div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          <NavItem icon={<Terminal className="h-4 w-4" />} label="Terminal" onClick={() => navigate('/dashboard')} />
          <NavItem icon={<Code2 className="h-4 w-4" />} label="Algorithms" onClick={goToPlanWorkspace} />
          <NavItem icon={<Swords className="h-4 w-4" />} label="Arena" onClick={goToPlanWorkspace} />
          <NavItem icon={<BarChart3 className="h-4 w-4" />} label="Analytics" onClick={() => navigate('/dashboard')} />
          <NavItem icon={<Settings className="h-4 w-4" />} label="System Setup" active />
        </nav>

        <div className="mt-auto p-4">
          <button
            onClick={() => navigate('/onboarding')}
            className="flex w-full items-center justify-center gap-2 border border-zinc-800 bg-zinc-900 py-2 font-mono text-xs text-zinc-400 transition-all hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" /> New Session
          </button>
        </div>
      </aside>

      <main className="flex h-screen flex-1 flex-col bg-surface-dim">
        <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-zinc-800/30 bg-zinc-950/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-8">
            <span className="font-mono text-base font-black text-zinc-100">ROOT@TERMINAL</span>
            <div className="flex items-center gap-4">
              <button
                onClick={goToPlanWorkspace}
                className="font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:text-primary-container"
              >
                Docs
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:text-primary-container"
              >
                Leaderboard
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="mr-4 flex items-center gap-2">
              <button className="border border-outline-variant/15 bg-surface-highest px-3 py-1 font-mono text-[10px] text-zinc-300 hover:bg-zinc-800">
                Debug
              </button>
              <button
                className="bg-primary-container px-3 py-1 font-mono text-[10px] font-bold text-on-primary-container hover:opacity-90"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? 'Executing...' : 'Execute'}
              </button>
            </div>

            <button className="text-zinc-400 transition-colors hover:text-primary-container">
              <Bell className="h-4 w-4" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800">
              <UserRound className="h-4 w-4 text-zinc-300" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col justify-between gap-8 border-b border-zinc-800/30 pb-6 lg:flex-row lg:items-end">
              <div>
                <h1 className="mb-2 text-4xl font-extrabold tracking-tighter text-zinc-100">INITIALIZING_FLOW</h1>
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Protocol: DSA_CORE_ONBOARDING_V2.4</p>
              </div>

              <div className="flex gap-4">
                <ProgressStep label="STEP_01" active width="w-1/3" />
                <ProgressStep label="STEP_02" width="w-0" muted />
                <ProgressStep label="STEP_03" width="w-0" muted />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
              <section className="col-span-12 border border-outline-variant/10 bg-surface-low p-8 xl:col-span-8">
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-mono text-sm font-bold text-primary-container">
                    <Terminal className="h-4 w-4" />
                    01_CHOOSE_TOPICS
                  </h3>
                  <span className="font-mono text-[10px] text-zinc-600">SELECTED: {selectedTopics.length}/{ALL_TOPICS.length}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {BASIC_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      className="border border-primary-container/40 bg-primary-container/10 px-4 py-2 font-mono text-xs text-primary-container"
                      title="Core topic (always enabled)"
                    >
                      {topic}
                    </button>
                  ))}

                  {ADVANCED_TOPICS.map((topic) => {
                    const isSelected = advancedSelected.includes(topic)
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleAdvanced(topic)}
                        className={`px-4 py-2 font-mono text-xs transition-colors ${
                          isSelected
                            ? 'border border-primary-container/40 bg-primary-container/10 text-primary-container'
                            : 'border border-zinc-800/50 bg-surface-highest text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        {topic}
                      </button>
                    )
                  })}
                </div>
              </section>

              <aside className="col-span-12 space-y-8 xl:col-span-4">
                <div className="border border-primary-container/20 bg-surface-container p-6">
                  <h4 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-zinc-500">CALIBRATION_SUMMARY</h4>
                  <div className="space-y-4">
                    <SummaryRow label="Selected Modules" value={`${selectedTopics.length}`} valueClass="text-primary-container" />
                    <SummaryRow
                      label="Est. Intensity"
                      value={selectedTopics.length >= 16 ? 'HIGH' : selectedTopics.length >= 12 ? 'MODERATE' : 'LIGHT'}
                      valueClass="text-primary-container"
                    />
                    <SummaryRow label="Training Window" value={`${duration}_DAYS`} valueClass="text-zinc-500" />
                  </div>
                </div>

                <div className="border border-zinc-800/40 bg-zinc-900/50 p-6">
                  <p className="text-[10px] italic leading-relaxed text-zinc-600">
                    "The terminal is your canvas. Precision in selection ensures peak algorithmic performance during execution."
                  </p>
                </div>
              </aside>

              <section className="col-span-12 border border-outline-variant/10 bg-surface-low p-8 xl:col-span-7">
                <h3 className="mb-8 flex items-center gap-2 font-mono text-sm font-bold text-primary-container">
                  <Wrench className="h-4 w-4" />
                  02_SKILL_CALIBRATION
                </h3>

                <div className="space-y-8">
                  {selectedTopics.map(({ topic }) => (
                    <div key={topic} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-zinc-300">{topic.toUpperCase().replace(/\s+/g, '_')}</span>
                        <span className="bg-primary-container/10 px-2 py-0.5 font-mono text-[10px] text-primary-container">
                          LVL_{userLevels[topic] || 1}
                        </span>
                      </div>

                      <input
                        className="w-full"
                        min={1}
                        max={5}
                        type="range"
                        value={userLevels[topic] || 1}
                        onChange={(e) => setUserLevels({ ...userLevels, [topic]: Number(e.target.value) })}
                      />

                      <div className="flex justify-between font-mono text-[8px] text-zinc-600">
                        <span>NOVICE</span>
                        <span>MASTER</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="col-span-12 flex flex-col border border-outline-variant/10 bg-surface-low p-8 xl:col-span-5">
                <h3 className="mb-8 flex items-center gap-2 font-mono text-sm font-bold text-primary-container">
                  <Settings className="h-4 w-4" />
                  03_OPERATIONAL_PARAMETERS
                </h3>

                <div className="flex-1 space-y-8">
                  <div>
                    <label className="mb-4 block font-mono text-[10px] uppercase tracking-widest text-zinc-500">PLAN_NAME</label>
                    <Input
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      maxLength={80}
                      placeholder="My Plan"
                      className="font-mono"
                    />
                  </div>

                  <div>
                    <label className="mb-4 block font-mono text-[10px] uppercase tracking-widest text-zinc-500">TRAINING_DURATION</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[7, 14, 30].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDuration(d)}
                          className={`py-3 font-mono text-xs ${
                            duration === d
                              ? 'border border-primary-container bg-primary-container/10 text-primary-container'
                              : 'border border-zinc-800 bg-surface-lowest text-zinc-400 hover:border-primary-container/50'
                          }`}
                        >
                          {String(d).padStart(2, '0')}_DAYS
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-4 block font-mono text-[10px] uppercase tracking-widest text-zinc-500">START_DATE_STAMP</label>
                    <div className="relative">
                      <input
                        className="w-full border border-zinc-800 bg-surface-lowest p-3 font-mono text-xs text-zinc-300 focus:border-primary-container/50 focus:outline-none"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-zinc-800/30 pt-8">
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 bg-primary-container py-4 font-mono text-xs font-black uppercase tracking-widest text-on-primary-container transition-all hover:opacity-90 active:scale-[0.99]"
                  >
                    {loading ? 'Committing...' : 'Commit Parameters'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </section>

              <footer className="col-span-12 mt-8 border border-zinc-800/50 bg-surface-lowest p-4">
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
                  <span className="font-mono text-[9px] uppercase text-zinc-500">System Status: Awaiting_Final_Config</span>
                  <span className="ml-auto font-mono text-[9px] uppercase text-zinc-700">TERMINAL_REF: 0x882_ONBOARD</span>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
        active
          ? 'border-r-2 border-primary-container bg-primary-container/10 text-primary-container'
          : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

function ProgressStep({
  label,
  active = false,
  muted = false,
  width,
}: {
  label: string
  active?: boolean
  muted?: boolean
  width: string
}) {
  return (
    <div className={`flex flex-col items-end ${muted ? 'opacity-30' : ''}`}>
      <span className={`mb-1 font-mono text-[10px] ${active ? 'text-primary-container' : 'text-zinc-500'}`}>{label}</span>
      <div className="h-1 w-24 bg-zinc-800">
        <div className={`h-full bg-primary-container ${width}`} />
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
