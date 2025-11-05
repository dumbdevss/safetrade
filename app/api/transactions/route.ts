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

    const supabase = await createClient()

    let query = supabase
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

    if (dealId) {
      query = query.eq('deal_id', dealId)
    }

    const { data: transactions, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // Filter transactions to only show those the user has access to
    const userTransactions = transactions?.filter(transaction => {
      const deal = transaction.deal
      return deal.seller_id === user.id || deal.buyer_id === user.id
    }) || []

    return NextResponse.json({
      transactions: userTransactions,
    })

  } catch (error) {
    console.error('Get transactions error:', error)
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

    const { dealId, amount, transactionType, paymentMethod, paymentReference } = await request.json()

    if (!dealId || !amount || !transactionType) {
      return NextResponse.json(
        { error: 'Deal ID, amount, and transaction type are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify the deal exists and user has access
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*')
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

    // Create the transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        deal_id: dealId,
        amount: parseFloat(amount),
        transaction_type: transactionType,
        payment_method: paymentMethod || null,
        payment_reference: paymentReference || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating transaction:', error)
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Transaction created successfully',
      transaction,
    }, { status: 201 })

  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
