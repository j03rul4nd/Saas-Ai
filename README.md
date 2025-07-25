# 🚀 Next.js SaaS Template - PDF AI Summarizer

A complete SaaS template built with Next.js that allows users to upload PDF files and get intelligent summaries using Google's Gemini AI API.

## ✨ Features

- 🏠 **Landing Page** - Attractive homepage
- 💰 **Pricing Page** - Subscription plans with Stripe
- 📊 **Dashboard** - User panel to manage PDFs
- 🤖 **AI PDF Summarizer** - Automatic summaries with Gemini AI
- 🔐 **Authentication** - Complete system with Clerk
- 💳 **Payments** - Stripe integration
- 🗄️ **Database** - Prisma + Supabase
- 🚀 **Deploy Ready** - Configured for Vercel

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Authentication**: Clerk
- **Database**: Supabase + Prisma ORM
- **Payments**: Stripe
- **AI**: Google Gemini API (Free)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone [your-repository]
cd nextjs-saas-template
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_public_key
CLERK_SECRET_KEY=sk_test_your_secret_key
WEBHOOK_SECRET=your_clerk_webhook_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_public_key
STRIPE_PRICE_ID=price_your_price_id
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Supabase Database
# For normal operations (queries, inserts, updates) - USE POOLING
DATABASE_URL="postgresql://postgres.user:password@host:6543/postgres?pgbouncer=true&connection_limit=1"

# For migrations and operations requiring direct connection
DIRECT_URL="postgresql://postgres.user:password@host:5432/postgres"
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push
```

### 5. Run the project

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Service Configuration

### Clerk (Authentication)

1. Create an account at [Clerk](https://clerk.com)
2. Create a new application
3. Copy the public and secret keys
4. Configure webhooks to sync users

### Supabase (Database)

1. Create a project at [Supabase](https://supabase.com)
2. Go to Settings > Database
3. Copy the Connection String (for both pooling and direct)
4. Enable Row Level Security if needed

### Stripe (Payments)

1. Create an account at [Stripe](https://stripe.com)
2. Go to Developers > API Keys
3. Copy the public and secret keys
4. Create products and prices
5. Set up webhooks to handle payment events

### Google Gemini AI

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create a free API Key
3. Configure usage limits according to your needs

### Vercel (Deployment)

1. Connect your repository to Vercel
2. Configure all environment variables
3. Automatic deployment with each push

## 📁 Project Structure

```
├── app/
│   ├── (auth)/         # Authentication-related routes and components (login, register, etc.)
│   ├── dashboard/      # Main section for authenticated users
│   ├── pricing/        # Pricing and plans page
│   ├── api/            # Internal API endpoints
│   └── globals.css     # Global application styles
├── components/
│   ├── ui/             # Reusable UI components
│   ├── auth/           # Authentication-specific components
│   └── dashboard/      # Dashboard-specific components
├── lib/
│   ├── prisma.ts       # Prisma ORM configuration and client
│   ├── stripe.ts       # Stripe integration for payments
│   └── gemini.ts       # Gemini AI integration for PDF processing
├── prisma/
│   └── schema.prisma   # Database schema definition
└── middleware.ts       # Global Next.js middleware (route protection)
```

## 🎯 Implemented Features

### Dashboard
- PDF file upload
- List of processed PDFs
- Summary visualization
- Subscription management

### Payment System
- Subscription plans
- Stripe checkout
- Webhooks for status updates
- Customer portal

### AI Integration
- PDF processing
- Summary generation with Gemini
- Subscription-based limits

### Authentication
- Login/Register with Clerk
- Route protection middleware
- Database synchronization

## 🔒 Middleware and Security

The middleware is configured to:
- Protect dashboard routes
- Validate authentication
- Handle automatic redirects
- Sync users with database

## 📦 Available Scripts

```bash
# Development
npm run dev

# Production build (includes automatic prisma generate)
npm run build

# Start in production
npm run start

# Linting
npm run lint

# Database
npx prisma studio      # Visual interface
npx prisma db push     # Sync schema
npx prisma generate    # Generate client (runs automatically on postinstall)
```

## ⚙️ Vercel Configuration

The project includes a `vercel.json` file with optimized configuration:

```json
{
    "buildCommand": "prisma generate && next build",
    "installCommand": "npm install"
}
```

This configuration ensures that:
- Prisma generates correctly before build
- Dependencies install properly
- Deployment is consistent

## 🚨 Important Notes

1. **API Keys**: Never commit real API keys to the repository
2. **Webhooks**: Properly configure Stripe and Clerk webhooks
3. **Database**: Use pooling URL for normal operations
4. **Limits**: Gemini API has free limits, consider upgrading for production
5. **CORS**: Properly configure domains in production

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under the MIT License. See the `LICENSE` file for more details.

## 🆘 Support

If you have problems or questions:

1. Review the documentation for each service
2. Verify that all environment variables are configured
3. Check Vercel logs for deployment errors
4. Make sure webhooks are working correctly

---

**Developed with ❤️ for the SaaS community!**