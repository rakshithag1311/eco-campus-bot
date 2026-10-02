'use client'

import { useState } from 'react'
import { DashboardSidebar } from './dashboard-sidebar'
import { DashboardMain } from './dashboard-main'

import type { EcoLevel, PointTransaction } from '@/lib/eco-points'
import { PointCelebrationToast } from '@/components/rewards/point-celebration-toast'
import type { RewardsTab } from '@/components/rewards/rewards-panel'

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

type CampusStat = {
  stat_key: string
  value: number
  label: string
  suffix: string
  trend: string
  bar: number
}

type Props = {
  user: User
  initialConversations: Conversation[]
  campusStats: CampusStat[]
  userEcoActions: number
  initialEcoPoints?: {
    totalPoints: number
    level: EcoLevel
    history: PointTransaction[]
  }
}

export type ActiveView = 'chat' | 'overview' | 'rewards'

export function DashboardLayout({ user, initialConversations, campusStats, userEcoActions, initialEcoPoints }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<ActiveView>('overview')
  const [rewardsTab, setRewardsTab] = useState<RewardsTab>('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatPrompt, setChatPrompt] = useState<string | undefined>(undefined)

  function openRewards(tab: RewardsTab = 'all') {
    setRewardsTab(tab)
    setActiveView('rewards')
    setSidebarOpen(false)
  }

  function handleNewConversation(conv: Conversation) {
    setConversations((prev) => [conv, ...prev])
    setActiveConversationId(conv.id)
    setActiveView('chat')
  }

  function handleTitleUpdate(id: string, title: string) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c)),
    )
  }

  function handleDeleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (activeConversationId === id) {
      setActiveConversationId(null)
      setActiveView('overview')
    }
  }

  function handleSelectConversation(id: string) {
    setActiveConversationId(id)
    setChatPrompt(undefined)
    setActiveView('chat')
    setSidebarOpen(false)
  }

  function handleNewChat(prompt?: string) {
    setActiveConversationId(null)
    setChatPrompt(prompt)
    setActiveView('chat')
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <DashboardSidebar
        user={user}
        conversations={conversations}
        activeId={activeConversationId}
        activeView={activeView}
        userLevel={initialEcoPoints?.level}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectConversation={handleSelectConversation}
        onNewChat={() => handleNewChat()}
        onOverview={() => { setActiveView('overview'); setSidebarOpen(false) }}
        onRewards={() => openRewards('all')}
        onDelete={handleDeleteConversation}
      />
      <DashboardMain
        user={user}
        activeView={activeView}
        activeConversationId={activeConversationId}
        campusStats={campusStats}
        userEcoActions={userEcoActions}
        initialEcoPoints={initialEcoPoints}
        chatPrompt={chatPrompt}
        onNewConversation={handleNewConversation}
        onTitleUpdate={handleTitleUpdate}
        onOpenSidebar={() => setSidebarOpen(true)}
        onStartChat={(prompt) => handleNewChat(prompt)}
        onRewards={openRewards}
        rewardsTab={rewardsTab}
      />
      <PointCelebrationToast />
    </div>
  )
}
