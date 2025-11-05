import { getDealByCode } from '@/utils/deals'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { dealCode: string } }
) {
  try {
    const { dealCode } = params

    const deal = await getDealByCode(dealCode)

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found or link is inactive' },
        { status: 404 }
      )
    }

    // Check if deal has expired
    if (deal.expires_at && new Date(deal.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Deal link has expired' },
        { status: 410 }
      )
    }

    // Return public deal information
    return NextResponse.json({
      deal: {
        id: deal.id,
        deal_code: deal.deal_code,
        title: deal.title,
        description: deal.description,
        amount: deal.amount,
        currency: deal.currency,
        status: deal.status,
        delivery_method: deal.delivery_method,
        seller: {
          id: deal.seller.id,
          full_name: deal.seller.full_name,
          avatar_url: deal.seller.avatar_url,
          trust_score: deal.seller.trust_score,
          total_deals: deal.seller.total_deals,
          successful_deals: deal.seller.successful_deals,
        },
        buyer: deal.buyer ? {
          id: deal.buyer.id,
          full_name: deal.buyer.full_name,
          avatar_url: deal.buyer.avatar_url,
        } : null,
        created_at: deal.created_at,
        expires_at: deal.expires_at,
      },
    })

  } catch (error) {
    console.error('Get deal by code error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
