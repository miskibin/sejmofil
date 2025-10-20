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
  changeDate?: string | null
}

export async function retrieveContextDocuments(
  embedding: number[],
  limit: number = 5
): Promise<ContextDocument[]> {
  try {
    console.log('[NEO4J] Starting vector search with limit:', limit)
    console.log('[NEO4J] Embedding dimension:', embedding.length)
    
    const documents: ContextDocument[] = []

    // Search Prints with embeddings (ONLY prints for now)
    try {
      const printQuery = `
        CALL db.index.vector.queryNodes('printEmbeddingIndex', $limit, $embedding)
        YIELD node, score
        WHERE node.summary IS NOT NULL
        RETURN 
          node.number as id,
          COALESCE(node.title, 'Druk ' + toString(node.number)) as title,
          node.summary as content,
          'print' as type,
          score,
          node.number as number,
          node.changeDate as changeDate
      `
      console.log('[NEO4J] Executing print query...')
      const prints = await runQuery<any>(printQuery, {
        embedding,
        limit,
      })

      console.log('[NEO4J] Print query returned:', prints?.length || 0, 'results')
      
      if (prints && Array.isArray(prints)) {
        prints.forEach((print: any, i: number) => {
          console.log(`[NEO4J] Print ${i}:`, {
            id: print.id,
            number: print.number,
            title: print.title?.substring(0, 50),
            score: print.score,
            changeDate: print.changeDate,
          })
        })
        
        documents.push(
          ...prints.map((print: any) => {
            const doc: ContextDocument = {
              type: 'print' as const,
              title: print.title || `Druk ${print.number}`,
              content: print.content || '',
              url: `/prints/${print.number}`,
              score: 1 - (print.score || 0),
              id: print.number?.toString() || '',
              number: print.number,
              changeDate: print.changeDate || null,
            }
            console.log('[NEO4J] Created document:', {
              type: doc.type,
              id: doc.id,
              url: doc.url,
              changeDate: doc.changeDate,
              score: doc.score,
            })
            return doc
          })
        )
      }
    } catch (error) {
      console.error('[NEO4J] Error searching prints:', error)
    }

    console.log('[NEO4J] Final documents before sorting:', documents.length)
    
    // Sort by similarity score (higher is better)
    documents.sort((a, b) => b.score - a.score)

    console.log('[NEO4J] Documents after sorting:', documents.length)
    
    // Return only the top N documents
    const result = documents.slice(0, limit)
    console.log('[NEO4J] Returning:', result.length, 'documents')
    result.forEach((doc, i) => {
      console.log(`[NEO4J] Final doc ${i}:`, {
        type: doc.type,
        id: doc.id,
        url: doc.url,
        title: doc.title?.substring(0, 50),
      })
    })
    
    return result
  } catch (error) {
    console.error('[NEO4J] Error retrieving context documents:', error)
    return []
  }
}
