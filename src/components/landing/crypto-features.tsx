'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Coins, 
  Shield, 
  Zap, 
  Globe,
  Lock,
  TrendingUp,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

const features = [
  {
    title: 'Crypto Payments',
    description: 'Pay entry fees and receive prizes in Bitcoin, Ethereum, and stablecoins',
    icon: Coins,
    benefits: [
      'Instant transactions',
      'Low fees',
      'Global accessibility',
      'No chargebacks'
    ],
    color: 'text-crypto-bitcoin',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
  },
  {
    title: 'NFT Rewards',
    description: 'Earn unique collectible NFTs for achievements and milestones',
    icon: Shield,
    benefits: [
      'Unique digital assets',
      'Achievement badges',
      'Trading marketplace',
      'Rare collectibles'
    ],
    color: 'text-crypto-ethereum',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    title: 'DeFi Integration',
    description: 'Stake tokens, earn yield, and participate in governance',
    icon: Zap,
    benefits: [
      'Token staking',
      'Yield farming',
      'Governance voting',
      'Liquidity mining'
    ],
    color: 'text-cfs-accent',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950',
  },
  {
    title: 'Cross-Chain',
    description: 'Access contests across multiple blockchain networks',
    icon: Globe,
    benefits: [
      'Ethereum mainnet',
      'Polygon L2',
      'Arbitrum L2',
      'Optimism L2'
    ],
    color: 'text-cfs-primary',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950',
  },
]

const cryptoStats = [
  { label: 'Supported Tokens', value: '50+', icon: Coins },
  { label: 'Blockchain Networks', value: '4', icon: Globe },
  { label: 'NFT Collections', value: '12', icon: Shield },
  { label: 'DeFi Protocols', value: '8', icon: Zap },
]

export function CryptoFeatures() {
  return (
    <section className="py-24 bg-gradient-to-br from-cfs-primary/5 via-cfs-secondary/5 to-cfs-accent/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Crypto-Powered Features
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Experience the future of fantasy sports with blockchain technology
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {features.map((feature, index) => (
            <Card key={feature.title} className="contest-card">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${feature.bgColor}`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    
                    <div className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-cfs-success" />
                          <span className="text-sm text-muted-foreground">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Crypto Stats */}
        <div className="mt-16">
          <h3 className="mb-8 text-center text-xl font-semibold text-foreground">
            Platform Statistics
          </h3>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {cryptoStats.map((stat, index) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="h-8 w-8 text-cfs-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="crypto-gradient text-white">
              <Coins className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>
            <Button size="lg" variant="outline">
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
