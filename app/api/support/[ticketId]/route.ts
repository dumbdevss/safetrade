import { getCurrentUser } from '@/utils/auth'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { ticketId } = await params
    const supabase = await createClient()

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        deal:deals(id, title, deal_code)
      `)
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .single()

    if (error || !ticket) {
      return NextResponse.json(
        { error: 'Support ticket not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ticket,
    })

  } catch (error) {
    console.error('Get support ticket error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { ticketId } = await params
    const { subject, description, priority } = await request.json()

    const supabase = await createClient()

    // Get the ticket first to check ownership
    const { data: existingTicket, error: fetchError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingTicket) {
      return NextResponse.json(
        { error: 'Support ticket not found' },
        { status: 404 }
      )
    }

    // Only allow updates if ticket is still open
    if (existingTicket.status !== 'open') {
      return NextResponse.json(
        { error: 'Cannot update closed or resolved tickets' },
        { status: 400 }
      )
    }

    const updates: any = {}
    if (subject) updates.subject = subject
    if (description) updates.description = description
    if (priority) updates.priority = priority

    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .select(`
        *,
        deal:deals(id, title, deal_code)
      `)
      .single()

    if (error) {
      console.error('Error updating support ticket:', error)
      return NextResponse.json(
        { error: 'Failed to update support ticket' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Support ticket updated successfully',
      ticket,
    })

  } catch (error) {
    console.error('Update support ticket error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
