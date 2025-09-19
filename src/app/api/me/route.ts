import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRequestLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const notificationPreferencesSchema = z
  .object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
  })
  .refine(preferences => Object.keys(preferences).length > 0, {
    message: 'At least one notification preference must be provided',
  })

const profileUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    username: z.string().min(3).optional(),
    image: z.string().url().optional(),
    dateOfBirth: z.coerce.date().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
    language: z.string().optional(),
    notifications: notificationPreferencesSchema.optional(),
  })
  .optional()

const updateProfileSchema = z
  .object({
    profile: profileUpdateSchema,
    preferences: notificationPreferencesSchema.optional(),
  })
  .refine(
    data => data.profile !== undefined || data.preferences !== undefined,
    {
      message: 'No update data provided',
      path: ['profile'],
    }
  )

interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
}

const defaultNotificationPreferences: NotificationPreferences = {
  email: true,
  push: true,
  sms: false,
}

function toNotificationPreferences(value: unknown): NotificationPreferences {
  if (!value || typeof value !== 'object') {
    return { ...defaultNotificationPreferences }
  }

  const record = value as Record<string, unknown>

  return {
    email:
      typeof record.email === 'boolean'
        ? record.email
        : defaultNotificationPreferences.email,
    push:
      typeof record.push === 'boolean'
        ? record.push
        : defaultNotificationPreferences.push,
    sms:
      typeof record.sms === 'boolean'
        ? record.sms
        : defaultNotificationPreferences.sms,
  }
}

function mergeNotificationPreferences(
  base: NotificationPreferences,
  updates?: Partial<NotificationPreferences>
): NotificationPreferences {
  if (!updates || Object.keys(updates).length === 0) {
    return base
  }

  return {
    email: updates.email ?? base.email,
    push: updates.push ?? base.push,
    sms: updates.sms ?? base.sms,
  }
}

const defaultUserInclude = {
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
} as const

export async function GET(request: NextRequest) {
  const requestLogger = getRequestLogger(request)

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      requestLogger.warn('Unauthorized profile access attempt')
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
      include: defaultUserInclude,
    })

    if (!user) {
      requestLogger.warn({ userId: session.user.id }, 'User profile not found')
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
    requestLogger.error({ error }, 'Error fetching user profile')
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
  const requestLogger = getRequestLogger(request)

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      requestLogger.warn('Unauthorized profile update attempt')
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const payload = await request.json()
    const parsedPayload = updateProfileSchema.safeParse(payload)

    if (!parsedPayload.success) {
      requestLogger.warn({ issues: parsedPayload.error.flatten() }, 'Invalid profile update payload')
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid profile payload',
          details: parsedPayload.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { profile, preferences } = parsedPayload.data
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    const basePreferences = toNotificationPreferences(existingProfile?.notifications)
    const notificationOverrides: Partial<NotificationPreferences> = {
      ...(profile?.notifications ?? {}),
      ...(preferences ?? {}),
    }
    const shouldUpdateNotifications = Object.keys(notificationOverrides).length > 0
    const mergedNotifications = shouldUpdateNotifications
      ? mergeNotificationPreferences(basePreferences, notificationOverrides)
      : basePreferences

    const userUpdateData: Prisma.UserUpdateInput = {}

    if (profile?.name !== undefined) {
      userUpdateData.name = profile.name
    }
    if (profile?.username !== undefined) {
      userUpdateData.username = profile.username
    }
    if (profile?.image !== undefined) {
      userUpdateData.image = profile.image
    }

    if (Object.keys(userUpdateData).length > 0) {
      requestLogger.debug({ userId: session.user.id }, 'Updating core user fields')
      await prisma.user.update({
        where: { id: session.user.id },
        data: userUpdateData,
      })
    }

    const profileUpdateData: Prisma.UserProfileUpdateInput = {}
    const profileCreateData: Prisma.UserProfileCreateInput = {
      user: {
        connect: { id: session.user.id },
      },
      language: profile?.language ?? existingProfile?.language ?? 'en',
      notifications: shouldUpdateNotifications ? mergedNotifications : basePreferences,
    }

    if (profile?.firstName !== undefined) {
      profileUpdateData.firstName = profile.firstName
      profileCreateData.firstName = profile.firstName
    }
    if (profile?.lastName !== undefined) {
      profileUpdateData.lastName = profile.lastName
      profileCreateData.lastName = profile.lastName
    }
    if (profile?.dateOfBirth !== undefined) {
      profileUpdateData.dateOfBirth = profile.dateOfBirth
      profileCreateData.dateOfBirth = profile.dateOfBirth
    }
    if (profile?.phone !== undefined) {
      profileUpdateData.phone = profile.phone
      profileCreateData.phone = profile.phone
    }
    if (profile?.country !== undefined) {
      profileUpdateData.country = profile.country
      profileCreateData.country = profile.country
    }
    if (profile?.timezone !== undefined) {
      profileUpdateData.timezone = profile.timezone
      profileCreateData.timezone = profile.timezone
    }
    if (profile?.language !== undefined) {
      profileUpdateData.language = profile.language
      profileCreateData.language = profile.language
    }

    if (shouldUpdateNotifications) {
      profileUpdateData.notifications = mergedNotifications
    }

    const shouldUpsertProfile =
      shouldUpdateNotifications || Object.keys(profileUpdateData).length > 0

    if (shouldUpsertProfile) {
      requestLogger.debug({ userId: session.user.id }, 'Upserting user profile data')
      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        update: profileUpdateData,
        create: profileCreateData,
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: defaultUserInclude,
    })

    if (!user) {
      requestLogger.error({ userId: session.user.id }, 'User not found after profile update')
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
    requestLogger.error({ error }, 'Error updating user profile')
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user profile',
      },
      { status: 500 }
    )
  }
}
