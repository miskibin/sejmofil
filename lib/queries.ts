"use server";
import neo4j, { Driver, Session } from "neo4j-driver";
import { Person, ProcessStage, Comment, Print, Topic } from "./types";

const DB_URI = process.env.DB_URI || "bolt+s://neo.msulawiak.pl:7687";
const DB_USER = process.env.DB_USER || "neo4j";
const DB_PASSWORD = process.env.NEO4J_PASSWORD || "";

const driver: Driver = neo4j.driver(
  DB_URI,
  neo4j.auth.basic(DB_USER, DB_PASSWORD)
);

const serializeData = (data: object): object | null => {
  if (!data) return null;
  if (Array.isArray(data)) return data.map(serializeData);
  if (typeof data === "object") {
    const serialized: { [key: string]: unknown } = {};
    for (const [key, value] of Object.entries(data)) {
      if (
        value &&
        typeof value === "object" &&
        "low" in value &&
        "high" in value
      ) {
        // Handle Neo4j Integer
        serialized[key] = value.low;
      } else if (value instanceof Date) {
        // Handle Date objects
        serialized[key] = value.toISOString();
      } else if (value && typeof value === "object") {
        // Recursively serialize nested objects
        serialized[key] = serializeData(value);
      } else {
        serialized[key] = value;
      }
    }
    return serialized;
  }
  return data;
};

const runQuery = async <T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T[]> => {
  const session: Session = driver.session();
  try {
    const result = await session.run(query, params);
    return result.records.map(
      (record) => serializeData(record.toObject()) as T
    );
  } finally {
    await session.close();
  }
};

export const getRelatedPrints = async (number: string): Promise<Print[]> => {
  const query = `
        MATCH (related:Print)-[:REFERENCES]->(p:Print {number: $number})
        RETURN related {
            .number,
            .title,
            .term,
            .documentType,
            .changeDate,
            .deliveryDate,
            .documentDate,
            .summary,
            .attachments
            } as print
        
        `;
  const result = await runQuery<{ print: Print }>(query, { number });
  return result.map((record) => record.print);
};

export const getTopicsForPrint = async (number: string): Promise<Topic[]> => {
  const query = `
        MATCH (print:Print {number: $number})-[:REFERS_TO]->(topic:Topic)
        RETURN topic.name AS name, topic.description AS description
    `;
  const result = await runQuery<Topic>(query, { number });
  return result;
};

export const getPrintsRelatedToTopic = async (
  topic_name: string
): Promise<Print[]> => {
  const query = `
        MATCH (p:Print )-[:REFERS_TO]->(topic:Topic {name: $topic_name})
        RETURN p {
            .number,
            .title,
            .term,
            .documentType,
            .changeDate,
            .processPrint,
            .deliveryDate,
            .documentDate,
            .summary,
            .attachments
          } as print
    `;
  const result = await runQuery<{ print: Print }>(query, { topic_name });
  return result.map((record) => record.print);
};
export const getSimmilarPrints = async (
  printNumber: string,
  maxVectorDistance: number = 0.5
): Promise<Print[]> => {
  const query = `
        MATCH (n:Print {number: $printNumber})
        WITH n
        MATCH (p:Print)
        WHERE p <> n
        WITH p, gds.similarity.cosine(n.embedding, p.embedding) as similarity
        WHERE similarity <= $maxVectorDistance
        RETURN p {
            .number,
            .title,
            .term,
            .documentType,
            .changeDate,
            .processPrint,
            .deliveryDate,
            .documentDate,
            .summary,
            .attachments
          } as print
        ORDER BY similarity DESC
        LIMIT 3
    `;
  const result = await runQuery<{ print: Print }>(query, {
    printNumber,
    maxVectorDistance,
  });
  return result.map((record) => record.print);
};

export const getAllTopics = async (): Promise<Topic[]> => {
  const query = `
        MATCH (topic:Topic)
        RETURN topic.name AS name, topic.description AS description
    `;
  return await runQuery<Topic>(query);
};

export const getPrint = async (number: string): Promise<Print> => {
  const query = `
    MATCH (p:Print {number: $number})
    RETURN p {
      .number,
      .title,
      .term,
      .documentType,
      .changeDate,
      .deliveryDate,
      .documentDate,
      .processPrint,
      .summary,
      .attachments
    } as print
  `;
  const result = await runQuery<{ print: Print }>(query, { number });
  return result[0]?.print;
};

export const getPrintAuthors = async (number: string): Promise<Person[]> => {
  const query = `
    MATCH (person:Person)-[:AUTHORED]->(p:Print {number: $number})
    RETURN person.firstLastName AS firstLastName, person.club AS club
`;
  const data = await runQuery<Person>(query, { number });
  console.log(data);
  return data;
};
export const getPrintSubjects = async (number: string): Promise<Person[]> => {
  const query = `
    MATCH (person:Person)-[:SUBJECT]->(p:Print {number: $number})
    RETURN person.firstLastName AS firstLastName, person
`;
  const data = await runQuery<Person>(query, { number });
  console.log(data);
  return data;
};

export const getPrintComments = async (number: string): Promise<Comment[]> => {
  const query = `
    MATCH (person:Person)-[r:COMMENTS]->(p:Print {number: $number})
    OPTIONAL MATCH (person)-[:REPRESENTS]->(org:Organization)
    RETURN person.firstLastName AS firstLastName, org.name AS organization, r.sentiment AS sentiment, r.summary AS summary
`;
  const data = await runQuery<Comment>(query, { number });
  return data;
};

export const getAllProcessStages = async (
  processNumber: string
): Promise<ProcessStage[]> => {
  const query = `
        MATCH (p:Process {number: $processNumber})-[:HAS]->(stage:Stage)
        OPTIONAL MATCH (stage)-[:HAS_CHILD]->(childStage:Stage)
        RETURN stage.stageName AS stageName, stage.date AS date, collect(childStage) AS childStages
    `;
  return await runQuery<ProcessStage>(query, { processNumber });
};

export const closeDriver = async (): Promise<void> => {
  await driver.close();
};
