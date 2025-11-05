export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          full_name: string | null
          avatar_url: string | null
          email_verified: boolean
          phone_verified: boolean
          id_verified: boolean
          trust_score: number
          total_deals: number
          successful_deals: number
          bio: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          full_name?: string | null
          avatar_url?: string | null
          email_verified?: boolean
          phone_verified?: boolean
          id_verified?: boolean
          trust_score?: number
          total_deals?: number
          successful_deals?: number
          bio?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          full_name?: string | null
          avatar_url?: string | null
          email_verified?: boolean
          phone_verified?: boolean
          id_verified?: boolean
          trust_score?: number
          total_deals?: number
          successful_deals?: number
          bio?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          deal_code: string
          seller_id: string
          buyer_id: string | null
          title: string
          description: string | null
          amount: number
          currency: string
          status: 'pending' | 'accepted' | 'funded' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
          link_active: boolean
          expires_at: string | null
          delivery_method: string | null
          delivery_address: string | null
          tracking_number: string | null
          created_at: string
          updated_at: string
          accepted_at: string | null
          funded_at: string | null
          shipped_at: string | null
          delivered_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          deal_code?: string
          seller_id: string
          buyer_id?: string | null
          title: string
          description?: string | null
          amount: number
          currency?: string
          status?: 'pending' | 'accepted' | 'funded' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
          link_active?: boolean
          expires_at?: string | null
          delivery_method?: string | null
          delivery_address?: string | null
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
          accepted_at?: string | null
          funded_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          deal_code?: string
          seller_id?: string
          buyer_id?: string | null
          title?: string
          description?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'accepted' | 'funded' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
          link_active?: boolean
          expires_at?: string | null
          delivery_method?: string | null
          delivery_address?: string | null
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
          accepted_at?: string | null
          funded_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          completed_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          deal_id: string
          amount: number
          currency: string
          transaction_type: 'escrow_deposit' | 'escrow_release' | 'refund' | 'fee'
          payment_method: string | null
          payment_reference: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          amount: number
          currency?: string
          transaction_type: 'escrow_deposit' | 'escrow_release' | 'refund' | 'fee'
          payment_method?: string | null
          payment_reference?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          amount?: number
          currency?: string
          transaction_type?: 'escrow_deposit' | 'escrow_release' | 'refund' | 'fee'
          payment_method?: string | null
          payment_reference?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          deal_id: string
          sender_id: string
          content: string
          message_type: 'text' | 'image' | 'file' | 'system'
          file_url: string | null
          file_name: string | null
          file_size: number | null
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          deal_id: string
          sender_id: string
          content: string
          message_type?: 'text' | 'image' | 'file' | 'system'
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          deal_id?: string
          sender_id?: string
          content?: string
          message_type?: 'text' | 'image' | 'file' | 'system'
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          created_at?: string
          read_at?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          deal_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string
          deal_id: string | null
          subject: string
          description: string
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          assigned_to: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          deal_id?: string | null
          subject: string
          description: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          deal_id?: string | null
          subject?: string
          description?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row']
export type Deal = Database['public']['Tables']['deals']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type SupportTicket = Database['public']['Tables']['support_tickets']['Row']

export type InsertUser = Database['public']['Tables']['users']['Insert']
export type InsertDeal = Database['public']['Tables']['deals']['Insert']
export type InsertTransaction = Database['public']['Tables']['transactions']['Insert']
export type InsertMessage = Database['public']['Tables']['messages']['Insert']
export type InsertReview = Database['public']['Tables']['reviews']['Insert']
export type InsertSupportTicket = Database['public']['Tables']['support_tickets']['Insert']

export type UpdateUser = Database['public']['Tables']['users']['Update']
export type UpdateDeal = Database['public']['Tables']['deals']['Update']
export type UpdateTransaction = Database['public']['Tables']['transactions']['Update']
export type UpdateMessage = Database['public']['Tables']['messages']['Update']
export type UpdateReview = Database['public']['Tables']['reviews']['Update']
export type UpdateSupportTicket = Database['public']['Tables']['support_tickets']['Update']

// Extended types with relations
export type DealWithUsers = Deal & {
  seller: User
  buyer: User | null
}

export type DealWithDetails = Deal & {
  seller: User
  buyer: User | null
  transactions: Transaction[]
  messages: Message[]
  reviews: Review[]
}

export type MessageWithSender = Message & {
  sender: User
}

export type ReviewWithUsers = Review & {
  reviewer: User
  reviewee: User
}
