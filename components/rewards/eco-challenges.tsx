'use client'

import { useState } from 'react'
import {
  Sparkles, CheckCircle2, CupSoda, Utensils, BatteryCharging, Zap,
  Loader2, Trophy,
} from 'lucide-react'
import { CAMPUS_CHALLENGES, type CampusChallenge } from '@/lib/eco-points'
import { triggerPointCelebration } from './point-celebration-toast'

const ICON_MAP: Record<string, React.ElementType> = {
  CupSoda,
  Utensils,
  BatteryCharging,
  Zap,
}

type Props = {
  completedIds?: string[]
  onCompleted?: () => void
}

export function EcoChallengesSection({ completedIds = [], onCompleted }: Props) {
  const [completed, setCompleted] = useState<string[]>(completedIds)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleComplete(challenge: typeof CAMPUS_CHALLENGES[0]) {
    if (completed.includes(challenge.id)) return

    setSubmittingId(challenge.id)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/eco-points/complete-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: challenge.id }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete challenge')
      }

      setCompleted((prev) => [...prev, challenge.id])
      triggerPointCelebration({
        points: 20,
        actionTitle: challenge.title,
        newTotal: data.newTotal,
        isLevelUp: data.isLevelUp,
        newLevelName: data.currentLevel?.name,
        newLevelEmoji: data.currentLevel?.emoji,
      })

      if (onCompleted) onCompleted()
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not complete challenge')
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Daily Campus Eco Challenges
          </h3>
          <p className="text-xs text-muted-foreground">
            Complete daily actions on campus to earn <strong className="text-primary">+20 Eco Points</strong> each!
          </p>
        </div>
        <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
          +20 pts each
        </span>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {CAMPUS_CHALLENGES.map((ch) => {
          const Icon = ICON_MAP[ch.icon] ?? Sparkles
          const isDone = completed.includes(ch.id)
          const isLoading = submittingId === ch.id

          return (
            <div
              key={ch.id}
              className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
                isDone
                  ? 'border-primary/40 bg-primary/[0.04]'
                  : 'border-border bg-card/60 hover:border-primary/30 hover:bg-card'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl transition-colors ${
                    isDone
                      ? 'bg-primary/20 text-primary'
                      : 'bg-white/5 text-muted-foreground'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="size-5" /> : <Icon className="size-5" />}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-sm font-semibold text-foreground">
                      {ch.title}
                    </h4>
                    <span className="shrink-0 text-xs font-bold text-primary">
                      +{ch.points} pts
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {ch.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                      Resets daily
                    </span>
                    <button
                      type="button"
                      disabled={isDone || isLoading}
                      onClick={() => handleComplete(ch)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                        isDone
                          ? 'border border-primary/30 bg-primary/10 text-primary cursor-default'
                          : 'bg-primary text-primary-foreground hover:brightness-110'
                      }`}
                    >
                      {isLoading && <Loader2 className="size-3 animate-spin" />}
                      {isDone ? 'Completed Today ✓' : 'I Did This Today'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
