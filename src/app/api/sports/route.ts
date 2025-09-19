import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')

    const where: any = {}
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
