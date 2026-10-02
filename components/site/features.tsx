import { ArrowUpRight, Bot, MapPin, Recycle, Sprout } from 'lucide-react'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'
import { TiltCard } from './tilt-card'

const FEATURES = [
  {
    icon: Recycle,
    title: 'Waste Classification',
    body: 'Describe or snap an item and instantly learn whether it is plastic, paper, organic, or e-waste.',
    iconAnim: 'group-hover:rotate-180',
  },
  {
    icon: MapPin,
    title: 'Find Disposal Points',
    body: 'Get the nearest correct bin or collection point on campus, with directions in a tap.',
    iconAnim: 'group-hover:-translate-y-1',
  },
  {
    icon: Bot,
    title: 'Ask Eco AI',
    body: 'Chat naturally about recycling rules, campus drives, and greener everyday habits.',
    iconAnim: 'group-hover:scale-110',
  },
  {
    icon: Sprout,
    title: 'Sustainable Tips',
    body: 'Bite-sized, practical ideas to cut waste in hostels, labs, cafeterias, and classrooms.',
    iconAnim: 'group-hover:-rotate-12 group-hover:scale-110',
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              One Campus. One Conversation. <span className="text-gradient">A Greener Future.</span>
            </>
          }
          description="Everything students need to make the right sustainable choice, in one friendly assistant."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body, iconAnim }, i) => (
            <Reveal key={title} delay={i * 90}>
              <TiltCard className="h-full">
                <div className="flex items-start justify-between">
                  <span className="relative grid size-12 place-items-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/25 transition-shadow duration-300 group-hover:shadow-[0_0_30px_-4px_oklch(0.76_0.165_158/0.7)]">
                    <Icon className={`size-6 transition-transform duration-500 ${iconAnim}`} aria-hidden="true" />
                  </span>
                  <ArrowUpRight
                    className="size-5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-6 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
