import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, isPrismaClientUnavailable } from '@/lib/prisma'
import { mockData } from '@/lib/mock-config'
import { generateId } from '@/lib/utils'
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

  try {

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
    if (isPrismaClientUnavailable(error)) {
      const searchParams = request.nextUrl.searchParams
      const sportFilter = searchParams.get('sport')?.toLowerCase() ?? null
      const statusFilter = searchParams.get('status')?.toUpperCase() ?? null
      const typeFilter = searchParams.get('type')?.toUpperCase() ?? null
      const minEntryFee = searchParams.get('minEntryFee')
      const maxEntryFee = searchParams.get('maxEntryFee')

      const minFee = minEntryFee ? Number.parseFloat(minEntryFee) : undefined
      const maxFee = maxEntryFee ? Number.parseFloat(maxEntryFee) : undefined

      const sportsMap = new Map(
        mockData.sports.map(sport => [sport.slug.toLowerCase(), sport])
      )

      const fallbackContests = mockData.contests
        .filter(contest => {
          const sportMatch = (() => {
            if (!sportFilter) {
              return true
            }

            const matchedSport =
              sportsMap.get(sportFilter) ||
              mockData.sports.find(
                sport => sport.displayName.toLowerCase() === sportFilter || sport.name.toLowerCase() === sportFilter
              ) ||
              null

            if (!matchedSport) {
              return false
            }

            return (
              matchedSport.slug.toLowerCase() === sportFilter ||
              matchedSport.displayName.toLowerCase() === contest.sport.toLowerCase() ||
              matchedSport.name.toLowerCase() === contest.sport.toLowerCase()
            )
          })()

          if (!sportMatch) {
            return false
          }

          const statusMatch = statusFilter ? contest.status === statusFilter : true
          if (!statusMatch) {
            return false
          }

          const typeMatch = typeFilter ? contest.type === typeFilter : true
          if (!typeMatch) {
            return false
          }

          if (minFee !== undefined && contest.entryFee < minFee) {
            return false
          }

          if (maxFee !== undefined && contest.entryFee > maxFee) {
            return false
          }

          return true
        })
        .map(contest => {
          const resolvedSport =
            mockData.sports.find(
              sport =>
                sport.slug === contest.sport.toLowerCase() ||
                sport.displayName.toLowerCase() === contest.sport.toLowerCase() ||
                sport.name.toLowerCase() === contest.sport.toLowerCase()
            ) || {
              id: `mock-sport-${contest.sport.toLowerCase()}`,
              name: contest.sport,
              slug: contest.sport.toLowerCase(),
              displayName: contest.sport,
              isActive: true,
            }

          const baseDate = new Date('2023-01-01T00:00:00.000Z')

          return {
            id: contest.id ?? `mock-contest-${generateId()}`,
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
            name: contest.name,
            description: contest.description ?? null,
            type: contest.type,
            status: contest.status,
            entryFee: contest.entryFee,
            maxEntries: contest.maxEntries ?? null,
            currentEntries: contest.currentEntries ?? 0,
            prizePool: contest.prizePool,
            rosterSize: contest.rosterSize ?? 9,
            salaryCap: contest.salaryCap ?? 50000,
            scoringRules: contest.scoringRules ?? {},
            startTime: contest.startTime instanceof Date ? contest.startTime : new Date(contest.startTime),
            endTime:
              contest.endTime instanceof Date
                ? contest.endTime
                : contest.endTime
                ? new Date(contest.endTime)
                : undefined,
            lockTime:
              contest.lockTime instanceof Date
                ? contest.lockTime
                : contest.lockTime
                ? new Date(contest.lockTime)
                : undefined,
            isPrivate: contest.isPrivate ?? false,
            inviteCode: contest.inviteCode ?? null,
            entries: [],
            createdAt: baseDate,
            updatedAt: baseDate,
            _count: { entries: contest.currentEntries ?? 0 },
          }
        })

      const total = fallbackContests.length
      const totalPages = Math.ceil(total / limit)
      const skip = (page - 1) * limit
      const paginatedContests = fallbackContests.slice(skip, skip + limit)

      return NextResponse.json({
        success: true,
        data: paginatedContests,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      })
    }
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
    if (isPrismaClientUnavailable(error)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database is not available in mock mode. Contest mutations are disabled.',
        },
        { status: 503 }
      )
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create contest',
      },
      { status: 500 }
    )
  }
}
