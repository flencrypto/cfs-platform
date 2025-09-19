'use client'

import { Button } from '@/components/ui/button'
import { ConnectWalletButton } from '@/components/auth/connect-wallet-button'
import { SignInButton } from '@/components/auth/sign-in-button'
import { useSession } from 'next-auth/react'
import { 
  ArrowRight, 
  Trophy, 
  Coins, 
  Zap,
  CheckCircle,
  Star
} from 'lucide-react'

const benefits = [
  'No registration fees',
  'Instant crypto payouts',
  '24/7 customer support',
  'Mobile & desktop access',
  'Secure & transparent',
  'Global accessibility',
]

export function CTA() {
  const { data: session } = useSession()

  return (
    <section className="py-24 bg-gradient-to-br from-cfs-primary via-cfs-secondary to-cfs-accent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Start Winning?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Join thousands of players earning crypto rewards in fantasy sports contests
          </p>

          {/* Benefits */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2 text-white/90">
                <CheckCircle className="h-4 w-4 text-cfs-success" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {session ? (
              <Button size="lg" className="bg-white text-cfs-primary hover:bg-white/90">
                <Trophy className="mr-2 h-5 w-5" />
                Enter Contest
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <>
                <ConnectWalletButton 
                  size="lg" 
                  className="bg-white text-cfs-primary hover:bg-white/90"
                />
                <SignInButton 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-cfs-primary"
                />
              </>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Coins className="h-8 w-8 text-crypto-bitcoin" />
              </div>
              <div className="text-2xl font-bold text-white">$2.5M+</div>
              <div className="text-sm text-white/80">Paid Out</div>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-white">4.9/5</div>
              <div className="text-sm text-white/80">Player Rating</div>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Zap className="h-8 w-8 text-cfs-accent" />
              </div>
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-sm text-white/80">Active Players</div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-12">
            <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90">
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <span>Secure & Audited</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
