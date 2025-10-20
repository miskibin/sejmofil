/**
 * Retrieve context documents from Neo4j based on embedding similarity
 * This function performs vector similarity search on Neo4j nodes with embeddings
 * Supported node types: Topic, Print, Organization
 */

import { runQuery } from '@/lib/db/client'

export interface ContextDocument {
  type: 'topic' | 'print' | 'organization'
  title: string
  content: string
  url?: string | null
  score: number
  id: string
  number?: string
}

export async function retrieveContextDocuments(
  embedding: number[],
  limit: number = 5
): Promise<ContextDocument[]> {
  try {
    const documents: ContextDocument[] = []

    // Search Topics with embeddings
    try {
      const topicQuery = `
        CALL db.index.vector.queryNodes('topicEmbeddingIndex', $limit, $embedding)
        YIELD node, score
        RETURN 
          node.id as id,
          node.name as title,
          node.description as content,
          'topic' as type,
          score,
          null as number
      `
      const topics = await runQuery<any>(topicQuery, {
        embedding,
        limit: Math.ceil(limit / 3),
      })

      if (topics && Array.isArray(topics)) {
        documents.push(
          ...topics.map((topic: any) => ({
            type: 'topic' as const,
            title: topic.title || 'Temat',
            content: topic.content || '',
            url: `/topics/${topic.id}`,
            score: 1 - (topic.score || 0), // Convert distance to similarity
            id: topic.id,
          }))
        )
      }
    } catch (error) {
      console.warn('Error searching topics:', error)
    }

    // Search Prints with embeddings
    try {
      const printQuery = `
        CALL db.index.vector.queryNodes('printEmbeddingIndex', $limit, $embedding)
        YIELD node, score
        WHERE node.summary IS NOT NULL
        RETURN 
          node.id as id,
          COALESCE(node.title, CONCAT('Druk ', node.number)) as title,
          node.summary as content,
          'print' as type,
          score,
          node.number as number
      `
      const prints = await runQuery<any>(printQuery, {
        embedding,
        limit: Math.ceil(limit / 3),
      })

      if (prints && Array.isArray(prints)) {
        documents.push(
          ...prints.map((print: any) => ({
            type: 'print' as const,
            title: print.title || `Druk ${print.number}`,
            content: print.content || '',
            url: `/prints/${print.id}`,
            score: 1 - (print.score || 0),
            id: print.id,
            number: print.number,
          }))
        )
      }
    } catch (error) {
      console.warn('Error searching prints:', error)
    }

    // Search Organizations with embeddings
    try {
      const orgQuery = `
        CALL db.index.vector.queryNodes('organizationEmbeddingIndex', $limit, $embedding)
        YIELD node, score
        RETURN 
          node.id as id,
          node.name as title,
          node.description as content,
          'organization' as type,
          score,
          null as number
      `
      const organizations = await runQuery<any>(orgQuery, {
        embedding,
        limit: Math.ceil(limit / 3),
      })

      if (organizations && Array.isArray(organizations)) {
        documents.push(
          ...organizations.map((org: any) => ({
            type: 'organization' as const,
            title: org.title || 'Organizacja',
            content: org.content || '',
            url: null,
            score: 1 - (org.score || 0),
            id: org.id,
          }))
        )
      }
    } catch (error) {
      console.warn('Error searching organizations:', error)
    }

    // Sort by similarity score (higher is better)
    documents.sort((a, b) => b.score - a.score)

    // Return only the top N documents
    return documents.slice(0, limit)
  } catch (error) {
    console.error('Error retrieving context documents:', error)
    return []
  }
}
