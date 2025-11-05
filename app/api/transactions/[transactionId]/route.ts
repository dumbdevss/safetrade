import { getCurrentUser } from '@/utils/auth'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { transactionId } = params
    const supabase = await createClient()

    const { data: transaction, error } = await supabase
      .from('transactions')
      .select(`
        *,
        deal:deals(
          id,
          title,
          seller_id,
          buyer_id,
          seller:users!deals_seller_id_fkey(id, full_name, avatar_url),
          buyer:users!deals_buyer_id_fkey(id, full_name, avatar_url)
        )
      `)
      .eq('id', transactionId)
      .single()

    if (error || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this transaction
    const deal = transaction.deal
    if (deal.seller_id !== user.id && deal.buyer_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to view this transaction' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      transaction,
    })

  } catch (error) {
    console.error('Get transaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { transactionId } = params
    const { status, paymentReference } = await request.json()

    const supabase = await createClient()

    // Get the transaction first to check permissions
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select(`
        *,
        deal:deals(seller_id, buyer_id)
      `)
      .eq('id', transactionId)
      .single()

    if (fetchError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this transaction
    const deal = transaction.deal
    if (deal.seller_id !== user.id && deal.buyer_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this transaction' },
        { status: 403 }
      )
    }

    // Prepare updates
    const updates: any = {}
    if (status) updates.status = status
    if (paymentReference) updates.payment_reference = paymentReference

    const { data: updatedTransaction, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating transaction:', error)
      return NextResponse.json(
        { error: 'Failed to update transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction,
    })

  } catch (error) {
    console.error('Update transaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
