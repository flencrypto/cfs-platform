import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CONTEST_STATUSES, CONTEST_TYPES, ContestStatus, ContestType } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type ContestQueryFilters = {
  sport?: { slug: string }
  status?: ContestStatus
  type?: ContestType
  entryFee?: {
    gte?: number
    lte?: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const pageParam = Number.parseInt(searchParams.get('page') || '1', 10)
    const limitParam = Number.parseInt(searchParams.get('limit') || '10', 10)
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
    const limit = Number.isNaN(limitParam) || limitParam < 1 ? 10 : limitParam
    const sport = searchParams.get('sport') || undefined
    const statusParam = searchParams.get('status')
    const typeParam = searchParams.get('type')
    const minEntryFee = searchParams.get('minEntryFee')
    const maxEntryFee = searchParams.get('maxEntryFee')

    const status = Object.values(CONTEST_STATUSES).includes(
      (statusParam || '').toUpperCase() as ContestStatus
    )
      ? ((statusParam || '').toUpperCase() as ContestStatus)
      : undefined

    const type = Object.values(CONTEST_TYPES).includes(
      (typeParam || '').toUpperCase() as ContestType
    )
      ? ((typeParam || '').toUpperCase() as ContestType)
      : undefined

    const skip = (page - 1) * limit

    // Build where clause
    const where: ContestQueryFilters = {}
    
    if (sport) {
      where.sport = { slug: sport }
    }
    
    if (status) {
      where.status = status
    }
    
    if (type) {
      where.type = type
    }
    
    if (minEntryFee || maxEntryFee) {
      const minFee = minEntryFee ? Number.parseFloat(minEntryFee) : undefined
      const maxFee = maxEntryFee ? Number.parseFloat(maxEntryFee) : undefined
      where.entryFee = {}
      if (typeof minFee === 'number' && !Number.isNaN(minFee)) {
        where.entryFee.gte = minFee
      }
      if (typeof maxFee === 'number' && !Number.isNaN(maxFee)) {
        where.entryFee.lte = maxFee
      }
      if (Object.keys(where.entryFee).length === 0) {
        delete where.entryFee
      }
    }

    // Get contests
    const [contests, total] = await Promise.all([
      prisma.contest.findMany({
        where,
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
          _count: {
            select: {
              entries: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.contest.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: contests,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Error fetching contests:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch contests',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = (await request.json()) as {
      sportId?: string
      name?: string
      description?: string | null
      type?: ContestType | string
      entryFee?: number | string
      maxEntries?: number | string | null
      prizePool?: number | string
      rosterSize?: number | string
      salaryCap?: number | string | null
      scoringRules?: Record<string, unknown>
      startTime?: string | Date
      endTime?: string | Date | null
      lockTime?: string | Date | null
      isPrivate?: boolean
    }

    const {
      sportId,
      name,
      description,
      type,
      entryFee,
      maxEntries,
      prizePool,
      rosterSize,
      salaryCap,
      scoringRules,
      startTime,
      endTime,
      lockTime,
      isPrivate,
    } = body

    const normalizedType =
      typeof type === 'string' ? (type.toUpperCase() as ContestType) : type
    const parsedEntryFee = typeof entryFee === 'string' ? Number(entryFee) : entryFee
    const parsedPrizePool = typeof prizePool === 'string' ? Number(prizePool) : prizePool
    const parsedRosterSize =
      typeof rosterSize === 'string' ? Number.parseInt(rosterSize, 10) : rosterSize
    const parsedMaxEntries =
      maxEntries === null || maxEntries === undefined
        ? null
        : typeof maxEntries === 'string'
        ? Number.parseInt(maxEntries, 10)
        : maxEntries
    const parsedSalaryCap =
      salaryCap === null || salaryCap === undefined
        ? null
        : typeof salaryCap === 'string'
        ? Number(salaryCap)
        : salaryCap

    const maxEntriesInvalid = parsedMaxEntries !== null && Number.isNaN(parsedMaxEntries)
    const salaryCapInvalid = parsedSalaryCap !== null && Number.isNaN(parsedSalaryCap)

    if (
      !sportId ||
      !name ||
      !normalizedType ||
      !Object.values(CONTEST_TYPES).includes(normalizedType) ||
      parsedEntryFee === undefined ||
      Number.isNaN(parsedEntryFee) ||
      parsedPrizePool === undefined ||
      Number.isNaN(parsedPrizePool) ||
      parsedRosterSize === undefined ||
      Number.isNaN(parsedRosterSize) ||
      maxEntriesInvalid ||
      salaryCapInvalid ||
      !startTime
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    // Create contest
    const contest = await prisma.contest.create({
      data: {
        sportId,
        creatorId: session.user.id,
        name,
        description,
        type: normalizedType,
        entryFee: parsedEntryFee,
        maxEntries: parsedMaxEntries,
        prizePool: parsedPrizePool,
        rosterSize: parsedRosterSize,
        salaryCap: parsedSalaryCap,
        scoringRules: scoringRules ?? {},
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        lockTime: lockTime ? new Date(lockTime) : null,
        isPrivate: isPrivate ?? false,
        status: 'DRAFT',
      },
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
      data: contest,
    })
  } catch (error) {
    console.error('Error creating contest:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create contest',
      },
      { status: 500 }
    )
  }
}
