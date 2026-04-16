import { Link } from 'react-router-dom'
import { ArrowUpRight, Flame, Sparkles, Trophy, UserPlus } from 'lucide-react'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { FriendsWidget } from '@/components/friends/FriendsWidget'
import { Card, CardContent } from '@/components/ui/card'

const guideCards = [
  {
    icon: UserPlus,
    title: 'Build your circle',
    description: 'Share your code, bring in friends, and turn solo prep into a shared challenge.',
  },
  {
    icon: Trophy,
    title: 'Read the ranking',
    description: 'Use the leaderboard to see who is consistent, who is catching up, and where you stand.',
  },
  {
    icon: Flame,
    title: 'Stay hooked',
    description: 'A visible streak race gives users a reason to come back daily and not break momentum.',
  },
]

export default function FriendsHub() {
  return (
    <div className="min-h-screen bg-[#09090b] text-foreground">
      <AppSidebar />

      <main className="min-h-screen px-4 pb-10 pt-10 lg:ml-64 lg:p-8">
        <div className="mx-auto max-w-[1440px] space-y-6">
          <section className="relative overflow-hidden rounded-sm border border-outline-variant/15 bg-[linear-gradient(135deg,rgba(24,24,28,0.98),rgba(12,12,14,0.98))] px-6 py-8 sm:px-8 sm:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,193,116,0.08),transparent_28%)]" />
            <div className="relative z-10 grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-sm border border-primary-container/20 bg-primary-container/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-primary-container">
                  <Sparkles className="h-3.5 w-3.5" />
                  Social Hub
                </div>
                <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] text-zinc-50 sm:text-5xl">
                  A cleaner place to manage your friends, requests, and streak race.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                  This area should feel like the competitive layer of `ALGO_CORE`: inviting people in, seeing who is active,
                  and checking the leaderboard without hunting through scattered widgets.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <InfoPanel
                  label="What lives here"
                  text="Friend code sharing, incoming requests, accepted connections, and the live streak board."
                />
                <InfoPanel
                  label="Why it matters"
                  text="The social layer gives users an extra reason to return each day and protect their rank."
                />
                <InfoPanel
                  label="Back to planning"
                  text="Continue building your prep flow from the dashboard whenever you want."
                  href="/dashboard"
                />
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            {guideCards.map((card) => {
              const Icon = card.icon

              return (
                <Card key={card.title} className="overflow-hidden border-outline-variant/15 bg-[linear-gradient(180deg,rgba(23,23,27,0.96),rgba(15,15,17,0.92))]">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-primary-container/20 bg-primary-container/10">
                      <Icon className="h-5 w-5 text-primary-container" />
                    </div>
                    <h2 className="mt-5 text-xl font-semibold text-zinc-100">{card.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </section>

          <section className="rounded-sm border border-outline-variant/15 bg-[linear-gradient(180deg,rgba(18,18,21,0.98),rgba(12,12,14,0.96))] p-4 sm:p-6">
            <FriendsWidget />
          </section>
        </div>
      </main>
    </div>
  )
}

function InfoPanel({
  label,
  text,
  href,
}: {
  label: string
  text: string
  href?: string
}) {
  return (
    <div className="rounded-sm border border-outline-variant/15 bg-black/15 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-200">{text}</div>
      {href ? (
        <Link to={href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-container">
          Open dashboard
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  )
}
