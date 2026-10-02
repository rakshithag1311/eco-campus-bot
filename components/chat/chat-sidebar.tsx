'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bot, LogOut, MessageSquarePlus, Trash2, X, Leaf, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

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
  open: boolean
  onClose: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function ChatSidebar({ user, conversations, activeId, open, onClose, onSelect, onDelete }: Props) {
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

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-card/80 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.13_170)] text-primary-foreground shadow-[0_0_20px_-4px_oklch(0.76_0.165_158/0.7)]">
              <Leaf className="size-4" />
            </span>
            <span className="font-display text-sm font-semibold">Eco Campus <span className="text-primary">Bot</span></span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* New chat button */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => { onSelect(''); onClose() }}
            className="flex w-full items-center gap-2.5 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-3.5 py-2.5 text-sm font-medium text-primary transition-all hover:border-primary/50 hover:bg-primary/10"
          >
            <MessageSquarePlus className="size-4" />
            New conversation
          </button>
        </div>

        {/* Conversation list */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3" aria-label="Conversations">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Bot className="size-8 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">No conversations yet.</p>
              <p className="text-xs text-muted-foreground">Ask Eco Bot anything!</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {conversations.map((conv) => (
                <li key={conv.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelect(conv.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 pr-9 text-left transition-colors',
                      activeId === conv.id
                        ? 'bg-primary/15 text-foreground'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                    )}
                  >
                    <MessageSquarePlus className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">
                        {conv.title ?? 'New conversation'}
                      </span>
                      <span className="text-[11px] text-muted-foreground/60">
                        {timeAgo(conv.updated_at)}
                      </span>
                    </span>
                  </button>
                  {/* Delete sits outside button to avoid invalid nesting */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); handleDelete(e as any, conv.id) }}
                    onKeyDown={(e) => e.key === 'Enter' && handleDelete(e as any, conv.id)}
                    aria-label="Delete conversation"
                    className="absolute right-1.5 top-1/2 hidden size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-muted-foreground/50 hover:bg-destructive/20 hover:text-destructive group-hover:grid"
                  >
                    <Trash2 className="size-3.5" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </nav>

        {/* User footer */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={initials} className="size-8 rounded-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.displayName ?? 'Student'}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
