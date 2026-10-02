import { AmbientBackground } from './ambient'
import { CtaLink } from './cta-link'
import { Reveal } from './reveal'

export function FinalCta() {
  return (
    <section className="px-4 py-20 sm:px-6 md:py-28">
      <Reveal>
        <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-primary/20 bg-[radial-gradient(ellipse_at_top,oklch(0.38_0.09_160),oklch(0.2_0.03_165)_70%)] px-6 py-20 text-center md:py-28">
          <div className="grid-bg absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
          <AmbientBackground />
          <div className="animate-pulse-glow absolute left-1/2 top-1/2 -z-10 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />

          <h2 className="text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Small Actions. <span className="text-gradient">Big Impact.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-pretty text-base text-muted-foreground md:text-lg">
            Start making smarter choices for a cleaner campus.
          </p>
          <div className="mt-10 flex justify-center">
            <CtaLink href="/login" magnetic className="h-14 px-8 text-base">
              Get Started <span aria-hidden="true">🌱</span>
            </CtaLink>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
