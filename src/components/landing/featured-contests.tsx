'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, getTimeUntil } from '@/lib/utils'
import { Trophy, Users, Clock, ArrowRight } from 'lucide-react'

// Mock data - replace with real data from API
const featuredContests = [
  {
    id: '1',
    name: 'Premier League Showdown',
    sport: 'Soccer',
    entryFee: 25,
    prizePool: 5000,
    maxEntries: 200,
    currentEntries: 156,
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    status: 'ACTIVE',
    type: 'DAILY',
    participants: 156,
    timeLeft: '2h 15m',
  },
  {
    id: '2',
    name: 'NBA Championship',
    sport: 'Basketball',
    entryFee: 50,
    prizePool: 10000,
    maxEntries: 100,
    currentEntries: 89,
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    status: 'ACTIVE',
    type: 'TOURNAMENT',
    participants: 89,
    timeLeft: '4h 30m',
  },
  {
    id: '3',
    name: 'Crypto Cup Finals',
    sport: 'Soccer',
    entryFee: 100,
    prizePool: 25000,
    maxEntries: 50,
    currentEntries: 42,
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    status: 'ACTIVE',
    type: 'TOURNAMENT',
    participants: 42,
    timeLeft: '6h 45m',
  },
]

export function FeaturedContests() {
  const [selectedContest, setSelectedContest] = useState<string | null>(null)

  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Featured Contests
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Join the biggest contests with the highest prize pools
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {featuredContests.map((contest) => (
            <Card
              key={contest.id}
              className={`contest-card cursor-pointer transition-all duration-200 ${
                selectedContest === contest.id ? 'ring-2 ring-cfs-primary' : ''
              }`}
              onClick={() => setSelectedContest(contest.id)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="mb-2">
                    {contest.sport}
                  </Badge>
                  <Badge 
                    variant={contest.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className="mb-2"
                  >
                    {contest.status}
                  </Badge>
                </div>

                <h3 className="text-xl font-semibold text-foreground">
                  {contest.name}
                </h3>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Entry Fee</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(contest.entryFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Prize Pool</span>
                    <span className="font-semibold text-cfs-primary">
                      {formatCurrency(contest.prizePool)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Participants</span>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">
                        {contest.currentEntries}/{contest.maxEntries}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Starts In</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">
                        {getTimeUntil(contest.startTime)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{Math.round((contest.currentEntries / contest.maxEntries) * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-cfs-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(contest.currentEntries / contest.maxEntries) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    variant={selectedContest === contest.id ? 'default' : 'outline'}
                  >
                    {selectedContest === contest.id ? (
                      <>
                        <Trophy className="mr-2 h-4 w-4" />
                        Enter Contest
                      </>
                    ) : (
                      <>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline">
            View All Contests
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
