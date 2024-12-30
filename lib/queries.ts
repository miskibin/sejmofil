"use server";
import neo4j, { Driver } from "neo4j-driver";
import {
  Person,
  Print,
  Topic,
  PrintListItem,
  Comment,
  ProcessStage,
  ProceedingDates,
  PrintShort,
  Envoy,
  EnvoyShort,
} from "./types";

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
let driver: Driver | null = null;
function getDriver() {
  if (driver) return driver;

  if (
    !process.env.DB_URI ||
    !process.env.DB_USER ||
    !process.env.NEO4J_PASSWORD
  ) {
    throw new Error("Database credentials not provided");
  }

  driver = neo4j.driver(
    process.env.DB_URI,
    neo4j.auth.basic(process.env.DB_USER, process.env.NEO4J_PASSWORD),
    {
      maxConnectionLifetime: 30000,
      maxConnectionPoolSize: 50,
      connectionTimeout: 30000,
    }
  );

  return driver;
}

// Base query function with serialization
async function runQuery<T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  // Only get the driver when we actually need to run a query
  const session = getDriver().session({ database: "neo4j" });
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
  const query = `
    MATCH (print:Print {number: $number})-[:REFERS_TO]->(topic:Topic)
    RETURN topic.name AS name, topic.description AS description
  `;
  return runQuery<Topic>(query, { number });
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
  `;
  const result = await runQuery<{ print: Print }>(query, { topic_name });
  return result.map((record) => record.print);
}

export async function getSimmilarPrints(
  printNumber: string,
  maxVectorDistance: number = 0.5
): Promise<Print[]> {
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
  const query = `
    MATCH (print:Print)-[:REFERS_TO]->(topic:Topic)
    RETURN print.number AS number, 
           print.title AS title,
           topic.name AS topicName, 
           topic.description AS topicDescription
  `;
  return runQuery<PrintListItem>(query);
}

export async function getProceedingDates(): Promise<ProceedingDates[]> {
  const query = `
    MATCH (p:Proceeding)
    UNWIND p.proceeding_dates AS date
    RETURN p.proceeding_number AS proceeding_number, 
           collect(date) AS proceeding_dates
    ORDER BY proceeding_number;
  `;

  const result = await runQuery<ProceedingDates>(query);
  return result;
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
  `;
  const result = await runQuery<{ print: Print }>(query, { number });
  return result[0]?.print || null;
}

export async function getPrintAuthors(number: string): Promise<Person[]> {
  const query = `
    MATCH (person:Person)-[:AUTHORED]->(p:Print {number: $number})
    RETURN person.firstLastName AS firstLastName, person.club AS club
  `;
  return runQuery<Person>(query, { number });
}

export async function getPrintSubjects(number: string): Promise<Person[]> {
  const query = `
    MATCH (person:Person)-[:SUBJECT]->(p:Print {number: $number})
    RETURN person.firstLastName AS firstLastName, person.club AS club
  `;
  return runQuery<Person>(query, { number });
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
  `;
  return runQuery<Comment>(query, { number });
}

export async function getAllProcessStages(
  processNumber: string
): Promise<ProcessStage[]> {
  const query = `
    MATCH (p:Process {number: $processNumber})-[:HAS]->(stage:Stage)
    OPTIONAL MATCH (stage)-[:HAS_CHILD]->(childStage:Stage)
    RETURN stage.stageName AS stageName,
           stage.date AS date,
           collect(childStage {.*}) AS childStages
  `;
  return runQuery<ProcessStage>(query, { processNumber });
}

export async function getTotalProceedingDays(): Promise<number> {
  const query = `
    MATCH (p:Proceeding)
    WITH p, date() as today
    UNWIND p.proceeding_dates as dateStr
    WITH date(dateStr) as proceedingDate, today
    WHERE proceedingDate <= today
    RETURN count(proceedingDate) as totalDays
  `;
  const result = await runQuery<{ totalDays: number }>(query);
  return result[0]?.totalDays || 0;
}

export interface EnvoyCommittee {
  name: string;
  role: string;
}

export async function getEnvoyInfo(id: number): Promise<Envoy> {
  const query = `
    MATCH (p:Person {id: toInteger($id)})
    RETURN p {.*} as envoy
  `;
  const result = await runQuery<{ envoy: Envoy }>(query, { id });
  return result[0].envoy;
}
export async function getAllEnvoys(): Promise<EnvoyShort[]> {
  const query = `
    MATCH (p:Person)
    WHERE p.club IS NOT NULL
    RETURN p {
      active: p.active,
      club: p.club,
      firstName: p.firstName,
      id: p.id,
      districtName: p.districtName,
      lastName: p.lastName,
      numberOfVotes: p.numberOfVotes,
      profession: p.profession
    } as envoy
  `;
  const result = await runQuery<{ envoy: EnvoyShort }>(query);
  return result.map((record) => record.envoy);
}

export async function getEnvoyCommittees(
  id: number
): Promise<EnvoyCommittee[]> {
  const query = `
    MATCH (p:Person {id: toInteger($id)})-[r:JEST_CZŁONKIEM]->(c:Committee)
    RETURN c.name as name, r.function as role
  `;
  return runQuery<EnvoyCommittee>(query, { id });
}

export async function getEnvoySpeeches(id: number): Promise<number> {
  const query = `
    MATCH (p:Person {id: toInteger($id)})-[:SAID]->()
    RETURN count(*) as count
  `;
  const result = await runQuery<{ count: number }>(query, { id });
  return result[0]?.count || 0;
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
  deliveryDate: print.deliveryDate,
  summary: print.summary
} as print
ORDER BY print.documentDate DESC
LIMIT 5
  `;
  const result = await runQuery<{ print: PrintShort }>(query, { id, limit });
  return result.map((record) => record.print);
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
      deliveryDate: print.deliveryDate,
      summary: print.summary
    } as print
    ORDER BY print.documentDate DESC
    LIMIT 5
  `;
  const result = await runQuery<{ print: PrintShort }>(query, { id, limit });
  return result.map((record) => record.print);
}
