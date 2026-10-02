import type { Metadata } from 'next'
import { Logo } from '@/components/site/logo'
import { UpdatePasswordForm } from '@/components/login/update-password-form'

export const metadata: Metadata = {
  title: 'Set New Password — Eco Campus Bot',
  description: 'Set a new password for your Eco Campus Bot account.',
}

export default function UpdatePasswordPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="absolute right-0 top-0 -z-10 size-96 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <UpdatePasswordForm />
      </div>
    </main>
  )
}
