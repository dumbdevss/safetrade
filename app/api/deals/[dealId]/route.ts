import { getCurrentUser } from '@/utils/auth'
import { getDealById, updateDeal, cancelDeal } from '@/utils/deals'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const user = await getCurrentUser()
    const { dealId } = params

    const deal = await getDealById(dealId)

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this deal
    if (!user || (deal.seller_id !== user.id && deal.buyer_id !== user.id)) {
      // Return limited public info for non-participants
      return NextResponse.json({
        deal: {
          id: deal.id,
          deal_code: deal.deal_code,
          title: deal.title,
          description: deal.description,
          amount: deal.amount,
          currency: deal.currency,
          status: deal.status,
          seller: {
            id: deal.seller.id,
            full_name: deal.seller.full_name,
            avatar_url: deal.seller.avatar_url,
            trust_score: deal.seller.trust_score,
            total_deals: deal.seller.total_deals,
            successful_deals: deal.seller.successful_deals,
          },
          created_at: deal.created_at,
        },
      })
    }

    return NextResponse.json({
      deal,
    })

  } catch (error) {
    console.error('Get deal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { dealId } = params
    const updates = await request.json()

    // Get the deal first to check permissions
    const deal = await getDealById(dealId)

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to update this deal
    if (deal.seller_id !== user.id && deal.buyer_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this deal' },
        { status: 403 }
      )
    }

    // Only allow certain fields to be updated
    const allowedUpdates: any = {}

    if (updates.title && deal.seller_id === user.id && deal.status === 'pending') {
      allowedUpdates.title = updates.title
    }

    if (updates.description && deal.seller_id === user.id && deal.status === 'pending') {
      allowedUpdates.description = updates.description
    }

    if (updates.delivery_address && deal.buyer_id === user.id) {
      allowedUpdates.delivery_address = updates.delivery_address
    }

    if (updates.tracking_number && deal.seller_id === user.id) {
      allowedUpdates.tracking_number = updates.tracking_number
    }

    const updatedDeal = await updateDeal(dealId, allowedUpdates)

    if (!updatedDeal) {
      return NextResponse.json(
        { error: 'Failed to update deal' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Deal updated successfully',
      deal: updatedDeal,
    })

  } catch (error) {
    console.error('Update deal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { dealId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { dealId } = params

    const cancelledDeal = await cancelDeal(dealId, user.id)

    if (!cancelledDeal) {
      return NextResponse.json(
        { error: 'Failed to cancel deal or deal not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Deal cancelled successfully',
      deal: cancelledDeal,
    })

  } catch (error) {
    console.error('Cancel deal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
