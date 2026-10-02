import { Logo } from './logo'

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
        <Logo />
        <p>{'© 2026 Eco Campus Bot · Built for a greener campus.'}</p>
      </div>
    </footer>
  )
}
