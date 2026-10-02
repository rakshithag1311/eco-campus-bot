'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bot, LogOut, MessageSquarePlus, Trash2, X,
  Leaf, LayoutDashboard, ExternalLink, Trophy,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { ActiveView } from './dashboard-layout'
import type { EcoLevel } from '@/lib/eco-points'

type Conversation = {
  id: string
  title: string | null
  created_at: string
  updated_at: string
}

type User = {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
}

type Props = {
  user: User
  conversations: Conversation[]
  activeId: string | null
  activeView: ActiveView
  userLevel?: EcoLevel
  open: boolean
  onClose: () => void
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  onOverview: () => void
  onRewards: () => void
  onDelete: (id: string) => void
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function DashboardSidebar({
  user, conversations, activeId, activeView, userLevel,
  open, onClose, onSelectConversation, onNewChat, onOverview, onRewards, onDelete,
}: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setDeletingId(id)
    const supabase = createClient()
    await supabase.from('messages').delete().eq('conversation_id', id)
    await supabase.from('conversations').delete().eq('id', id)
    onDelete(id)
    setDeletingId(null)
  }

  const initials = user.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email.slice(0, 2).toUpperCase()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card/80 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}>

        {/* Logo */}
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.13_170)] text-primary-foreground shadow-[0_0_20px_-4px_oklch(0.76_0.165_158/0.7)]">
              <Leaf className="size-4" />
            </span>
            <span className="font-display text-sm font-semibold">
              Eco <span className="text-primary">Campus</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-1">
          <button
            type="button"
            onClick={onOverview}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              activeView === 'overview'
                ? 'bg-primary/15 text-foreground'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
            )}
          >
            <LayoutDashboard className="size-4 shrink-0" />
            Overview
          </button>
          <button
            type="button"
            onClick={onRewards}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              activeView === 'rewards'
                ? 'bg-primary/15 text-foreground'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
            )}
          >
            <Trophy className="size-4 shrink-0 text-amber-400" />
            <span className="flex-1 text-left">Eco Points</span>
            {userLevel && (
              <span className="text-xs">{userLevel.emoji}</span>
            )}
          </button>
          <button
            type="button"
            onClick={onNewChat}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              activeView === 'chat' && !activeId
                ? 'bg-primary/15 text-foreground'
                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
            )}
          >
            <Bot className="size-4 shrink-0" />
            Ask Eco Bot
          </button>
        </nav>

        <div className="mx-3 border-t border-border pt-3">
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
            Recent Chats
          </p>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {conversations.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted-foreground">No chats yet. Ask Eco Bot anything!</p>
          ) : (
            <ul className="space-y-0.5">
              {conversations.map((conv) => (
                <li key={conv.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelectConversation(conv.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-xl px-3 py-2 pr-8 text-left transition-colors',
                      activeId === conv.id && activeView === 'chat'
                        ? 'bg-primary/15 text-foreground'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                    )}
                  >
                    <MessageSquarePlus className="size-3.5 shrink-0 opacity-60" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs">
                        {conv.title ?? 'New conversation'}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50">
                        {timeAgo(conv.updated_at)}
                      </span>
                    </span>
                  </button>
                  {/* Delete — sits outside the button to avoid nesting */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); handleDelete(e as any, conv.id) }}
                    onKeyDown={(e) => e.key === 'Enter' && handleDelete(e as any, conv.id)}
                    aria-label="Delete conversation"
                    className="absolute right-1.5 top-1/2 hidden size-5 -translate-y-1/2 cursor-pointer place-items-center rounded text-muted-foreground/40 hover:text-destructive group-hover:grid"
                  >
                    <Trash2 className="size-3" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* User footer */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt={initials} className="size-8 rounded-full object-cover" />
                : initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-medium">{user.displayName ?? 'Student'}</p>
                {userLevel && (
                  <span className="text-xs" title={userLevel.name}>
                    {userLevel.emoji}
                  </span>
                )}
              </div>
              <p className="truncate text-[11px] text-muted-foreground">
                {userLevel ? `${userLevel.name}` : user.email}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              aria-label="Sign out"
              className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
