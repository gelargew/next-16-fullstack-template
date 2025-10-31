# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 CMS application built with Bun, featuring authentication, database integration, and a modern admin dashboard interface. It uses a clean architecture with TypeScript, Tailwind CSS, and modern React patterns.

## Common Development Commands

**Note: This project uses Bun as the package manager. Use `bun` instead of `npm` for all commands.**

### Development
```bash
bun dev          # Start development server on localhost:3000
bun run build    # Build production application
bun start        # Start production server
bun run lint     # Run ESLint
```

### Database Operations (Drizzle ORM)
```bash
bun run db:generate  # Generate database migrations
bun run db:migrate   # Run database migrations
bun run db:studio    # Open Drizzle Studio for database management
```

## Architecture

### Directory Structure
- `app/` - Next.js App Router pages and API routes
- `components/` - React components (UI, form, and app-specific)
- `server/` - Backend code (auth, database, utilities)
- `lib/` - Shared utilities and configurations

### Key Technologies
- **Package Manager**: Bun
- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with email/password
- **Icons**: Lucide React and Tabler Icons
- **Styling**: Tailwind CSS v4
- **Form Handling**: React Hook Form with Zod validation
- **Tables**: TanStack Table with state persistence
- **Notifications**: Sonner for toast messages

### Database Setup
- Uses PostgreSQL via Neon serverless
- Database configuration in `drizzle.config.ts`
- Schemas located in `server/db/schema/`
- Database connection in `server/db/connection.ts`
- Migrations output to `server/db/drizzle/`

### Authentication
- Better Auth integrated with Next.js API routes
- Auth configuration in `server/auth.ts`
- API handler at `app/api/auth/[...all]/route.ts`
- Uses Drizzle adapter for PostgreSQL
- Email/password authentication enabled

### Custom Components

#### Form System (`components/form/`)
Compound form component pattern with shared state:
- `Form.Input` - Text, email, password inputs with validation
- `Form.Textarea` - Multi-line text inputs
- `Form.Select` - Dropdown selections
- `Form.Checkbox` - Boolean inputs
- `Form.Upload` - File uploads with drag-and-drop support

Usage:
```tsx
const form = useForm<FormData>(initialValues, schema)

<Form form={form} onSubmit={handleSubmit}>
  <Form.Input name="name" label="Name" required />
  <Form.Input name="email" type="email" label="Email" required />
  <Button type="submit">Submit</Button>
</Form>
```

#### Data Table (`components/ui/data-table-v2.tsx`)
Advanced table component with URL state persistence using nuqs:
- Column sorting and filtering
- Global search functionality
- Pagination with configurable page sizes
- Column visibility toggles
- State persisted in URL parameters

Features:
- Automatic state persistence in URL
- Server-side pagination support
- Custom column definitions
- Built-in search and filter UI
- Responsive design

### User Management System
Complete user management implementation at `/app/dashboard/users/`:
- User CRUD operations via API routes
- Reusable form components for user creation/editing
- Advanced data table with search, sort, and pagination
- Real-time updates with toast notifications
- Profile image support
- Accessible through the dashboard sidebar navigation

API Routes:
- `GET/POST /api/users` - List and create users
- `GET/PUT/DELETE /api/users/[id]` - Individual user operations

### Dashboard Structure
The application uses a nested dashboard structure:
- `/dashboard` - Main dashboard page with analytics and overview
- `/dashboard/users` - User management interface
- All dashboard routes share the same sidebar navigation and layout

### UI Components
- Extensive set of reusable UI components in `components/ui/`
- Built on Radix UI primitives with Tailwind CSS
- Consistent design system with proper accessibility
- Includes data tables, charts, forms, navigation components
- Custom compound components for complex interactions

### Dashboard Layout
- Modern admin dashboard with responsive sidebar navigation
- Uses CSS custom properties for layout dimensions
- Chart components with Recharts integration
- Site header with user profile integration

## Path Aliases
- `@/*` maps to root directory for clean imports
- Configuration in `tsconfig.json`

## State Management
- Form state managed by React Hook Form with compound pattern
- Table state persisted in URL using nuqs
- Component state using React hooks
- No external state management library required

## Environment Variables
Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- Additional Better Auth configuration variables as needed

## Development Notes
- Uses App Router exclusively
- Server components for data fetching
- Client components marked with `"use client"`
- Modern React patterns with hooks and context
- Comprehensive TypeScript configuration with strict mode
- ESLint for code quality
- Component-first architecture with reusability in mind

## Adding New Features
1. Create API routes in `app/api/` for backend logic
2. Use the compound form pattern for data entry forms
3. Use the data table component for lists with pagination
4. Follow the existing code structure and patterns
5. Add proper TypeScript types and validation schemas
6. Include toast notifications for user feedback