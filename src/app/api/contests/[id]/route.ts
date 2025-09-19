import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, isPrismaClientUnavailable } from '@/lib/prisma'
import { mockData } from '@/lib/mock-config'
import { generateId } from '@/lib/utils'
import { CONTEST_STATUSES, CONTEST_TYPES, ContestStatus, ContestType } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type ContestUpdatePayload = {
  name?: string
  description?: string | null
  type?: ContestType
  entryFee?: number
  maxEntries?: number | null
  prizePool?: number
  rosterSize?: number
  salaryCap?: number | null
  scoringRules?: Record<string, unknown>
  startTime?: Date
  endTime?: Date | null
  lockTime?: Date | null
  status?: ContestStatus
  isPrivate?: boolean
  inviteCode?: string | null
  sport?: { connect: { id: string } }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contest = await prisma.contest.findUnique({
      where: { id: params.id },
      include: {
        sport: true,
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
        entries: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                image: true,
              },
            },
            rosterSlots: {
              include: {
                player: true,
              },
            },
          },
          orderBy: {
            totalScore: 'desc',
          },
        },
        _count: {
          select: {
            entries: true,
          },
        },
      },
    })

    if (!contest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contest not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: contest,
    })
  } catch (error) {
    console.error('Error fetching contest:', error)
    if (isPrismaClientUnavailable(error)) {
      const baseDate = new Date('2023-01-01T00:00:00.000Z')
      const mockContest = mockData.contests.find(contest => contest.id === params.id)

      if (!mockContest) {
        return NextResponse.json(
          {
            success: false,
            error: 'Contest not found',
          },
          { status: 404 }
        )
      }

      const resolvedSport =
        mockData.sports.find(
          sport =>
            sport.slug === mockContest.sport.toLowerCase() ||
            sport.displayName.toLowerCase() === mockContest.sport.toLowerCase() ||
            sport.name.toLowerCase() === mockContest.sport.toLowerCase()
        ) || {
          id: `mock-sport-${mockContest.sport.toLowerCase()}`,
          name: mockContest.sport,
          slug: mockContest.sport.toLowerCase(),
          displayName: mockContest.sport,
          isActive: true,
        }

      const contestResponse = {
        id: mockContest.id ?? `mock-contest-${generateId()}`,
        sportId: resolvedSport.id,
        sport: {
          ...resolvedSport,
          rosterSize: (resolvedSport as { rosterSize?: number }).rosterSize ?? 9,
          salaryCap: (resolvedSport as { salaryCap?: number }).salaryCap,
          scoringRules: (resolvedSport as { scoringRules?: Record<string, unknown> }).scoringRules ?? {},
          createdAt: baseDate,
          updatedAt: baseDate,
        },
        creatorId: 'mock-user',
        creator: {
          id: 'mock-user',
          username: 'mockuser',
          name: 'Mock User',
          image: null,
        },
        name: mockContest.name,
        description: mockContest.description ?? null,
        type: mockContest.type,
        status: mockContest.status,
        entryFee: mockContest.entryFee,
        maxEntries: mockContest.maxEntries ?? null,
        currentEntries: mockContest.currentEntries ?? 0,
        prizePool: mockContest.prizePool,
        rosterSize: mockContest.rosterSize ?? 9,
        salaryCap: mockContest.salaryCap ?? 50000,
        scoringRules: mockContest.scoringRules ?? {},
        startTime:
          mockContest.startTime instanceof Date
            ? mockContest.startTime
            : new Date(mockContest.startTime),
        endTime:
          mockContest.endTime instanceof Date
            ? mockContest.endTime
            : mockContest.endTime
            ? new Date(mockContest.endTime)
            : undefined,
        lockTime:
          mockContest.lockTime instanceof Date
            ? mockContest.lockTime
            : mockContest.lockTime
            ? new Date(mockContest.lockTime)
            : undefined,
        isPrivate: mockContest.isPrivate ?? false,
        inviteCode: mockContest.inviteCode ?? null,
        entries: [],
        _count: { entries: mockContest.currentEntries ?? 0 },
        createdAt: baseDate,
        updatedAt: baseDate,
      }

      return NextResponse.json({
        success: true,
        data: contestResponse,
      })
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch contest',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = (await request.json()) as Partial<{
      name: string
      description?: string | null
      type?: ContestType | string
      entryFee?: number
      maxEntries?: number | null
      prizePool?: number
      rosterSize?: number
      salaryCap?: number | null
      scoringRules?: Record<string, unknown>
      startTime?: string | Date
      endTime?: string | Date | null
      lockTime?: string | Date | null
      status?: ContestStatus | string
      isPrivate?: boolean
      inviteCode?: string | null
      sportId?: string
    }>

    const updateData: ContestUpdatePayload = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description

    if (body.type !== undefined) {
      const normalizedType = (typeof body.type === 'string'
        ? body.type.toUpperCase()
        : body.type) as ContestType
      if (Object.values(CONTEST_TYPES).includes(normalizedType)) {
        updateData.type = normalizedType
      }
    }

    if (body.entryFee !== undefined) updateData.entryFee = body.entryFee
    if (body.maxEntries !== undefined) updateData.maxEntries = body.maxEntries
    if (body.prizePool !== undefined) updateData.prizePool = body.prizePool
    if (body.rosterSize !== undefined) updateData.rosterSize = body.rosterSize
    if (body.salaryCap !== undefined) updateData.salaryCap = body.salaryCap
    if (body.scoringRules !== undefined) updateData.scoringRules = body.scoringRules

    if (body.startTime !== undefined) {
      updateData.startTime = new Date(body.startTime)
    }

    if (body.endTime !== undefined) {
      updateData.endTime = body.endTime ? new Date(body.endTime) : null
    }

    if (body.lockTime !== undefined) {
      updateData.lockTime = body.lockTime ? new Date(body.lockTime) : null
    }

    if (body.status !== undefined) {
      const normalizedStatus = (typeof body.status === 'string'
        ? body.status.toUpperCase()
        : body.status) as ContestStatus
      if (Object.values(CONTEST_STATUSES).includes(normalizedStatus)) {
        updateData.status = normalizedStatus
      }
    }

    if (body.isPrivate !== undefined) updateData.isPrivate = body.isPrivate
    if (body.inviteCode !== undefined) updateData.inviteCode = body.inviteCode
    if (body.sportId !== undefined) {
      updateData.sport = { connect: { id: body.sportId } }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid fields provided for update',
        },
        { status: 400 }
      )
    }

    // Check if user is the creator or has admin rights
    const contest = await prisma.contest.findUnique({
      where: { id: params.id },
      select: { creatorId: true },
    })

    if (!contest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contest not found',
        },
        { status: 404 }
      )
    }

    if (contest.creatorId !== session.user.id) {
      // Check if user has admin rights
      const adminRole = await prisma.adminRole.findFirst({
        where: {
          userId: session.user.id,
          role: {
            in: ['SUPER_ADMIN', 'CONTEST_ADMIN'],
          },
        },
      })

      if (!adminRole) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
          },
          { status: 403 }
        )
      }
    }

    // Update contest
    const updatedContest = await prisma.contest.update({
      where: { id: params.id },
      data: updateData,
      include: {
        sport: true,
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedContest,
    })
  } catch (error) {
    console.error('Error updating contest:', error)
    if (isPrismaClientUnavailable(error)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database is not available in mock mode. Contest updates are disabled.',
        },
        { status: 503 }
      )
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update contest',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if user is the creator or has admin rights
    const contest = await prisma.contest.findUnique({
      where: { id: params.id },
      select: { creatorId: true, status: true },
    })

    if (!contest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contest not found',
        },
        { status: 404 }
      )
    }

    if (contest.creatorId !== session.user.id) {
      // Check if user has admin rights
      const adminRole = await prisma.adminRole.findFirst({
        where: {
          userId: session.user.id,
          role: {
            in: ['SUPER_ADMIN', 'CONTEST_ADMIN'],
          },
        },
      })

      if (!adminRole) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
          },
          { status: 403 }
        )
      }
    }

    // Only allow deletion of draft contests
    if (contest.status !== 'DRAFT') {
      return NextResponse.json(
        {
          success: false,
          error: 'Can only delete draft contests',
        },
        { status: 400 }
      )
    }

    // Delete contest
    await prisma.contest.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Contest deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting contest:', error)
    if (isPrismaClientUnavailable(error)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database is not available in mock mode. Contest deletion is disabled.',
        },
        { status: 503 }
      )
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete contest',
      },
      { status: 500 }
    )
  }
}
