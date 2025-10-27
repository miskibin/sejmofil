# Feature: Redesign Proceeding Point Page - Bold, Engaging Bento Box Layout with Messenger-Style Discussions

## Overview

Transform the proceeding point detail page from the current tabbed layout to a **bold, visually engaging bento box grid layout** with **messenger-style discussion threads**. The redesign prioritizes AI-generated summaries and visual data (charts, stats, voting results) in the viewport, with a hybrid tabbed navigation for secondary content. Discussion statements are displayed as alternating messenger-style bubbles for a more engaging, conversational experience.

**Design Direction**: Bold typography, high contrast stat cards (dark burgundy backgrounds), large visual elements, modern grid-based layout following 2025 UX trends.

## Prerequisites

- Existing Supabase data structure for point details
- Current components: `CardWrapper`, `StatCard`, `DiscussionEntries`, `TopicAttitudeChart`, `VotingList`
- UI components available: `Badge`, `Tabs`, `Card`, `Button`, `Alert`
- Access to speaker club data and AI ratings
- Tailwind CSS with current color palette (primary: #76052a burgundy)

## Implementation Steps

### 1. Create Messenger-Style Discussion Component

**File:** `app/proceedings/[number]/[date]/[id]/components/statement-bubble.tsx`
**Purpose:** Individual statement displayed as alternating left/right chat bubbles with speaker info, summary, citations, and reactions.

**Actions:**

- Create component that accepts: `statement`, `speaker`, `isAlternate` (boolean for left/right positioning)
- Left-aligned for even index speakers, right-aligned for odd
- Display speaker avatar (linked to `/envoys/{id}`), name, club badge
- Show statement summary TLDR in bold, clean typography
- Render citations as styled blockquotes below summary
- Add emotion/manipulation/logic/facts icons with tooltips
- Include statement reactions footer (upvotes/downvotes)
- Add "View full" link to external transcript
- Styling:
  - Left side: bg-muted, border-left accent
  - Right side: bg-primary/10, border-right accent
  - Clean shadows, rounded corners, 12px padding
  - Mobile: stack without left/right distinction

**Key Functions/Methods:**

```typescript
interface StatementBubbleProps {
  statement: Statement
  speaker?: SpeakerInfo
  isAlternate: boolean
  proceedingNumber: number
  proceedingDate: string
}

export function StatementBubble({ ... }: StatementBubbleProps)
```

### 2. Create Messenger-Style Discussion Container

**File:** `app/proceedings/[number]/[date]/[id]/components/messenger-discussion.tsx`
**Purpose:** Manages statement filtering/sorting and renders statement bubbles in messenger-style thread.

**Actions:**

- Accept same props as current `DiscussionEntries` component
- Implement filtering modes: 'featured', 'all', 'normal', and by club
- Group statements by speaker to detect consecutive speakers
- For same speaker's consecutive statements: render as one larger bubble
- Sort by: mode-dependent (featured by emotion/manipulation score, others chronologically)
- Show speaker change as visual break/divider
- Display counter: "Showing X of Y statements"
- Implement "Load more" pagination (show 5-8 statements initially)
- Mobile optimization: single-column, full-width bubbles
- Desktop: still single-column but with better spacing/margins

**Key Functions/Methods:**

```typescript
interface MessengerDiscussionProps {
  statements: Statement[]
  speakerClubs: SpeakerInfo[]
  proceedingNumber: number
  proceedingDate: string
  initialMode?: FilterMode
}

// Helper functions
function groupConsecutiveStatements(statements: Statement[])
function getAlternateIndex(uniqueSpeakersUpToIndex: number): boolean
```

### 3. Create Bento Box Statistics Grid

**File:** `app/proceedings/[number]/[date]/[id]/components/stats-bento-grid.tsx`
**Purpose:** Replace current 3-stat layout with a 2x2 bento box grid layout with flexible sizing.

**Actions:**

- Create 2x2 grid structure using CSS Grid
- **Size 1 (Top-Left, 1x1):** Emotionality stat card
  - Prominent display: large number (e.g., "3/5")
  - Burgundy background (#76052a)
  - White text, bold typography
  - Info icon with tooltip
  - Size: 200x150px

- **Size 2 (Top-Right, 1x1):** Statements count
  - Similar styling to emotionality
  - Show total count

- **Size 3 (Bottom-Left, 1x1):** Participants count
  - Similar styling
- **Size 4 (Bottom-Right, 1x1):** Key metadata badges
  - Official point number
  - Date badge
  - Category badge
  - Stack vertically in this cell

- All cards: hover effects, smooth shadows, rounded corners (12px)
- Mobile: collapse to single column (1x1 each)
- Desktop: maintain 2x2 grid with gaps

**Key Functions/Methods:**

```typescript
interface StatsBentoGridProps {
  emotionality: number
  statementsCount: number
  speakersCount: number
  officialPoint: string
  category: string
  pointDate: string
}

export function StatsBentoGrid({ ... }: StatsBentoGridProps)
```

### 4. Create Hybrid Tabs Component for Secondary Content

**File:** `app/proceedings/[number]/[date]/[id]/components/secondary-content-tabs.tsx`
**Purpose:** Tabbed interface for summary, issues, positions, official info, and documents.

**Actions:**

- Wrap existing `Tabs` component with enhanced styling
- Tabs: "Podsumowanie", "Kwestie sporne", "Stanowiska", "Informacje", "Dokumenty"
- Keep default to first tab with content
- Tab styling: bold text, underline indicator, burgundy accent color
- Content sections:
  - Summary: Markdown content (outtakes)
  - Issues: Markdown content (unresolved)
  - Positions: Markdown content (key_positions)
  - Information: Official topic & official point display
  - Documents: Existing PrintSection component
- Lazy load content (only fetch/render active tab)
- Min-height: 300px for content area
- Mobile: full-width tabs with horizontal scroll if needed

**Key Functions/Methods:**

```typescript
interface SecondaryContentTabsProps {
  summaryMain: SummaryMain | null
  officialTopic: string
  officialPoint: string
  prints: PrintWithStages[]
}

export function SecondaryContentTabs({ ... }: SecondaryContentTabsProps)
```

### 5. Create Club Attitude & Voting Bento Section

**File:** `app/proceedings/[number]/[date]/[id]/components/analysis-bento-grid.tsx`
**Purpose:** Side-by-side grid combining club attitude chart and voting results in bento layout.

**Actions:**

- Create 1x2 horizontal bento grid (2 equal columns)
- Left column (1x1): "Analiza klubów" card
  - Existing TopicAttitudeChart component
  - Empty state if < 7 clubs
  - Title: "Stosunek do tematu"
- Right column (1x1): "Głosowania" card
  - Existing VotingList component
  - Title: "Wyniki głosowań"
  - Empty state if no votings

- Both cards: same burgundy theme, consistent styling
- Mobile: stack vertically (full width each)
- Desktop: side by side with equal width

**Key Functions/Methods:**

```typescript
interface AnalysisBentoGridProps {
  chartData: ChartDataPoint[]
  votingResults: VotingResult[]
}

export function AnalysisBentoGrid({ ... }: AnalysisBentoGridProps)
```

### 6. Redesign Main Page Layout Structure

**File:** `app/proceedings/[number]/[date]/[id]/page.tsx` (modify)
**Purpose:** Update page layout to use bento grid sections and new components.

**Actions:**

- Keep existing data fetching logic (no API changes)
- Reorganize JSX structure:
  1. Header section (title, badges, category) - **unchanged**
  2. Alert section for related points - **unchanged**
  3. NEW: Stats Bento Grid (emotionality, statements, participants, metadata)
  4. NEW: Secondary Content Tabs (summary, issues, positions, info, documents)
  5. NEW: Analysis Bento Grid (charts + voting)
  6. NEW: Full-width Messenger Discussion section
  7. Navigation buttons (prev/next) - **unchanged**

- Update class names and layout structure
- Remove old 3-stat card layout
- Remove old CardWrapper wrappers around tabs
- Simplify grid classes:

  ```
  grid grid-cols-1 lg:grid-cols-2 gap-6
  ```

- Maintain ISR revalidation (3600s)

**Grid Structure**:

```
┌─────────────────────────────────────┐
│     Header (Title + Badges)         │
├─────────────────────────────────────┤
│     Alert (if related point)        │
├──────────────────┬──────────────────┤
│  Stats Bento     │  Stats Bento     │
│  (2x2 grid)      │  (2x2 grid)      │
├─────────────────────────────────────┤
│  Secondary Tabs (Full Width)        │
├─────────────────────────────────────┤
│   Analysis Grid (Charts + Voting)   │
├──────────────────┬──────────────────┤
│  Attitude Chart  │  Voting Results  │
├─────────────────────────────────────┤
│  Messenger Discussion (Full Width)  │
│  ─────────────────────────────────  │
│  [Left Bubble]                      │
│                      [Right Bubble] │
│  [Left Bubble]                      │
├─────────────────────────────────────┤
│   Prev / Next Navigation            │
└─────────────────────────────────────┘
```

### 7. Update Typography & Visual Hierarchy

**File:** `globals.css` or component Tailwind classes
**Purpose:** Implement bold, engaging typography following 2025 trends.

**Actions:**

- Stat cards: Use bold, large numbers (text-4xl or text-5xl)
- Card titles: Bold, uppercase tracking (font-bold tracking-wide)
- Section headers: Large, semibold, 2xl minimum
- Primary buttons/actions: Bold text, high contrast
- Hover effects: Smooth transitions, shadow lift
- Color scheme:
  - Primary (stat cards): #76052a (burgundy)
  - Text on primary: white
  - Accent: Keep existing highlight colors
  - Neutral backgrounds: Light gray (#f5f5f5)
- Update stat card styling:
  ```
  bg-primary text-primary-foreground font-bold text-4xl
  shadow-lg hover:shadow-xl transition-shadow
  rounded-lg p-6
  ```

### 8. Create & Style Messenger Discussion Filter Controls

**File:** Update `messenger-discussion.tsx`
**Purpose:** Add filter dropdown and mode selection UI to messenger component.

**Actions:**

- Above discussion thread: horizontal filter bar
- "Wyróżnione" dropdown (bold styling)
- Options:
  - "Najciekawsze" (featured mode - high emotion/manipulation)
  - "Chronologicznie" (normal mode)
  - "Wszystkie" (all mode)
  - Club filter options (dynamically from speakerClubs)
- Right side: display count "(X z Y)" showing filtered vs total
- Mobile: dropdown takes full width
- Desktop: dropdown inline with counter

### 9. Responsive Design Adjustments

**File:** All component files with Tailwind responsive classes
**Purpose:** Ensure bold design works on all screen sizes.

**Actions:**

- Mobile (< 768px):
  - Single-column layout throughout
  - Stat cards: 1x1 stacked
  - Messenger bubbles: full-width, no left/right distinction
  - Tabs: horizontal scroll if needed
  - Chart: scrollable container
  - Larger touch targets (min 44px)
  - Reduced padding for mobile screens

- Tablet (768px - 1024px):
  - 2-column grids where possible
  - Stat bento: 2x2 maintained
  - Side-by-side analysis grid

- Desktop (> 1024px):
  - Full bento grid layouts
  - Generous spacing and whitespace
  - Charts fully interactive

- All breakpoints: Tailwind utilities (sm:, md:, lg:)

## Data Models

### StatementBubble Props

```typescript
interface Statement {
  id: number
  speaker_name: string
  number_source: number
  number_sequence: number
  statement_ai: {
    summary_tldr: string
    citations: string[]
    speaker_rating: Record<string, number>
  }
}

interface SpeakerInfo {
  name: string
  club: string
  id: number
}
```

### Stats Bento Grid Data

```typescript
interface StatsBentoData {
  emotionality: number // 1-5 average
  statementsCount: number
  speakersCount: number
  officialPoint: string
  category: string
  pointDate: string
}
```

### Messenger Discussion Modes

```typescript
type FilterMode = 'featured' | 'all' | 'normal' | string // string for club names

interface MessengerState {
  filterMode: FilterMode
  displayedCount: number
  isExpanded: boolean
}
```

## Integration Points

### With Existing Components

- **CardWrapper**: No longer wraps main sections; used selectively for analysis cards
- **StatCard**: Replaced by StatsBentoGrid but styling patterns reused
- **DiscussionEntries**: Replaced by MessengerDiscussion; reuse logic (filtering, sorting)
- **TopicAttitudeChart**: Integrated into AnalysisBentoGrid unchanged
- **VotingList**: Integrated into AnalysisBentoGrid unchanged
- **Tabs**: Used for secondary content, restyled

### With Data Layer

- No API changes; existing `getPointDetails` fetch remains identical
- Data transformation logic moves from page.tsx to components
- Speaker club mapping still comes from `getClubAndIdsByNames`
- Voting results still from `getVotingResultsByNumbrs`

### With Server/Client Components

- Main page remains server component (data fetching)
- New components that use hooks ('use client'):
  - `messenger-discussion.tsx` (filter state, URL params)
  - `secondary-content-tabs.tsx` (active tab state)
- Stateless components: all bento grids, statement bubbles

## Configuration

### Tailwind Classes Used

```
- grid grid-cols-1 lg:grid-cols-2 gap-6
- bg-primary text-primary-foreground
- font-bold text-4xl md:text-5xl
- hover:shadow-xl transition-shadow
- rounded-lg p-6
- max-w-prose prose prose-sm
```

### Color Palette

- Primary: `#76052a` (current, used for stat cards)
- Accent: `#ef4444` for highlights
- Background: `#ffffff` and `#f5f5f5`
- Text: `#1f2937` (dark) and `#6b7280` (muted)
- Borders: `#e5e7eb`

### Typography

- Headings: Bold, uppercase tracking
- Stats: Bold, large size (text-4xl+)
- Body: Normal weight, readable line-height (1.6)
- Labels: Semibold, small size

### Spacing

- Gap between grids: `gap-6` (24px)
- Card padding: `p-6` (24px)
- Mobile padding: `p-4` (16px)
- Section margins: `space-y-6`

## Implementation Order

**Phase 1: Components (Foundation)**

1. StatementBubble component (single statement display)
2. StatsBentoGrid component (stat cards layout)
3. SecondaryContentTabs component (tabbed content)
4. AnalysisBentoGrid component (charts + voting)

**Phase 2: Integration (Main Logic)** 5. MessengerDiscussion component (discussion thread with filtering) 6. Update main page.tsx layout and structure

**Phase 3: Polish (UX/Refinement)** 7. Responsive design adjustments across all components 8. Typography and visual hierarchy refinement 9. Hover effects and transitions 10. Mobile optimization

## Success Criteria

✅ Bold, engaging visual design with high-contrast stat cards
✅ Information hierarchy prioritizes AI summaries and visual data first
✅ Discussion displayed as messenger-style bubbles (alternating left/right)
✅ Bento box grid layout for stats and analysis sections
✅ Secondary content (summary, issues, positions) accessible via tabs
✅ Full-width discussion section below analysis
✅ Fully responsive on mobile, tablet, and desktop
✅ All original data displayed; no information loss
✅ Smooth transitions and modern hover effects
✅ Same data fetching/performance; no API changes
