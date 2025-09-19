import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    const body = await request.json()
    const { profile, preferences } = body

    const updateData: any = {}

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
    if (profile && Object.keys(profile).length > 0) {
      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        update: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          country: profile.country,
          timezone: profile.timezone,
          language: profile.language,
          notifications: profile.notifications || {
            email: true,
            push: true,
            sms: false,
          },
        },
        create: {
          userId: session.user.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          country: profile.country,
          timezone: profile.timezone,
          language: profile.language || 'en',
          notifications: profile.notifications || {
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
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user profile',
      },
      { status: 500 }
    )
  }
}
