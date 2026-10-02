import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/site/logo'
import { ResetPasswordForm } from '@/components/login/reset-password-form'

export const metadata: Metadata = {
  title: 'Reset Password — Eco Campus Bot',
  description: 'Reset your Eco Campus Bot password.',
}

export default function ResetPasswordPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="absolute right-0 top-0 -z-10 size-96 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="absolute left-0 bottom-0 -z-10 size-72 rounded-full bg-primary/8 blur-3xl" aria-hidden="true" />

      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            Back to sign in
          </Link>
          <Logo />
        </div>
        <ResetPasswordForm />
      </div>
    </main>
  )
}
