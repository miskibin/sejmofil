# Topic Page UI Mockup

## Desktop Layout (1920x1080)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ NAVBAR: Logo | Posłowie | Procesy | Posiedzenia | [Search] | O Projekcie   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          HEADER (Gradient Background)                        │
│  ╭────╮                                                                      │
│  │ 💡 │  [Temat parlamentarny]                                              │
│  ╰────╯  Koronawirus                                                        │
│                                                                              │
│  Opis tematu - Lorem ipsum dolor sit amet, consectetur adipiscing elit...   │
│                                                    [Decorative blur orbs]    │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────┬────────────────┬────────────────┐
│   ┌────────┐   │   ┌────────┐   │   ┌────────┐   │
│   │   15   │   │   │   42   │   │   │   89   │   │
│   └────────┘   │   └────────┘   │   └────────┘   │
│ Procesów       │ Punktów obrad  │ Druków         │
│ legislacyjnych │                │ sejmowych      │
└────────────────┴────────────────┴────────────────┘

┌──────────────────────────────────────┬───────────────────────────┐
│ LEFT COLUMN (2/3 width)              │ RIGHT COLUMN (1/3 width)  │
│                                      │                           │
│ ╔════════════════════════════════╗  │ ╔═══════════════════════╗ │
│ ║ 📖 Procesy legislacyjne        ║  │ ║ ✨ Podobne tematy     ║ │
│ ╚════════════════════════════════╝  │ ╚═══════════════════════╝ │
│ ┌────────────────────────────────┐  │ ┌───────────────────────┐ │
│ │ [Ustawa] Proces #8245          │  │ │ Pandemia             │ │
│ │ Ustawa o zmianie...            │  │ │ Związana z COVID...  │ │
│ │ Opis procesu...         [Date] │  │ └───────────────────────┘ │
│ └────────────────────────────────┘  │ ┌───────────────────────┐ │
│ ┌────────────────────────────────┐  │ │ Służba zdrowia       │ │
│ │ [Projekt] Proces #8144         │  │ │ Tematy medyczne...   │ │
│ │ Projekt ustawy...              │  │ └───────────────────────┘ │
│ │ Lorem ipsum...          [Date] │  │ ┌───────────────────────┐ │
│ └────────────────────────────────┘  │ │ Epidemiologia        │ │
│                                      │ │ Badania nad...       │ │
│ ╔════════════════════════════════╗  │ └───────────────────────┘ │
│ ║ 📄 Punkty obrad                ║  │                           │
│ ╚════════════════════════════════╝  │ ╔═══════════════════════╗ │
│ ┌────────────────────────────────┐  │ ║ 📄 Druki sejmowe      ║ │
│ │ Debata o COVID-19              │  │ ╚═══════════════════════╝ │
│ │ Streszczenie...                │  │ ┌───────────────────────┐ │
│ │ [15. posiedzenie] [3 głosowań] │  │ │ #5234 [Ustawa]       │ │
│ │                         [Date] │  │ │ Projekt w sprawie... │ │
│ └────────────────────────────────┘  │ │              [Date]  │ │
│ ┌────────────────────────────────┐  │ └───────────────────────┘ │
│ │ Raport stanu epidemii          │  │ ┌───────────────────────┐ │
│ │ Przedstawienie raportu...      │  │ │ #5189 [Raport]       │ │
│ │ [16. posiedzenie] [1 głosowań] │  │ │ Sprawozdanie z...    │ │
│ │                         [Date] │  │ │              [Date]  │ │
│ └────────────────────────────────┘  │ └───────────────────────┘ │
└──────────────────────────────────────┴───────────────────────────┘
```

## Mobile Layout (375x667)

```
┌───────────────────────────────┐
│ [☰] 🏛️ [Search] [Login]      │
├───────────────────────────────┤
│                               │
│  ╭────╮                       │
│  │ 💡 │ [Temat parlamentarny] │
│  ╰────╯                       │
│  Koronawirus                  │
│                               │
│  Opis tematu - Lorem ipsum... │
│                               │
├───────────────────────────────┤
│  ┌─────────────┐              │
│  │     15      │              │
│  └─────────────┘              │
│  Procesów                     │
│  legislacyjnych               │
├───────────────────────────────┤
│  ┌─────────────┐              │
│  │     42      │              │
│  └─────────────┘              │
│  Punktów obrad                │
├───────────────────────────────┤
│  ┌─────────────┐              │
│  │     89      │              │
│  └─────────────┘              │
│  Druków sejmowych             │
├───────────────────────────────┤
│ 📖 Procesy legislacyjne       │
├───────────────────────────────┤
│ [Ustawa] Proces #8245         │
│ Ustawa o zmianie...           │
│ Opis...              [Date]   │
├───────────────────────────────┤
│ [Projekt] Proces #8144        │
│ Projekt ustawy...             │
│ Lorem ipsum...       [Date]   │
├───────────────────────────────┤
│ 📄 Punkty obrad               │
├───────────────────────────────┤
│ Debata o COVID-19             │
│ Streszczenie...               │
│ [15. posiedzenie]             │
│                      [Date]   │
├───────────────────────────────┤
│ ✨ Podobne tematy             │
├───────────────────────────────┤
│ Pandemia                      │
│ Związana z COVID...           │
├───────────────────────────────┤
│ 📄 Druki sejmowe              │
├───────────────────────────────┤
│ #5234 [Ustawa]                │
│ Projekt w sprawie...  [Date]  │
└───────────────────────────────┘
```

## Color Scheme

### Primary Colors
- Primary: `#76052a` (Dark red from Sejm branding)
- Primary Light: `rgba(118, 5, 42, 0.1)` for backgrounds
- Primary Hover: `#7A1230`

### Gradients
- Header: `from-primary/10 via-primary/5 to-background`
- Decorative orbs: `bg-primary/20` and `bg-primary/10` with `blur-3xl`

### Text Colors
- Heading: Default foreground
- Body: `text-muted-foreground`
- Links: `text-primary` with `hover:text-primary/80`

### Backgrounds
- Cards: `bg-gray-50` with `hover:bg-gray-100`
- Badges: `bg-secondary` or `bg-outline`

## Interactive Elements

### Hover Effects
- Cards scale slightly and get shadow: `hover:shadow-md`
- Background lightens: `hover:bg-gray-100`
- Links: Color transitions

### Click Targets
All cards and items are clickable:
- Processes → `/processes/[number]`
- Proceeding points → `/proceedings/[number]/[date]/[id]`
- Similar topics → `/topics/[name]`
- Prints → `/prints/[number]`

## Icons Used

- 💡 Lightbulb (topic icon)
- 📖 BookOpen (processes)
- 📄 FileText (proceedings, prints)
- ✨ Sparkles (similar topics, AI-powered)

## Typography

- Page title (H1): `text-3xl font-bold`
- Section titles: `text-lg font-semibold`
- Card titles: `font-medium leading-tight`
- Descriptions: `text-sm text-muted-foreground`
- Stats numbers: `text-4xl font-bold text-primary`

## Spacing

- Container: `container mx-auto space-y-6 py-6`
- Grid gaps: `gap-4` or `gap-6`
- Card padding: `p-4` or `p-6`
- Section spacing: `space-y-3` or `space-y-4`

## Responsive Breakpoints

- Mobile: Default (< 768px)
- Tablet: `md:` (768px - 1024px)
- Desktop: `lg:` (> 1024px)

Grid changes:
- Stats: `grid-cols-1 md:grid-cols-3`
- Main layout: `lg:grid-cols-3` with `lg:col-span-2` for left column
- Topics list: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
