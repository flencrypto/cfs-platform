import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, isPrismaClientUnavailable } from '@/lib/prisma'
import { mockData } from '@/lib/mock-config'
import { generateId } from '@/lib/utils'

const baseMockTimestamp = new Date('2023-01-01T00:00:00.000Z')

const buildMockUserResponse = () => {
  const fallback = mockData.users[0] ?? {
    id: 'mock-user',
    email: 'test@example.com',
    username: 'mockuser',
    name: 'Mock User',
    image: null,
  }

  const userId = fallback.id ?? `mock-user-${generateId()}`

  return {
    id: userId,
    email: fallback.email ?? 'test@example.com',
    username: fallback.username ?? 'mockuser',
    name: fallback.name ?? 'Mock User',
    image: (fallback.image ?? null) as string | null,
    createdAt: baseMockTimestamp,
    updatedAt: baseMockTimestamp,
    profile: {
      id: `mock-profile-${userId}`,
      userId,
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: undefined,
      phone: undefined as string | undefined,
      country: 'US',
      timezone: 'UTC',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      depositLimit: undefined as number | undefined,
      sessionLimit: undefined as number | undefined,
      selfExcluded: false,
      selfExcludedUntil: undefined as Date | undefined,
    },
    kycProfile: {
      id: `mock-kyc-${userId}`,
      userId,
      status: 'APPROVED',
      provider: 'mock-provider',
      providerId: 'kyc_mock',
      verifiedAt: baseMockTimestamp,
      rejectedAt: undefined,
      rejectionReason: undefined,
    },
    wallet: {
      id: `mock-wallet-${userId}`,
      userId,
      address: '0x0000000000000000000000000000000000000000',
      type: 'EOA',
      network: 'ethereum',
      balances: [],
      createdAt: baseMockTimestamp,
      updatedAt: baseMockTimestamp,
    },
    subscriptions: [],
    _count: { entries: 0, createdContests: 0 },
  }
}

const applyMockProfileUpdates = (
  user: ReturnType<typeof buildMockUserResponse>,
  body: UpdatePayload,
) => {
  const nextUser = { ...user, updatedAt: new Date() }

  const profileUpdates = body.profile
  if (profileUpdates) {
    if (profileUpdates.name !== undefined) {
      nextUser.name = profileUpdates.name ?? nextUser.name
    }
    if (profileUpdates.username !== undefined) {
      nextUser.username = profileUpdates.username ?? nextUser.username
    }
    if (profileUpdates.image !== undefined) {
      nextUser.image = profileUpdates.image
    }

    nextUser.profile = {
      ...nextUser.profile,
      firstName: profileUpdates.firstName ?? nextUser.profile.firstName,
      lastName: profileUpdates.lastName ?? nextUser.profile.lastName,
      phone: profileUpdates.phone ?? nextUser.profile.phone,
      country: profileUpdates.country ?? nextUser.profile.country,
      timezone: profileUpdates.timezone ?? nextUser.profile.timezone,
      language: profileUpdates.language ?? nextUser.profile.language,
      notifications: profileUpdates.notifications
        ? {
            ...nextUser.profile.notifications,
            ...profileUpdates.notifications,
          }
        : nextUser.profile.notifications,
    }
  }

  const preferenceUpdates = body.preferences
  if (preferenceUpdates) {
    nextUser.profile = {
      ...nextUser.profile,
      depositLimit:
        preferenceUpdates.depositLimit !== undefined
          ? preferenceUpdates.depositLimit ?? undefined
          : nextUser.profile.depositLimit,
      sessionLimit:
        preferenceUpdates.sessionLimit !== undefined
          ? preferenceUpdates.sessionLimit ?? undefined
          : nextUser.profile.sessionLimit,
      selfExcluded:
        preferenceUpdates.selfExcluded !== undefined
          ? preferenceUpdates.selfExcluded ?? false
          : nextUser.profile.selfExcluded,
      selfExcludedUntil:
        preferenceUpdates.selfExcludedUntil !== undefined
          ? preferenceUpdates.selfExcludedUntil
            ? new Date(preferenceUpdates.selfExcludedUntil)
            : undefined
          : nextUser.profile.selfExcludedUntil,
    }
  }

  return nextUser
}

type UpdatePayload = Partial<{
  profile: {
    name?: string | null
    username?: string | null
    image?: string | null
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
    country?: string | null
    timezone?: string | null
    language?: string | null
    notifications?: {
      email?: boolean
      push?: boolean
      sms?: boolean
    }
  }
  preferences: {
    depositLimit?: number | null
    sessionLimit?: number | null
    selfExcluded?: boolean
    selfExcludedUntil?: string | Date | null
  }
}>

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        kycProfile: true,
        wallet: {
          include: {
            balances: true,
          },
        },
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
        },
        _count: {
          select: {
            entries: true,
            createdContests: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    if (isPrismaClientUnavailable(error)) {
      return NextResponse.json({
        success: true,
        data: buildMockUserResponse(),
      })
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user profile',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  let body: UpdatePayload | null = null

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    body = (await request.json()) as UpdatePayload

    const { profile, preferences } = body ?? {}

    const updateData: Record<string, unknown> = {}

    // Update user fields
    if (profile) {
      if (profile.name !== undefined) updateData.name = profile.name
      if (profile.username !== undefined) updateData.username = profile.username
      if (profile.image !== undefined) updateData.image = profile.image
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      include: {
        profile: true,
        kycProfile: true,
        wallet: {
          include: {
            balances: true,
          },
        },
      },
    })

    // Update profile if provided
    const profileUpdate: Record<string, unknown> = {}
    const profileCreateData: Record<string, unknown> = {
      userId: session.user.id,
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
    }

    if (profile) {
      if (profile.firstName !== undefined) {
        profileUpdate.firstName = profile.firstName
        profileCreateData.firstName = profile.firstName
      }
      if (profile.lastName !== undefined) {
        profileUpdate.lastName = profile.lastName
        profileCreateData.lastName = profile.lastName
      }
      if (profile.phone !== undefined) {
        profileUpdate.phone = profile.phone
        profileCreateData.phone = profile.phone
      }
      if (profile.country !== undefined) {
        profileUpdate.country = profile.country
        profileCreateData.country = profile.country
      }
      if (profile.timezone !== undefined) {
        profileUpdate.timezone = profile.timezone
        profileCreateData.timezone = profile.timezone
      }
      if (profile.language !== undefined) {
        profileUpdate.language = profile.language
        profileCreateData.language = profile.language
      }
      if (profile.notifications) {
        profileUpdate.notifications = profile.notifications
        profileCreateData.notifications = profile.notifications
      }
    }

    if (preferences) {
      if (preferences.depositLimit !== undefined) {
        profileUpdate.depositLimit = preferences.depositLimit
        profileCreateData.depositLimit = preferences.depositLimit ?? undefined
      }
      if (preferences.sessionLimit !== undefined) {
        profileUpdate.sessionLimit = preferences.sessionLimit
        profileCreateData.sessionLimit = preferences.sessionLimit ?? undefined
      }
      if (preferences.selfExcluded !== undefined) {
        profileUpdate.selfExcluded = preferences.selfExcluded
        profileCreateData.selfExcluded = preferences.selfExcluded ?? undefined
      }
      if (preferences.selfExcludedUntil !== undefined) {
        const parsedDate =
          preferences.selfExcludedUntil instanceof Date
            ? preferences.selfExcludedUntil
            : preferences.selfExcludedUntil
            ? new Date(preferences.selfExcludedUntil)
            : null
        profileUpdate.selfExcludedUntil = parsedDate ?? undefined
        profileCreateData.selfExcludedUntil = parsedDate ?? undefined
      }
    }

    const shouldUpdateProfile =
      Object.keys(profileUpdate).length > 0 || Object.keys(profileCreateData).length > 3

    if (shouldUpdateProfile) {
      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        update: profileUpdate,
        create: {
          ...profileCreateData,
          firstName: profile?.firstName,
          lastName: profile?.lastName,
          phone: profile?.phone,
          country: profile?.country,
          timezone: profile?.timezone,
          notifications:
            profile?.notifications ?? {
              email: true,
              push: true,
              sms: false,
            },
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    if (isPrismaClientUnavailable(error)) {
      const fallbackUser = applyMockProfileUpdates(buildMockUserResponse(), body ?? {})
      return NextResponse.json({
        success: true,
        data: fallbackUser,
      })
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user profile',
      },
      { status: 500 }
    )
  }
}
