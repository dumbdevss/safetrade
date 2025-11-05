import { getCurrentUser } from '@/utils/auth'
import { acceptDeal, getDealById } from '@/utils/deals'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { dealId } = await params

    // Check if deal exists and is in pending status
    const deal = await getDealById(dealId)

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    if (deal.status !== 'pending') {
      return NextResponse.json(
        { error: 'Deal is not available for acceptance' },
        { status: 400 }
      )
    }

    if (deal.seller_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot accept your own deal' },
        { status: 400 }
      )
    }

    if (deal.buyer_id && deal.buyer_id !== user.id) {
      return NextResponse.json(
        { error: 'Deal already has a buyer' },
        { status: 400 }
      )
    }

    const acceptedDeal = await acceptDeal(dealId, user.id)

    if (!acceptedDeal) {
      return NextResponse.json(
        { error: 'Failed to accept deal' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Deal accepted successfully',
      deal: acceptedDeal,
    })

  } catch (error) {
    console.error('Accept deal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
