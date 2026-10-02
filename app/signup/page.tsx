import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Leaf, Recycle, Sparkles } from 'lucide-react'
import { Logo } from '@/components/site/logo'
import { AmbientBackground } from '@/components/site/ambient'
import { SignupForm } from '@/components/login/signup-form'

export const metadata: Metadata = {
  title: 'Create Account — Eco Campus Bot',
  description: 'Join Eco Campus Bot and start your sustainability journey.',
}

export default function SignupPage() {
  return (
    <main className="relative grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative isolate hidden overflow-hidden border-r border-border bg-[radial-gradient(ellipse_at_top_left,oklch(0.36_0.09_160),oklch(0.17_0.02_165)_70%)] p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="grid-bg absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
        <AmbientBackground />
        <Logo />

        <div className="relative max-w-md">
          <h2 className="text-balance font-display text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Join thousands making their campus <span className="text-gradient">a little greener.</span>
          </h2>
          <ul className="mt-10 space-y-3">
            {[
              { icon: Recycle, text: 'Instantly classify any waste item' },
              { icon: Leaf, text: 'Find the nearest correct disposal point' },
              { icon: Sparkles, text: 'Track your personal eco actions' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="glass flex items-center gap-3 rounded-2xl px-4 py-3 text-sm">
                <span className="grid size-8 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-muted-foreground">{'© 2026 Eco Campus Bot'}</p>
      </aside>

      <section className="relative flex flex-col px-6 py-8 sm:px-10">
        <div
          className="absolute right-0 top-0 -z-10 size-96 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            Back to home
          </Link>
          <Logo className="lg:hidden" />
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <SignupForm />
        </div>
      </section>
    </main>
  )
}
