import { Suspense } from 'react'
import { Hero } from '@/components/landing/hero'
import { FeaturedContests } from '@/components/landing/featured-contests'
import { HowItWorks } from '@/components/landing/how-it-works'
import { SportsCoverage } from '@/components/landing/sports-coverage'
import { CryptoFeatures } from '@/components/landing/crypto-features'
import { Testimonials } from '@/components/landing/testimonials'
import { CTA } from '@/components/landing/cta'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<LoadingSpinner />}>
        <Hero />
        <FeaturedContests />
        <HowItWorks />
        <SportsCoverage />
        <CryptoFeatures />
        <Testimonials />
        <CTA />
      </Suspense>
    </main>
  )
}
