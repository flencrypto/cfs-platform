'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Goal, Dribbble, Shield, Zap, Trophy, Users, Calendar } from 'lucide-react'

const sports = [
  {
    id: 'soccer',
    name: 'Soccer',
    icon: Goal,
    status: 'Live',
    contests: 156,
    prizePool: 125000,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    description: 'Premier League, La Liga, Champions League',
  },
  {
    id: 'nba',
    name: 'NBA',
    icon: Dribbble,
    status: 'Live',
    contests: 89,
    prizePool: 89000,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    description: 'Regular season, playoffs, and finals',
  },
  {
    id: 'nfl',
    name: 'NFL',
    icon: Shield,
    status: 'Coming Soon',
    contests: 0,
    prizePool: 0,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    description: 'Regular season and Super Bowl',
  },
  {
    id: 'ufc',
    name: 'UFC',
    icon: Zap,
    status: 'Live',
    contests: 23,
    prizePool: 45000,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    description: 'Main events and championship fights',
  },
]

const upcomingSports = [
  { name: 'Cricket', status: 'Phase 2' },
  { name: 'F1 Racing', status: 'Phase 2' },
  { name: 'MLB', status: 'Phase 2' },
  { name: 'NHL', status: 'Phase 2' },
  { name: 'Tennis', status: 'Phase 2' },
  { name: 'Esports', status: 'Phase 3' },
]

export function SportsCoverage() {
  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Sports Coverage
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            From soccer to basketball, compete across multiple sports with real-time scoring
          </p>
        </div>

        {/* Live Sports */}
        <div className="mt-16">
          <h3 className="mb-8 text-xl font-semibold text-foreground">
            Live Now
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sports.map((sport) => (
              <Card key={sport.id} className="contest-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full ${sport.bgColor}`}>
                      <sport.icon className={`h-6 w-6 ${sport.color}`} />
                    </div>
                    <Badge 
                      variant={sport.status === 'Live' ? 'success' : 'secondary'}
                    >
                      {sport.status}
                    </Badge>
                  </div>

                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    {sport.name}
                  </h4>

                  <p className="text-sm text-muted-foreground mb-4">
                    {sport.description}
                  </p>

                  {sport.status === 'Live' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Contests</span>
                        <span className="font-semibold text-foreground">
                          {sport.contests}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Prize Pool</span>
                        <span className="font-semibold text-cfs-primary">
                          ${sport.prizePool.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full mt-4" 
                    variant={sport.status === 'Live' ? 'default' : 'outline'}
                    disabled={sport.status !== 'Live'}
                  >
                    {sport.status === 'Live' ? 'View Contests' : 'Coming Soon'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Sports */}
        <div className="mt-16">
          <h3 className="mb-8 text-xl font-semibold text-foreground">
            Coming Soon
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {upcomingSports.map((sport) => (
              <Card key={sport.name} className="text-center">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground mb-2">
                    {sport.name}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {sport.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Trophy className="h-8 w-8 text-cfs-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">4</div>
            <div className="text-sm text-muted-foreground">Live Sports</div>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Users className="h-8 w-8 text-crypto-ethereum" />
            </div>
            <div className="text-3xl font-bold text-foreground">268</div>
            <div className="text-sm text-muted-foreground">Active Contests</div>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Calendar className="h-8 w-8 text-cfs-accent" />
            </div>
            <div className="text-3xl font-bold text-foreground">10+</div>
            <div className="text-sm text-muted-foreground">Sports Coming</div>
          </div>
        </div>
      </div>
    </section>
  )
}
