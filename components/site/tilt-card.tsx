'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'

export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse') return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg) translateY(-4px)`
  }

  function handleLeave() {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-border bg-card/60 p-6 transition-[transform,border-color,box-shadow] duration-300 ease-out will-change-transform hover:border-primary/40 hover:shadow-[0_20px_60px_-20px_oklch(0.76_0.165_158/0.45)]',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), oklch(0.76 0.165 158 / 0.14), transparent 45%)',
        }}
        aria-hidden="true"
      />
      <div className="relative">{children}</div>
    </div>
  )
}
