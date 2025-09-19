import { NextRequest, NextResponse } from 'next/server'
import { prisma, isPrismaClientUnavailable } from '@/lib/prisma'
import { mockData } from '@/lib/mock-config'

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
    if (isPrismaClientUnavailable(error)) {
      const searchParams = request.nextUrl.searchParams
      const active = searchParams.get('active')
      const shouldFilterActive = active === 'true'

      const fallbackSports = mockData.sports
        .filter(sport => (shouldFilterActive ? sport.isActive : true))
        .map(sport => ({
          ...sport,
          rosterSize: sport?.rosterSize ?? 0,
          createdAt: new Date('2023-01-01T00:00:00.000Z'),
          updatedAt: new Date('2023-01-01T00:00:00.000Z'),
        }))

      return NextResponse.json({
        success: true,
        data: fallbackSports,
      })
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch sports',
      },
      { status: 500 }
    )
  }
}
