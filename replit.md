# Imaiyavarmam Silambam - Student Management System

## Overview

A student management and attendance tracking dashboard for Imaiyavarmam Silambam martial arts school. The application allows administrators to manage students, track their lesson progress, log daily attendance, and monitor fee payment status.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens (CSS variables for theming)
- **Animations**: Framer Motion for smooth list and dialog animations
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints defined in shared route contracts
- **Build Tool**: esbuild for server bundling, Vite for client

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit for database migrations (`npm run db:push`)

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database table definitions and Zod schemas for validation
- `routes.ts`: API route contracts with input/output types for type-safe API calls

### Project Structure
```
client/           # React frontend
  src/
    components/   # Reusable UI components
    pages/        # Route page components
    hooks/        # Custom React hooks (API calls)
    lib/          # Utilities (query client, cn helper)
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route handlers
  storage.ts      # Database operations
  db.ts           # Database connection
shared/           # Shared types and contracts
  schema.ts       # Drizzle table definitions
  routes.ts       # API route specifications
```

### Key Design Decisions
1. **Type-safe API contracts**: Routes are defined in `shared/routes.ts` with Zod schemas, ensuring frontend and backend stay in sync
2. **Storage abstraction**: Database operations go through `IStorage` interface in `storage.ts`, making it easy to swap implementations
3. **Component-driven UI**: Using shadcn/ui provides accessible, customizable components that can be modified directly in the codebase

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage in PostgreSQL (available but not currently used for sessions)

### UI Framework
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component implementations using Radix + Tailwind
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Development server with HMR for frontend
- **Drizzle Kit**: Database schema management and migrations
- **tsx**: TypeScript execution for development

### Fonts
- **Inter**: Body text font
- **Outfit**: Display/header font
- Loaded via Google Fonts CDN