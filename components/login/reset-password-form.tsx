'use client'

import { useState } from 'react'
import { Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'peer h-12 w-full rounded-xl border border-input bg-background/50 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 transition-[border-color,box-shadow,background-color] duration-200 outline-none hover:border-primary/30 focus:border-primary/60 focus:bg-background/80 focus:ring-4 focus:ring-primary/15'

export function ResetPasswordForm() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/update-password`,
    })

    if (error) {
      setError(error.message)
      setPending(false)
      return
    }

    setSuccess(true)
    setPending(false)
  }

  if (success) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4 text-center duration-700">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/15">
          <CheckCircle2 className="size-8 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a password reset link to your email. It expires in 1 hour.
        </p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Forgot your password?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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

        <button
          type="submit"
          disabled={pending}
          className="glow-primary flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 disabled:pointer-events-none disabled:opacity-80"
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {pending ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>

      <div aria-live="polite">
        {error && (
          <p className="animate-in fade-in slide-in-from-top-1 mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-xs leading-relaxed text-red-300 duration-300">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
