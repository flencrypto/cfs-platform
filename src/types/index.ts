// Core Types for CFS Platform

export interface User {
  id: string
  email?: string
  username?: string
  name?: string
  image?: string
  createdAt: Date
  updatedAt: Date
  profile?: UserProfile
  kycProfile?: KycProfile
  wallet?: Wallet
}

export interface UserProfile {
  id: string
  userId: string
  firstName?: string
  lastName?: string
  dateOfBirth?: Date
  phone?: string
  country?: string
  timezone?: string
  language: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  depositLimit?: number
  sessionLimit?: number
  selfExcluded: boolean
  selfExcludedUntil?: Date
}

export interface KycProfile {
  id: string
  userId: string
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  provider?: string
  providerId?: string
  documentType?: string
  documentNumber?: string
  nationality?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  verifiedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
}

export interface Wallet {
  id: string
  userId: string
  address?: string
  type: 'EOA' | 'CUSTODIAL'
  network?: string
  balances: WalletBalance[]
  createdAt: Date
  updatedAt: Date
}

export interface WalletBalance {
  id: string
  walletId: string
  currency: string
  amount: number
  createdAt: Date
  updatedAt: Date
}

export interface Sport {
  id: string
  name: string
  slug: string
  displayName: string
  isActive: boolean
  rosterSize: number
  salaryCap?: number
  scoringRules?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Fixture {
  id: string
  sportId: string
  sport: Sport
  homeTeam: string
  awayTeam: string
  startTime: Date
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED'
  league?: string
  season?: string
  round?: string
  lineups?: Record<string, any>
  stats?: Record<string, any>
  players: Player[]
  createdAt: Date
  updatedAt: Date
}

export interface Player {
  id: string
  sportId: string
  sport: Sport
  fixtureId?: string
  fixture?: Fixture
  name: string
  position: string
  team: string
  salary?: number
  stats?: Record<string, any>
  projections?: Record<string, any>
  isActive: boolean
  injuryStatus?: string
  createdAt: Date
  updatedAt: Date
}

export interface Contest {
  id: string
  sportId: string
  sport: Sport
  creatorId?: string
  creator?: User
  name: string
  description?: string
  type: ContestType
  status: ContestStatus
  entryFee: number
  maxEntries?: number
  currentEntries: number
  prizePool: number
  rosterSize: number
  salaryCap?: number
  scoringRules?: Record<string, any>
  startTime: Date
  endTime?: Date
  lockTime?: Date
  isPrivate: boolean
  inviteCode?: string
  entries: Entry[]
  createdAt: Date
  updatedAt: Date
}

export interface Entry {
  id: string
  contestId: string
  contest: Contest
  userId: string
  user: User
  name?: string
  totalScore: number
  rank?: number
  paymentId?: string
  paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  rosterSlots: RosterSlot[]
  submittedAt?: Date
  lockedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface RosterSlot {
  id: string
  entryId: string
  entry: Entry
  playerId: string
  player: Player
  position: string
  isCaptain: boolean
  multiplier: number
  score: number
  createdAt: Date
  updatedAt: Date
}

export interface League {
  id: string
  name: string
  description?: string
  isPrivate: boolean
  inviteCode?: string
  settings?: Record<string, any>
  contestId?: string
  contest?: Contest
  members: LeagueMember[]
  createdAt: Date
  updatedAt: Date
}

export interface LeagueMember {
  id: string
  leagueId: string
  league: League
  userId: string
  user: User
  role: 'MEMBER' | 'ADMIN' | 'COMMISSIONER'
  joinedAt: Date
}

export interface Transaction {
  id: string
  walletId?: string
  wallet?: Wallet
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'ENTRY_FEE' | 'PRIZE_WIN' | 'REFUND' | 'SUBSCRIPTION' | 'REFERRAL_BONUS'
  amount: number
  currency: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  externalId?: string
  description?: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  userId: string
  user: User
  plan: string
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'UNPAID' | 'INCOMPLETE'
  amount: number
  currency: string
  interval: string
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: 'CONTEST_STARTED' | 'CONTEST_ENDED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'KYC_APPROVED' | 'KYC_REJECTED' | 'LEAGUE_INVITE' | 'MESSAGE_RECEIVED' | 'PRIZE_WON' | 'REFERRAL_BONUS'
  title: string
  message: string
  data?: Record<string, any>
  isRead: boolean
  createdAt: Date
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Form Types
export interface LoginForm {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  username: string
  agreeToTerms: boolean
}

export interface WalletConnectForm {
  address: string
  signature: string
  message: string
}

export interface ContestEntryForm {
  contestId: string
  roster: {
    position: string
    playerId: string
    isCaptain?: boolean
  }[]
  paymentMethod: 'card' | 'crypto'
  paymentId?: string
}

export interface LeagueForm {
  name: string
  description?: string
  isPrivate: boolean
  settings?: Record<string, any>
}

// Webhook Types
export interface WebhookEvent {
  id: string
  type: string
  data: Record<string, any>
  created: number
}

export interface ContestCreatedEvent {
  id: string
  sport: string
  startsAt: string
  prizePool: number
}

export interface PaymentSucceededEvent {
  paymentId: string
  amount: number
  currency: string
  method: string
  entryId: string
}

export interface ScoringUpdateEvent {
  contestId: string
  entryId: string
  delta: {
    points: number
    reason: string
    playerId: string
    minute?: number
  }
  snapshot: {
    total: number
    rank: number
  }
  ts: string
}

// UI State Types
export interface LoadingState {
  isLoading: boolean
  error?: string
}

export interface FilterState {
  sport?: string
  entryFee?: {
    min?: number
    max?: number
  }
  status?: string
  dateRange?: {
    start?: Date
    end?: Date
  }
}

export interface SortState {
  field: string
  direction: 'asc' | 'desc'
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: Record<string, any>
}

// Constants
export const SPORTS = {
  SOCCER: 'soccer',
  NBA: 'nba',
  NFL: 'nfl',
  UFC: 'ufc',
  CRICKET: 'cricket',
  F1: 'f1',
  MLB: 'mlb',
  NHL: 'nhl',
  TENNIS: 'tennis',
  ESPORTS: 'esports',
} as const

export const CONTEST_TYPES = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  SEASONAL: 'SEASONAL',
  HEAD_TO_HEAD: 'HEAD_TO_HEAD',
  TOURNAMENT: 'TOURNAMENT',
  MULTIPLIER: 'MULTIPLIER',
} as const

export const CONTEST_STATUSES = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  LOCKED: 'LOCKED',
  SETTLED: 'SETTLED',
  CANCELLED: 'CANCELLED',
} as const

export const PAYMENT_METHODS = {
  CARD: 'card',
  CRYPTO: 'crypto',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  BANK_TRANSFER: 'bank_transfer',
} as const

export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  ETH: 'ETH',
  USDC: 'USDC',
  USDT: 'USDT',
} as const

export type SportType = typeof SPORTS[keyof typeof SPORTS]
export type ContestType = typeof CONTEST_TYPES[keyof typeof CONTEST_TYPES]
export type ContestStatus = typeof CONTEST_STATUSES[keyof typeof CONTEST_STATUSES]
export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS]
export type Currency = typeof CURRENCIES[keyof typeof CURRENCIES]
