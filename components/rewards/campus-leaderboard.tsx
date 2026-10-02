'use client'

import { Trophy, Medal, Crown, Sparkles, User as UserIcon } from 'lucide-react'
import type { LeaderboardEntry } from '@/lib/eco-points'
import { cn } from '@/lib/utils'

type Props = {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

export function CampusLeaderboard({ entries, currentUserId }: Props) {
  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)
  const currentUserEntry = entries.find((e) => e.userId === currentUserId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-base font-semibold flex items-center gap-2">
            <Trophy className="size-4 text-amber-400" />
            Campus Eco Leaderboard
          </h3>
          <p className="text-xs text-muted-foreground">
            Real student rankings based on verified campus sustainability actions.
          </p>
        </div>

        {currentUserEntry && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-foreground">
            <span className="font-semibold text-primary">Your Rank: #{currentUserEntry.rank}</span>
            <span className="text-muted-foreground">•</span>
            <span className="font-bold">{currentUserEntry.totalPoints} pts</span>
            <span>{currentUserEntry.level.emoji}</span>
          </div>
        )}
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {top3.map((entry, idx) => {
            const isFirst = idx === 0
            const isSecond = idx === 1
            const isThird = idx === 2

            const podiumStyles = isFirst
              ? 'border-amber-400/40 bg-gradient-to-b from-amber-500/10 to-card/60 shadow-[0_0_30px_-10px_oklch(0.79_0.15_85/0.4)]'
              : isSecond
              ? 'border-slate-300/30 bg-gradient-to-b from-slate-400/10 to-card/60'
              : 'border-amber-700/30 bg-gradient-to-b from-amber-700/10 to-card/60'

            const badgeBg = isFirst
              ? 'bg-amber-400 text-amber-950 ring-amber-400/40'
              : isSecond
              ? 'bg-slate-300 text-slate-900 ring-slate-300/40'
              : 'bg-amber-700 text-amber-100 ring-amber-700/40'

            const initials = entry.displayName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)

            return (
              <div
                key={entry.userId}
                className={cn(
                  'relative flex flex-col items-center rounded-2xl border p-4 text-center transition-all',
                  podiumStyles,
                  entry.isCurrentUser && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                )}
              >
                {/* Crown for #1 */}
                {isFirst && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="grid size-7 place-items-center rounded-full bg-amber-400 text-amber-950 shadow-md">
                      <Crown className="size-4 fill-amber-950" />
                    </span>
                  </div>
                )}

                {/* Avatar with rank pill */}
                <div className="relative mt-2">
                  <div className="size-14 rounded-full overflow-hidden border-2 border-border bg-card grid place-items-center text-sm font-bold text-foreground">
                    {entry.avatarUrl ? (
                      <img src={entry.avatarUrl} alt={entry.displayName} className="size-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <span
                    className={cn(
                      'absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full text-[10px] font-bold shadow-md ring-2',
                      badgeBg,
                    )}
                  >
                    {entry.rank}
                  </span>
                </div>

                {/* Info */}
                <div className="mt-3 w-full">
                  <p className="truncate font-display text-sm font-bold text-foreground">
                    {entry.displayName}
                    {entry.isCurrentUser && (
                      <span className="ml-1 text-[10px] text-primary font-normal">(You)</span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {entry.level.name} {entry.level.emoji}
                  </p>
                </div>

                {/* Points */}
                <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-border bg-white/[0.04] px-3 py-1 text-xs font-bold text-foreground">
                  <Sparkles className="size-3 text-primary" />
                  <span className="text-primary">{entry.totalPoints}</span> pts
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rankings Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
        <div className="grid grid-cols-12 gap-2 border-b border-border/80 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
          <span className="col-span-2 text-center sm:col-span-1">Rank</span>
          <span className="col-span-6 sm:col-span-6">Student</span>
          <span className="hidden sm:col-span-3 sm:block">Level</span>
          <span className="col-span-4 text-right sm:col-span-2">Points</span>
        </div>

        {entries.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No campus points recorded yet. Be the first to earn points!
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {entries.map((item) => {
              const initials = item.displayName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              return (
                <li
                  key={item.userId}
                  className={cn(
                    'grid grid-cols-12 items-center gap-2 px-4 py-3 text-xs transition-colors',
                    item.isCurrentUser
                      ? 'bg-primary/10 font-medium'
                      : 'hover:bg-white/[0.02]',
                  )}
                >
                  {/* Rank */}
                  <div className="col-span-2 text-center sm:col-span-1">
                    <span
                      className={cn(
                        'inline-grid size-6 place-items-center rounded-lg font-bold',
                        item.rank === 1
                          ? 'bg-amber-400/20 text-amber-400 font-extrabold'
                          : item.rank === 2
                          ? 'bg-slate-300/20 text-slate-300'
                          : item.rank === 3
                          ? 'bg-amber-700/20 text-amber-500'
                          : 'text-muted-foreground',
                      )}
                    >
                      {item.rank}
                    </span>
                  </div>

                  {/* Student */}
                  <div className="col-span-6 flex items-center gap-2.5 min-w-0 sm:col-span-6">
                    <div className="size-7 shrink-0 rounded-full overflow-hidden bg-primary/15 border border-primary/20 grid place-items-center text-[10px] font-semibold text-primary">
                      {item.avatarUrl ? (
                        <img src={item.avatarUrl} alt={item.displayName} className="size-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0 flex-1 truncate">
                      <span className="truncate font-semibold text-foreground">
                        {item.displayName}
                      </span>
                      {item.isCurrentUser && (
                        <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary">
                          You
                        </span>
                      )}
                      <span className="block sm:hidden text-[10px] text-muted-foreground truncate">
                        {item.level.name} {item.level.emoji}
                      </span>
                    </div>
                  </div>

                  {/* Level badge (desktop) */}
                  <div className="hidden sm:col-span-3 sm:flex items-center gap-1.5">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium',
                        item.level.badgeBg,
                        item.level.badgeBorder,
                        item.level.badgeText,
                      )}
                    >
                      <span>{item.level.emoji}</span>
                      <span>{item.level.name}</span>
                    </span>
                  </div>

                  {/* Points */}
                  <div className="col-span-4 text-right sm:col-span-2">
                    <span className="font-display font-bold text-foreground">
                      {item.totalPoints.toLocaleString()}
                    </span>{' '}
                    <span className="text-[11px] text-muted-foreground">pts</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
