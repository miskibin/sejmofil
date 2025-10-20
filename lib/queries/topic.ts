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
}

/**
 * Get topic details by name (used as ID)
 */
export async function getTopicByName(
  topicName: string
): Promise<TopicDetails | null> {
  const query = `
    MATCH (t:Topic {name: $topicName})
    RETURN t {
      id: t.name,
      name: t.name,
      description: t.description,
      embedding: t.embedding
    } as topic
  `
  const result = await runQuery<{ topic: TopicDetails }>(query, { topicName })
  return result[0]?.topic || null
}

/**
 * Get all prints related to a topic
 */
export async function getPrintsByTopic(
  topicName: string,
  limit: number = 20
): Promise<PrintShort[]> {
  const query = `
    MATCH (p:Print)-[:REFERS_TO]->(t:Topic {name: $topicName})
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

  const res = await runQuery<PrintShort>(query, { topicName, limit: Math.floor(limit) })
  return res
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
 * Get similar topics using embeddings
 */
export async function getSimilarTopics(
  topicName: string,
  limit: number = 5
): Promise<TopicWithId[]> {
  const query = `
    MATCH (sourceTopic:Topic {name: $topicName})
    WHERE sourceTopic.embedding IS NOT NULL
    WITH sourceTopic
    MATCH (otherTopic:Topic)
    WHERE otherTopic <> sourceTopic 
      AND otherTopic.embedding IS NOT NULL
    WITH otherTopic, sourceTopic,
         gds.similarity.cosine(sourceTopic.embedding, otherTopic.embedding) as similarity
    WHERE similarity > 0.5
    RETURN otherTopic.name as name,
           otherTopic.description as description
    ORDER BY similarity DESC
    LIMIT toInteger($limit)
  `

  const res = await runQuery<TopicWithId>(query, {
    topicName,
    limit: Math.floor(limit),
  })
  return res
}

/**
 * Get all topics with their print counts
 */
export async function getAllTopics(
  limit: number = 50
): Promise<Array<TopicWithId & { printCount: number }>> {
  const query = `
    MATCH (t:Topic)<-[:REFERS_TO]-(p:Print)
    WITH t, count(p) as printCount
    WHERE printCount > 0
    RETURN t {
      id: t.name,
      name: t.name,
      description: t.description
    } as topic, printCount
    ORDER BY printCount DESC
    LIMIT toInteger($limit)
  `

  const res = await runQuery<{
    topic: TopicWithId
    printCount: number
  }>(query, { limit: Math.floor(limit) })
  return res.map((r) => ({ ...r.topic, printCount: r.printCount }))
}
