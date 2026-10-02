'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Bot, MapPin, RotateCcw, SendHorizontal } from 'lucide-react'
import { CtaLink } from './cta-link'
import { Reveal, useInView } from './reveal'
import { SectionHeading } from './section-heading'
import { cn } from '@/lib/utils'

const USER_MSG = 'Where should I dispose of an old charger?'
const BOT_MSG = "That's e-waste 🔋. Please take it to the e-waste collection point on campus."

type Phase = 'idle' | 'typing' | 'sent' | 'thinking' | 'replying' | 'done'

function Orb({ size = 'md', active = false }: { size?: 'sm' | 'md'; active?: boolean }) {
  return (
    <span
      className={cn(
        'relative grid shrink-0 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,oklch(0.93_0.07_160),oklch(0.72_0.16_158)_50%,oklch(0.32_0.07_160))] text-primary-foreground',
        size === 'sm' ? 'size-8' : 'size-11',
        active && 'shadow-[0_0_24px_2px_oklch(0.76_0.165_158/0.6)]',
      )}
      aria-hidden="true"
    >
      {active && <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />}
      <Bot className={size === 'sm' ? 'size-4' : 'size-5'} />
    </span>
  )
}

export function ChatPreview() {
  const { ref, inView } = useInView<HTMLDivElement>(0.4)
  const [phase, setPhase] = useState<Phase>('idle')
  const [userChars, setUserChars] = useState(0)
  const [botChars, setBotChars] = useState(0)

  useEffect(() => {
    if (inView && phase === 'idle') setPhase('typing')
  }, [inView, phase])

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    if (phase === 'typing') {
      t = userChars < USER_MSG.length ? setTimeout(() => setUserChars((c) => c + 1), 38) : setTimeout(() => setPhase('sent'), 350)
    } else if (phase === 'sent') {
      t = setTimeout(() => setPhase('thinking'), 500)
    } else if (phase === 'thinking') {
      t = setTimeout(() => setPhase('replying'), 1500)
    } else if (phase === 'replying') {
      t = botChars < BOT_MSG.length ? setTimeout(() => setBotChars((c) => c + 1), 22) : setTimeout(() => setPhase('done'), 200)
    }
    return () => clearTimeout(t)
  }, [phase, userChars, botChars])

  function replay() {
    setUserChars(0)
    setBotChars(0)
    setPhase('typing')
  }

  const showUser = phase !== 'idle' && phase !== 'typing'
  const showBot = phase === 'replying' || phase === 'done'
  const botText = Array.from(BOT_MSG).slice(0, botChars).join('')

  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
        <div className="text-center lg:text-left [&>div]:lg:mx-0 [&>div]:lg:text-left">
          <SectionHeading
            eyebrow="Eco AI"
            title={
              <>
                Ask anything. Get the <span className="text-gradient">right bin</span>, instantly.
              </>
            }
            description="Eco AI understands everyday questions and turns them into clear, campus-specific disposal guidance."
          />
          <Reveal delay={150} className="mt-8 flex justify-center lg:justify-start">
            <CtaLink href="/login" magnetic>
              Ask Eco AI
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </CtaLink>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <div ref={ref} className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-primary/15 blur-3xl" aria-hidden="true" />
            <div className="glass relative overflow-hidden rounded-[2rem] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                  <Orb active={phase === 'thinking' || phase === 'replying'} />
                  <div>
                    <p className="font-display text-sm font-semibold">Eco Bot</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                      {phase === 'thinking' ? 'Thinking…' : phase === 'replying' ? 'Typing…' : 'Online'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={replay}
                  disabled={phase !== 'done'}
                  className="grid size-9 place-items-center rounded-xl text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground disabled:opacity-0"
                  aria-label="Replay conversation"
                >
                  <RotateCcw className="size-4" />
                </button>
              </div>

              <div className="flex min-h-[300px] flex-col gap-4 px-5 py-6" aria-live="polite">
                {showUser && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 flex justify-end duration-300">
                    <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                      {USER_MSG}
                    </p>
                  </div>
                )}

                {phase === 'thinking' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 flex items-end gap-2.5 duration-300">
                    <Orb size="sm" active />
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-card/70 px-4 py-3.5">
                      <span className="sr-only">Eco Bot is thinking</span>
                      {[0, 150, 300].map((d) => (
                        <span key={d} className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                )}

                {showBot && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 flex items-end gap-2.5 duration-300">
                    <Orb size="sm" />
                    <div className="max-w-[85%] space-y-2.5">
                      <p className="rounded-2xl rounded-bl-md border border-border bg-card/70 px-4 py-2.5 text-sm leading-relaxed">
                        {botText}
                        {phase === 'replying' && <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-primary" />}
                      </p>
                      {phase === 'done' && (
                        <p className="animate-in fade-in slide-in-from-bottom-1 inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-medium text-mint duration-500">
                          <MapPin className="size-3.5 text-primary" aria-hidden="true" />
                          E-waste point · Library Block, Ground Floor
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-border p-3">
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/50 py-1.5 pl-4 pr-1.5">
                  <p className="min-w-0 flex-1 truncate text-sm" aria-hidden="true">
                    {phase === 'typing' ? (
                      <>
                        {USER_MSG.slice(0, userChars)}
                        <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-foreground" />
                      </>
                    ) : (
                      <span className="text-muted-foreground">Ask about any item…</span>
                    )}
                  </p>
                  <span
                    className={cn(
                      'grid size-9 place-items-center rounded-xl transition-all duration-300',
                      phase === 'typing' && userChars > 0 ? 'bg-primary text-primary-foreground' : 'bg-white/5 text-muted-foreground',
                    )}
                    aria-hidden="true"
                  >
                    <SendHorizontal className="size-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
