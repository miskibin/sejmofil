# Topic Pages Feature

## Overview

This feature adds comprehensive topic pages to Sejmofil, allowing users to explore parliamentary topics and their related content.

## Routes

### Topic Detail Page

**URL Pattern:** `/topics/[id]` where `[id]` is the URL-encoded topic name

**Example:**

- `/topics/Koronawirus`
- `/topics/Obrona%20narodowa`

### Topics List Page

**URL:** `/topics`

Shows all available topics with their print counts.

## Data Sources

### Neo4j (Knowledge Graph)

- Topic nodes with `name`, `description`, and `embedding` properties
- Relationships: `Print-[:REFERS_TO]->Topic`
- Used for:
  - Topic details
  - Related prints
  - Related processes (through prints)
  - Similar topics (using cosine similarity on embeddings)

### Supabase (PostgreSQL)

- Used to find proceeding points that discussed prints related to the topic
- Links topics to actual parliamentary proceedings

## Page Features

### Topic Detail Page (`/topics/[id]`)

#### Header Section

- Topic name and description
- Gradient background with decorative elements
- "Temat parlamentarny" badge

#### Statistics Cards

Three cards showing:

1. Number of related legislative processes
2. Number of proceeding points
3. Number of related prints

#### Main Content Sections

**1. Procesy legislacyjne (Legislative Processes)**

- Shows all processes related to the topic
- Each process card includes:
  - Document type badge
  - Process number
  - Title and description
  - Date
- Click to navigate to `/processes/[number]`

**2. Punkty obrad (Proceeding Points)**

- Shows proceeding points where topic was discussed
- Each point includes:
  - Topic title
  - Summary (TL;DR)
  - Proceeding title badge
  - Number of votings badge
  - Date
- Click to navigate to full proceeding point

**3. Podobne tematy (Similar Topics)**

- AI-powered recommendations using embeddings
- Cosine similarity threshold: 0.7
- Shows name and description
- Click to navigate to similar topic

**4. Druki sejmowe (Parliamentary Prints)**

- Lists all prints related to the topic
- Shows print number, type, title, date, and summary
- Click to navigate to `/prints/[number]`

### Topics List Page (`/topics`)

- Grid layout (responsive: 1/2/3 columns)
- Each card shows:
  - Topic name
  - Description (truncated to 3 lines)
  - Number of related prints
- Sorted by print count (descending)

## Technical Implementation

### Query Functions

Located in `lib/queries/topic.ts`:

```typescript
// Get topic by name
const topic = await getTopicByName('Koronawirus')

// Get processes for topic
const processes = await getProcessesByTopic('Koronawirus', 10)

// Get prints for topic
const prints = await getPrintsByTopic('Koronawirus', 20)

// Get similar topics
const similar = await getSimilarTopics('Koronawirus', 5)

// Get all topics
const allTopics = await getAllTopics(100)
```

Located in `lib/supabase/getProceedingPointsByPrintNumbers.ts`:

```typescript
// Get proceeding points by print numbers
const points = await getProceedingPointsByPrintNumbers(['1234', '5678'])
```

### Neo4j Queries

**Similar Topics using Embeddings:**

```cypher
MATCH (sourceTopic:Topic {name: $topicName})
WHERE sourceTopic.embedding IS NOT NULL
WITH sourceTopic
MATCH (otherTopic:Topic)
WHERE otherTopic <> sourceTopic
  AND otherTopic.embedding IS NOT NULL
WITH otherTopic, sourceTopic,
     gds.similarity.cosine(sourceTopic.embedding, otherTopic.embedding) as similarity
WHERE similarity > 0.7
RETURN otherTopic, similarity
ORDER BY similarity DESC
```

**Processes by Topic:**

```cypher
MATCH (print:Print)-[:REFERS_TO]->(topic:Topic {name: $topicName})
MATCH (print)-[:IS_SOURCE_OF]->(process:Process)
RETURN DISTINCT process
ORDER BY process.changeDate DESC
```

## UI Components Used

- `CardWrapper` - Consistent card styling
- `Badge` - Topic types, document types, etc.
- `Tabs` - Not used in topic pages, but available for future enhancements
- Lucide icons: `Lightbulb`, `BookOpen`, `FileText`, `Sparkles`
- `ReactMarkdown` - For rendering print summaries

## Responsive Design

- Mobile: Single column layout
- Tablet: 2-column grid for topics list
- Desktop: 3-column layout with sidebar and main content

## SEO & Metadata

Each topic page includes:

- Dynamic title: Topic name
- Dynamic description: Topic description or fallback
- Proper URL encoding for topic names with special characters

## Future Enhancements

Potential additions:

- Topic timeline showing activity over time
- Network graph visualization of topic relationships
- Filtering by date range
- Topic statistics (trending, most active, etc.)
- Export topic data as PDF/CSV
- Subscribe to topic updates
- Topic comparison view

## Testing

To test the feature:

1. Ensure Neo4j is populated with Topic nodes and relationships
2. Visit `/topics` to see all topics
3. Click on a topic to see its detail page
4. Verify all sections populate with data
5. Test similar topics recommendations
6. Verify links navigate correctly
