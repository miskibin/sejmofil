#!/usr/bin/env node

/**
 * Debug script for testing Neo4j vector search functionality
 * Run with: npx tsx debug-neo4j.ts
 */

import { config } from 'dotenv'
import { runQuery } from './lib/db/client'
import OpenAI from 'openai'

// Load environment variables
config()

// Initialize OpenAI client only if API key is available
let openai: OpenAI | null = null
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
} catch (error) {
  console.log('⚠️  OpenAI not available, skipping embedding tests')
}

async function testNeo4jConnection() {
  console.log('🔗 Testing Neo4j connection...')

  try {
    const testQuery = 'RETURN "Neo4j connection successful" as message'
    const result = await runQuery<{ message: string }>(testQuery)
    console.log('✅ Neo4j connection:', result[0]?.message)
    return true
  } catch (error) {
    console.error('❌ Neo4j connection failed:', error)
    return false
  }
}

async function checkVectorIndexes() {
  console.log('\n📊 Checking vector indexes...')

  const indexes = [
    'topicEmbeddingIndex',
    'printEmbeddingIndex',
    'organizationEmbeddingIndex'
  ]

  for (const indexName of indexes) {
    try {
      const query = `
        CALL db.indexes() YIELD name, type, labelsOrTypes, properties
        WHERE name = $indexName
        RETURN name, type, labelsOrTypes, properties
      `
      const result = await runQuery(query, { indexName })

      if (result.length > 0) {
        console.log(`✅ Index ${indexName} exists:`, result[0])
      } else {
        console.log(`❌ Index ${indexName} does not exist`)
      }
    } catch (error) {
      console.error(`❌ Error checking index ${indexName}:`, error)
    }
  }
}

async function checkNodeCounts() {
  console.log('\n📈 Checking node counts...')

  const nodeTypes = [
    { label: 'Topic', query: 'MATCH (n:Topic) RETURN count(n) as count' },
    { label: 'Print', query: 'MATCH (n:Print) RETURN count(n) as count' },
    { label: 'Organization', query: 'MATCH (n:Organization) RETURN count(n) as count' }
  ]

  for (const { label, query } of nodeTypes) {
    try {
      const result = await runQuery<{ count: number }>(query)
      console.log(`📊 ${label} nodes: ${result[0]?.count || 0}`)
    } catch (error) {
      console.error(`❌ Error counting ${label} nodes:`, error)
    }
  }
}

async function checkEmbeddingFields() {
  console.log('\n🔍 Checking embedding fields...')

  const checks = [
    {
      name: 'Topics with embeddings',
      query: 'MATCH (n:Topic) WHERE n.embedding IS NOT NULL RETURN count(n) as count'
    },
    {
      name: 'Prints with embeddings',
      query: 'MATCH (n:Print) WHERE n.embedding IS NOT NULL RETURN count(n) as count'
    },
    {
      name: 'Organizations with embeddings',
      query: 'MATCH (n:Organization) WHERE n.embedding IS NOT NULL RETURN count(n) as count'
    }
  ]

  for (const { name, query } of checks) {
    try {
      const result = await runQuery<{ count: number }>(query)
      console.log(`📊 ${name}: ${result[0]?.count || 0}`)
    } catch (error) {
      console.error(`❌ Error checking ${name}:`, error)
    }
  }
}

async function testEmbeddingGeneration() {
  console.log('\n🧮 Testing embedding generation...')

  if (!openai) {
    console.log('⚠️  OpenAI not available, skipping embedding generation test')
    return null
  }

  try {
    const testText = 'jakie są procedury głosowania w Sejmie?'
    console.log('Test query:', testText)

    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: testText,
    })

    const embedding = embeddingResponse.data[0]?.embedding
    console.log('✅ Embedding generated, length:', embedding?.length)
    console.log('First 5 values:', embedding?.slice(0, 5))

    return embedding
  } catch (error) {
    console.error('❌ Error generating embedding:', error)
    return null
  }
}

async function testVectorSearch(embedding: number[]) {
  console.log('\n🔍 Testing vector search...')

  // Test Topics
  try {
    console.log('Testing topic search...')
    const topicQuery = `
      CALL db.index.vector.queryNodes('topicEmbeddingIndex', 3, $embedding)
      YIELD node, score
      WHERE score <= 0.8
      RETURN node.name as name, node.description as description, score
      ORDER BY score ASC
      LIMIT 3
    `
    const topics = await runQuery(topicQuery, { embedding })
    console.log('📋 Topics found:', topics.length)
    topics.forEach((topic: any, i: number) => {
      console.log(`  ${i + 1}. ${topic.name} (score: ${topic.score})`)
    })
  } catch (error) {
    console.error('❌ Error testing topic search:', error)
  }

  // Test Prints
  try {
    console.log('Testing print search...')
    const printQuery = `
      CALL db.index.vector.queryNodes('printEmbeddingIndex', 3, $embedding)
      YIELD node, score
      WHERE score <= 0.8 AND node.summary IS NOT NULL
      RETURN node.number as number, node.title as title, score
      ORDER BY score ASC
      LIMIT 3
    `
    const prints = await runQuery(printQuery, { embedding })
    console.log('📋 Prints found:', prints.length)
    prints.forEach((print: any, i: number) => {
      console.log(`  ${i + 1}. Druk ${print.number}: ${print.title} (score: ${print.score})`)
    })
  } catch (error) {
    console.error('❌ Error testing print search:', error)
  }

  // Test Organizations
  try {
    console.log('Testing organization search...')
    const orgQuery = `
      CALL db.index.vector.queryNodes('organizationEmbeddingIndex', 3, $embedding)
      YIELD node, score
      WHERE score <= 0.8
      RETURN node.name as name, score
      ORDER BY score ASC
      LIMIT 3
    `
    const organizations = await runQuery(orgQuery, { embedding })
    console.log('📋 Organizations found:', organizations.length)
    organizations.forEach((org: any, i: number) => {
      console.log(`  ${i + 1}. ${org.name} (score: ${org.score})`)
    })
  } catch (error) {
    console.error('❌ Error testing organization search:', error)
  }
}

async function main() {
  console.log('🚀 Starting Neo4j vector search debug...\n')

  // Test connection
  const connected = await testNeo4jConnection()
  if (!connected) {
    console.log('❌ Cannot proceed without Neo4j connection')
    return
  }

  // Check indexes
  await checkVectorIndexes()

  // Check data
  await checkNodeCounts()
  await checkEmbeddingFields()

  // Test embedding generation
  const embedding = await testEmbeddingGeneration()
  if (!embedding) {
    console.log('❌ Cannot proceed without embedding generation')
    return
  }

  // Test vector search
  await testVectorSearch(embedding)

  console.log('\n✨ Debug completed!')
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}

export { main as debugNeo4j }