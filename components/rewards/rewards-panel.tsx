'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Trophy, Sparkles, AlertTriangle, ShieldCheck, Flame, RefreshCw } from 'lucide-react'
import type { EcoLevel, PointTransaction, LeaderboardEntry } from '@/lib/eco-points'
import { getEcoLevel } from '@/lib/eco-points'
import { EcoPointsCard } from './eco-points-card'
import { CampusLeaderboard } from './campus-leaderboard'
import { EcoChallengesSection } from './eco-challenges'
import { ReportWasteModal } from './report-waste-modal'

export type RewardsTab = 'all' | 'leaderboard' | 'challenges'

type User = {
  id: string
  displayName: string | null
  avatarUrl: string | null
  email: string
}

type Props = {
  user: User
  onStartChat: (prompt?: string) => void
  initialTab?: RewardsTab
}

export function RewardsPanel({ user, onStartChat, initialTab = 'all' }: Props) {
  const [totalPoints, setTotalPoints] = useState<number>(0)
  const [level, setLevel] = useState<EcoLevel>(getEcoLevel(0))
  const [history, setHistory] = useState<PointTransaction[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<RewardsTab>(initialTab)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [activeTab])

  const fetchPointsAndLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/eco-points/leaderboard')
      if (res.ok) {
        const data = await res.json()
        if (data.userSummary) {
          setTotalPoints(data.userSummary.totalPoints)
          setLevel(data.userSummary.level)
          setHistory(data.userSummary.history ?? [])
        } else if (data.currentUser) {
          setTotalPoints(data.currentUser.totalPoints)
          setLevel(data.currentUser.level)
        }
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard)
        }
      }
    } catch (err) {
      console.error('[rewards] failed to fetch leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPointsAndLeaderboard()

    function handlePointsUpdate() {
      fetchPointsAndLeaderboard()
    }

    window.addEventListener('eco-points-awarded', handlePointsUpdate)
    return () => window.removeEventListener('eco-points-awarded', handlePointsUpdate)
  }, [fetchPointsAndLeaderboard])

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto px-4 py-6 md:px-6">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* View Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Trophy className="size-5 text-amber-400" />
              Eco Points & Campus Rewards
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track your level, earn points for real campus recycling actions, and climb the campus rank.
            </p>
          </div>

          {/* Quick tab filters */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('challenges')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'challenges'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Challenges
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('leaderboard')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>

        {activeTab === 'all' && (
          <>
            <EcoPointsCard
              totalPoints={totalPoints}
              level={level}
              history={history}
              onOpenReportModal={() => setReportModalOpen(true)}
              onOpenChallenges={() => setActiveTab('challenges')}
              onOpenLeaderboard={() => setActiveTab('leaderboard')}
              onStartChat={onStartChat}
            />

            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="size-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Campus Sustainability Levels
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {[
                  { name: 'Eco Starter', emoji: '🌱', range: '0–49 pts', active: level.name === 'Eco Starter' },
                  { name: 'Green Explorer', emoji: '🌿', range: '50–149 pts', active: level.name === 'Green Explorer' },
                  { name: 'Eco Champion', emoji: '♻️', range: '150–299 pts', active: level.name === 'Eco Champion' },
                  { name: 'Green Guardian', emoji: '🌎', range: '300–499 pts', active: level.name === 'Green Guardian' },
                  { name: 'Planet Hero', emoji: '🌍', range: '500+ pts', active: level.name === 'Planet Hero' },
                ].map((lvl) => (
                  <div
                    key={lvl.name}
                    className={`rounded-xl border p-2.5 text-center transition-all ${
                      lvl.active
                        ? 'border-primary/60 bg-primary/10 shadow-[0_0_15px_-3px_oklch(0.76_0.165_158/0.4)]'
                        : 'border-border/60 bg-white/[0.02] opacity-70'
                    }`}
                  >
                    <span className="text-2xl">{lvl.emoji}</span>
                    <p className={`mt-1 font-display text-xs font-bold ${lvl.active ? 'text-primary' : 'text-foreground'}`}>
                      {lvl.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{lvl.range}</p>
                    {lvl.active && (
                      <span className="mt-1 inline-block rounded-md bg-primary/20 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {(activeTab === 'all' || activeTab === 'challenges') && (
          <EcoChallengesSection onCompleted={fetchPointsAndLeaderboard} />
        )}

        {(activeTab === 'all' || activeTab === 'leaderboard') && (
          <CampusLeaderboard entries={leaderboard} currentUserId={user.id} />
        )}

      </div>

      <ReportWasteModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSuccess={fetchPointsAndLeaderboard}
      />
    </div>
  )
}
