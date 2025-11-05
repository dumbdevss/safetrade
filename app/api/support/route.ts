import { getCurrentUser } from '@/utils/auth'
import { createClient } from '@/utils/supabase/server'
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

    const supabase = await createClient()

    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        deal:deals(id, title, deal_code)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching support tickets:', error)
      return NextResponse.json(
        { error: 'Failed to fetch support tickets' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      tickets: tickets || [],
    })

  } catch (error) {
    console.error('Get support tickets error:', error)
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

    const { subject, description, priority, dealId } = await request.json()

    if (!subject || !description) {
      return NextResponse.json(
        { error: 'Subject and description are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // If dealId is provided, verify user has access to the deal
    if (dealId) {
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .select('seller_id, buyer_id')
        .eq('id', dealId)
        .single()

      if (dealError || !deal) {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 404 }
        )
      }

      if (deal.seller_id !== user.id && deal.buyer_id !== user.id) {
        return NextResponse.json(
          { error: 'Not authorized for this deal' },
          { status: 403 }
        )
      }
    }

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        deal_id: dealId || null,
        subject,
        description,
        priority: priority || 'medium',
      })
      .select(`
        *,
        deal:deals(id, title, deal_code)
      `)
      .single()

    if (error) {
      console.error('Error creating support ticket:', error)
      return NextResponse.json(
        { error: 'Failed to create support ticket' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Support ticket created successfully',
      ticket,
    }, { status: 201 })

  } catch (error) {
    console.error('Create support ticket error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
