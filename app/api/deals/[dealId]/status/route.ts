import { getCurrentUser } from '@/utils/auth'
import { updateDealStatus, getDealById } from '@/utils/deals'
import { NextRequest, NextResponse } from 'next/server'
import { Deal } from '@/types/database'

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
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses: Deal['status'][] = [
      'pending', 'accepted', 'funded', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed'
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get the deal first to check permissions and current status
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

    // Validate status transitions based on user role and current status
    const isseller = deal.seller_id === user.id
    const isBuyer = deal.buyer_id === user.id

    // Define allowed status transitions
    const allowedTransitions: Record<Deal['status'], { seller: Deal['status'][], buyer: Deal['status'][] }> = {
      pending: { seller: ['cancelled'], buyer: [] },
      accepted: { seller: ['cancelled'], buyer: ['funded', 'cancelled'] },
      funded: { seller: ['shipped', 'cancelled'], buyer: ['cancelled'] },
      shipped: { seller: [], buyer: ['delivered'] },
      delivered: { seller: ['completed'], buyer: ['completed'] },
      completed: { seller: [], buyer: [] },
      cancelled: { seller: [], buyer: [] },
      disputed: { seller: [], buyer: [] },
    }

    const currentTransitions = allowedTransitions[deal.status]
    const userAllowedStatuses = isseller ? currentTransitions.seller : currentTransitions.buyer

    if (!userAllowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${deal.status} to ${status}` },
        { status: 400 }
      )
    }

    const updatedDeal = await updateDealStatus(dealId, status, user.id)

    if (!updatedDeal) {
      return NextResponse.json(
        { error: 'Failed to update deal status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Deal status updated successfully',
      deal: updatedDeal,
    })

  } catch (error) {
    console.error('Update deal status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
