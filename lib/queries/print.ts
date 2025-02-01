import { runQuery } from '../db/client'
import { Comment, Print, PrintListItem, PrintShort } from '../types/print'
import { Topic } from '../types/process'

export async function getRelatedPrints(number: string): Promise<Print[]> {
  const query = `
      MATCH (related:Print)-[:REFERENCES]->(p:Print {number: $number})
      RETURN related {
        number: related.number,
        title: related.title,
        term: related.term,
        documentType: related.documentType,
        changeDate: related.changeDate,
        deliveryDate: related.deliveryDate,
        documentDate: related.documentDate,
        summary: related.summary,
        attachments: related.attachments,
        processPrint: related.processPrint
      } as print
    `
  const result = await runQuery<{ print: Print }>(query, { number })
  return result.map((record) => record.print)
}

export async function getTopicsForPrint(number: string): Promise<Topic[]> {
  const query = `
      MATCH (print:Print {number: $number})-[:REFERS_TO]->(topic:Topic)
      RETURN topic.name AS name, topic.description AS description
    `
  return runQuery<Topic>(query, { number })
}

export async function getPrintsRelatedToTopic(
  topic_name: string
): Promise<Print[]> {
  const query = `
      MATCH (p:Print)-[:REFERS_TO]->(topic:Topic {name: $topic_name})
      RETURN p {
        number: p.number,
        title: p.title,
        term: p.term,
        documentType: p.documentType,
        changeDate: p.changeDate,
        deliveryDate: p.deliveryDate,
        documentDate: p.documentDate,
        summary: p.summary,
        attachments: p.attachments,
        processPrint: p.processPrint
      } as print
    `
  const result = await runQuery<{ print: Print }>(query, { topic_name })
  return result.map((record) => record.print)
}

export async function getSimmilarPrints(
  printNumber: string,
  maxVectorDistance: number = 0.5
): Promise<Print[]> {
  const query = `
        MATCH (n:Print {number: $printNumber})
        WITH n
        CALL db.index.vector.queryNodes('printEmbeddingIndex', 3, n.embedding) 
        YIELD node, score
        WHERE node <> n AND score <= $maxVectorDistance
        RETURN node {
            number: node.number,
            title: node.title,
            term: node.term,
            documentType: node.documentType,
            changeDate: node.changeDate,
            deliveryDate: node.deliveryDate,
            documentDate: node.documentDate,
            summary: node.summary,
            attachments: node.attachments,
            processPrint: node.processPrint
        } as print
        ORDER BY score ASC
    `
  const result = await runQuery<{ print: Print }>(query, {
    printNumber,
    maxVectorDistance,
  })
  return result.map((record) => record.print)
}

export async function getAllProcessPrints(
  skip: number = 0,
  limit: number = 20,
  filters?: {
    dateFrom?: string;
    dateTo?: string;
    categories?: string[];
    documentTypes?: string[];
  }
): Promise<PrintListItem[]> {
  const conditions = ['print.short_title IS NOT NULL']

  if (filters?.dateFrom) conditions.push(`process.changeDate >= datetime($dateFrom)`)
  if (filters?.dateTo) conditions.push(`process.changeDate <= datetime($dateTo)`)
  if (filters?.documentTypes?.length) conditions.push(`process.documentType IN $documentTypes`)

  const query = `
      MATCH (print:Print)-[:IS_SOURCE_OF]->(process:Process)
      WHERE ${conditions.join(' AND ')}
      WITH print, process
      MATCH (print)-[:REFERS_TO]->(topic:Topic)
      WITH print, process, collect(DISTINCT topic.name) as topics
      ${filters?.categories?.length ? 'WHERE ANY(cat IN $categories WHERE cat IN topics)' : ''}
      MATCH (process)-[:HAS]->(stage:Stage)
      WITH print, process, topics, stage
      ORDER BY stage.number DESC, process.changeDate DESC
      WITH print, process, topics, collect(stage)[0] as lastStage
      SKIP toInteger($skip)
      LIMIT toInteger($limit)
      RETURN DISTINCT
             print.number AS number, 
             print.short_title AS title,
             print.summary AS summary,
             process.documentType AS type,
             print.documentDate AS date,
             process.changeDate AS changeDate,
             lastStage.stageName AS status,
             topics AS categories,
             print.processPrint AS processPrint
    `

  console.log('Query params:', { 
    skip, 
    limit, 
    ...filters,
    categories: filters?.categories?.filter(c => c !== 'wszystkie')
  })

  return runQuery<PrintListItem>(query, { 
    skip, 
    limit, 
    ...filters,
    categories: filters?.categories?.filter(c => c !== 'wszystkie')
  })
}

export async function getPrint(number: string): Promise<Print | null> {
  const query = `
      MATCH (p:Print {number: $number})
      RETURN p {
        number: p.number,
        title: p.title,
        term: p.term,
        documentType: p.documentType,
        changeDate: p.changeDate,
        deliveryDate: p.deliveryDate,
        documentDate: p.documentDate,
        summary: p.summary,
        attachments: p.attachments,
        processPrint: p.processPrint
      } as print
    `
  const result = await runQuery<{ print: Print }>(query, { number })
  return result[0]?.print || null
}

export async function getPrintComments(number: string): Promise<Comment[]> {
  const query = `
      MATCH (person:Person)-[r:COMMENTS]->(p:Print {number: $number})
      OPTIONAL MATCH (person)-[:REPRESENTS]->(org:Organization)
      WITH DISTINCT r.summary AS summary, person, org, r
      WITH summary, 
           collect(DISTINCT person.firstLastName)[0] AS firstLastName,
           collect(DISTINCT org.name)[0] AS organization,
           collect(DISTINCT r.sentiment)[0] AS sentiment
      RETURN firstLastName, organization, sentiment, summary
    `
  return runQuery<Comment>(query, { number })
}

export async function getEnvoyPrints(
  id: number,
  limit: number = 5
): Promise<PrintShort[]> {
  const query = `
  MATCH (p:Person {id: toInteger($id)})-[:AUTHORED]->(print:Print)
  RETURN print {
    number: print.number,
    title: print.title,
    documentData: print.documentData,
    summary: print.summary
  } as print
  ORDER BY print.documentDate DESC
  LIMIT 5
    `
  const result = await runQuery<{ print: PrintShort }>(query, { id, limit })
  return result.map((record) => record.print)
}

export async function getEnvoySubjectPrints(
  id: number,
  limit: number = 5
): Promise<PrintShort[]> {
  const query = `
      MATCH (p:Person {id: toInteger($id)})-[:SUBJECT]->(print:Print)
      RETURN print {
        number: print.number,
        title: print.title,
        documentData: print.documentData,
        summary: print.summary
      } as print
      ORDER BY print.documentDate DESC
      LIMIT 5
    `
  const result = await runQuery<{ print: PrintShort }>(query, { id, limit })
  return result.map((record) => record.print)
}

export async function getPrintsByNumbersAndVotings(
  numbers: string[]
): Promise<PrintShort[]> {
  // TODO add prints for votings in db!!!!
  const query = `
    MATCH (print:Print)
    WHERE print.number IN $numbers
    RETURN print {
      number: print.number,
      title: print.title,
      processPrint: print.processPrint,
      documentDate: print.documentDate,
      attachments: print.attachments, 
      summary: print.summary
    } as print
    ORDER BY print.documentDate DESC
  `
  const result = await runQuery<{ print: PrintShort }>(query, { numbers })
  return result.map((record) => record.print)
}

export async function getLatestStageAndPerformer(printNumber: string): Promise<{
  stageName: string
  performerName: string | null
  performerCode: string | null
}> {
  const query = `
  MATCH (print:Print)-[:IS_SOURCE_OF|REFERS_TO]->(process:Process)
  WHERE print.number = $printNumber
  WITH process
  MATCH (process)-[:HAS]->(stage:Stage)
  CALL apoc.path.subgraphNodes(stage, {
      relationshipFilter: 'HAS_CHILD>',
      labelFilter: '+Stage'
  })
  YIELD node AS relatedStage
  WITH relatedStage
  ORDER BY relatedStage.number DESC
  LIMIT 1
  OPTIONAL MATCH (relatedStage)-[:PERFORMED_BY]->(performer)
  RETURN 
  relatedStage.stageName AS stageName,
  performer.name AS performerName,
  performer.code AS performerCode
  `
  const result = await runQuery<{
    stageName: string
    performerName: string | null
    performerCode: string | null
  }>(query, { printNumber })
  return (
    result[0] || { stageName: '', performerName: null, performerCode: null }
  )
}

export async function searchPrints(searchQuery: string): Promise<PrintShort[]> {
  const query = `
    CALL db.index.fulltext.queryNodes("print_content", $searchQuery) YIELD node, score
    WHERE node.short_title IS NOT NULL
    RETURN node {
      number: node.number,
      title: node.short_title,
      documentDate: node.documentDate,
      summary: node.summary,
      type: node.documentType,
      category: node.category,
      status: node.status
    } as print,
    score
    ORDER BY score DESC
    LIMIT 20
  `
  const result = await runQuery<{ print: PrintShort }>(query, { searchQuery })
  return result.map((record) => record.print)
}
 
export async function getAllTopics(): Promise<{ name: string; count: number }[]> {
  const query = `
    MATCH (topic:Topic)<-[:REFERS_TO]-(print:Print)
    WITH topic.name as name, count(print) as count
    RETURN name, count
    ORDER BY count DESC
  `
  return runQuery<{ name: string; count: number }>(query)
}
