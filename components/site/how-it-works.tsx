import { BrainCircuit, MapPinned, MessageCircleQuestion } from 'lucide-react'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'

const STEPS = [
  {
    n: '01',
    icon: MessageCircleQuestion,
    title: 'Ask',
    body: 'Type a quick question in plain language.',
    example: '“Where should I throw this battery?”',
  },
  {
    n: '02',
    icon: BrainCircuit,
    title: 'Understand',
    body: 'Eco AI classifies the item instantly.',
    example: 'Identified as e-waste',
  },
  {
    n: '03',
    icon: MapPinned,
    title: 'Act',
    body: 'Get the right campus disposal point.',
    example: 'Library Block · Bin B2',
  },
]

function Connector() {
  return (
    <div className="flex items-center justify-center py-3 md:py-0" aria-hidden="true">
      <svg className="h-12 w-6 md:hidden" viewBox="0 0 24 48" fill="none" stroke="oklch(0.76 0.165 158)" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="40" className="animate-dash" strokeOpacity="0.7" />
        <path d="M6 36l6 8 6-8" strokeOpacity="0.9" />
      </svg>
      <svg className="hidden h-6 w-full md:block" viewBox="0 0 64 24" fill="none" stroke="oklch(0.76 0.165 158)" strokeWidth="2" strokeLinecap="round">
        <line x1="4" y1="12" x2="54" y2="12" className="animate-dash" strokeOpacity="0.7" />
        <path d="M52 6l8 6-8 6" strokeOpacity="0.9" />
      </svg>
    </div>
  )
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20 md:py-28">
      <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              Ask <span className="text-primary">→</span> Understand <span className="text-primary">→</span> Act
            </>
          }
          description="From a question to the right bin in seconds."
        />

        <ol className="mt-14 flex flex-col md:grid md:grid-cols-[1fr_64px_1fr_64px_1fr] md:items-center">
          {STEPS.map(({ n, icon: Icon, title, body, example }, i) => (
            <li key={title} className="contents">
              <Reveal delay={i * 150} className="relative">
                <div className="group relative rounded-3xl border border-border bg-card/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.13_170)] text-primary-foreground shadow-[0_0_30px_-6px_oklch(0.76_0.165_158/0.8)] transition-transform duration-500 group-hover:scale-110">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <span className="font-display text-4xl font-semibold text-foreground/10">{n}</span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
                  <p className="mt-5 rounded-xl border border-primary/20 bg-primary/[0.06] px-3.5 py-2.5 text-sm text-mint">
                    {example}
                  </p>
                </div>
              </Reveal>
              {i < STEPS.length - 1 && (
                <Connector />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
