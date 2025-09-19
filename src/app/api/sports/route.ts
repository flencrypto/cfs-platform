import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const active = searchParams.get('active')

    const where: { isActive?: boolean } = {}
    if (active === 'true') {
      where.isActive = true
    }

    const sports = await prisma.sport.findMany({
      where,
      orderBy: {
        displayName: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: sports,
    })
  } catch (error) {
    console.error('Error fetching sports:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sports',
      },
      { status: 500 }
    )
  }
}
