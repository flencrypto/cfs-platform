import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const body = await request.json()
    const updateData = { ...body }

    // Remove fields that shouldn't be updated directly
    delete updateData.id
    delete updateData.createdAt
    delete updateData.updatedAt
    delete updateData.creatorId

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
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete contest',
      },
      { status: 500 }
    )
  }
}
