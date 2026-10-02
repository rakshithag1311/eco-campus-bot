'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Trophy, Award, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PointEventDetail = {
  points: number
  actionTitle: string
  newTotal?: number
  isLevelUp?: boolean
  newLevelName?: string
  newLevelEmoji?: string
}

export function triggerPointCelebration(detail: PointEventDetail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('eco-points-awarded', { detail }))
  }
}

export function PointCelebrationToast() {
  const [toast, setToast] = useState<PointEventDetail | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleEvent(e: Event) {
      const customEvent = e as CustomEvent<PointEventDetail>
      if (customEvent.detail) {
        setToast(customEvent.detail)
        setVisible(true)
      }
    }

    window.addEventListener('eco-points-awarded', handleEvent)
    return () => window.removeEventListener('eco-points-awarded', handleEvent)
  }, [])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      setVisible(false)
    }, 4500)
    return () => clearTimeout(timer)
  }, [visible, toast])

  if (!toast || !visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-page-in pointer-events-auto max-w-sm">
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300',
          toast.isLevelUp
            ? 'border-amber-500/40 bg-gradient-to-br from-card/95 via-amber-950/30 to-card/95 shadow-[0_0_35px_-5px_oklch(0.76_0.165_158/0.4)]'
            : 'border-primary/40 bg-card/90 shadow-[0_0_30px_-5px_oklch(0.76_0.165_158/0.35)]',
        )}
      >
        {/* Glow ambient */}
        <div
          className={cn(
            'absolute -right-6 -top-6 size-24 rounded-full blur-2xl',
            toast.isLevelUp ? 'bg-amber-400/20' : 'bg-primary/20',
          )}
          aria-hidden="true"
        />

        <div className="relative flex items-start gap-3.5">
          {/* Icon Badge */}
          <div
            className={cn(
              'grid size-10 shrink-0 place-items-center rounded-xl font-bold shadow-inner',
              toast.isLevelUp
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 shadow-amber-300/40'
                : 'bg-primary/20 text-primary border border-primary/30',
            )}
          >
            {toast.isLevelUp ? (
              <Trophy className="size-5 animate-bounce" />
            ) : (
              <Sparkles className="size-5 animate-pulse" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  'text-xs font-semibold uppercase tracking-wider',
                  toast.isLevelUp ? 'text-amber-400' : 'text-primary',
                )}
              >
                {toast.isLevelUp ? '🎉 Level Up!' : 'Eco Points Earned!'}
              </span>
              <button
                type="button"
                onClick={() => setVisible(false)}
                className="text-muted-foreground/60 hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <p className="mt-1 font-display text-base font-bold text-foreground">
              +{toast.points} Points{' '}
              <span className="text-sm font-normal text-muted-foreground">
                ({toast.actionTitle})
              </span>
            </p>

            {toast.isLevelUp && toast.newLevelName && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                <Award className="size-3.5" />
                <span>
                  Promoted to {toast.newLevelName} {toast.newLevelEmoji}
                </span>
              </div>
            )}

            {toast.newTotal !== undefined && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Current total: <strong className="text-foreground">{toast.newTotal} pts</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
