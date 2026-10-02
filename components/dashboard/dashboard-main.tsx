'use client'

import { Menu, Trophy } from 'lucide-react'
import type { ActiveView } from './dashboard-layout'
import type { RewardsTab } from '@/components/rewards/rewards-panel'
import { OverviewPanel } from './overview-panel'
import { ChatPanel } from './chat-panel'
import { RewardsPanel } from '@/components/rewards/rewards-panel'
import type { EcoLevel, PointTransaction } from '@/lib/eco-points'

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
  activeView: ActiveView
  activeConversationId: string | null
  campusStats: CampusStat[]
  userEcoActions: number
  initialEcoPoints?: {
    totalPoints: number
    level: EcoLevel
    history: PointTransaction[]
  }
  chatPrompt?: string
  rewardsTab?: RewardsTab
  onNewConversation: (conv: Conversation) => void
  onTitleUpdate: (id: string, title: string) => void
  onOpenSidebar: () => void
  onStartChat: (prompt?: string) => void
  onRewards?: (tab?: RewardsTab) => void
}

export function DashboardMain({
  user, activeView, activeConversationId,
  campusStats, userEcoActions, initialEcoPoints, chatPrompt, rewardsTab,
  onNewConversation, onTitleUpdate, onOpenSidebar, onStartChat, onRewards,
}: Props) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="size-5" />
        </button>
        <div>
          <h1 className="font-display text-sm font-semibold">
            {activeView === 'overview'
              ? 'Dashboard'
              : activeView === 'rewards'
              ? 'Eco Points & Rewards'
              : 'Eco Bot'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {activeView === 'overview'
              ? `Welcome back, ${user.displayName?.split(' ')[0] ?? 'Student'} 🌱`
              : activeView === 'rewards'
              ? 'Real-time student impact and rewards'
              : 'AI-powered sustainability assistant'}
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'overview' ? (
          <OverviewPanel
            user={user}
            campusStats={campusStats}
            userEcoActions={userEcoActions}
            initialEcoPoints={initialEcoPoints}
            onStartChat={onStartChat}
            onOpenRewards={onRewards}
          />
        ) : activeView === 'rewards' ? (
          <RewardsPanel
            user={user}
            onStartChat={onStartChat}
            initialTab={rewardsTab}
          />
        ) : (
          <ChatPanel
            user={user}
            conversationId={activeConversationId}
            onNewConversation={onNewConversation}
            onTitleUpdate={onTitleUpdate}
            initialPrompt={chatPrompt}
          />
        )}
      </div>
    </div>
  )
}
