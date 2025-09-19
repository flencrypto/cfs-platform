# CFS - Crypto Fantasy Sports Platform

A comprehensive crypto-enabled fantasy sports platform built with Next.js, TypeScript, and Prisma. Users can draft virtual teams, enter contests, and earn prizes in fiat, tokens, and NFTs.

## 🚀 Features

### Core Functionality
- **Multi-Sport Support**: Soccer, NBA, NFL, UFC (Phase 1), with plans for Cricket, F1, MLB, NHL, Tennis, Esports
- **Contest Types**: Daily, Weekly, Seasonal, Head-to-Head, Tournaments, Multipliers
- **Draft Modes**: Salary cap, Snake draft (real-time/async), Auto-draft fallback
- **Live Scoring**: Real-time updates with sport-specific rules
- **Prize Pools**: Fiat, crypto tokens, and NFT rewards

### Authentication & Security
- **Multi-Provider Auth**: Google, Apple, Email/Password
- **Wallet Integration**: WalletConnect, MetaMask, Coinbase Wallet
- **KYC/AML**: Persona, Onfido integration for compliance
- **Fraud Detection**: Sift, Forter integration
- **Security**: OAuth2/JWT, TLS 1.3, WAF, audit trails

### Crypto Features
- **Payment Methods**: Stripe, Apple/Google IAP, Open Banking, Crypto wallets
- **Blockchain Support**: Ethereum, Polygon, Arbitrum, Optimism
- **DeFi Integration**: Token staking, yield farming, governance
- **NFT Rewards**: Achievement badges, collectible cards, trading marketplace

### Social & Community
- **Private Leagues**: Custom rules, invitations, approvals
- **Creator Contests**: Sponsored contests with branded overlays
- **Social Features**: Profiles, follow system, DMs, leaderboards
- **Referral System**: Deep links, affiliate tracking, bonus rewards

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **State Management**: React Query (TanStack Query)
- **Crypto Integration**: Wagmi, RainbowKit, Viem

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Caching**: Redis
- **File Storage**: AWS S3 / Google Cloud Storage

### External Services
- **Sports Data**: Sportradar, Opta/Stats Perform
- **Payments**: Stripe, Apple/Google IAP, Open Banking
- **KYC/AML**: Persona, Onfido, Sumsub
- **Analytics**: Mixpanel, Google Analytics
- **Monitoring**: Sentry, Datadog

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── contests/      # Contest management
│   │   ├── sports/        # Sports data
│   │   └── me/            # User profile
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── landing/           # Landing page components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   ├── api.ts             # API client
│   ├── auth.ts            # Authentication config
│   ├── prisma.ts          # Database client
│   └── utils.ts           # Helper functions
├── types/                 # TypeScript type definitions
└── styles/                # Additional styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/cfs-platform.git
   cd cfs-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in the required environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/cfs_platform"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # OAuth Providers
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Stripe
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   
   # Redis
   REDIS_URL="redis://localhost:6379"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # (Optional) Seed the database
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

The platform uses a comprehensive PostgreSQL schema with the following key entities:

- **Users**: Authentication, profiles, KYC status
- **Wallets**: Crypto wallet integration, balances
- **Sports**: Sport configurations, scoring rules
- **Contests**: Contest definitions, rules, timing
- **Entries**: User contest entries, rosters
- **Transactions**: Payment history, withdrawals
- **Leagues**: Private league management
- **Notifications**: User notifications system

See `prisma/schema.prisma` for the complete schema definition.

## 🔌 API Documentation

### Authentication Endpoints
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration
- `POST /api/auth/wallet/connect` - Wallet connection
- `GET /api/auth/session` - Get current session

### Contest Endpoints
- `GET /api/contests` - List contests with filters
- `POST /api/contests` - Create new contest
- `GET /api/contests/[id]` - Get contest details
- `PATCH /api/contests/[id]` - Update contest
- `DELETE /api/contests/[id]` - Delete contest

### User Endpoints
- `GET /api/me` - Get user profile
- `PATCH /api/me` - Update user profile
- `POST /api/me/kyc/start` - Start KYC verification

### Sports Endpoints
- `GET /api/sports` - List available sports
- `GET /api/sports/[id]/fixtures` - Get sport fixtures
- `GET /api/sports/[id]/players` - Get sport players

## 🎮 Usage Examples

### Creating a Contest
```typescript
const contest = await api.post('/api/contests', {
  sportId: 'soccer',
  name: 'Premier League Showdown',
  type: 'DAILY',
  entryFee: 25,
  prizePool: 5000,
  maxEntries: 200,
  rosterSize: 11,
  salaryCap: 100000,
  startTime: '2024-01-15T15:00:00Z',
  isPrivate: false
})
```

### Entering a Contest
```typescript
const entry = await api.post('/api/entries', {
  contestId: 'contest_123',
  roster: [
    { position: 'FWD1', playerId: 'player_456', isCaptain: false },
    { position: 'MID1', playerId: 'player_789', isCaptain: true },
    // ... more players
  ],
  paymentMethod: 'card',
  paymentId: 'pi_1234567890'
})
```

### Wallet Connection
```typescript
import { useConnect } from 'wagmi'

const { connect, connectors } = useConnect()

const connectWallet = () => {
  connect({ connector: connectors[0] })
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker
```bash
# Build Docker image
docker build -t cfs-platform .

# Run container
docker run -p 3000:3000 cfs-platform
```

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📈 Monitoring & Analytics

- **Error Tracking**: Sentry integration
- **Performance**: Datadog APM
- **Analytics**: Mixpanel, Google Analytics
- **Uptime**: UptimeRobot monitoring
- **Logs**: Structured logging with request IDs

## 🔒 Security

- **Authentication**: OAuth2/JWT with secure session management
- **Data Protection**: GDPR/UK-GDPR compliance
- **API Security**: Rate limiting, CORS, input validation
- **Crypto Security**: Hardware wallet support, multi-sig options
- **Audit Trails**: Comprehensive logging for all actions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.cfs.app](https://docs.cfs.app)
- **Discord**: [discord.gg/cfs](https://discord.gg/cfs)
- **Email**: support@cfs.app
- **Twitter**: [@cfs_app](https://twitter.com/cfs_app)

## 🗺 Roadmap

### Phase 1 (MVP) - 8-12 weeks
- [x] Project setup and core architecture
- [ ] Soccer daily contests with salary-cap drafting
- [ ] Stripe card payments integration
- [ ] WalletConnect integration (view-only)
- [ ] Basic KYC flow
- [ ] Live scoring system
- [ ] Payout system
- [ ] Referral system
- [ ] Basic CRM
- [ ] Admin console v1

### Phase 2 - 16-20 weeks
- [ ] Subscriptions and IAP
- [ ] Private leagues
- [ ] Creator contests
- [ ] Crypto on-ramp/off-ramp
- [ ] Fraud detection engine
- [ ] Business intelligence dashboards
- [ ] Multi-sport support (NBA, NFL, UFC)

### Phase 3 - 24+ weeks
- [ ] NFT marketplace
- [ ] ML-powered projections
- [ ] Social DMs and messaging
- [ ] Tournament circuits
- [ ] Full tokenomics implementation
- [ ] Mobile apps (iOS/Android)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Database with [Prisma](https://prisma.io/)
- Crypto integration with [Wagmi](https://wagmi.sh/)
