import { Leaf } from 'lucide-react'

const BUBBLES = [
  { left: '8%', size: 10, delay: '0s', duration: '14s' },
  { left: '22%', size: 6, delay: '3s', duration: '11s' },
  { left: '37%', size: 14, delay: '6s', duration: '16s' },
  { left: '55%', size: 8, delay: '1.5s', duration: '13s' },
  { left: '71%', size: 12, delay: '4.5s', duration: '15s' },
  { left: '86%', size: 7, delay: '8s', duration: '12s' },
]

const LEAVES = [
  { top: '18%', left: '6%', size: 22, delay: '0s', rotate: -20 },
  { top: '62%', left: '12%', size: 16, delay: '2s', rotate: 35 },
  { top: '28%', left: '88%', size: 20, delay: '4s', rotate: 60 },
  { top: '72%', left: '82%', size: 14, delay: '1s', rotate: -45 },
]

export function AmbientBackground({ leaves = true }: { leaves?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="animate-rise absolute bottom-[-20px] rounded-full border border-primary/30 bg-primary/10 max-md:hidden"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDelay: b.delay,
            animationDuration: b.duration,
          }}
        />
      ))}
      {leaves &&
        LEAVES.map((l, i) => (
          <span
            key={i}
            className="animate-drift absolute text-primary/30"
            style={{ top: l.top, left: l.left, animationDelay: l.delay }}
          >
            <Leaf style={{ width: l.size, height: l.size, transform: `rotate(${l.rotate}deg)` }} />
          </span>
        ))}
    </div>
  )
}
