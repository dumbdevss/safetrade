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

    const { searchParams } = new URL(request.url)
    const dealId = searchParams.get('dealId')

    if (!dealId) {
      return NextResponse.json(
        { error: 'Deal ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // First verify user has access to this deal
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
        { error: 'Not authorized to view messages for this deal' },
        { status: 403 }
      )
    }

    // Get messages for the deal
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users(id, full_name, avatar_url)
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      messages: messages || [],
    })

  } catch (error) {
    console.error('Get messages error:', error)
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

    const { dealId, content, messageType, fileUrl, fileName, fileSize } = await request.json()

    if (!dealId || !content) {
      return NextResponse.json(
        { error: 'Deal ID and content are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify user has access to this deal
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
        { error: 'Not authorized to send messages for this deal' },
        { status: 403 }
      )
    }

    // Create the message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        deal_id: dealId,
        sender_id: user.id,
        content,
        message_type: messageType || 'text',
        file_url: fileUrl || null,
        file_name: fileName || null,
        file_size: fileSize || null,
      })
      .select(`
        *,
        sender:users(id, full_name, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Error creating message:', error)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Message sent successfully',
      data: message,
    }, { status: 201 })

  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
