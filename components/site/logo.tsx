import Link from 'next/link'
import { Leaf } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.13_170)] text-primary-foreground shadow-[0_0_24px_-4px_oklch(0.76_0.165_158/0.7)]',
        className,
      )}
      aria-hidden="true"
    >
      <Leaf className="size-[18px]" strokeWidth={2.4} />
      <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-background bg-mint" />
    </span>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('group flex items-center gap-2.5', className)} aria-label="Eco Campus Bot home">
      <LogoMark className="transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-105" />
      <span className="font-display text-base font-semibold tracking-tight text-foreground">
        Eco Campus <span className="text-primary">Bot</span>
      </span>
    </Link>
  )
}
