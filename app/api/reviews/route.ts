import { getCurrentUser } from '@/utils/auth'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const dealId = searchParams.get('dealId')

    const supabase = await createClient()

    let query = supabase
      .from('reviews')
      .select(`
        *,
        reviewer:users!reviews_reviewer_id_fkey(id, full_name, avatar_url),
        reviewee:users!reviews_reviewee_id_fkey(id, full_name, avatar_url),
        deal:deals(id, title)
      `)

    if (userId) {
      query = query.eq('reviewee_id', userId)
    }

    if (dealId) {
      query = query.eq('deal_id', dealId)
    }

    const { data: reviews, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      reviews: reviews || [],
    })

  } catch (error) {
    console.error('Get reviews error:', error)
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

    const { dealId, revieweeId, rating, comment } = await request.json()

    if (!dealId || !revieweeId || !rating) {
      return NextResponse.json(
        { error: 'Deal ID, reviewee ID, and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (revieweeId === user.id) {
      return NextResponse.json(
        { error: 'Cannot review yourself' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify the deal exists and is completed
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

    if (deal.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only review completed deals' },
        { status: 400 }
      )
    }

    // Verify user was part of the deal
    if (deal.seller_id !== user.id && deal.buyer_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to review this deal' },
        { status: 403 }
      )
    }

    // Verify reviewee was the other party in the deal
    if (deal.seller_id !== revieweeId && deal.buyer_id !== revieweeId) {
      return NextResponse.json(
        { error: 'Invalid reviewee for this deal' },
        { status: 400 }
      )
    }

    // Check if review already exists
    const { data: existingReview, error: existingError } = await supabase
      .from('reviews')
      .select('id')
      .eq('deal_id', dealId)
      .eq('reviewer_id', user.id)
      .eq('reviewee_id', revieweeId)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this deal' },
        { status: 400 }
      )
    }

    // Create the review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        deal_id: dealId,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating,
        comment: comment || null,
      })
      .select(`
        *,
        reviewer:users!reviews_reviewer_id_fkey(id, full_name, avatar_url),
        reviewee:users!reviews_reviewee_id_fkey(id, full_name, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Error creating review:', error)
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      )
    }

    // Update reviewee's trust metrics
    const { data: revieweeStats, error: statsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', revieweeId)

    if (!statsError && revieweeStats) {
      const totalReviews = revieweeStats.length
      const averageRating = revieweeStats.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      const trustScore = Math.round(averageRating * 20) // Convert to 0-100 scale

      await supabase
        .from('users')
        .update({
          trust_score: trustScore,
        })
        .eq('id', revieweeId)
    }

    return NextResponse.json({
      message: 'Review created successfully',
      review,
    }, { status: 201 })

  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
