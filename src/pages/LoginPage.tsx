import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { CodeInput } from '@/components/CodeInput'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useObrol } from '@/store/obrol'
import { obrolStore } from '@/store/obrol'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const navigate = useNavigate()
  const loggedIn = useObrol((s) => s.auth.loggedIn)
  const onboarded = useObrol((s) => s.auth.onboarded)
  const savedEmail = useObrol((s) => s.me.email)
  const [email, setEmail] = useState(savedEmail)
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (loggedIn) navigate(onboarded ? '/' : '/onboarding', { replace: true })
  }, [loggedIn, onboarded, navigate])

  function sendCode(e: React.FormEvent) {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) {
      setError('Masukkan alamat email yang valid')
      return
    }
    setError('')
    setStep('code')
  }

  function verify(e?: React.FormEvent) {
    e?.preventDefault()
    if (!/^\d{6}$/.test(code)) {
      setError('Masukkan 6 digit kode')
      return
    }
    obrolStore.getState().login(email)
  }

  return (
    <main className="flex min-h-dvh items-center justify-center overflow-y-auto bg-rail px-4 py-8">
      <div className="w-full max-w-sm rounded-lg border border-border bg-sidebar p-6 shadow-xl sm:p-8">
        <Logo className="mb-6" />
        {step === 'email' ? (
          <form onSubmit={sendCode} className="flex flex-col gap-4" noValidate>
            <div>
              <h1 className="text-lg font-semibold">Masuk ke Obrol</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Masukkan email kamu untuk menerima kode masuk.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nama@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? 'login-error' : undefined}
                autoFocus
              />
            </div>
            {error && (
              <p id="login-error" role="alert" className="text-sm text-danger-text">
                {error}
              </p>
            )}
            <Button type="submit" size="lg">
              Kirim kode
            </Button>
          </form>
        ) : (
          <form onSubmit={verify} className="flex flex-col gap-4" noValidate>
            <div>
              <h1 className="text-lg font-semibold">Masukkan kode</h1>
              <p className="mt-1 text-sm text-muted-foreground [overflow-wrap:anywhere]">
                Kami mengirim kode 6 digit ke <span className="text-foreground">{email.trim()}</span>.
              </p>
            </div>
            <CodeInput
              value={code}
              onChange={(v) => {
                setCode(v)
                setError('')
              }}
              autoFocus
            />
            {error && (
              <p role="alert" className="text-center text-sm text-danger-text">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" disabled={code.length !== 6}>
              Masuk
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStep('email')
                setCode('')
                setError('')
              }}
            >
              <ArrowLeft /> Ganti email
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Mode demo: masukkan 6 digit apa saja
        </p>
      </div>
    </main>
  )
}
