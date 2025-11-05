-- SafeTrade Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with verification status
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    full_name TEXT,
    avatar_url TEXT,
    
    -- Verification status
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    id_verified BOOLEAN DEFAULT FALSE,
    
    -- Trust metrics
    trust_score INTEGER DEFAULT 0,
    total_deals INTEGER DEFAULT 0,
    successful_deals INTEGER DEFAULT 0,
    
    -- Profile
    bio TEXT,
    location TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deals table
CREATE TABLE public.deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_code TEXT UNIQUE NOT NULL, -- For shareable links (e.g., xyz123)
    
    -- Deal parties
    seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Deal details
    title TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    
    -- Deal status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'funded', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed')),
    
    -- Link management
    link_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery details
    delivery_method TEXT, -- 'physical', 'digital', 'service'
    delivery_address TEXT,
    tracking_number TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    funded_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Transactions table for escrow management
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    
    -- Transaction details
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('escrow_deposit', 'escrow_release', 'refund', 'fee')),
    
    -- Payment details
    payment_method TEXT,
    payment_reference TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table for deal communication
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Message content
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    
    -- File attachments
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Review details
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support tickets table
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    
    -- Ticket details
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    
    -- Assignment
    assigned_to TEXT, -- Admin/support agent
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_deals_seller_id ON public.deals(seller_id);
CREATE INDEX idx_deals_buyer_id ON public.deals(buyer_id);
CREATE INDEX idx_deals_deal_code ON public.deals(deal_code);
CREATE INDEX idx_deals_status ON public.deals(status);
CREATE INDEX idx_transactions_deal_id ON public.transactions(deal_id);
CREATE INDEX idx_messages_deal_id ON public.messages(deal_id);
CREATE INDEX idx_reviews_reviewee_id ON public.reviews(reviewee_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own profile and public profiles
CREATE POLICY "Users can view public profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Deals policies
CREATE POLICY "Anyone can view active deals by deal_code" ON public.deals
    FOR SELECT USING (link_active = true);

CREATE POLICY "Sellers can create deals" ON public.deals
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Deal parties can update deals" ON public.deals
    FOR UPDATE USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Transactions policies
CREATE POLICY "Deal parties can view transactions" ON public.transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.deals 
            WHERE deals.id = transactions.deal_id 
            AND (deals.seller_id = auth.uid() OR deals.buyer_id = auth.uid())
        )
    );

-- Messages policies
CREATE POLICY "Deal parties can view messages" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.deals 
            WHERE deals.id = messages.deal_id 
            AND (deals.seller_id = auth.uid() OR deals.buyer_id = auth.uid())
        )
    );

CREATE POLICY "Deal parties can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.deals 
            WHERE deals.id = messages.deal_id 
            AND (deals.seller_id = auth.uid() OR deals.buyer_id = auth.uid())
        )
    );

-- Reviews policies
CREATE POLICY "Anyone can read reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Deal parties can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id AND
        EXISTS (
            SELECT 1 FROM public.deals 
            WHERE deals.id = reviews.deal_id 
            AND (deals.seller_id = auth.uid() OR deals.buyer_id = auth.uid())
            AND deals.status = 'completed'
        )
    );

-- Support tickets policies
CREATE POLICY "Users can view their own tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create support tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to generate unique deal codes
CREATE OR REPLACE FUNCTION generate_deal_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate deal codes
CREATE OR REPLACE FUNCTION set_deal_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.deal_code IS NULL OR NEW.deal_code = '' THEN
        LOOP
            NEW.deal_code := generate_deal_code();
            EXIT WHEN NOT EXISTS (SELECT 1 FROM public.deals WHERE deal_code = NEW.deal_code);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_deal_code
    BEFORE INSERT ON public.deals
    FOR EACH ROW
    EXECUTE FUNCTION set_deal_code();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
