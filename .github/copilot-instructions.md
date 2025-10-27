# Sejmofil AI Coding Agent Instructions

## DONT GENERATE ANY DOCS OR MARKDOWN

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
- **Relationships**: Neo4j stores complex relationships between political entities (via `lib/db/client.ts`)
- **Types**: Comprehensive TypeScript interfaces in `lib/types/proceeding.ts` define the data structure
- **Queries**: Centralized in `lib/supabase/` with specific files per feature (e.g., `getProceedings.ts`, `votes.ts`)
- **Supabase Clients**:
  - Server: `utils/supabase/server.ts` - Use `await createClient()` in server components
  - Client: `utils/supabase/client.ts` - Use `createClient()` in client components
- **Database Functions**: Use `.rpc()` for Supabase stored procedures (e.g., `get_vote_counts`, `get_all_vote_counts`)

### App Router Conventions

- **Route Groups**: Use parentheses for organization without affecting URL structure (e.g., `(home)/page.tsx`)
- **Server Components**: Default to server components; all data fetching happens server-side
- **Parallel Data**: Use `Promise.all()` for concurrent data fetching in page components
- **Search Params**: Always await searchParams and handle as Promise in Next.js 15
- **ISR/Caching**: Use `export const revalidate = 300` for time-based revalidation (300s for home, 3600s for static pages)
- **Client Components**: Mark with `'use client'` directive - required for hooks, event handlers, and browser APIs

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

- **Start Command**: `pnpm dev` (uses Turbopack for faster builds)
- **Package Manager**: **pnpm only** - all scripts and lock files use pnpm
- **Scripts**:
  - `pnpm typecheck` - Type checking without build
  - `pnpm prettier` - Format all files
  - `pnpm husky:prepare` - Setup git hooks (Windows PowerShell commands)

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

## Common Gotchas

- `lib/types/proceeding.ts` - Complete data type definitions
- `app/(home)/page.tsx` - Main feed implementation pattern
- `lib/supabase/getProceedings.ts` - Core data fetching patterns
- `components/ui/` - Base component implementations
- `utils/supabase/server.ts` - Server-side Supabase client setup
- `lib/db/client.ts` - Neo4j connection and query execution

## Critical Implementation Patterns

### Neo4j Queries

```typescript
// Use runQuery from lib/db/client.ts
import { runQuery } from '@/lib/db/client'
const results = await runQuery<YourType>('MATCH (n) RETURN n', { param: value })
```

### Supabase RPC Calls

```typescript
// Server component pattern
const { data, error } = await (
  await createClient()
).rpc('function_name', { param: value })

// Client component pattern
const { data, error } = await createClient().rpc('function_name', {
  param: value,
})
```
