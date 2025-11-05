import { getCurrentUser } from '@/utils/auth'
import { createDeal, getUserDeals } from '@/utils/deals'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') as 'seller' | 'buyer' | 'all' || 'all'

    const deals = await getUserDeals(user.id, role)

    return NextResponse.json({
      deals,
    })

  } catch (error) {
    console.error('Get deals error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const dealData = await request.json()

    // Validate required fields
    if (!dealData.title || !dealData.amount) {
      return NextResponse.json(
        { error: 'Title and amount are required' },
        { status: 400 }
      )
    }

    if (dealData.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    const newDeal = await createDeal({
      seller_id: user.id,
      title: dealData.title,
      description: dealData.description || null,
      amount: parseFloat(dealData.amount),
      currency: dealData.currency || 'USD',
      delivery_method: dealData.delivery_method || null,
      expires_at: dealData.expires_at || null,
    })

    if (!newDeal) {
      return NextResponse.json(
        { error: 'Failed to create deal' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Deal created successfully',
      deal: newDeal,
    }, { status: 201 })

  } catch (error) {
    console.error('Create deal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
