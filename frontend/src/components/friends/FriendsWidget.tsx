import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Flame, Search, Trophy, UserPlus, Users, X } from 'lucide-react'
import api from '@/lib/api'
import { getSocket, connectSocket } from '@/lib/socket'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

type FriendUser = {
  _id: string
  username: string
  uniqueCode: string
  streak: number
}

export function FriendsWidget() {
  const queryClient = useQueryClient()
  const { pushToast } = useToast()
  const [searchCode, setSearchCode] = useState('')
  const [copied, setCopied] = useState(false)

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/users/me').then((res) => res.data),
  })

  const { data: myCodeData } = useQuery({
    queryKey: ['myCode'],
    queryFn: () => api.get('/friends/me').then((res) => res.data),
  })

  const { data: leaderboard = [], isLoading: lbLoading } = useQuery<FriendUser[]>({
    queryKey: ['leaderboard'],
    queryFn: () => api.get('/friends/leaderboard').then((res) => res.data),
  })

  const { data: pendingRequests = [] } = useQuery<FriendUser[]>({
    queryKey: ['pendingRequests'],
    queryFn: () => api.get('/friends/pending').then((res) => res.data),
  })

  const connectedFriends = leaderboard.filter((user) => user._id !== me?._id)
  const currentUserRank = leaderboard.findIndex((user) => user._id === me?._id) + 1
  const topFriend = connectedFriends[0]

  const searchMutation = useMutation({
    mutationFn: (code: string) => api.get(`/friends/search/${code}`).then((res) => res.data),
  })

  const sendRequestMutation = useMutation({
    mutationFn: (targetUserId: string) => api.post('/friends/request', { targetUserId }),
    onSuccess: () => {
      pushToast({
        title: 'Friend request sent',
        description: 'Your invite is on the way.',
        variant: 'success',
      })
      setSearchCode('')
      searchMutation.reset()
    },
    onError: (err: any) => {
      pushToast({
        title: 'Could not send request',
        description: err.response?.data?.msg || 'Error sending request',
        variant: 'error',
      })
    },
  })

  const acceptMutation = useMutation({
    mutationFn: (id: string) => api.put(`/friends/request/${id}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      pushToast({
        title: 'Request accepted',
        description: 'Your leaderboard circle just expanded.',
        variant: 'success',
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/friends/request/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] })
    },
  })

  useEffect(() => {
    if (!me?._id) return

    connectSocket(me._id)
    const socket = getSocket()

    const onRequestReceived = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] })
      pushToast({
        title: 'New friend request',
        description: `${data.from} sent you a request.`,
        variant: 'info',
      })
    }

    const onRequestAccepted = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      pushToast({
        title: 'Friend request accepted',
        description: `${data.by} is now in your circle.`,
        variant: 'success',
      })
    }

    socket.on('friend_request_received', onRequestReceived)
    socket.on('friend_request_accepted', onRequestAccepted)

    return () => {
      socket.off('friend_request_received', onRequestReceived)
      socket.off('friend_request_accepted', onRequestAccepted)
    }
  }, [me, pushToast, queryClient])

  const copyCode = () => {
    if (!myCodeData?.uniqueCode) return

    navigator.clipboard.writeText(myCodeData.uniqueCode)
    setCopied(true)
    pushToast({
      title: 'Friend code copied',
      description: `${myCodeData.uniqueCode} is ready to share.`,
      variant: 'info',
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-sm border border-outline-variant/15 bg-[linear-gradient(180deg,rgba(27,27,31,0.98),rgba(17,17,19,0.96))]">
          <div className="border-b border-outline-variant/15 px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary-container/70">Invite flow</p>
            <h3 className="mt-2 text-lg font-semibold text-zinc-100">Bring friends into your prep loop</h3>
          </div>

          <div className="space-y-5 p-5">
            <div className="rounded-sm border border-primary-container/20 bg-primary-container/10 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-container/70">Your friend code</div>
                  <div className="mt-2 font-mono text-2xl font-black tracking-[0.25em] text-primary-container">
                    {myCodeData?.uniqueCode || '------'}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={copyCode} className="gap-2 border-primary-container/25 bg-black/10">
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Find by friend code</div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex h-11 flex-1 items-center rounded-sm border border-zinc-800 bg-surface-lowest px-3">
                  <Search className="h-4 w-4 text-zinc-500" />
                  <input
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                    placeholder="Enter Friend Code"
                    className="w-full bg-transparent px-2 text-sm font-mono text-zinc-100 outline-none placeholder:text-zinc-600"
                  />
                </div>
                <Button
                  disabled={!searchCode || searchMutation.isPending}
                  onClick={() => searchMutation.mutate(searchCode)}
                  className="h-11 min-w-[120px]"
                >
                  {searchMutation.isPending ? 'Searching...' : 'Find Friend'}
                </Button>
              </div>

              {searchMutation.isError ? (
                <div className="mt-3 rounded-sm border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  No user found for that code.
                </div>
              ) : null}

              {searchMutation.isSuccess && searchMutation.data ? (
                <div className="mt-4 flex flex-col gap-4 rounded-sm border border-primary-container/20 bg-surface-lowest/90 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-primary-container/12 text-primary-container">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-100">{searchMutation.data.username}</div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                        <span className="font-mono">{searchMutation.data.uniqueCode}</span>
                        <span className="inline-flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5 text-amber-400" />
                          {searchMutation.data.streak} day streak
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => sendRequestMutation.mutate(searchMutation.data._id)}>
                    Add to Network
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <MetricCard
            icon={Users}
            label="Connected friends"
            value={connectedFriends.length.toString()}
            hint={connectedFriends.length > 0 ? `${connectedFriends.length} active connections` : 'Start by inviting one friend'}
          />
          <MetricCard
            icon={Trophy}
            label="Your rank"
            value={currentUserRank > 0 ? `#${currentUserRank}` : '--'}
            hint={leaderboard.length > 1 ? 'Among your current circle' : 'Ranking appears once friends join'}
          />
          <MetricCard
            icon={Flame}
            label="Top streak"
            value={topFriend ? `${topFriend.streak}` : '--'}
            hint={topFriend ? `${topFriend.username} leads your network` : 'No friend streaks yet'}
          />
        </div>
      </section>

      {pendingRequests.length > 0 ? (
        <section className="rounded-sm border border-emerald-500/20 bg-[linear-gradient(180deg,rgba(18,27,22,0.55),rgba(16,16,18,0.92))] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-emerald-400/80">Pending requests</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-100">People waiting to join your circle</h3>
            </div>
            <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
              {pendingRequests.length} incoming
            </div>
          </div>

          <div className="grid gap-3">
            {pendingRequests.map((req) => (
              <div
                key={req._id}
                className="flex flex-col gap-3 rounded-sm border border-emerald-500/10 bg-black/15 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-300">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">{req.username}</div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                      <span className="font-mono">{req.uniqueCode}</span>
                      <span>{req.streak} day streak</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 border-emerald-500/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
                    onClick={() => acceptMutation.mutate(req._id)}
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-2 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                    onClick={() => rejectMutation.mutate(req._id)}
                  >
                    <X className="h-4 w-4" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-sm border border-outline-variant/15 bg-[linear-gradient(180deg,rgba(20,20,23,0.97),rgba(14,14,16,0.92))] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary-container/70">Connected friends</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-100">Your current network</h3>
            </div>
            <div className="rounded-sm border border-outline-variant/15 bg-surface-lowest/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              {connectedFriends.length} linked
            </div>
          </div>

          {lbLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-28 animate-pulse rounded-sm bg-surface-lowest" />
              <div className="h-28 animate-pulse rounded-sm bg-surface-lowest" />
            </div>
          ) : connectedFriends.length === 0 ? (
            <div className="rounded-sm border border-dashed border-zinc-800 bg-surface-lowest/70 px-4 py-10 text-center">
              <p className="text-sm font-medium text-zinc-300">No connected friends yet</p>
              <p className="mt-2 text-sm text-zinc-500">Add a friend above and accepted connections will show up here with their current streak.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {connectedFriends.map((friend) => {
                const friendRank = leaderboard.findIndex((user) => user._id === friend._id) + 1

                return (
                  <div
                    key={friend._id}
                    className="rounded-sm border border-outline-variant/15 bg-surface-lowest/85 p-4 transition-all hover:-translate-y-px hover:border-primary-container/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">{friend.username}</div>
                        <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">{friend.uniqueCode}</div>
                      </div>
                      <div className="rounded-sm bg-surface-container-high px-2 py-1 font-mono text-[10px] text-zinc-400">
                        #{friendRank}
                      </div>
                    </div>

                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Streak</div>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="font-mono text-3xl font-black text-primary-container">{friend.streak}</span>
                          <span className="text-xs uppercase tracking-widest text-zinc-500">days</span>
                        </div>
                      </div>
                      <div className="rounded-sm border border-primary-container/15 bg-primary-container/10 px-2 py-1 text-xs text-primary-container">
                        {topFriend?._id === friend._id ? 'Leader' : 'Tracking'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-sm border border-outline-variant/15 bg-[linear-gradient(180deg,rgba(22,22,25,0.97),rgba(14,14,16,0.92))] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary-container/70">Leaderboard</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-100">Streak ranking</h3>
            </div>
            <Trophy className="h-5 w-5 text-primary-container" />
          </div>

          {lbLoading ? (
            <div className="h-40 animate-pulse rounded-sm bg-surface-lowest" />
          ) : leaderboard.length <= 1 ? (
            <div className="rounded-sm border border-dashed border-zinc-800 bg-surface-lowest/70 px-4 py-10 text-center">
              <p className="text-sm font-medium text-zinc-300">Your leaderboard is waiting</p>
              <p className="mt-2 text-sm text-zinc-500">Add friends using their code to turn your solo streak into a shared race.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((user, idx) => (
                <div
                  key={user._id}
                  className={`grid grid-cols-[44px_1fr_auto] items-center gap-4 rounded-sm border px-4 py-3 transition-colors ${
                    user._id === me?._id
                      ? 'border-primary-container/25 bg-primary-container/10'
                      : idx === 0
                        ? 'border-amber-500/15 bg-amber-500/5'
                        : 'border-outline-variant/15 bg-surface-lowest/80'
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-black/20 font-mono text-xs font-bold text-zinc-400">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                      <span>{user.username}</span>
                      {user._id === me?._id ? (
                        <span className="rounded-sm bg-primary-container/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary-container">
                          You
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">{user.uniqueCode}</div>
                  </div>
                  <div className="rounded-sm border border-outline-variant/15 bg-surface-container-high/70 px-3 py-2 text-right">
                    <div className="font-mono text-lg font-bold text-amber-400">{user.streak}</div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">days</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-sm border border-outline-variant/15 bg-[linear-gradient(180deg,rgba(24,24,27,0.95),rgba(16,16,18,0.92))] p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</div>
        <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-primary-container/20 bg-primary-container/10">
          <Icon className="h-4 w-4 text-primary-container" />
        </div>
      </div>
      <div className="mt-4 text-3xl font-black tracking-tight text-zinc-50">{value}</div>
      <div className="mt-2 text-sm text-zinc-500">{hint}</div>
    </div>
  )
}
