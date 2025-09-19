'use client'

import { Button } from '@/components/ui/button'
import { ConnectWalletButton } from '@/components/auth/connect-wallet-button'
import { SignInButton } from '@/components/auth/sign-in-button'
import { useSession } from 'next-auth/react'
import { ArrowRight, Play, Trophy, Zap } from 'lucide-react'

export function Hero() {
  const { data: session } = useSession()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cfs-primary via-cfs-secondary to-cfs-accent">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Crypto Fantasy Sports
            <span className="block text-crypto-bitcoin">Reimagined</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl">
            Draft virtual teams, enter contests, and earn prizes in fiat, tokens, and NFTs. 
            The ultimate crypto-enabled fantasy sports platform.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {session ? (
              <Button size="lg" className="crypto-gradient text-white hover:opacity-90">
                Enter Contest
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <>
                <ConnectWalletButton size="lg" />
                <SignInButton size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-cfs-primary" />
              </>
            )}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center">
                <Trophy className="h-8 w-8 text-crypto-bitcoin" />
              </div>
              <div className="mt-2 text-3xl font-bold text-white">$2.5M+</div>
              <div className="text-sm text-white/80">Prize Pools</div>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center">
                <Zap className="h-8 w-8 text-crypto-ethereum" />
              </div>
              <div className="mt-2 text-3xl font-bold text-white">50K+</div>
              <div className="text-sm text-white/80">Active Players</div>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center">
                <Play className="h-8 w-8 text-cfs-accent" />
              </div>
              <div className="mt-2 text-3xl font-bold text-white">1M+</div>
              <div className="text-sm text-white/80">Contests Played</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute left-10 top-20 h-20 w-20 animate-pulse rounded-full bg-white/10 blur-xl" />
      <div className="absolute right-10 top-40 h-32 w-32 animate-pulse rounded-full bg-crypto-bitcoin/20 blur-xl" />
      <div className="absolute bottom-20 left-1/4 h-16 w-16 animate-pulse rounded-full bg-crypto-ethereum/20 blur-xl" />
    </section>
  )
}
