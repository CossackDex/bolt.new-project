# Construction Project Manager

A modern, full-stack construction project management application with subscription-based premium features. Built with React, TypeScript, and Supabase for seamless project tracking, task management, and cost estimation.

## Overview

Construction Project Manager is a comprehensive solution for managing construction projects from start to finish. It enables teams to organize projects hierarchically, track tasks with nested subtasks, manage costs automatically, and collaborate with project-specific notes. The application features a freemium model with Stripe integration for subscription management.

## Key Features

- **User Authentication**: Secure email/password authentication powered by Supabase
- **Project Management**: Create and organize multiple construction projects with priorities, dates, and cost tracking
- **Hierarchical Task System**: Support for tasks and nested subtasks with unlimited depth
- **Intelligent Cost Tracking**: Automatic cost summation with support for custom and calculated modes
- **Notes System**: Attach detailed notes to projects and tasks for better collaboration
- **Subscription Tiers**:
  - Free tier: Up to 3 projects
  - Premium tier: Unlimited projects with advanced features
- **Priority Levels**: Organize work by priority (low, medium, high)
- **Task Status Tracking**: Monitor progress with status indicators (pending, in progress, completed)
- **Dark Mode**: Full dark/light theme support with system preference detection
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Real-time Updates**: Live data synchronization using Supabase

## Technology Stack

### Frontend
- **React 18**: Modern UI library with hooks
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool and dev server
- **React Router DOM 7**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library

### Backend & Services
- **Supabase**: Backend-as-a-Service platform
  - PostgreSQL database with Row Level Security
  - Authentication service
  - Edge Functions for serverless operations
- **Stripe**: Payment processing and subscription management
- **Supabase Edge Functions**: Serverless functions for Stripe integration

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## Database Schema

### Core Tables

#### `user_subscriptions`
Stores user subscription information and tier limits.
- `id`: UUID primary key
- `user_id`: Reference to auth.users
- `subscription_tier`: 'free' or 'premium'
- `stripe_customer_id`: Stripe customer reference
- `stripe_subscription_id`: Stripe subscription reference
- `project_limit`: Maximum allowed projects
- `created_at`, `updated_at`: Timestamps

#### `projects`
Main project records with cost and date tracking.
- `id`: UUID primary key
- `user_id`: Project owner reference
- `name`: Project name
- `description`: Project details
- `priority`: 'low', 'medium', or 'high'
- `cost`: Project cost (auto-calculated or custom)
- `cost_mode`: 'auto' or 'custom'
- `start_date`, `end_date`: Project timeline
- `created_at`, `updated_at`: Timestamps

#### `tasks`
Hierarchical task tracking with support for subtasks.
- `id`: UUID primary key
- `project_id`: Parent project reference
- `parent_task_id`: Optional parent task for nesting
- `user_id`: Task owner reference
- `title`: Task title
- `description`: Task details
- `status`: 'pending', 'in_progress', or 'completed'
- `priority`: 'low', 'medium', or 'high'
- `cost`: Task cost (auto-calculated or custom)
- `cost_mode`: 'auto' or 'custom'
- `deadline`: Optional due date
- `created_at`, `updated_at`: Timestamps

#### `notes`
Notes attached to projects or tasks.
- `id`: UUID primary key
- `user_id`: Note author reference
- `project_id`: Optional project reference
- `task_id`: Optional task reference
- `content`: Note content
- `created_at`, `updated_at`: Timestamps

### Stripe Integration Tables

#### `stripe_customers`
Links users to Stripe customer records.

#### `stripe_subscriptions`
Tracks active Stripe subscriptions.

#### `stripe_orders`
Records one-time payment orders.

### Security

All tables are protected with Row Level Security (RLS) policies ensuring:
- Users can only access their own data
- Optimized subquery patterns for better performance
- Indexed foreign keys for fast queries
- Leaked password protection enabled

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase account
- A Stripe account (for payment features)

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd construction-project-manager
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to the `.env` file
3. Run the database migrations:
   - Navigate to the SQL Editor in your Supabase dashboard
   - Execute each migration file in `supabase/migrations/` in chronological order:
     - `20260113230459_create_construction_app_schema.sql`
     - `20260113231948_jade_unit.sql`
     - `20260114010434_fix_subscription_view.sql`
     - `20260114020044_add_project_status_tracking.sql`
     - `20260115083650_fix_security_and_performance_issues.sql`

### Step 4: Deploy Edge Functions

Deploy the Supabase Edge Functions for Stripe integration:

1. **stripe-checkout**: Creates Stripe checkout sessions
2. **stripe-webhook**: Handles Stripe webhook events
3. **cancel-subscription**: Manages subscription cancellations

Deployment is handled through the Supabase dashboard or CLI.

### Step 5: Stripe Configuration

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Configure your product and pricing in the Stripe dashboard
3. Update `src/stripe-config.ts` with your price IDs
4. Set up a webhook endpoint pointing to your `stripe-webhook` Edge Function
5. Configure webhook secret in Supabase Edge Function environment variables

### Step 6: Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build production bundle
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint on the codebase
- `npm run typecheck`: Run TypeScript type checking

## Project Structure

```
src/
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard with projects/tasks
│   ├── Login.tsx       # Login page
│   ├── Signup.tsx      # Registration page
│   ├── Pricing.tsx     # Subscription pricing page
│   ├── Account.tsx     # User account settings
│   └── Success.tsx     # Post-payment success page
├── components/         # Reusable components
│   ├── auth/          # Authentication components
│   ├── subscription/  # Subscription-related components
│   ├── Header.tsx     # Page header
│   ├── Navbar.tsx     # Navigation bar
│   ├── ProjectList.tsx # Project list view
│   ├── ProjectModal.tsx # Project create/edit modal
│   ├── TaskView.tsx   # Task list and details view
│   ├── TaskModal.tsx  # Task create/edit modal
│   ├── Notes.tsx      # Notes component
│   └── PricingCard.tsx # Pricing display card
├── contexts/          # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   └── ThemeContext.tsx   # Theme management
├── hooks/             # Custom React hooks
│   ├── useAuth.ts     # Authentication hook
│   └── useSubscription.ts # Subscription data hook
├── lib/               # Utilities and configuration
│   └── supabase.ts    # Supabase client and types
├── App.tsx            # Main app component with routing
└── main.tsx           # Application entry point

supabase/
├── migrations/        # Database migrations
└── functions/         # Edge Functions
    ├── stripe-checkout/
    ├── stripe-webhook/
    └── cancel-subscription/
```

## Authentication Flow

1. Users register with email/password through Supabase Auth
2. Upon successful authentication, a free-tier subscription is automatically created
3. Protected routes check authentication status and redirect to login if needed
4. Session management is handled automatically by Supabase

## Subscription Model

### Free Tier
- Limited to 3 projects
- Access to core features
- Task and note management

### Premium Tier
- Unlimited projects
- All features included
- Managed through Stripe subscriptions

Users can upgrade from the pricing page, which initiates a Stripe Checkout session.

## Security Features

- **Row Level Security**: All database tables have RLS policies
- **Authenticated Access**: All data requires authenticated user session
- **Optimized Policies**: Subquery-based policies for better performance
- **Secure Payment Processing**: Stripe handles all payment data
- **HTTPS Only**: All production traffic uses encrypted connections
- **Environment Variables**: Sensitive keys stored securely

## Performance Optimizations

- **Indexed Foreign Keys**: Fast relationship queries
- **Efficient RLS Policies**: Optimized database access patterns
- **Code Splitting**: Lazy loading with React Router
- **Vite HMR**: Fast development experience
- **Tailwind JIT**: On-demand CSS compilation

## Development Guidelines

- Follow TypeScript best practices
- Use Tailwind utility classes for styling
- Implement proper error handling
- Test authentication flows thoroughly
- Keep components focused and reusable
- Document complex logic with comments

## Deployment

### Frontend Deployment
The application can be deployed to any static hosting service:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

Make sure to set environment variables in your hosting platform.

### Database & Backend
Supabase handles all backend infrastructure:
- PostgreSQL database is managed by Supabase
- Edge Functions are deployed through Supabase
- Authentication is managed by Supabase

## Troubleshooting

### Common Issues

**Authentication not working:**
- Verify environment variables are set correctly
- Check Supabase project settings
- Ensure email confirmation is disabled for development

**Subscription limits not enforcing:**
- Verify RLS policies are enabled
- Check user_subscriptions table has correct data
- Review Edge Function logs in Supabase

**Stripe payments failing:**
- Confirm webhook endpoint is configured
- Verify Stripe API keys are correct
- Check Edge Function environment variables
- Review Stripe dashboard for error logs

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary. All rights reserved.

## Support

For issues or questions:
- Check the troubleshooting section
- Review Supabase documentation
- Consult Stripe integration guides
