import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, LogIn, Terminal, UserRoundPlus, Loader2, Check, X } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { AuthTopBar } from '@/components/auth/AuthTopBar'
import { AuthModeTabs } from '@/components/auth/AuthModeTabs'
import { AuthField } from '@/components/auth/AuthField'
import { AuthErrorPanel } from '@/components/auth/AuthErrorPanel'
import { AuthFooterMeta } from '@/components/auth/AuthFooterMeta'

const normalizeError = (message: string) => {
  return message
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/gi, '')
    .toUpperCase()
}

export default function Login() {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const resetFormState = (nextRegister: boolean) => {
    setIsRegister(nextRegister)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const { data } = await api.post(endpoint, { username: username.trim(), password })

      localStorage.setItem('token', data.token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.msg || err.response?.data?.error?.[0]?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-surface-dim text-foreground">
      <AuthTopBar />

      <main className="flex min-h-screen items-center justify-center px-4 pb-8 pt-20">
        <section className="w-full max-w-[400px] overflow-hidden bg-surface-low tm-ghost-border shadow-ambient animate-editorial-rise">
          <AuthModeTabs isRegister={isRegister} onToggle={resetFormState} />

          <form className="space-y-6 p-8" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {isRegister ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRegister ? 'Register to start planning your DSA practice.' : 'Log in to continue to your planner.'}
              </p>
            </div>

            <AuthField
              label="Username"
              placeholder="Username"
              type="text"
              value={username}
              minLength={3}
              onChange={setUsername}
              icon={Terminal}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="tm-label">Password</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => setIsRegister(true)}
                    className="font-mono text-[10px] uppercase text-primary-container/80 transition-colors hover:text-primary-container"
                  >
                    Recovery
                  </button>
                )}
              </div>

              <AuthField
                label=""
                placeholder="••••••••"
                type="password"
                value={password}
                minLength={6}
                onChange={setPassword}
                icon={KeyRound}
              />

              {isRegister && (
                <div className="flex flex-col gap-1.5 pt-2 font-mono text-[10px] uppercase">
                  <div className={`flex items-center gap-2 ${password.length >= 6 ? 'text-emerald-500' : 'text-zinc-500'}`}>
                    {password.length >= 6 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-destructive" />}
                    <span>MINIMUM_6_CHARACTERS</span>
                  </div>
                  <div className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-emerald-500' : 'text-zinc-500'}`}>
                    {/[A-Z]/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-destructive" />}
                    <span>UPPERCASE_CHARACTER</span>
                  </div>
                  <div className={`flex items-center gap-2 ${/\d/.test(password) ? 'text-emerald-500' : 'text-zinc-500'}`}>
                    {/\d/.test(password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3 text-destructive" />}
                    <span>NUMERIC_CHARACTER</span>
                  </div>
                </div>
              )}
            </div>

            {error && <AuthErrorPanel message={`${normalizeError(error)}. PLEASE VERIFY SYSTEM IDENTITY AND RETRY.`} />}

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full gap-2 font-mono text-xs font-bold uppercase tracking-widest"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Log in'}
              {!loading && (isRegister ? <UserRoundPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />)}
            </Button>
          </form>

          <div className="bg-surface-lowest/40">
            <AuthFooterMeta />
          </div>
        </section>
      </main>

      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>
    </div>
  )
}
