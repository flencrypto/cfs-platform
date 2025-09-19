import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Contest, ContestStatus, ContestType } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sport = searchParams.get('sport')
    const status = searchParams.get('status') as ContestStatus
    const type = searchParams.get('type') as ContestType
    const minEntryFee = searchParams.get('minEntryFee')
    const maxEntryFee = searchParams.get('maxEntryFee')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
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
      where.entryFee = {}
      if (minEntryFee) {
        where.entryFee.gte = parseFloat(minEntryFee)
      }
      if (maxEntryFee) {
        where.entryFee.lte = parseFloat(maxEntryFee)
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

    const body = await request.json()
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

    // Validate required fields
    if (!sportId || !name || !type || !entryFee || !prizePool || !rosterSize || !startTime) {
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
        type,
        entryFee: parseFloat(entryFee),
        maxEntries: maxEntries ? parseInt(maxEntries) : null,
        prizePool: parseFloat(prizePool),
        rosterSize: parseInt(rosterSize),
        salaryCap: salaryCap ? parseFloat(salaryCap) : null,
        scoringRules: scoringRules || {},
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        lockTime: lockTime ? new Date(lockTime) : null,
        isPrivate: isPrivate || false,
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
