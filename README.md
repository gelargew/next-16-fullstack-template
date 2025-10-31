# CMS Dashboard

A modern, schema-driven dashboard built with Next.js, featuring server actions, type-safe forms, and URL-first state management.

## Prerequisites

- **Bun** (recommended) or Node.js 18+
- PostgreSQL database (Neon recommended)

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd cms
   bun install
   # or
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host:port/database"

   # Authentication (if using better-auth)
   AUTH_SECRET="your-secret-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Set up the database:**
   ```bash
   # Generate migrations
   bun run db:generate

   # Run migrations
   bun run db:migrate

   # (Optional) Open Drizzle Studio
   bun run db:studio
   ```

4. **Start the development server:**
   ```bash
   bun dev
   # or
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** to see the application.

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Authentication
AUTH_SECRET="your-super-secret-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: OAuth Providers (if using better-auth social auth)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Database Setup

This project uses **PostgreSQL** with **Drizzle ORM**. The schema is located in `/server/db/schema/`.

### Recommended Database: Neon

1. Create a free Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to your `.env.local`

### Migration Commands

```bash
# Generate migration files from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Open database GUI for management
npm run db:studio
```

## Key Dependencies

### Core Framework
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety

### Database & ORM
- **Drizzle ORM** - Type-safe SQL toolkit
- **Drizzle Zod** - Auto-generated validation schemas
- **@neondatabase/serverless** - PostgreSQL driver

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Headless component primitives
- **Lucide React** - Icon library
- **Class Variance Authority** - Component styling utilities

### Forms & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

### State & Data Fetching
- **TanStack Query** - Server state management
- **nuqs** - URL state management
- **better-auth** - Authentication solution

### Development Tools
- **Drizzle Kit** - Database toolkit
- **ESLint** - Code linting
- **TypeScript** - Static type checking

## Project Scripts

```bash
# Development
bun dev              # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint

# Database
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations
bun run db:studio    # Open Drizzle Studio
```

## Architecture Highlights

- **Schema-Driven**: Database schema drives types, validation, and forms
- **Server Actions**: All CRUD operations use Next.js server actions
- **URL-First State**: Filters, search, and sort persist in URLs
- **Type Safety**: End-to-end type safety from database to UI
- **Zero Boilerplate**: Auto-generated forms and validation

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)