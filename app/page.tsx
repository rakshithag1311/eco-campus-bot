import { Navbar } from '@/components/site/navbar'
import { Hero } from '@/components/site/hero'
import { Features } from '@/components/site/features'
import { HowItWorks } from '@/components/site/how-it-works'
import { Impact } from '@/components/site/impact'
import { ChatPreview } from '@/components/site/chat-preview'
import { FinalCta } from '@/components/site/final-cta'
import { Footer } from '@/components/site/footer'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-clip">
        <Hero />
        <Features />
        <HowItWorks />
        <Impact />
        <ChatPreview />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
