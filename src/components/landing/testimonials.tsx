'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, Quote, Trophy, Coins } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Alex Chen',
    username: '@alexchen',
    avatar: '/avatars/alex.jpg',
    location: 'San Francisco, CA',
    winnings: 12500,
    rating: 5,
    text: 'CFS has completely changed how I play fantasy sports. The crypto integration is seamless and the payouts are instant. I\'ve won over $12k in just 3 months!',
    contest: 'Premier League Champion',
    verified: true,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    username: '@sarahj',
    avatar: '/avatars/sarah.jpg',
    location: 'London, UK',
    winnings: 8750,
    rating: 5,
    text: 'The NFT rewards system is amazing. I love collecting unique player cards and achievement badges. It adds a whole new dimension to fantasy sports.',
    contest: 'NBA Finals Winner',
    verified: true,
  },
  {
    id: 3,
    name: 'Mike Rodriguez',
    username: '@mikerod',
    avatar: '/avatars/mike.jpg',
    location: 'Barcelona, ES',
    winnings: 15600,
    rating: 5,
    text: 'As a crypto enthusiast, I was skeptical about fantasy sports. But CFS delivers on all fronts - great UX, fair gameplay, and real crypto rewards.',
    contest: 'Crypto Cup Champion',
    verified: true,
  },
  {
    id: 4,
    name: 'Emma Wilson',
    username: '@emmaw',
    avatar: '/avatars/emma.jpg',
    location: 'Toronto, CA',
    winnings: 6200,
    rating: 5,
    text: 'The live scoring updates are incredible. I can track my team\'s performance in real-time and the interface is so intuitive. Highly recommended!',
    contest: 'UFC Main Event Winner',
    verified: true,
  },
  {
    id: 5,
    name: 'David Kim',
    username: '@davidk',
    avatar: '/avatars/david.jpg',
    location: 'Seoul, KR',
    winnings: 9800,
    rating: 5,
    text: 'CFS has the best community I\'ve seen in fantasy sports. The private leagues feature lets me compete with friends, and the crypto aspect makes it even more exciting.',
    contest: 'Champions League Winner',
    verified: true,
  },
  {
    id: 6,
    name: 'Lisa Thompson',
    username: '@lisat',
    avatar: '/avatars/lisa.jpg',
    location: 'Melbourne, AU',
    winnings: 4200,
    rating: 5,
    text: 'I\'ve been playing fantasy sports for years, but CFS takes it to the next level. The variety of contests and the crypto rewards make every game exciting.',
    contest: 'Daily Contest Regular',
    verified: true,
  },
]

export function Testimonials() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What Our Players Say
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Join thousands of satisfied players who have earned millions in prizes
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="contest-card">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="mb-4 flex justify-center">
                  <Quote className="h-8 w-8 text-cfs-primary/20" />
                </div>

                {/* Rating */}
                <div className="mb-4 flex justify-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="mb-6 text-center text-muted-foreground">
                  "{testimonial.text}"
                </p>

                {/* User Info */}
                <div className="text-center">
                  <div className="mb-2 flex items-center justify-center space-x-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold text-foreground">
                          {testimonial.name}
                        </span>
                        {testimonial.verified && (
                          <Badge variant="success" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.username}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground mb-2">
                    {testimonial.location}
                  </div>

                  {/* Winnings */}
                  <div className="mb-2 flex items-center justify-center space-x-1">
                    <Coins className="h-4 w-4 text-crypto-bitcoin" />
                    <span className="font-semibold text-foreground">
                      ${testimonial.winnings.toLocaleString()} won
                    </span>
                  </div>

                  {/* Contest Achievement */}
                  <Badge variant="outline" className="text-xs">
                    <Trophy className="mr-1 h-3 w-3" />
                    {testimonial.contest}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">50K+</div>
            <div className="text-sm text-muted-foreground">Happy Players</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">$2.5M+</div>
            <div className="text-sm text-muted-foreground">Total Winnings</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">4.9/5</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  )
}
