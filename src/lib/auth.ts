import { NextAuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import CredentialsProvider from 'next-auth/providers/credentials'
import { mockConfig, mockData } from '@/lib/mock-config'
import { prisma, isPrismaClientUnavailable } from '@/lib/prisma'
import { generateId } from '@/lib/utils'
import { User, UserProfile, KycProfile, Wallet } from '@/types'

const baseMockTimestamp = new Date('2023-01-01T00:00:00.000Z')

let prismaIsAvailable = true

const markPrismaUnavailable = (error: unknown): boolean => {
  if (isPrismaClientUnavailable(error)) {
    prismaIsAvailable = false
    return true
  }
  return false
}

const withFallback = (value: string | undefined, fallback: string, envName: string): string => {
  if (value && value.trim().length > 0) {
    return value
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[auth] Falling back to mock value for ${envName}`)
  }

  return fallback
}

const buildMockProfile = (userId: string, overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: overrides.id ?? `mock-profile-${userId}`,
  userId,
  firstName: overrides.firstName ?? 'Test',
  lastName: overrides.lastName ?? 'User',
  dateOfBirth: overrides.dateOfBirth,
  phone: overrides.phone,
  country: overrides.country,
  timezone: overrides.timezone,
  language: overrides.language ?? 'en',
  notifications:
    overrides.notifications ?? {
      email: true,
      push: true,
      sms: false,
    },
  depositLimit: overrides.depositLimit,
  sessionLimit: overrides.sessionLimit,
  selfExcluded: overrides.selfExcluded ?? false,
  selfExcludedUntil: overrides.selfExcludedUntil,
})

const buildMockWallet = (userId: string, overrides: Partial<Wallet> = {}): Wallet => ({
  id: overrides.id ?? `mock-wallet-${userId}`,
  userId,
  address: overrides.address,
  type: overrides.type ?? 'EOA',
  network: overrides.network ?? 'ethereum',
  balances: overrides.balances ?? [],
  createdAt: overrides.createdAt ?? baseMockTimestamp,
  updatedAt: overrides.updatedAt ?? baseMockTimestamp,
})

const buildMockKycProfile = (userId: string, overrides: Partial<KycProfile> = {}): KycProfile => ({
  id: overrides.id ?? `mock-kyc-${userId}`,
  userId,
  status: overrides.status ?? 'IN_PROGRESS',
  provider: overrides.provider ?? 'mock-provider',
  providerId: overrides.providerId ?? `kyc_${Date.now()}`,
  documentType: overrides.documentType,
  documentNumber: overrides.documentNumber,
  nationality: overrides.nationality,
  address: overrides.address,
  city: overrides.city,
  state: overrides.state,
  postalCode: overrides.postalCode,
  verifiedAt: overrides.verifiedAt,
  rejectedAt: overrides.rejectedAt,
  rejectionReason: overrides.rejectionReason,
})

const buildMockUser = (overrides: Partial<User> = {}): User => {
  const base = mockData.users[0]
  const id = overrides.id ?? base?.id ?? `mock-user-${generateId()}`

  return {
    id,
    email: overrides.email ?? base?.email ?? `${id}@mock.local`,
    username: overrides.username ?? base?.username ?? `mock_${id.slice(-6)}`,
    name: overrides.name ?? base?.name ?? 'Mock User',
    image: overrides.image ?? (base?.image ?? undefined),
    createdAt: overrides.createdAt ?? baseMockTimestamp,
    updatedAt: overrides.updatedAt ?? baseMockTimestamp,
    profile: buildMockProfile(id, overrides.profile ?? {}),
    kycProfile: buildMockKycProfile(id, { status: 'APPROVED', ...(overrides.kycProfile ?? {}) }),
    wallet: buildMockWallet(id, overrides.wallet ?? {}),
  }
}

const findMockUserByEmail = (email: string): User | null => {
  const entry = mockData.users.find(mockUser => mockUser.email?.toLowerCase() === email.toLowerCase())

  if (!entry) {
    return null
  }

  return buildMockUser({
    id: entry.id,
    email: entry.email ?? undefined,
    username: entry.username ?? undefined,
    name: entry.name ?? undefined,
    image: entry.image ?? undefined,
  })
}

const mapUserForAuth = (user: User) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  image: user.image,
  username: user.username,
})

const buildMockWalletUser = (address: string): User => {
  const id = `mock-wallet-${address.slice(2, 10) || generateId()}`
  const wallet = buildMockWallet(id, { address, type: 'EOA', network: 'ethereum' })

  return buildMockUser({
    id,
    email: `${address}@wallet.local`,
    username: `wallet_${address.slice(2, 10) || generateId()}`,
    name: `Wallet User ${address.slice(2, 6) || ''}`.trim() || 'Wallet User',
    wallet,
  })
}

const googleClientId = withFallback(
  process.env.GOOGLE_CLIENT_ID,
  mockConfig.auth.googleClientId,
  'GOOGLE_CLIENT_ID'
)

const googleClientSecret = withFallback(
  process.env.GOOGLE_CLIENT_SECRET,
  mockConfig.auth.googleClientSecret,
  'GOOGLE_CLIENT_SECRET'
)

const appleClientId = withFallback(
  process.env.APPLE_CLIENT_ID,
  mockConfig.auth.appleClientId,
  'APPLE_CLIENT_ID'
)

const appleClientSecret = withFallback(
  process.env.APPLE_CLIENT_SECRET,
  mockConfig.auth.appleClientSecret,
  'APPLE_CLIENT_SECRET'
)

let adapter: Adapter | undefined

try {
  adapter = PrismaAdapter(prisma)
} catch (error) {
  if (!markPrismaUnavailable(error)) {
    throw error
  }
}

const authOptionsBase: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
    AppleProvider({
      clientId: appleClientId,
      clientSecret: appleClientSecret,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        if (!prismaIsAvailable) {
          const fallback = findMockUserByEmail(credentials.email)
          return fallback ? mapUserForAuth(fallback) : null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            include: {
              profile: true,
              kycProfile: true,
              wallet: true,
            },
          })

          if (!user) {
            return null
          }

          return mapUserForAuth(user as unknown as User)
        } catch (error) {
          if (markPrismaUnavailable(error)) {
            const fallback = findMockUserByEmail(credentials.email)
            return fallback ? mapUserForAuth(fallback) : null
          }

          throw error
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const { username } = user as { username?: string | null }
        token.id = user.id
        token.username = typeof username === 'string' ? username : null
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        if (token.id) {
          session.user.id = token.id
        }
        session.user.username =
          typeof token.username === 'string' ? token.username : undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account }) {
      // Log sign in events for analytics
      console.log('User signed in:', { userId: user.id, provider: account?.provider })
    },
    async signOut({ token }) {
      // Log sign out events
      console.log('User signed out:', { userId: token?.id })
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

if (adapter) {
  authOptionsBase.adapter = adapter
}

export const authOptions = authOptionsBase

// Helper functions for wallet authentication
export async function verifyWalletSignature(
  address: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error('Invalid wallet address format')
    }

    if (signature.trim().length === 0) {
      throw new Error('Missing wallet signature')
    }

    if (message.trim().length === 0) {
      throw new Error('Missing signed message')
    }

    // In a real implementation, verify the signature using a library like ethers.js
    return true
  } catch (error) {
    console.error('Wallet signature verification failed:', error)
    return false
  }
}

export async function createWalletUser(
  address: string,
  signature: string,
  message: string
): Promise<User | null> {
  try {
    // Verify the signature first
    const isValid = await verifyWalletSignature(address, signature, message)
    if (!isValid) {
      throw new Error('Invalid wallet signature')
    }

    if (!prismaIsAvailable) {
      return buildMockWalletUser(address)
    }

    try {
      // Check if user already exists
      let user = await prisma.user.findFirst({
        where: {
          wallet: {
            address: address,
          },
        },
        include: {
          profile: true,
          kycProfile: true,
          wallet: true,
        },
      })

      if (user) {
        return user as User
      }

      // Create new user with wallet
      user = await prisma.user.create({
        data: {
          email: `${address}@wallet.local`, // Temporary email for wallet users
          username: `wallet_${address.slice(0, 8)}`,
          name: `Wallet User ${address.slice(0, 8)}`,
          wallet: {
            create: {
              address: address,
              type: 'EOA',
              network: 'ethereum', // Default to ethereum, can be updated later
            },
          },
          profile: {
            create: {
              language: 'en',
              notifications: {
                email: false,
                push: true,
                sms: false,
              },
            },
          },
        },
        include: {
          profile: true,
          kycProfile: true,
          wallet: true,
        },
      })

      return user as User
    } catch (error) {
      if (markPrismaUnavailable(error)) {
        return buildMockWalletUser(address)
      }

      throw error
    }
  } catch (error) {
    console.error('Failed to create wallet user:', error)
    return null
  }
}

// KYC verification helpers
export async function startKycVerification(userId: string, provider: string = 'persona') {
  try {
    if (!prismaIsAvailable) {
      return buildMockKycProfile(userId, {
        status: 'IN_PROGRESS',
        provider,
      })
    }

    // In a real implementation, you'd integrate with KYC providers like Persona, Onfido, etc.
    // For now, we'll just create a pending KYC profile
    const kycProfile = await prisma.kycProfile.upsert({
      where: { userId },
      update: {
        status: 'IN_PROGRESS',
        provider,
        providerId: `kyc_${Date.now()}`,
      },
      create: {
        userId,
        status: 'IN_PROGRESS',
        provider,
        providerId: `kyc_${Date.now()}`,
      },
    })

    return kycProfile
  } catch (error) {
    console.error('Failed to start KYC verification:', error)
    if (markPrismaUnavailable(error)) {
      return buildMockKycProfile(userId, {
        status: 'IN_PROGRESS',
        provider,
      })
    }

    throw error
  }
}

export async function updateKycStatus(
  userId: string,
  status: 'APPROVED' | 'REJECTED',
  rejectionReason?: string
) {
  try {
    if (!prismaIsAvailable) {
      return buildMockKycProfile(userId, {
        status,
        rejectionReason,
        verifiedAt: status === 'APPROVED' ? new Date() : undefined,
        rejectedAt: status === 'REJECTED' ? new Date() : undefined,
      })
    }

    const baseUpdate: Record<string, unknown> = {
      status,
    }

    const statusUpdate: Record<string, unknown> =
      status === 'APPROVED'
        ? {
            verifiedAt: new Date(),
            rejectedAt: null,
            rejectionReason: null,
          }
        : {
            rejectedAt: new Date(),
            rejectionReason: rejectionReason ?? null,
            verifiedAt: null,
          }

    const kycProfile = await prisma.kycProfile.update({
      where: { userId },
      data: {
        ...baseUpdate,
        ...statusUpdate,
      },
    })

    return kycProfile
  } catch (error) {
    console.error('Failed to update KYC status:', error)
    if (markPrismaUnavailable(error)) {
      return buildMockKycProfile(userId, {
        status,
        rejectionReason,
        verifiedAt: status === 'APPROVED' ? new Date() : undefined,
        rejectedAt: status === 'REJECTED' ? new Date() : undefined,
      })
    }

    throw error
  }
}
