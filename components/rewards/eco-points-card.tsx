'use client'

import { useState } from 'react'
import {
  Sparkles, Trophy, ArrowRight, Camera, Recycle, AlertTriangle,
  History, Clock, CheckCircle2, ChevronRight, Award
} from 'lucide-react'
import type { EcoLevel, PointTransaction } from '@/lib/eco-points'
import { cn } from '@/lib/utils'

type Props = {
  totalPoints: number
  level: EcoLevel
  history: PointTransaction[]
  onOpenReportModal?: () => void
  onOpenChallenges?: () => void
  onOpenLeaderboard?: () => void
  onStartChat?: (prompt?: string) => void
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

export function EcoPointsCard({
  totalPoints,
  level,
  history,
  onOpenReportModal,
  onOpenChallenges,
  onOpenLeaderboard,
  onStartChat,
}: Props) {
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-card via-card/90 to-primary/[0.06] p-5 shadow-lg">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-12 -bottom-12 size-36 rounded-full bg-mint/10 blur-2xl"
        aria-hidden="true"
      />

      {/* Top row: Points & Level Badge */}
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-primary/20 text-primary">
              <Sparkles className="size-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Eco Points & Rewards
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-display text-4xl font-extrabold tracking-tight text-foreground tabular-nums">
              {totalPoints.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-primary">PTS</span>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Earn points for recycling, sorting, reporting, and daily challenges.
          </p>
        </div>

        {/* Current Level Pill */}
        <div className="flex flex-col items-start sm:items-end gap-1.5">
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-sm font-bold shadow-sm',
              level.badgeBg,
              level.badgeBorder,
              level.badgeText,
            )}
          >
            <span className="text-xl leading-none">{level.emoji}</span>
            <span>{level.name}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {level.max !== null ? `Level Range: ${level.min}–${level.max} pts` : 'Max Level Reached!'}
          </span>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div className="relative mt-5 rounded-xl border border-border/80 bg-white/[0.02] p-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">
            Progress to {level.nextLevel ? `${level.nextLevel} ${level.emoji}` : 'Legend'}
          </span>
          <span className="font-bold text-foreground tabular-nums">
            {level.progress}%
          </span>
        </div>

        {/* Progress track */}
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-mint to-[oklch(0.85_0.15_150)] transition-all duration-700 ease-out shadow-[0_0_12px_rgba(34,197,94,0.6)]"
            style={{ width: `${level.progress}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{level.min} pts</span>
          {level.nextLevel ? (
            <span className="font-semibold text-primary">
              {level.pointsToNext} more pts needed to level up
            </span>
          ) : (
            <span className="font-semibold text-amber-400">
              🌍 Top Rank Active
            </span>
          )}
          <span>{level.max !== null ? `${level.max + 1} pts` : '500+ pts'}</span>
        </div>
      </div>

      {/* Ways to Earn Points Shortcuts */}
      <div className="relative mt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Earn Points Now
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => onStartChat?.('Help me classify my waste item')}
            className="flex flex-col items-start gap-1 rounded-xl border border-border bg-card/60 p-2.5 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
          >
            <div className="flex w-full items-center justify-between">
              <Recycle className="size-4 text-primary" />
              <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                +5
              </span>
            </div>
            <span className="mt-1 text-xs font-semibold leading-tight">Classify Waste</span>
            <span className="text-[10px] text-muted-foreground">Ask Eco Bot</span>
          </button>

          <button
            type="button"
            onClick={() => onStartChat?.('📷 Take a photo of waste to identify it')}
            className="flex flex-col items-start gap-1 rounded-xl border border-border bg-card/60 p-2.5 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
          >
            <div className="flex w-full items-center justify-between">
              <Camera className="size-4 text-emerald-400" />
              <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                +5
              </span>
            </div>
            <span className="mt-1 text-xs font-semibold leading-tight">Snap & Sort</span>
            <span className="text-[10px] text-muted-foreground">Upload photo</span>
          </button>

          <button
            type="button"
            onClick={onOpenReportModal}
            className="flex flex-col items-start gap-1 rounded-xl border border-border bg-card/60 p-2.5 text-left transition-all hover:border-amber-400/40 hover:bg-amber-400/5"
          >
            <div className="flex w-full items-center justify-between">
              <AlertTriangle className="size-4 text-amber-400" />
              <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                +10
              </span>
            </div>
            <span className="mt-1 text-xs font-semibold leading-tight">Report Issue</span>
            <span className="text-[10px] text-muted-foreground">Campus bin alert</span>
          </button>

          <button
            type="button"
            onClick={onOpenChallenges}
            className="flex flex-col items-start gap-1 rounded-xl border border-border bg-card/60 p-2.5 text-left transition-all hover:border-cyan-400/40 hover:bg-cyan-400/5"
          >
            <div className="flex w-full items-center justify-between">
              <Trophy className="size-4 text-cyan-400" />
              <span className="rounded-md bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400">
                +20
              </span>
            </div>
            <span className="mt-1 text-xs font-semibold leading-tight">Eco Challenge</span>
            <span className="text-[10px] text-muted-foreground">Daily tasks</span>
          </button>
        </div>
      </div>

      {/* Recent Point History Toggle */}
      <div className="relative mt-4 border-t border-border/60 pt-3">
        <button
          type="button"
          onClick={() => setShowHistory((prev) => !prev)}
          className="flex w-full items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-1.5">
            <History className="size-3.5 text-primary" />
            Recent Point History ({history.length})
          </span>
          <ChevronRight
            className={cn('size-3.5 transition-transform duration-200', showHistory && 'rotate-90')}
          />
        </button>

        {showHistory && (
          <div className="mt-2.5 max-h-48 overflow-y-auto space-y-1.5 pr-1 animate-page-in">
            {history.length === 0 ? (
              <p className="py-2 text-center text-xs text-muted-foreground">
                No point transactions logged yet. Ask Eco Bot or classify waste to get started!
              </p>
            ) : (
              history.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-white/[0.02] px-3 py-2 text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate font-medium text-foreground">{tx.description}</p>
                    <p className="text-[10px] text-muted-foreground">{timeAgo(tx.createdAt)}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-primary/15 px-2 py-0.5 font-bold text-primary">
                    +{tx.points} pts
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Leaderboard CTA */}
      {onOpenLeaderboard && (
        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <span>View Campus Leaderboard & Challenges</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
