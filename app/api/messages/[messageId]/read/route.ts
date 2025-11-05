import { getCurrentUser } from '@/utils/auth'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { messageId } = await params
    const supabase = await createClient()

    // Get the message first to check permissions
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select(`
        *,
        deal:deals(seller_id, buyer_id)
      `)
      .eq('id', messageId)
      .single()

    if (fetchError || !message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this message
    const deal = message.deal
    if (deal.seller_id !== user.id && deal.buyer_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to mark this message as read' },
        { status: 403 }
      )
    }

    // Don't mark own messages as read
    if (message.sender_id === user.id) {
      return NextResponse.json({
        message: 'Cannot mark own message as read',
      })
    }

    // Mark message as read
    const { data: updatedMessage, error } = await supabase
      .from('messages')
      .update({
        read_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select()
      .single()

    if (error) {
      console.error('Error marking message as read:', error)
      return NextResponse.json(
        { error: 'Failed to mark message as read' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Message marked as read',
      data: updatedMessage,
    })

  } catch (error) {
    console.error('Mark message as read error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
