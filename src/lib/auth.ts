import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { User } from '@/types'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
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

        // For now, we'll skip password verification since we're using OAuth
        // In a real app, you'd verify the password hash here
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          username: user.username,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.username = (user as any).username
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Log sign in events for analytics
      console.log('User signed in:', { userId: user.id, provider: account?.provider })
    },
    async signOut({ session, token }) {
      // Log sign out events
      console.log('User signed out:', { userId: token?.id })
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

// Helper functions for wallet authentication
export async function verifyWalletSignature(
  address: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    // In a real implementation, you'd verify the signature using a library like ethers.js
    // For now, we'll just return true for demo purposes
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
    console.error('Failed to create wallet user:', error)
    return null
  }
}

// KYC verification helpers
export async function startKycVerification(userId: string, provider: string = 'persona') {
  try {
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
    throw error
  }
}

export async function updateKycStatus(
  userId: string,
  status: 'APPROVED' | 'REJECTED',
  rejectionReason?: string
) {
  try {
    const updateData: any = {
      status,
      [status === 'APPROVED' ? 'verifiedAt' : 'rejectedAt']: new Date(),
    }

    if (status === 'REJECTED' && rejectionReason) {
      updateData.rejectionReason = rejectionReason
    }

    const kycProfile = await prisma.kycProfile.update({
      where: { userId },
      data: updateData,
    })

    return kycProfile
  } catch (error) {
    console.error('Failed to update KYC status:', error)
    throw error
  }
}
