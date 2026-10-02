'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost'

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground shadow-[0_10px_40px_-12px_oklch(0.76_0.165_158/0.8)] hover:shadow-[0_14px_50px_-10px_oklch(0.76_0.165_158/0.95)] hover:brightness-110',
  ghost: 'glass text-foreground hover:bg-white/[0.07] hover:border-primary/40',
}

export function CtaLink({
  href,
  children,
  variant = 'primary',
  magnetic = false,
  className,
  onClick,
}: {
  href: string
  children: React.ReactNode
  variant?: Variant
  magnetic?: boolean
  className?: string
  onClick?: () => void
}) {
  const ref = useRef<HTMLAnchorElement>(null)

  function handleMove(e: React.PointerEvent<HTMLAnchorElement>) {
    if (!magnetic || e.pointerType !== 'mouse' || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * 0.18
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3
    ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  function handleLeave() {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <Link
      ref={ref}
      href={href}
      onClick={onClick}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn(
        'group inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-[transform,box-shadow,background-color,border-color,filter] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.97]',
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  )
}
