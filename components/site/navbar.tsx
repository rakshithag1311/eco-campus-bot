'use client'

import { useEffect, useState } from 'react'
import { Menu, X, ArrowRight, Bot, LogOut, Leaf } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from './logo'
import { CtaLink } from './cta-link'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '#impact', label: 'Impact' },
]

type User = {
  email: string
  displayName: string | null
  avatarUrl: string | null
} | null

export function Navbar() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Check auth state on mount
  useEffect(() => {
    const supabase = createClient()

    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', authUser.id)
          .single()
        setUser({
          email: authUser.email ?? '',
          displayName: profile?.display_name ?? null,
          avatarUrl: profile?.avatar_url ?? null,
        })
      }
    }

    getUser()

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null)
      } else {
        getUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setUserMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? ''

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6">
      <nav
        aria-label="Main"
        className={cn(
          'mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 transition-all duration-500 ease-out',
          scrolled || open
            ? 'glass h-14 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)]'
            : 'h-16 border border-transparent bg-transparent',
        )}
      >
        <Logo />

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="relative rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground after:absolute after:inset-x-4 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {user ? (
            /* ── Authenticated state ── */
            <div className="hidden items-center gap-2 sm:flex">
              <CtaLink href="/dashboard" className="h-10 px-5">
                <Bot className="size-4" aria-hidden="true" />
                Open Chat
              </CtaLink>

              {/* User avatar + dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex size-9 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary transition-all hover:ring-2 hover:ring-primary/40"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={initials} className="size-9 rounded-full object-cover" />
                  ) : (
                    initials
                  )}
                </button>

                {userMenuOpen && (
                  <div className="glass absolute right-0 top-12 w-52 overflow-hidden rounded-2xl border border-border shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-medium">{user.displayName ?? 'Student'}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
                      >
                        <Bot className="size-4 text-primary" />
                        Go to Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                      >
                        <LogOut className="size-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── Unauthenticated state ── */
            <CtaLink href="/login" className="hidden h-10 px-5 sm:inline-flex">
              Get Started
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </CtaLink>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-xl text-foreground transition-colors hover:bg-white/5 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          'glass mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl transition-all duration-300 md:hidden',
          open ? 'max-h-96 opacity-100' : 'pointer-events-none max-h-0 border-transparent opacity-0',
        )}
      >
        <ul className="flex flex-col p-2">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="p-2">
            {user ? (
              <div className="space-y-2">
                <CtaLink href="/dashboard" className="w-full" onClick={() => setOpen(false)}>
                  <Bot className="size-4" />
                  Open Chat
                </CtaLink>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <CtaLink href="/login" className="w-full">
                Get Started
              </CtaLink>
            )}
          </li>
        </ul>
      </div>
    </header>
  )
}
