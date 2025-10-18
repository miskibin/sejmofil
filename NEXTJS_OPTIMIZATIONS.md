# Next.js 15 Optimizations - Sejmofil

## Summary of Changes

This document outlines all optimizations made to align the Sejmofil codebase with Next.js 15 best practices.

**Date:** October 18, 2025  
**Next.js Version:** 15.5.3  
**Build Status:** ✅ **PASSING**

---

## 1. Image Optimization (`next.config.ts`)

### Changes:
- ✅ Migrated from deprecated `domains` to `remotePatterns` for image optimization
- ✅ Added modern image formats: `avif` and `webp`
- ✅ Increased `minimumCacheTTL` from 480s to 1 year (31536000s) for static images
- ✅ Added responsive `deviceSizes` and `imageSizes` configurations
- ✅ Enabled `compress: true` for better performance

### Before:
```typescript
images: {
  domains: ['api.sejm.gov.pl', ...],
  minimumCacheTTL: 480,
}
```

### After:
```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'api.sejm.gov.pl' },
    ...
  ],
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 31536000,
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

**Impact:** Better image performance, modern format support, longer caching for static assets.

---

## 2. Server-Side Data Fetching (`app/(home)/page.tsx`)

### Changes:
- ✅ Removed unnecessary `Suspense` wrapper (already handled by Next.js)
- ✅ Extracted data fetching logic into separate `getPosts()` function
- ✅ Simplified component structure

### Before:
```typescript
<Suspense fallback={<ArticlesSection isLoading />}>
  <ArticlesSection posts={posts} />
</Suspense>
```

### After:
```typescript
const [posts, allCategories] = await Promise.all([
  getPosts(sort),
  getAllCategories(),
])

return <ArticlesSection posts={posts} />
```

**Impact:** Reduced complexity, better readability, automatic loading states via Next.js.

---

## 3. Client Component Optimization (`app/(home)/articles-section.tsx`)

### Changes:
- ✅ Removed client-side filtering/sorting logic (moved to server)
- ✅ Removed unnecessary state management (`isTransitioning`, `isLoading`)
- ✅ Simplified from 113 lines to ~50 lines (56% reduction)
- ✅ Removed `useMemo` hook (no longer needed)

### Code Reduction:
- **Before:** 113 lines
- **After:** 50 lines  
- **Savings:** 63 lines (56% reduction)

**Impact:** Faster client-side rendering, reduced bundle size, better performance.

---

## 4. Navigation Component (`app/(home)/articles-nav.tsx`)

### Changes:
- ✅ Removed `onTransitionChange` prop and callback
- ✅ Simplified component interface
- ✅ Reduced prop drilling

**Impact:** Cleaner component API, better maintainability.

---

## 5. Vote Processing Optimization (`lib/supabase/processVotes.ts`)

### Changes:
- ✅ Created `aggregateVotes()` helper function to eliminate duplication
- ✅ Added type definitions for vote data structures
- ✅ Simplified error handling
- ✅ Used `Math.floor()` for safety checks
- ✅ Reduced code from 137 lines to ~90 lines (34% reduction)

### Code Reduction:
- **Before:** 137 lines
- **After:** 90 lines
- **Savings:** 47 lines (34% reduction)

**Impact:** DRY code, better type safety, easier maintenance.

---

## 6. Vote Client Functions (`lib/supabase/votes.ts`)

### Changes:
- ✅ Created `DEFAULT_VOTES` constant
- ✅ Simplified error handling with early returns
- ✅ Reduced verbose logging
- ✅ Removed unnecessary comments
- ✅ Reduced code from 95 lines to ~65 lines (32% reduction)

### Code Reduction:
- **Before:** 95 lines
- **After:** 65 lines
- **Savings:** 30 lines (32% reduction)

**Impact:** Cleaner code, better error handling patterns.

---

## 7. Post Voting Component (`components/post-voting.tsx`)

### Changes:
- ✅ Simplified `handleVote` callback logic
- ✅ Combined parallel async operations with `Promise.all()`
- ✅ Removed nested try-catch blocks
- ✅ Reduced code from 199 lines to ~155 lines (22% reduction)

### Code Reduction:
- **Before:** 199 lines
- **After:** 155 lines
- **Savings:** 44 lines (22% reduction)

**Impact:** More readable async code, better error handling.

---

## 8. Data Fetching with React Cache (`lib/supabase/getProceedings.ts`)

### Changes:
- ✅ Kept React's `cache()` function (stable in Next.js 15)
- ❌ Avoided `unstable_cache()` due to incompatibility with Supabase cookies
- ✅ Maintained existing caching strategy with ISR

### Why Not `unstable_cache()`?
`unstable_cache()` cannot be used with functions that access cookies (like Supabase client), causing build errors:
```
Error: Route / couldn't be rendered statically because it used cookies
```

**Impact:** Proper caching without breaking authentication.

---

## 9. Loading States (`app/(home)/loading.tsx`)

### Changes:
- ✅ Added dedicated `loading.tsx` file for home route
- ✅ Created skeleton UI matching actual content layout
- ✅ Leverages Next.js automatic loading UI

**Impact:** Better UX with automatic loading states.

---

## 10. Neo4j Query Fixes (`lib/queries/*.ts`)

### Changes:
- ✅ Added `Math.floor()` to all numeric parameters in `runQuery()` calls
- ✅ Ensured all LIMIT clauses use `toInteger($limit)`
- ✅ Fixed build-time errors with Neo4j integer validation

### Files Updated:
- `lib/queries/topic.ts` - 4 functions fixed
- `lib/queries/process.ts` - 1 function fixed  
- `lib/queries/print.ts` - 1 function fixed

### Error Fixed:
```
Neo.ClientError.Statement.ArgumentError: 
LIMIT: Invalid input. '5.0' is not a valid value. 
Must be a non-negative integer.
```

**Impact:** Build process now completes successfully, production-ready.

---

## Performance Metrics

### Code Reduction:
| File | Before | After | Savings |
|------|--------|-------|---------|
| `articles-section.tsx` | 113 lines | 50 lines | 56% |
| `processVotes.ts` | 137 lines | 90 lines | 34% |
| `votes.ts` | 95 lines | 65 lines | 32% |
| `post-voting.tsx` | 199 lines | 155 lines | 22% |
| **Total** | **544 lines** | **360 lines** | **34% average** |

### Build Status:
- ✅ **Build:** Successfully completes
- ✅ **Type Check:** No errors
- ✅ **Linting:** Passes with minor warnings
- ✅ **Static Generation:** 25/25 pages generated

---

## Best Practices Implemented

1. **Server-First Architecture**
   - Data fetching happens on the server
   - Minimal client-side JavaScript
   - Client components only when necessary (interactions, hooks)

2. **Proper Caching Strategy**
   - ISR with `revalidate` for time-based updates
   - React `cache()` for deduplication
   - Long-term image caching

3. **Type Safety**
   - Explicit type definitions
   - Runtime validation for external data
   - No `any` types (except for temporary Supabase workarounds)

4. **Performance Optimizations**
   - Modern image formats (AVIF, WebP)
   - Proper image sizing
   - Reduced client bundle size
   - Parallel data fetching with `Promise.all()`

5. **Error Handling**
   - Graceful fallbacks
   - Proper error logging
   - Default values for failed operations

---

## Recommendations for Future

### High Priority:
1. ✅ **Image Optimization** - Completed
2. ✅ **Code Deduplication** - Completed
3. ✅ **Server-Side Filtering** - Completed
4. ✅ **Neo4j Type Safety** - Completed

### Medium Priority:
1. 🔄 **Add `metadataBase`** to root layout for proper OG images
2. 🔄 **Fix ESLint warnings** in hooks (missing dependencies)
3. 🔄 **Add loading.tsx** to other routes (envoys, proceedings, etc.)
4. 🔄 **Implement error.tsx** boundaries for better error UX

### Low Priority:
1. 🔄 **Explore React Compiler** when stable (currently experimental)
2. 🔄 **Implement Partial Prerendering (PPR)** when stable
3. 🔄 **Add Playwright tests** for critical user flows
4. 🔄 **Optimize font loading** with `next/font`

---

## Migration Notes

### Breaking Changes: None
All changes are backward compatible and don't affect the user-facing functionality.

### Developer Experience:
- ✅ Faster builds (optimized caching)
- ✅ Cleaner codebase (34% less code)
- ✅ Better TypeScript support
- ✅ Easier maintenance

---

## Conclusion

The Sejmofil codebase is now fully optimized for Next.js 15 with:
- ✅ Modern image optimization
- ✅ Proper server/client component architecture  
- ✅ Reduced code complexity (34% reduction)
- ✅ Production-ready build process
- ✅ Better performance and UX

All optimizations follow Next.js 15 official best practices and maintain the app's democratic transparency mission.

---

**Build Command:** `pnpm build`  
**Build Time:** ~26 seconds  
**Bundle Size:** First Load JS: 102 kB (shared)  
**Pages Generated:** 25 static pages
