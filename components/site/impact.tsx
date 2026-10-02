'use client'

import { useEffect, useState } from 'react'
import { BatteryCharging, FileStack, Recycle, Sparkles, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SectionHeading } from './section-heading'
import { Reveal, useInView } from './reveal'

// Icon map — maps the stat_key to a lucide icon
const ICON_MAP: Record<string, React.ElementType> = {
  recycled_kg: Recycle,
  ewaste_kg: BatteryCharging,
  paper_kg: FileStack,
  eco_actions: Sparkles,
}

// Fallback static data used while loading or if Supabase isn't configured
const FALLBACK_STATS = [
  { icon: Recycle,         value: 125,  suffix: ' kg', label: 'Recycled',          trend: '+12%', bar: 78,  stat_key: 'recycled_kg' },
  { icon: BatteryCharging, value: 24,   suffix: ' kg', label: 'E-waste collected', trend: '+8%',  bar: 42,  stat_key: 'ewaste_kg'  },
  { icon: FileStack,       value: 80,   suffix: ' kg', label: 'Paper recycled',    trend: '+15%', bar: 64,  stat_key: 'paper_kg'   },
  { icon: Sparkles,        value: 1240, suffix: '',    label: 'Eco actions',       trend: '+21%', bar: 90,  stat_key: 'eco_actions' },
]

const WEEK = [38, 52, 44, 66, 58, 80, 72]
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

type Stat = {
  icon: React.ElementType
  value: number
  suffix: string
  label: string
  trend: string
  bar: number
  stat_key: string
}

function Counter({ to, suffix, start }: { to: number; suffix: string; start: boolean }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return
    let frame = 0
    const duration = 1600
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [start, to])

  return (
    <span className="tabular-nums">
      {value.toLocaleString('en-US')}
      {suffix}
    </span>
  )
}

export function Impact() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3)
  const [stats, setStats] = useState<Stat[]>(FALLBACK_STATS)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('campus_stats')
          .select('stat_key, value, label, suffix, trend, bar')

        if (error || !data || data.length === 0) return

        const mapped: Stat[] = data.map((row) => ({
          icon: ICON_MAP[row.stat_key] ?? Sparkles,
          value: row.value,
          suffix: row.suffix,
          label: row.label,
          trend: row.trend,
          bar: row.bar,
          stat_key: row.stat_key,
        }))

        // Maintain the preferred display order
        const order = ['recycled_kg', 'ewaste_kg', 'paper_kg', 'eco_actions']
        mapped.sort((a, b) => order.indexOf(a.stat_key) - order.indexOf(b.stat_key))

        setStats(mapped)
        setIsLive(true)
      } catch {
        // If Supabase isn't configured yet, silently fall back to static data
      }
    }

    fetchStats()
  }, [])

  return (
    <section id="impact" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Impact"
          title={
            <>
              Track the change your <span className="text-gradient">campus</span> makes
            </>
          }
          description="A live snapshot of how small student actions add up."
        />

        <Reveal className="mt-14">
          <div ref={ref} className="glass relative overflow-hidden rounded-[2rem] p-5 sm:p-8">
            <div className="absolute -right-24 -top-24 size-72 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />

            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="size-2.5 rounded-full bg-white/15" />
                  <span className="size-2.5 rounded-full bg-white/15" />
                  <span className="size-2.5 rounded-full bg-primary/70" />
                </span>
                <p className="font-display text-sm font-medium">Campus Sustainability Dashboard</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-medium ${
                isLive
                  ? 'border-primary/25 bg-primary/10 text-mint'
                  : 'border-amber-300/25 bg-amber-300/10 text-amber-200'
              }`}>
                {isLive ? '🟢 Live data' : 'Demo · Sample statistics'}
              </span>
            </div>

            <div className="relative mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {stats.map(({ icon: Icon, value, suffix, label, trend, bar }, i) => (
                <div
                  key={label}
                  className="group rounded-2xl border border-border bg-background/40 p-4 transition-colors duration-300 hover:border-primary/35 sm:p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-9 place-items-center rounded-xl bg-primary/12 text-primary transition-transform duration-300 group-hover:scale-110">
                      <Icon className="size-[18px]" aria-hidden="true" />
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-primary">
                      <TrendingUp className="size-3.5" aria-hidden="true" />
                      {trend}
                    </span>
                  </div>
                  <p className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    <Counter to={value} suffix={suffix} start={inView} />
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/60 to-mint transition-[width] duration-[1600ms] ease-out"
                      style={{ width: inView ? `${bar}%` : '0%', transitionDelay: `${i * 120}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="relative mt-4 rounded-2xl border border-border bg-background/40 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Eco actions this week</p>
                <p className="text-xs text-muted-foreground">{isLive ? 'Live' : 'Sample data'}</p>
              </div>
              <div className="mt-5 flex h-28 items-end gap-2 sm:gap-4" role="img" aria-label="Bar chart of weekly eco actions">
                {WEEK.map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-full w-full items-end">
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-primary/30 to-primary transition-[height] duration-1000 ease-out"
                        style={{ height: inView ? `${h}%` : '4%', transitionDelay: `${300 + i * 80}ms` }}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground" aria-hidden="true">{DAYS[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
