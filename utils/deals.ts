import { createClient } from '@/utils/supabase/server'
import { Deal, DealWithUsers, DealWithDetails, InsertDeal, UpdateDeal } from '@/types/database'

export async function createDeal(dealData: InsertDeal): Promise<Deal | null> {
  const supabase = await createClient()
  
  const { data: deal, error } = await supabase
    .from('deals')
    .insert(dealData)
    .select()
    .single()

  if (error) {
    console.error('Error creating deal:', error)
    return null
  }

  return deal
}

export async function getDealByCode(dealCode: string): Promise<DealWithUsers | null> {
  const supabase = await createClient()
  
  const { data: deal, error } = await supabase
    .from('deals')
    .select(`
      *,
      seller:users!deals_seller_id_fkey(*),
      buyer:users!deals_buyer_id_fkey(*)
    `)
    .eq('deal_code', dealCode)
    .eq('link_active', true)
    .single()

  if (error) {
    console.error('Error fetching deal:', error)
    return null
  }

  return deal as DealWithUsers
}

export async function getDealById(dealId: string): Promise<DealWithUsers | null> {
  const supabase = await createClient()
  
  const { data: deal, error } = await supabase
    .from('deals')
    .select(`
      *,
      seller:users!deals_seller_id_fkey(*),
      buyer:users!deals_buyer_id_fkey(*)
    `)
    .eq('id', dealId)
    .single()

  if (error) {
    console.error('Error fetching deal:', error)
    return null
  }

  return deal as DealWithUsers
}

export async function getDealWithDetails(dealId: string): Promise<DealWithDetails | null> {
  const supabase = await createClient()
  
  const { data: deal, error } = await supabase
    .from('deals')
    .select(`
      *,
      seller:users!deals_seller_id_fkey(*),
      buyer:users!deals_buyer_id_fkey(*),
      transactions(*),
      messages(*, sender:users(*)),
      reviews(*, reviewer:users(*), reviewee:users(*))
    `)
    .eq('id', dealId)
    .single()

  if (error) {
    console.error('Error fetching deal with details:', error)
    return null
  }

  return deal as DealWithDetails
}

export async function updateDeal(dealId: string, updates: UpdateDeal): Promise<Deal | null> {
  const supabase = await createClient()
  
  const { data: deal, error } = await supabase
    .from('deals')
    .update(updates)
    .eq('id', dealId)
    .select()
    .single()

  if (error) {
    console.error('Error updating deal:', error)
    return null
  }

  return deal
}

export async function getUserDeals(userId: string, role: 'seller' | 'buyer' | 'all' = 'all'): Promise<DealWithUsers[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('deals')
    .select(`
      *,
      seller:users!deals_seller_id_fkey(*),
      buyer:users!deals_buyer_id_fkey(*)
    `)

  if (role === 'seller') {
    query = query.eq('seller_id', userId)
  } else if (role === 'buyer') {
    query = query.eq('buyer_id', userId)
  } else {
    query = query.or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
  }

  const { data: deals, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user deals:', error)
    return []
  }

  return deals as DealWithUsers[]
}

export async function acceptDeal(dealId: string, buyerId: string): Promise<Deal | null> {
  const supabase = await createClient()
  
  const { data: deal, error } = await supabase
    .from('deals')
    .update({
      buyer_id: buyerId,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', dealId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) {
    console.error('Error accepting deal:', error)
    return null
  }

  return deal
}

export async function cancelDeal(dealId: string, userId: string): Promise<Deal | null> {
  const supabase = await createClient()
  
  const { data: deal, error } = await supabase
    .from('deals')
    .update({
      status: 'cancelled',
      link_active: false,
    })
    .eq('id', dealId)
    .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
    .select()
    .single()

  if (error) {
    console.error('Error cancelling deal:', error)
    return null
  }

  return deal
}

export async function updateDealStatus(
  dealId: string, 
  status: Deal['status'], 
  userId: string
): Promise<Deal | null> {
  const supabase = await createClient()
  
  const updates: UpdateDeal = { status }
  
  // Add timestamp for specific status changes
  const now = new Date().toISOString()
  switch (status) {
    case 'funded':
      updates.funded_at = now
      break
    case 'shipped':
      updates.shipped_at = now
      break
    case 'delivered':
      updates.delivered_at = now
      break
    case 'completed':
      updates.completed_at = now
      break
  }

  const { data: deal, error } = await supabase
    .from('deals')
    .update(updates)
    .eq('id', dealId)
    .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
    .select()
    .single()

  if (error) {
    console.error('Error updating deal status:', error)
    return null
  }

  return deal
}
