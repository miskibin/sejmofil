# Sejmofil AI Coding Agent Instructions

## Project Overview

Sejmofil is a **Polish parliamentary transparency platform** using AI to analyze Sejm (Polish Parliament) data. It's a non-profit initiative focused on increasing democratic transparency through data visualization and analysis.

## Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Database**: Supabase (PostgreSQL) + Neo4j for relationships
- **UI**: Radix UI + Tailwind CSS + shadcn/ui components
- **Authentication**: Supabase Auth with SSR
- **Language**: TypeScript (strict)
- **Deployment**: Docker with standalone output

## Critical Architecture Patterns

### Data Layer Structure

- **Primary Data**: Supabase handles parliamentary proceedings, votes, envoys, and AI-generated summaries
- **Relationships**: Neo4j stores complex relationships between political entities
- **Types**: Comprehensive TypeScript interfaces in `lib/types/proceeding.ts` define the data structure
- **Queries**: Centralized in `lib/supabase/` with specific files per feature (e.g., `getProceedings.ts`, `votes.ts`)

### App Router Conventions

- **Route Groups**: Use parentheses for organization without affecting URL structure (e.g., `(home)/page.tsx`)
- **Server Components**: Default to server components; all data fetching happens server-side
- **Parallel Data**: Use `Promise.all()` for concurrent data fetching in page components
- **Search Params**: Always await searchParams and handle as Promise in Next.js 15

### Component Organization

```
components/
├── ui/           # shadcn/ui base components
├── sections/     # Complex page sections
└── [feature].tsx # Feature-specific components
```

### Data Fetching Pattern

```typescript
// Standard pattern for pages
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams // Next.js 15 requirement
  const [data1, data2] = await Promise.all([
    getFunction1(),
    getFunction2()
  ])
  return <Component data={data1} />
}
```

## Development Workflow

### Environment Setup

- **Critical**: Join Discord server to get `.env` file (contains Supabase keys)
- **Start Command**: `pnpm dev` (uses Turbopack for faster builds)
- **Scripts**:
  - `pnpm typecheck` - Type checking without build
  - `pnpm prettier` - Format all files
  - `pnpm husky:prepare` - Setup git hooks (Windows PowerShell commands)

### Code Quality

- **Linting**: ESLint + Prettier with `lint-staged` on pre-commit
- **Formatting**: Prettier with `prettier-plugin-tailwindcss` for class sorting
- **TypeScript**: Strict mode enabled, no `any` types allowed

### Docker Development

- Multi-stage build with Node.js 23 Alpine
- Environment variables injected at build time
- Standalone output for minimal production images

## Domain-Specific Patterns

### Parliamentary Data Structure

```typescript
// Core entities relationship
Proceeding → ProceedingDay → ProceedingPointAI
                           ↓
                    Contains voting_numbers & print_numbers
```

### Voting System

- **User Reactions**: Upvotes/downvotes on proceeding points
- **Vote Counts**: Aggregated in separate service (`processVotes.ts`)
- **Real-time**: Client-side optimistic updates with server sync

### Search & Filtering

- **Semantic Search**: AI-powered search across parliamentary content
- **Category Filters**: Dynamic category system for proceeding points
- **Sort Options**: 'foryou', 'popular', 'latest', and category-specific

## Component Patterns

### Page Structure

```typescript
// Standard page layout
<Navbar />
<Breadcrumbs />
<main>{children}</main>
<Footer />
<Toaster /> // Global toast notifications
```

### Responsive Design

- **Mobile-first**: Use `use-mobile.tsx` hook for responsive logic
- **Breakpoints**: Tailwind default breakpoints
- **Components**: Vaul for mobile drawers, Radix for desktop

## Integration Points

### External Services

- **Sejm API**: Official Polish Parliament API (`api.sejm.gov.pl`)
- **Image Sources**: Multiple allowed domains in `next.config.ts`
- **Analytics**: Ready for integration (structure exists)

### Authentication Flow

- **Supabase Auth**: SSR-enabled with middleware
- **Session Management**: Automatic session refresh via middleware
- **Protected Routes**: Use Supabase client in server components

## Common Gotchas

1. **Async SearchParams**: Always await `searchParams` in Next.js 15
2. **Image Optimization**: Add new domains to `next.config.ts` before using
3. **Polish Characters**: Ensure proper encoding in URL params and database queries
4. **Neo4j Integration**: Separate connection from Supabase, used for relationship queries
5. **SSR Hydration**: Be careful with client-only components (wrap in `use-client`)

## Key Files to Reference

- `lib/types/proceeding.ts` - Complete data type definitions
- `app/(home)/page.tsx` - Main feed implementation pattern
- `lib/supabase/getProceedings.ts` - Core data fetching patterns
- `components/ui/` - Base component implementations
- `utils/supabase/server.ts` - Server-side Supabase client setup

When working on this codebase, prioritize parliamentary data accuracy, Polish language support, and democratic transparency goals.
