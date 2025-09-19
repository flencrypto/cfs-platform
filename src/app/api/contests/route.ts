import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRequestLogger } from '@/lib/logger'
import { CONTEST_STATUSES, CONTEST_TYPES, ContestStatus, ContestType } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const contestStatusValues = Object.values(CONTEST_STATUSES) as [
  ContestStatus,
  ...ContestStatus[]
]
const contestTypeValues = Object.values(CONTEST_TYPES) as [ContestType, ...ContestType[]]

const contestsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sport: z.string().min(1).optional(),
    status: z.enum(contestStatusValues).optional(),
    type: z.enum(contestTypeValues).optional(),
    minEntryFee: z.coerce.number().nonnegative().optional(),
    maxEntryFee: z.coerce.number().nonnegative().optional(),
  })
  .refine(
    data =>
      data.minEntryFee === undefined ||
      data.maxEntryFee === undefined ||
      data.maxEntryFee >= data.minEntryFee,
    {
      message: 'maxEntryFee must be greater than or equal to minEntryFee',
      path: ['maxEntryFee'],
    }
  )

const contestInputSchema = z
  .object({
    sportId: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    type: z.enum(contestTypeValues),
    entryFee: z.coerce.number().nonnegative(),
    maxEntries: z.coerce.number().int().positive().optional(),
    prizePool: z.coerce.number().nonnegative(),
    rosterSize: z.coerce.number().int().positive(),
    salaryCap: z.coerce.number().nonnegative().optional(),
    scoringRules: z.record(z.any()).optional(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date().optional(),
    lockTime: z.coerce.date().optional(),
    isPrivate: z.coerce.boolean().optional(),
  })
  .refine(data => !data.endTime || data.endTime >= data.startTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  })
  .refine(data => !data.lockTime || data.lockTime <= data.startTime, {
    message: 'lockTime must be before or equal to startTime',
    path: ['lockTime'],
  })

export async function GET(request: NextRequest) {
  const requestLogger = getRequestLogger(request)
  const queryObject = Object.fromEntries(request.nextUrl.searchParams.entries())
  const parsedQuery = contestsQuerySchema.safeParse(queryObject)

  if (!parsedQuery.success) {
    requestLogger.warn({ issues: parsedQuery.error.flatten() }, 'Invalid contest query received')
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid query parameters',
        details: parsedQuery.error.flatten(),
      },
      { status: 400 }
    )
  }

  const { page, limit, sport, status, type, minEntryFee, maxEntryFee } = parsedQuery.data
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}

  if (sport) {
    where.sport = { is: { slug: sport } }
  }

  if (status) {
    where.status = status
  }

  if (type) {
    where.type = type
  }

  if (minEntryFee !== undefined || maxEntryFee !== undefined) {
    const entryFeeFilter: Record<string, number> = {}
    if (minEntryFee !== undefined) {
      entryFeeFilter.gte = minEntryFee
    }
    if (maxEntryFee !== undefined) {
      entryFeeFilter.lte = maxEntryFee
    }
    where.entryFee = entryFeeFilter
  }

  try {
    requestLogger.debug(
      { page, limit, sport, status, type, minEntryFee, maxEntryFee },
      'Fetching contests'
    )

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
    requestLogger.error({ error }, 'Error fetching contests')
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
  const requestLogger = getRequestLogger(request)

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

    const payload = await request.json()
    const parsedBody = contestInputSchema.safeParse(payload)

    if (!parsedBody.success) {
      requestLogger.warn({ issues: parsedBody.error.flatten() }, 'Invalid contest payload received')
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid contest payload',
          details: parsedBody.error.flatten(),
        },
        { status: 400 }
      )
    }

    const data = parsedBody.data

    const contest = await prisma.contest.create({
      data: {
        sportId: data.sportId,
        creatorId: session.user.id,
        name: data.name,
        description: data.description,
        type: data.type,
        entryFee: data.entryFee,
        maxEntries: data.maxEntries ?? null,
        prizePool: data.prizePool,
        rosterSize: data.rosterSize,
        salaryCap: data.salaryCap ?? null,
        scoringRules: data.scoringRules ?? {},
        startTime: data.startTime,
        endTime: data.endTime ?? null,
        lockTime: data.lockTime ?? null,
        isPrivate: data.isPrivate ?? false,
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

    requestLogger.info({ contestId: contest.id }, 'Contest created successfully')

    return NextResponse.json(
      {
        success: true,
        data: contest,
      },
      { status: 201 }
    )
  } catch (error) {
    requestLogger.error({ error }, 'Error creating contest')
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create contest',
      },
      { status: 500 }
    )
  }
}
