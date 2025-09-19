'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  Users, 
  Trophy, 
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const steps = [
  {
    step: 1,
    title: 'Connect Wallet',
    description: 'Link your crypto wallet or create an account to get started',
    icon: Wallet,
    features: ['MetaMask', 'WalletConnect', 'Coinbase Wallet'],
    color: 'text-crypto-bitcoin',
  },
  {
    step: 2,
    title: 'Draft Your Team',
    description: 'Select players within salary cap constraints to build your lineup',
    icon: Users,
    features: ['Salary Cap Draft', 'Real-time Stats', 'Injury Updates'],
    color: 'text-crypto-ethereum',
  },
  {
    step: 3,
    title: 'Enter Contests',
    description: 'Join daily, weekly, or seasonal contests with various entry fees',
    icon: Zap,
    features: ['Multiple Formats', 'Live Scoring', 'Prize Pools'],
    color: 'text-cfs-accent',
  },
  {
    step: 4,
    title: 'Win Prizes',
    description: 'Earn fiat, tokens, and NFTs based on your team performance',
    icon: Trophy,
    features: ['Instant Payouts', 'Crypto Rewards', 'NFT Collectibles'],
    color: 'text-cfs-success',
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Get started in minutes with our simple 4-step process
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-12 hidden h-0.5 w-full -translate-x-1/2 bg-gradient-to-r from-cfs-primary to-cfs-secondary xl:block" />
                )}
                
                <Card className="relative h-full text-center">
                  <CardContent className="p-6">
                    {/* Step Number */}
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cfs-primary to-cfs-secondary text-white">
                      <span className="text-lg font-bold">{step.step}</span>
                    </div>

                    {/* Icon */}
                    <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted`}>
                      <step.icon className={`h-8 w-8 ${step.color}`} />
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="mb-4 text-muted-foreground">
                      {step.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center justify-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-cfs-success" />
                          <span className="text-sm text-muted-foreground">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-4">
            <Badge variant="outline" className="px-4 py-2">
              <Zap className="mr-2 h-4 w-4" />
              Ready to Start?
            </Badge>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </section>
  )
}
