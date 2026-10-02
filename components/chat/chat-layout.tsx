'use client'

import { useState } from 'react'
import { ChatSidebar } from './chat-sidebar'
import { ChatWindow } from './chat-window'
import { PointCelebrationToast } from '@/components/rewards/point-celebration-toast'

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
  initialConversations: Conversation[]
}

export function ChatLayout({ user, initialConversations }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleNewConversation(conv: Conversation) {
    setConversations((prev) => [conv, ...prev])
    setActiveConversationId(conv.id)
  }

  function handleTitleUpdate(id: string, title: string) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c)),
    )
  }

  function handleDeleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (activeConversationId === id) setActiveConversationId(null)
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <ChatSidebar
        user={user}
        conversations={conversations}
        activeId={activeConversationId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(id) => { setActiveConversationId(id); setSidebarOpen(false) }}
        onDelete={handleDeleteConversation}
      />
      <ChatWindow
        user={user}
        conversationId={activeConversationId}
        onNewConversation={handleNewConversation}
        onTitleUpdate={handleTitleUpdate}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
      <PointCelebrationToast />
    </div>
  )
}
