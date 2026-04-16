import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  Flame,
  Layers3,
  Sparkles,
  Target,
  Trophy,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const featureCards = [
  {
    icon: CalendarRange,
    title: 'Plan by real days',
    description: 'Generate a day-by-day roadmap based on how many days you can actually commit.',
  },
  {
    icon: Flame,
    title: 'Track consistency',
    description: 'Keep your streak visible so momentum feels earned and slipping off is easier to catch.',
  },
  {
    icon: Trophy,
    title: 'Compete with friends',
    description: 'Leaderboards add a healthy hook so progress feels social, not solitary.',
  },
]

const workflow = [
  {
    step: '01',
    title: 'Set your time horizon',
    copy: 'Choose how many days you have and when you want to start.',
  },
  {
    step: '02',
    title: 'Calibrate your level',
    copy: 'Tell ALGO_CORE where you feel strong and where you need more reps.',
  },
  {
    step: '03',
    title: 'Follow the daily plan',
    copy: 'Show up each day, complete the assigned work, and keep the streak alive.',
  },
]

const leaderboardPreview = [
  { rank: '01', name: 'Aarav', streak: '48 day streak', score: '1,280 pts' },
  { rank: '02', name: 'Naina', streak: '41 day streak', score: '1,190 pts' },
  { rank: '03', name: 'You', streak: '24 day streak', score: '960 pts' },
]

const stats = [
  { label: 'Daily focus', value: '1 clear plan' },
  { label: 'Consistency hook', value: 'streak + score' },
  { label: 'Competitive layer', value: 'live leaderboard' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-dim text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1.5, ease: "easeOut" }}
           className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_36%),radial-gradient(circle_at_78%_22%,rgba(255,193,116,0.1),transparent_24%),linear-gradient(180deg,rgba(9,9,11,0.12),rgba(9,9,11,0.62))]"
        />
        <motion.div
           initial={{ opacity: 0, x: -50 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 1.2, delay: 0.2 }}
           className="absolute left-[8%] top-28 h-52 w-52 rounded-full bg-primary-container/10 blur-3xl"
        />
        <motion.div
           initial={{ opacity: 0, x: 50 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 1.2, delay: 0.4 }}
           className="absolute bottom-10 right-[12%] h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
      </div>

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="sticky top-0 z-50 border-b border-outline-variant/15 bg-[#09090b]/78 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 text-left group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-primary-container/25 bg-primary-container/10 transition-colors group-hover:bg-primary-container/20">
              <Layers3 className="h-4 w-4 text-primary-container" />
            </div>
            <div>
              <div className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-zinc-100 group-hover:text-primary-container transition-colors">ALGO_CORE</div>
              <div className="text-xs text-muted-foreground">DSA planner system</div>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Sign in
            </Button>
            <Button size="sm" onClick={() => navigate('/login')} className="relative overflow-hidden group">
              <span className="relative z-10">Get started</span>
              <div className="absolute inset-0 bg-primary/20 translate-y-full transition-transform group-hover:translate-y-0" />
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28 lg:pt-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <motion.div variants={itemVariants}>
              <Badge className="mb-5 gap-2 px-3 py-1.5 text-[10px] hover:bg-primary-container/20 transition-colors cursor-default">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                DSA planning with consistency built in
              </Badge>
            </motion.div>

            <motion.h1 variants={itemVariants} className="max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] text-zinc-50 sm:text-5xl lg:text-6xl">
              Turn <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">DSA prep</span> into a system you can actually follow.
            </motion.h1>

            <motion.p variants={itemVariants} className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              ALGO_CORE creates a structured DSA plan around the number of days you have, helps you stay consistent,
              and adds leaderboard pressure so you keep showing up.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="group gap-2 relative overflow-hidden" onClick={() => navigate('/login')}>
                <span className="relative z-10 flex items-center gap-2">
                  Build my plan
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] transition-transform group-hover:translate-x-0 group-hover:duration-500" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="hover:bg-surface-container-low"
              >
                See how it works
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="group rounded-sm border border-outline-variant/15 bg-surface-container-low/70 p-4 transition-colors hover:border-primary-container/30">
                  <p className="tm-label">{stat.label}</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors">{stat.value}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="relative"
          >
            <Card className="relative overflow-hidden border-outline-variant/20 bg-surface-container-low/85 shadow-[0_20px_70px_rgba(0,0,0,0.35)] group hover:shadow-primary-container/10 transition-shadow duration-500">
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(245,158,11,0.2),rgba(255,193,116,0.85),rgba(245,158,11,0.2))] group-hover:opacity-100 opacity-80 transition-opacity" />
              <CardContent className="p-0">
                <div className="border-b border-outline-variant/15 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary-container/70">
                        ACTIVE PLAN
                      </p>
                      <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-100">75-day DSA sprint</h2>
                    </div>
                    <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400 animate-pulse">
                      on track
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-6">
                  <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-sm border border-outline-variant/15 bg-surface-container-high/45 p-4 hover:bg-surface-container-high/60 transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="tm-label">Today</p>
                        <span className="font-mono text-[11px] text-zinc-500">Day 18</span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {['Binary Search - 3 questions', 'Sliding Window - 2 questions', 'Revision block - 25 mins'].map((task) => (
                          <div key={task} className="flex items-center gap-3 rounded-sm bg-surface-container-lowest/70 px-3 py-2 cursor-default hover:bg-surface-container-lowest hover:scale-[1.02] transition-transform">
                            <CheckCircle2 className="h-4 w-4 text-primary-container" />
                            <span className="text-sm text-zinc-200">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-sm border border-outline-variant/15 bg-surface-container-high/45 p-4 hover:bg-surface-container-high/60 transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="tm-label">Streak</p>
                        <Flame className="h-4 w-4 text-primary-container" />
                      </div>
                      <div className="mt-3 text-4xl font-black tracking-tight text-zinc-50">24</div>
                      <p className="mt-1 text-sm text-muted-foreground">days of consistent practice</p>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                          <span>Consistency score</span>
                          <span>82%</span>
                        </div>
                        <div className="h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "82%" }}
                            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                            className="h-2 rounded-full tm-progress-gradient"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-sm border border-outline-variant/15 bg-surface-container-high/35 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="tm-label">Leaderboard preview</p>
                        <p className="mt-1 text-sm text-muted-foreground">Competition that nudges you back into the habit.</p>
                      </div>
                      <Users className="h-4 w-4 text-primary-container" />
                    </div>

                    <div className="mt-4 space-y-3">
                      {leaderboardPreview.map((entry, i) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                          key={entry.rank}
                          className={`grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-sm px-3 py-3 hover:scale-[1.01] transition-transform cursor-default ${
                            entry.name === 'You'
                              ? 'border border-primary-container/25 bg-primary-container/10'
                              : 'bg-surface-container-low/75'
                          }`}
                        >
                          <div className="font-mono text-xs font-bold text-zinc-500">#{entry.rank}</div>
                          <div>
                            <div className="text-sm font-semibold text-zinc-100">{entry.name}</div>
                            <div className="text-xs text-muted-foreground">{entry.streak}</div>
                          </div>
                          <div className="font-mono text-xs text-primary-container">{entry.score}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, type: 'spring' }}
              className="absolute -bottom-8 -left-8 hidden rounded-sm border border-outline-variant/15 bg-[#0c0c0e]/90 p-4 shadow-2xl lg:block group hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary-container group-hover:rotate-45 transition-transform" />
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">Weak area focus</div>
                  <div className="mt-1 text-sm font-semibold text-zinc-100">Dynamic Programming this week</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid gap-4 md:grid-cols-3"
          >
            {featureCards.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div variants={itemVariants} key={feature.title}>
                  <Card className="h-full border-outline-variant/15 bg-surface-container-low/65 hover:bg-surface-container-low/80 transition-colors hover:border-primary-container/20 group cursor-default">
                    <CardContent className="p-6">
                      <div className="flex h-11 w-11 items-center justify-center rounded-sm border border-primary-container/20 bg-primary-container/10 group-hover:scale-110 transition-transform">
                        <Icon className="h-5 w-5 text-primary-container" />
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-zinc-50 group-hover:text-amber-400 transition-colors">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary-container/65">How it works</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-zinc-50 sm:text-4xl">
              A planner that feels practical on day one.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              The goal is simple: give users a realistic DSA roadmap, make daily progress visible, and keep motivation alive
              through consistency signals and social ranking.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="mt-10 grid gap-4 lg:grid-cols-3"
          >
            {workflow.map((item) => (
              <motion.div variants={itemVariants} key={item.step}>
                <Card className="h-full border-outline-variant/15 bg-surface-container-low/60 hover:bg-surface-container-low/80 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-container/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-8xl font-black">{item.step}</span>
                  </div>
                  <CardContent className="p-6 relative z-10">
                    <div className="font-mono text-xs font-bold tracking-[0.24em] text-primary-container/80">{item.step}</div>
                    <h3 className="mt-4 text-xl font-semibold text-zinc-100">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8"
        >
          <Card className="overflow-hidden border-outline-variant/15 bg-[linear-gradient(135deg,rgba(23,23,28,0.92),rgba(10,10,11,0.98))] relative">
             <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
             <div className="absolute left-0 bottom-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-primary-container/20 blur-3xl pointer-events-none" />
            
            <CardContent className="grid gap-8 p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10 relative z-10">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary-container/65">Launch your prep</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-zinc-50 sm:text-4xl">
                  Build a DSA routine that stays alive after the first week.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                  Start with your available days, generate the plan, and let ALGO_CORE handle the structure, rhythm, and
                  motivation layer.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button size="lg" className="group gap-2 relative overflow-hidden" onClick={() => navigate('/login')}>
                  <span className="relative z-10 flex items-center gap-2">
                     Start with ALGO_CORE
                     <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] transition-transform group-hover:translate-x-0 group-hover:duration-500" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="hover:bg-surface-container-low transition-colors">
                  Sign in
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>
    </div>
  )
}
