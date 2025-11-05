# SafeTrade Backend Setup Guide

This document outlines the complete backend infrastructure that has been implemented for the SafeTrade project using Supabase.

## 🏗️ Architecture Overview

The backend is built using:
- **Supabase** - PostgreSQL database with built-in authentication
- **Next.js API Routes** - Server-side API endpoints
- **Row Level Security (RLS)** - Database-level security policies
- **TypeScript** - Full type safety across the stack

## 📊 Database Schema

The database includes the following main tables:

### Users Table
- User profiles with verification status
- Trust scores and deal metrics
- Personal information (name, bio, location)

### Deals Table
- Deal information with unique shareable codes
- Status tracking (pending → accepted → funded → shipped → delivered → completed)
- Delivery details and tracking

### Transactions Table
- Escrow deposit and release tracking
- Payment method and reference storage
- Transaction status management

### Messages Table
- Deal-specific communication
- File attachment support
- Read status tracking

### Reviews Table
- User rating system (1-5 stars)
- Deal-specific reviews
- Trust score calculation

### Support Tickets Table
- User support system
- Priority and status tracking
- Deal association

## 🔐 Authentication & Security

### Middleware Protection
- Route-based authentication middleware
- Automatic redirects for protected routes
- Session management with Supabase

### Row Level Security Policies
- Users can only access their own data
- Deal participants can view deal details
- Public access for deal discovery via codes

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `DELETE /api/auth/login` - User logout
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/[userId]` - Get public user info

### Deal Management
- `GET /api/deals` - Get user's deals
- `POST /api/deals` - Create new deal
- `GET /api/deals/[dealId]` - Get deal details
- `PUT /api/deals/[dealId]` - Update deal
- `DELETE /api/deals/[dealId]` - Cancel deal
- `POST /api/deals/[dealId]/accept` - Accept deal
- `PUT /api/deals/[dealId]/status` - Update deal status
- `GET /api/deals/code/[dealCode]` - Get deal by code

### Transaction Management
- `GET /api/transactions` - Get transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/[transactionId]` - Get transaction
- `PUT /api/transactions/[transactionId]` - Update transaction

### Messaging System
- `GET /api/messages?dealId=...` - Get deal messages
- `POST /api/messages` - Send message
- `PUT /api/messages/[messageId]/read` - Mark as read

### Review System
- `GET /api/reviews` - Get reviews
- `POST /api/reviews` - Create review

### Support System
- `GET /api/support` - Get support tickets
- `POST /api/support` - Create support ticket
- `GET /api/support/[ticketId]` - Get ticket details
- `PUT /api/support/[ticketId]` - Update ticket

## 🛠️ Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `supabase-schema.sql` in the SQL Editor
3. Enable Row Level Security on all tables
4. Configure authentication settings

### 3. Install Dependencies
```bash
npm install
# or
yarn install
```

### 4. Run Development Server
```bash
npm run dev
# or
yarn dev
```

## 📝 Usage Examples

### Frontend API Usage
```typescript
import { dealApi, userApi } from '@/utils/api'

// Create a new deal
const deal = await dealApi.createDeal({
  title: 'iPhone 15 Pro',
  description: 'Brand new, sealed',
  amount: 450000.00,
  currency: 'NGN'
})

// Get user profile
const profile = await userApi.getProfile()

// Accept a deal
await dealApi.acceptDeal(dealId)
```

### Using React Hooks
```typescript
import { useUser } from '@/hooks/useUser'

function MyComponent() {
  const { user, loading, login, logout } = useUser()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please log in</div>
  
  return <div>Welcome, {user.full_name}!</div>
}
```

## 🔄 Deal Flow

1. **Creation** - Seller creates deal with shareable link
2. **Discovery** - Buyer finds deal via link or code
3. **Acceptance** - Buyer accepts deal terms
4. **Funding** - Buyer deposits funds to escrow
5. **Shipping** - Seller ships item with tracking
6. **Delivery** - Buyer confirms receipt
7. **Completion** - Funds released to seller
8. **Review** - Both parties can leave reviews

## 🛡️ Security Features

- **Authentication middleware** protects all routes
- **Row Level Security** ensures data isolation
- **Input validation** on all API endpoints
- **Error handling** with proper HTTP status codes
- **Type safety** with TypeScript throughout

## 📊 Database Functions

### Auto-generated Deal Codes
- Unique 8-character alphanumeric codes
- Automatic generation on deal creation
- Collision detection and retry logic

### Trust Score Calculation
- Automatic calculation based on reviews
- Updates user trust metrics
- Influences deal visibility and trust

### Timestamp Management
- Automatic `created_at` and `updated_at` timestamps
- Status-specific timestamps (funded_at, shipped_at, etc.)

## 🚨 Error Handling

All API endpoints include comprehensive error handling:
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (authentication required)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found (resource doesn't exist)
- **500** - Internal Server Error (unexpected errors)

## 📈 Performance Considerations

- **Database indexes** on frequently queried columns
- **Efficient queries** with proper joins and filters
- **Pagination support** for large datasets
- **Caching strategies** for static data

## 🔧 Development Tools

- **TypeScript types** for all database tables
- **API utility functions** for frontend integration
- **React hooks** for state management
- **Error boundaries** for graceful error handling

## 📋 Next Steps

The backend infrastructure is now complete and functional. You can:

1. **Test the APIs** using the provided endpoints
2. **Build frontend components** using the utility functions
3. **Implement payment processing** for escrow functionality
4. **Add real-time features** using Supabase subscriptions
5. **Deploy to production** with proper environment variables

## 🤝 Support

If you encounter any issues with the backend setup:
1. Check the browser console for error messages
2. Verify environment variables are set correctly
3. Ensure Supabase project is properly configured
4. Review the API documentation for correct usage

The backend is now ready for full-scale development and testing!
