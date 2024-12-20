"use server";
import neo4j, { Driver } from "neo4j-driver";
import {
  Person,
  Print,
  Topic,
  PrintListItem,
  Comment,
  ProcessStage,
} from "./types";

const driver: Driver = neo4j.driver(
  process.env.DB_URI || "",
  neo4j.auth.basic(process.env.DB_USER || "", process.env.NEO4J_PASSWORD || "")
);

// Serialization helper for Neo4j integers and dates
function serializeNeo4jResult(data: unknown): unknown {
  if (data === null || data === undefined) {
    return null;
  }

  if (neo4j.isInt(data)) {
    return data.toNumber();
  }

  if (Array.isArray(data)) {
    return data.map(serializeNeo4jResult);
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        serializeNeo4jResult(value),
      ])
    );
  }

  return data;
}

// Base query function with caching and serialization
async function runQuery<T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  "use cache";
  const session = driver.session();
  try {
    const result = await session.run(query, params);
    return result.records.map(
      (record) => serializeNeo4jResult(record.toObject()) as T
    );
  } finally {
    await session.close();
  }
}

export async function getRelatedPrints(number: string): Promise<Print[]> {
  "use cache";
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
  `;
  const result = await runQuery<{ print: Print }>(query, { number });
  return result.map((record) => record.print);
}

export async function getTopicsForPrint(number: string): Promise<Topic[]> {
  "use cache";
  const query = `
    MATCH (print:Print {number: $number})-[:REFERS_TO]->(topic:Topic)
    RETURN topic.name AS name, topic.description AS description
  `;
  return runQuery<Topic>(query, { number });
}

export async function getPrintsRelatedToTopic(
  topic_name: string
): Promise<Print[]> {
  "use cache";
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
  `;
  const result = await runQuery<{ print: Print }>(query, { topic_name });
  return result.map((record) => record.print);
}

export async function getSimmilarPrints(
  printNumber: string,
  maxVectorDistance: number = 0.5
): Promise<Print[]> {
  "use cache";
  const query = `
    MATCH (n:Print {number: $printNumber})
    WITH n
    MATCH (p:Print)
    WHERE p <> n
    WITH p, gds.similarity.cosine(n.embedding, p.embedding) as similarity
    WHERE similarity <= $maxVectorDistance
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
    ORDER BY similarity DESC
    LIMIT 3
  `;
  const result = await runQuery<{ print: Print }>(query, {
    printNumber,
    maxVectorDistance,
  });
  return result.map((record) => record.print);
}

export async function getAllPrints(): Promise<PrintListItem[]> {
  "use cache";
  const query = `
    MATCH (print:Print)-[:REFERS_TO]->(topic:Topic)
    RETURN print.number AS number, 
           print.title AS title,
           topic.name AS topicName, 
           topic.description AS topicDescription
  `;
  return runQuery<PrintListItem>(query);
}

export async function getPrint(number: string): Promise<Print | null> {
  "use cache";
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
  `;
  const result = await runQuery<{ print: Print }>(query, { number });
  return result[0]?.print || null;
}

export async function getPrintAuthors(number: string): Promise<Person[]> {
  "use cache";
  const query = `
    MATCH (person:Person)-[:AUTHORED]->(p:Print {number: $number})
    RETURN person.firstLastName AS firstLastName, person.club AS club
  `;
  return runQuery<Person>(query, { number });
}

export async function getPrintSubjects(number: string): Promise<Person[]> {
  "use cache";
  const query = `
    MATCH (person:Person)-[:SUBJECT]->(p:Print {number: $number})
    RETURN person.firstLastName AS firstLastName, person.club AS club
  `;
  return runQuery<Person>(query, { number });
}

export async function getPrintComments(number: string): Promise<Comment[]> {
  "use cache";
  const query = `
    MATCH (person:Person)-[r:COMMENTS]->(p:Print {number: $number})
    OPTIONAL MATCH (person)-[:REPRESENTS]->(org:Organization)
    WITH DISTINCT r.summary AS summary, person, org, r
    WITH summary, 
         collect(DISTINCT person.firstLastName)[0] AS firstLastName,
         collect(DISTINCT org.name)[0] AS organization,
         collect(DISTINCT r.sentiment)[0] AS sentiment
    RETURN firstLastName, organization, sentiment, summary
  `;
  return runQuery<Comment>(query, { number });
}

export async function getAllProcessStages(
  processNumber: string
): Promise<ProcessStage[]> {
  "use cache";
  const query = `
    MATCH (p:Process {number: $processNumber})-[:HAS]->(stage:Stage)
    OPTIONAL MATCH (stage)-[:HAS_CHILD]->(childStage:Stage)
    RETURN stage.stageName AS stageName,
           stage.date AS date,
           collect(childStage {.*}) AS childStages
  `;
  return runQuery<ProcessStage>(query, { processNumber });
}

export async function closeDriver(): Promise<void> {
  await driver.close();
}
