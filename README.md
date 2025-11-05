# SafeTrade - Secure Escrow Service

SafeTrade is a modern escrow service platform that enables secure online transactions between buyers and sellers. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

### 🔒 Core Features
- **Secure Escrow**: Funds held safely until transaction completion
- **No Account Required**: Buyers can view deals without registration
- **Unique Deal Links**: Shareable links for instant deal access
- **Automatic Expiration**: Deal links expire after successful payment
- **Dual Mode Dashboard**: Switch between buyer and seller modes
- **User Verification**: ID, phone, and email verification system

### 🎨 Design
- **Premium Fintech UI**: Gradient-glow theme with modern animations
- **Responsive Design**: Works perfectly on all devices
- **Dark Theme**: Professional dark interface with purple/indigo gradients
- **Animated Components**: Smooth transitions and hover effects

### 🔍 Additional Features
- **Smart Search**: Global search with auto-complete
- **User Profiles**: Verification status and transaction history
- **Trust System**: User ratings and success metrics
- **Real-time Updates**: Live status updates for deals
- **Support System**: AI + Human support chat (planned)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Authentication**: Supabase Auth with email verification
- **Database**: PostgreSQL with Row Level Security
- **Deployment**: Vercel (recommended)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd safetrade
npm install --legacy-peer-deps
```

### 2. Set up Supabase

1. Go to [database.new](https://database.new) and create a new Supabase project
2. Copy your project URL and anon key from Settings > API
3. Run the SQL schema in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of supabase-schema.sql
```

### 3. Environment Variables

1. Copy `.env.example` to `.env.local`
2. Update with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your SafeTrade application.

## Database Schema

The application uses the following main tables:

- **users**: User profiles with verification status
- **deals**: Escrow deals with status tracking
- **transactions**: Payment and escrow records
- **messages**: Deal communication
- **reviews**: User ratings and feedback
- **support_tickets**: Customer support system

## Key Pages

### Public Pages
- `/` - Landing page with features and pricing
- `/deal/[dealCode]` - Public deal viewing (no auth required)
- `/auth/login` - User authentication
- `/auth/register` - User registration

### Protected Pages
- `/dashboard` - Main dashboard with buyer/seller mode
- `/dashboard/create-deal` - Deal creation form
- `/dashboard/deals/[id]` - Individual deal management
- `/profile` - User profile and verification

## How It Works

### For Sellers
1. Create a deal with product details and price
2. Generate and share a unique deal link
3. Buyer views deal and accepts (creates account if needed)
4. Funds are held in escrow
5. Ship item and mark as shipped
6. Buyer confirms receipt, funds released

### For Buyers
1. Receive deal link from seller
2. View deal details (no account needed)
3. Accept deal and create SafeTrade account
4. Funds held securely in escrow
5. Receive item and confirm delivery
6. Funds automatically released to seller

## Security Features

- **Row Level Security**: Database-level access control
- **Email Verification**: Required for account activation
- **Escrow Protection**: Funds held until confirmation
- **Deal Expiration**: Automatic link deactivation
- **Trust Scoring**: User reputation system
- **Encrypted Data**: All sensitive data encrypted

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment

```bash
npm run build
npm start
```

## Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

Optional:
- `SUPABASE_SERVICE_ROLE_KEY` - For server-side operations
- `NEXT_PUBLIC_SITE_URL` - Your site URL (for production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions:
- Email: support@safetrade.app
- Documentation: [docs.safetrade.app](https://docs.safetrade.app)
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

- [ ] Payment processor integration (Stripe)
- [ ] Mobile app (React Native)
- [ ] AI-powered dispute resolution
- [ ] Multi-currency support
- [ ] API for third-party integrations
- [ ] Advanced analytics dashboard
- [ ] Bulk deal management
- [ ] Automated compliance checks

---

Built with ❤️ by the SafeTrade team
