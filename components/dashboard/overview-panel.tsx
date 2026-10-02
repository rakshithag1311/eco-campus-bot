'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowRight, Battery, BatteryCharging, Bot, FileStack,
  Leaf, MapPin, Recycle, Sparkles, TrendingUp, Shirt, AlertTriangle,
  Camera, Trophy,
} from 'lucide-react'
import { EcoPointsCard } from '@/components/rewards/eco-points-card'
import { ReportWasteModal } from '@/components/rewards/report-waste-modal'
import type { EcoLevel, PointTransaction } from '@/lib/eco-points'
import { getEcoLevel } from '@/lib/eco-points'
import type { RewardsTab } from '@/components/rewards/rewards-panel'

const ICON_MAP: Record<string, React.ElementType> = {
  recycled_kg: Recycle,
  ewaste_kg: BatteryCharging,
  paper_kg: FileStack,
  eco_actions: Sparkles,
}

const FALLBACK_STATS = [
  { stat_key: 'recycled_kg',  value: 125,  label: 'Recycled',          suffix: ' kg', trend: '+12%', bar: 78 },
  { stat_key: 'ewaste_kg',    value: 24,   label: 'E-waste collected',  suffix: ' kg', trend: '+8%',  bar: 42 },
  { stat_key: 'paper_kg',     value: 80,   label: 'Paper recycled',     suffix: ' kg', trend: '+15%', bar: 64 },
  { stat_key: 'eco_actions',  value: 1240, label: 'Eco actions',        suffix: '',    trend: '+21%', bar: 90 },
]

const QUICK_ACTIONS = [
  { icon: Recycle,       label: 'Classify waste (+5)',   prompt: 'Help me classify my waste item' },
  { icon: Camera,        label: 'Snap & Sort (+5)',       prompt: '📷 Take a photo of waste to identify it' },
  { icon: AlertTriangle, label: 'Report issue (+10)',     action: 'report' },
  { icon: Trophy,        label: 'Eco challenges (+20)',  action: 'rewards' },
  { icon: MapPin,        label: 'Find nearest bin',       prompt: 'Where is the nearest recycling bin on campus?' },
  { icon: Battery,       label: 'Dispose e-waste',        prompt: 'Where do I dispose of old electronics?' },
]

type CampusStat = {
  stat_key: string
  value: number
  label: string
  suffix: string
  trend: string
  bar: number
}

type User = {
  displayName: string | null
}

type Props = {
  user: User
  campusStats: CampusStat[]
  userEcoActions: number
  initialEcoPoints?: {
    totalPoints: number
    level: EcoLevel
    history: PointTransaction[]
  }
  onStartChat: (prompt?: string) => void
  onOpenRewards?: (tab?: RewardsTab) => void
}

function AnimatedCounter({ to, suffix }: { to: number; suffix: string }) {
  const [value, setValue] = useState(0)
  const ref = useRef(false)

  useEffect(() => {
    if (ref.current) return
    ref.current = true
    const duration = 1400
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [to])

  return <span className="tabular-nums">{value.toLocaleString('en-US')}{suffix}</span>
}

export function OverviewPanel({
  user, campusStats, userEcoActions, initialEcoPoints,
  onStartChat, onOpenRewards,
}: Props) {
  const stats = campusStats.length > 0 ? campusStats : FALLBACK_STATS

  const order = ['recycled_kg', 'ewaste_kg', 'paper_kg', 'eco_actions']
  const sorted = [...stats].sort((a, b) => order.indexOf(a.stat_key) - order.indexOf(b.stat_key))

  const [pointsSummary, setPointsSummary] = useState(
    initialEcoPoints ?? {
      totalPoints: 0,
      level: getEcoLevel(0),
      history: [],
    }
  )
  const [reportModalOpen, setReportModalOpen] = useState(false)

  const refreshPoints = useCallback(async () => {
    try {
      const res = await fetch('/api/eco-points')
      if (res.ok) {
        const data = await res.json()
        setPointsSummary(data)
      }
    } catch (e) {
      console.error('[overview] failed to refresh points:', e)
    }
  }, [])

  useEffect(() => {
    function handleEvent() {
      refreshPoints()
    }
    window.addEventListener('eco-points-awarded', handleEvent)
    return () => window.removeEventListener('eco-points-awarded', handleEvent)
  }, [refreshPoints])

  function handleQuickAction(actionItem: (typeof QUICK_ACTIONS)[0]) {
    if ('action' in actionItem) {
      if (actionItem.action === 'report') {
        setReportModalOpen(true)
        return
      }
      if (actionItem.action === 'rewards') {
        onOpenRewards?.('challenges')
        return
      }
    }
    if ('prompt' in actionItem && actionItem.prompt) {
      onStartChat(actionItem.prompt)
    }
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-6 md:px-6">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-5">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">
                Good to see you, {user.displayName?.split(' ')[0] ?? 'Student'} 🌿
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                You've logged {userEcoActions} eco action{userEcoActions !== 1 ? 's' : ''}. Keep it up!
              </p>
            </div>
            <button
              type="button"
              onClick={() => onStartChat()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 shrink-0"
            >
              <Bot className="size-4" />
              Ask Eco Bot
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Eco Points Card */}
        <EcoPointsCard
          totalPoints={pointsSummary.totalPoints}
          level={pointsSummary.level}
          history={pointsSummary.history}
          onOpenReportModal={() => setReportModalOpen(true)}
          onOpenChallenges={() => onOpenRewards?.('challenges')}
          onOpenLeaderboard={() => onOpenRewards?.('leaderboard')}
          onStartChat={onStartChat}
        />

        {/* Campus stats */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Campus Impact
          </h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {sorted.map(({ stat_key, value, label, suffix, trend, bar }) => {
              const Icon = ICON_MAP[stat_key] ?? Sparkles
              return (
                <div
                  key={stat_key}
                  className="rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-8 place-items-center rounded-xl bg-primary/12 text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-primary">
                      <TrendingUp className="size-3" />
                      {trend}
                    </span>
                  </div>
                  <p className="mt-3 font-display text-xl font-semibold tracking-tight">
                    <AnimatedCounter to={value} suffix={suffix} />
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/60 to-mint"
                      style={{ width: `${bar}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {QUICK_ACTIONS.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleQuickAction(item)}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3.5 text-left text-sm transition-all hover:border-primary/30 hover:bg-primary/5"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="font-medium leading-tight">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Waste guide */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Waste Guide
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { color: 'bg-gray-500/20 text-gray-300 border-gray-500/20',   label: 'General',    icon: '🗑️' },
              { color: 'bg-blue-500/20 text-blue-300 border-blue-500/20',    label: 'Recyclable', icon: '♻️' },
              { color: 'bg-green-500/20 text-green-300 border-green-500/20', label: 'Organic',    icon: '🌿' },
              { color: 'bg-amber-500/20 text-amber-300 border-amber-500/20', label: 'E-waste',    icon: '🔋' },
              { color: 'bg-red-500/20 text-red-300 border-red-500/20',       label: 'Hazardous',  icon: '⚠️' },
              { color: 'bg-purple-500/20 text-purple-300 border-purple-500/20', label: 'Textile', icon: '👕' },
            ].map(({ color, label, icon }) => (
              <div
                key={label}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-xs font-medium ${color}`}
              >
                <span className="text-xl">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>

      </div>

      <ReportWasteModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSuccess={refreshPoints}
      />
    </div>
  )
}
