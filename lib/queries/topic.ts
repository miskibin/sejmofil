import { runQuery } from '../db/client'
import { PrintShort } from '../types/print'
import { Topic } from '../types/process'

export interface TopicWithId extends Topic {
  id: string
}

export interface TopicDetails {
  id: string
  name: string
  description: string
  embedding: number[]
  type?: 'Topic' | 'Organization'
}

export type EntityType = 'Topic' | 'Organization'

/**
 * Get entity (topic or organization) details by name
 * Automatically detects entity type from database
 */
export async function getEntityByName(
  entityName: string,
  entityType?: EntityType
): Promise<TopicDetails | null> {
  // If type is specified, use it directly
  if (entityType) {
    const query = `
      MATCH (e:${entityType} {name: $entityName})
      RETURN e {
        id: e.name,
        name: e.name,
        description: e.description,
        embedding: e.embedding,
        type: '${entityType}'
      } as entity
    `
    const result = await runQuery<{ entity: TopicDetails }>(query, {
      entityName,
    })
    return result[0]?.entity || null
  }

  // Auto-detect type by searching both
  const query = `
    MATCH (e {name: $entityName})
    WHERE e:Topic OR e:Organization
    RETURN e {
      id: e.name,
      name: e.name,
      description: e.description,
      embedding: e.embedding,
      type: labels(e)[0]
    } as entity
    LIMIT 1
  `
  const result = await runQuery<{ entity: TopicDetails }>(query, {
    entityName,
  })
  return result[0]?.entity || null
}

/**
 * Get topic details by name (used as ID)
 */
export async function getTopicByName(
  topicName: string
): Promise<TopicDetails | null> {
  return getEntityByName(topicName, 'Topic')
}

/**
 * Get all prints related to an entity (topic or organization)
 */
export async function getPrintsByEntity(
  entityName: string,
  entityType: EntityType = 'Topic',
  limit: number = 20
): Promise<PrintShort[]> {
  const query = `
    MATCH (p:Print)-[:REFERS_TO]->(e:${entityType} {name: $entityName})
    WHERE p.short_title IS NOT NULL
    RETURN p.number as number,
           p.short_title as title,
           p.documentDate as documentDate,
           p.processPrint as processPrint,
           p.summary as summary,
           p.documentType as type,
           p.category as category,
           p.status as status
    ORDER BY p.documentDate DESC
    LIMIT toInteger($limit)
  `

  const res = await runQuery<PrintShort>(query, {
    entityName,
    limit: Math.floor(limit),
  })
  return res
}

/**
 * Get all prints related to a topic
 */
export async function getPrintsByTopic(
  topicName: string,
  limit: number = 20
): Promise<PrintShort[]> {
  return getPrintsByEntity(topicName, 'Topic', limit)
}

/**
 * Get processes related to a topic through prints
 */
export async function getProcessesByTopic(
  topicName: string,
  limit: number = 10
): Promise<
  Array<{
    number: string
    title: string
    documentType: string
    description: string
    changeDate: string
  }>
> {
  const query = `
    MATCH (print:Print)-[:REFERS_TO]->(topic:Topic {name: $topicName})
    MATCH (print)-[:IS_SOURCE_OF]->(process:Process)
    RETURN DISTINCT process {
      number: process.number,
      title: process.title,
      documentType: process.documentType,
      description: process.description,
      changeDate: process.changeDate
    }
    ORDER BY process.changeDate DESC
    LIMIT toInteger($limit)
  `

  const res = await runQuery<{
    number: string
    title: string
    documentType: string
    description: string
    changeDate: string
  }>(query, { topicName, limit: Math.floor(limit) })
  return res
}

/**
 * Get similar entities using embeddings
 */
export async function getSimilarEntities(
  entityName: string,
  entityType: EntityType = 'Topic',
  limit: number = 5
): Promise<Array<TopicWithId & { type: EntityType }>> {
  const query = `
    MATCH (source:${entityType} {name: $entityName})
    WHERE source.embedding IS NOT NULL
    WITH source
    MATCH (other:${entityType})
    WHERE other <> source 
      AND other.embedding IS NOT NULL
    WITH other, source,
         gds.similarity.cosine(source.embedding, other.embedding) as similarity
    WHERE similarity > 0.5
    RETURN other.name as name,
           other.description as description,
           '${entityType}' as type
    ORDER BY similarity DESC
    LIMIT toInteger($limit)
  `

  const res = await runQuery<TopicWithId & { type: EntityType }>(query, {
    entityName,
    limit: Math.floor(limit),
  })
  return res
}

/**
 * Get similar topics using embeddings
 */
export async function getSimilarTopics(
  topicName: string,
  limit: number = 5
): Promise<TopicWithId[]> {
  return getSimilarEntities(topicName, 'Topic', limit)
}

/**
 * Get all entities (topics and/or organizations) with their print counts
 */
export async function getAllEntities(
  entityTypes: EntityType[] = ['Topic', 'Organization'],
  limit: number = 100
): Promise<Array<TopicWithId & { printCount: number; type: EntityType }>> {
  const labels = entityTypes.join('|')
  const query = `
    MATCH (e:${labels})<-[:REFERS_TO]-(p:Print)
    WITH e, count(p) as printCount, labels(e)[0] as entityType
    WHERE printCount > 0
    RETURN e {
      id: e.name,
      name: e.name,
      description: e.description
    } as entity, printCount, entityType as type
    ORDER BY printCount DESC
    LIMIT toInteger($limit)
  `

  const res = await runQuery<{
    entity: TopicWithId
    printCount: number
    type: EntityType
  }>(query, { limit: Math.floor(limit) })
  return res.map((r) => ({ ...r.entity, printCount: r.printCount, type: r.type }))
}

/**
 * Search entities by name or description
 * Uses fulltext index if available, falls back to CONTAINS
 */
export async function searchEntities(
  searchQuery: string,
  entityTypes: EntityType[] = ['Topic', 'Organization'],
  limit: number = 20
): Promise<Array<TopicWithId & { printCount: number; type: EntityType }>> {
  const labels = entityTypes.join('|')
  
  // Try fulltext search first (requires index)
  try {
    const fulltextQuery = `
      CALL db.index.fulltext.queryNodes("entity_content", $searchQuery) YIELD node, score
      WHERE (node:Topic OR node:Organization)
      WITH node, score
      MATCH (node)<-[:REFERS_TO]-(p:Print)
      WITH node, count(p) as printCount, labels(node)[0] as entityType, score
      RETURN node {
        id: node.name,
        name: node.name,
        description: node.description
      } as entity, printCount, entityType as type
      ORDER BY score DESC
      LIMIT toInteger($limit)
    `
    
    const res = await runQuery<{
      entity: TopicWithId
      printCount: number
      type: EntityType
    }>(fulltextQuery, { searchQuery, limit: Math.floor(limit) })
    
    if (res.length > 0) {
      return res.map((r) => ({ ...r.entity, printCount: r.printCount, type: r.type }))
    }
  } catch (error) {
    console.log('Fulltext index not available, falling back to CONTAINS search')
  }
  
  // Fallback to CONTAINS search
  const query = `
    MATCH (e:${labels})<-[:REFERS_TO]-(p:Print)
    WHERE toLower(e.name) CONTAINS toLower($searchQuery)
       OR toLower(e.description) CONTAINS toLower($searchQuery)
    WITH e, count(p) as printCount, labels(e)[0] as entityType
    RETURN e {
      id: e.name,
      name: e.name,
      description: e.description
    } as entity, printCount, entityType as type
    ORDER BY printCount DESC
    LIMIT toInteger($limit)
  `

  const res = await runQuery<{
    entity: TopicWithId
    printCount: number
    type: EntityType
  }>(query, { searchQuery, limit: Math.floor(limit) })
  return res.map((r) => ({ ...r.entity, printCount: r.printCount, type: r.type }))
}

/**
 * Get all topics with their print counts
 */
export async function getAllTopics(
  limit: number = 50
): Promise<Array<TopicWithId & { printCount: number }>> {
  const entities = await getAllEntities(['Topic'], limit)
  return entities
}
