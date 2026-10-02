import { Battery, Bot, Droplets, Leaf, Recycle, FileText, Sparkles } from 'lucide-react'

const NODES = [
  { icon: Recycle, x: 18, y: 22, label: 'Plastic', delay: '0s' },
  { icon: Battery, x: 82, y: 26, label: 'E‑waste', delay: '1.2s' },
  { icon: FileText, x: 14, y: 74, label: 'Paper', delay: '2.4s' },
  { icon: Droplets, x: 84, y: 72, label: 'Water', delay: '0.6s' },
]

const PARTICLES = [
  { x: 30, y: 10, d: '0s' },
  { x: 62, y: 8, d: '1.1s' },
  { x: 92, y: 48, d: '2.2s' },
  { x: 6, y: 46, d: '0.5s' },
  { x: 40, y: 92, d: '1.7s' },
  { x: 70, y: 90, d: '2.8s' },
  { x: 50, y: 30, d: '0.9s' },
  { x: 28, y: 58, d: '2.5s' },
  { x: 74, y: 56, d: '1.4s' },
]

const LEAVES = [
  { x: 4, y: 12, size: 26, delay: '0s', rot: -30 },
  { x: 88, y: 6, size: 20, delay: '3s', rot: 40 },
  { x: 92, y: 88, size: 24, delay: '1.5s', rot: 120 },
  { x: 2, y: 90, size: 18, delay: '4.5s', rot: -80 },
]

export function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]" aria-hidden="true">
      <div className="animate-pulse-glow absolute inset-[18%] rounded-full bg-primary/25 blur-3xl" />

      <div className="animate-spin-slow absolute inset-[8%] rounded-full border border-dashed border-primary/20" />
      <div className="animate-spin-reverse absolute inset-[22%] rounded-full border border-primary/15">
        <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint shadow-[0_0_12px_2px_oklch(0.93_0.07_160/0.8)]" />
      </div>

      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.93 0.07 160)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="oklch(0.76 0.165 158)" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {NODES.map((n) => (
          <line
            key={n.label}
            x1="50"
            y1="50"
            x2={n.x}
            y2={n.y}
            stroke="url(#line-grad)"
            strokeWidth="0.35"
            className="animate-dash"
            vectorEffect="non-scaling-stroke"
            style={{ strokeWidth: 1.2 }}
          />
        ))}
      </svg>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="animate-float relative grid size-32 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,oklch(0.93_0.07_160),oklch(0.72_0.16_158)_45%,oklch(0.32_0.07_160)_100%)] shadow-[0_0_60px_-5px_oklch(0.76_0.165_158/0.8),inset_0_-10px_30px_oklch(0.2_0.05_165/0.6)] sm:size-36">
          <div className="absolute inset-2 rounded-full border border-white/25" />
          <Bot className="size-12 text-primary-foreground sm:size-14" strokeWidth={1.8} />
        </div>
      </div>

      {NODES.map(({ icon: Icon, x, y, label, delay }) => (
        <div
          key={label}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <div className="animate-float-slow glass flex items-center gap-2 rounded-2xl px-3 py-2" style={{ animationDelay: delay }}>
            <span className="grid size-8 place-items-center rounded-xl bg-primary/15 text-primary">
              <Icon className="size-4" />
            </span>
            <span className="hidden pr-1 text-xs font-medium text-foreground/90 sm:inline">{label}</span>
          </div>
        </div>
      ))}

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="animate-twinkle absolute size-1.5 rounded-full bg-mint"
          style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: p.d }}
        />
      ))}

      {LEAVES.map((l, i) => (
        <span
          key={i}
          className="animate-drift absolute text-primary/50"
          style={{ left: `${l.x}%`, top: `${l.y}%`, animationDelay: l.delay }}
        >
          <Leaf style={{ width: l.size, height: l.size, transform: `rotate(${l.rot}deg)` }} />
        </span>
      ))}

      <div className="absolute bottom-[4%] left-1/2 w-[78%] max-w-xs -translate-x-1/2">
        <div className="glass animate-float flex items-center gap-3 rounded-2xl px-4 py-3" style={{ animationDelay: '2s' }}>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0 text-left">
            <p className="truncate text-xs text-muted-foreground">Identified: Old battery</p>
            <p className="truncate text-sm font-medium">E-waste · Library Bin B2</p>
          </div>
        </div>
      </div>
    </div>
  )
}
