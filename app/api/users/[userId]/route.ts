import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const supabase = await createClient()

    // Get public user profile
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        avatar_url,
        bio,
        location,
        trust_score,
        total_deals,
        successful_deals,
        created_at
      `)
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        reviewer:users!reviews_reviewer_id_fkey(id, full_name, avatar_url)
      `)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
    }

    return NextResponse.json({
      user,
      reviews: reviews || [],
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
