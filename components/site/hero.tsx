import { ArrowRight, PlayCircle } from 'lucide-react'
import { CtaLink } from './cta-link'
import { HeroVisual } from './hero-visual'

export function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="grid-bg absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="absolute -top-40 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,oklch(0.55_0.13_160/0.35),transparent_65%)]"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
        <div className="text-center lg:text-left">
          <p className="animate-in fade-in slide-in-from-bottom-2 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-mint duration-700">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            AI-powered sustainability for students
          </p>

          <h1 className="animate-in fade-in slide-in-from-bottom-4 mt-6 text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight duration-700 sm:text-5xl lg:text-6xl xl:text-7xl">
            Make Your Campus Smarter. <span className="text-gradient">Make It Greener.</span>
          </h1>

          <p className="animate-in fade-in slide-in-from-bottom-4 mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground delay-150 duration-700 fill-mode-both md:text-lg lg:mx-0">
            Eco Campus Bot helps students understand waste disposal, recycling, and sustainable practices across
            campus.
          </p>

          <div className="animate-in fade-in slide-in-from-bottom-4 mt-9 flex flex-col items-center justify-center gap-3 delay-300 duration-700 fill-mode-both sm:flex-row lg:justify-start">
            <CtaLink href="/login" magnetic className="w-full sm:w-auto">
              Explore Eco Campus
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </CtaLink>
            <CtaLink href="#how-it-works" variant="ghost" className="w-full sm:w-auto">
              <PlayCircle className="size-4 text-primary transition-transform group-hover:scale-110" aria-hidden="true" />
              How It Works
            </CtaLink>
          </div>

          <dl className="animate-in fade-in mt-12 flex items-center justify-center gap-8 delay-500 duration-1000 fill-mode-both lg:justify-start">
            {[
              { k: '6', v: 'Waste categories' },
              { k: '24/7', v: 'AI guidance' },
              { k: '1 tap', v: 'To find a bin' },
            ].map((s) => (
              <div key={s.v} className="text-left">
                <dt className="sr-only">{s.v}</dt>
                <dd className="font-display text-xl font-semibold text-foreground">{s.k}</dd>
                <dd className="text-xs text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="animate-in fade-in zoom-in-95 delay-200 duration-1000 fill-mode-both">
          <HeroVisual />
        </div>
      </div>
    </section>
  )
}
