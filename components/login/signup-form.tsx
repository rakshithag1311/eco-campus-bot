'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2, Lock, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Pending = 'email' | 'google' | null

function GoogleLogo() {
  return (
    <svg className="size-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  )
}

const inputClass =
  'peer h-12 w-full rounded-xl border border-input bg-background/50 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 transition-[border-color,box-shadow,background-color] duration-200 outline-none hover:border-primary/30 focus:border-primary/60 focus:bg-background/80 focus:ring-4 focus:ring-primary/15'

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState<Pending>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // ── Google OAuth ──────────────────────────────────────────────────────────
  async function handleGoogle() {
    setPending('google')
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setPending(null)
    }
  }

  // ── Email / Password signup ───────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending('email')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setPending(null)
      return
    }

    // Show confirmation message — user needs to verify email
    setSuccess(true)
    setPending(null)
  }

  if (success) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-sm space-y-4 duration-700 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/15">
          <CheckCircle2 className="size-8 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a confirmation link to your email address. Click it to activate your account and start your sustainability journey.
        </p>
        <p className="text-sm text-muted-foreground">
          Already confirmed?{' '}
          <Link href="/login" className="font-medium text-primary transition-colors hover:text-mint">
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-sm duration-700">
      <div className="text-center lg:text-left">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Create your account <span aria-hidden="true">🌿</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Join the campus sustainability movement.</p>
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={pending !== null}
        className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-white text-sm font-medium text-[#1f1f1f] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(255,255,255,0.35)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-70"
      >
        {pending === 'google' ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <GoogleLogo />}
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Full name</label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Your name"
              className={inputClass}
            />
            <User className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors peer-focus:text-primary" aria-hidden="true" />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@university.edu"
              className={inputClass}
            />
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors peer-focus:text-primary" aria-hidden="true" />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              className={cn(inputClass, 'pr-12')}
            />
            <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors peer-focus:text-primary" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending !== null}
          className="glow-primary flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 disabled:pointer-events-none disabled:opacity-80"
        >
          {pending === 'email' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {pending === 'email' ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      {/* Error message */}
      <div aria-live="polite">
        {error && (
          <p className="animate-in fade-in slide-in-from-top-1 mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-xs leading-relaxed text-red-300 duration-300">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary transition-colors hover:text-mint">
          Sign in
        </Link>
      </p>
    </div>
  )
}
