import { runQuery } from "../db/client";
import {
  Envoy,
  EnvoyCommittee,
  EnvoyShort,
  Person,
  RecordHolder,
} from "../types/person";

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
      role: p.role,
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
  return runQuery<{ name: string; role: string }>(query, { id });
}

export async function getEnvoySpeeches(id: number): Promise<number> {
  const query = `
    MATCH (p:Person {id: toInteger($id)})-[:SAID]->()
    RETURN count(*) as count
  `;
  const result = await runQuery<{ count: number }>(query, { id });
  return result[0]?.count || 0;
}

interface PersonStatements extends Record<string, unknown> {
  id: string;
  numberOfStatements: number;
}
interface PersonInterruptions extends Record<string, unknown> {
  id: string;
  numberOfInterruptions: number;
}

export async function getPersonStatementCounts(): Promise<PersonStatements[]> {
  const query = `
    MATCH (p:Person)-[r:SAID]->(s)
    WHERE p.role IS NOT NULL
    WITH p.id as id, count(r) as numberOfStatements\
    RETURN id, numberOfStatements
    ORDER BY numberOfStatements DESC
  `;
  return runQuery<PersonStatements>(query);
}
export async function getPersonInterruptionsCount(): Promise<
  PersonInterruptions[]
> {
  const query = `
    MATCH (p:Person)-[r:INTERRUPTS]->(s)
    WHERE p.role IS NOT NULL
    WITH p.id as id, count(r) as numberOfInterruptions
    RETURN id, numberOfInterruptions
    ORDER BY numberOfInterruptions DESC
  `;
  return runQuery<PersonInterruptions>(query);
}
export async function getPersonWithMostInterruptions(): Promise<RecordHolder> {
  const query = `
    MATCH (p:Person)-[r:INTERRUPTS]->(s)
    WHERE p.role IS NOT NULL AND p.active 
    WITH p, count(r) as numberOfInterruptions
    RETURN p.firstLastName as name, numberOfInterruptions as count, p.id as id
    ORDER BY numberOfInterruptions DESC
    LIMIT 1
  `;
  const result = await runQuery<RecordHolder>(query);
  return result[0];
}

export async function getPersonWithMostStatements(
  invert = false
): Promise<RecordHolder> {
  const query = `
    MATCH (p:Person)-[r:SAID]->(s)
    WHERE p.role IS NOT NULL
    WITH p, count(r) as numberOfStatements
    RETURN p.firstLastName as name, numberOfStatements as count, p.id as id
    ORDER BY numberOfStatements ${invert ? "ASC" : "DESC"}
    LIMIT 1
  `;
  const result = await runQuery<RecordHolder>(query);
  return result[0];
}
export async function getIdsFromNames(names: string[]): Promise<number[]> {
  const query = `
    MATCH (p:Person)
    WHERE p.firstLastName IN $names
    RETURN p.id as id
  `;
  const result = await runQuery<{ id: string }>(query, { names });
  return result.map((record) => parseInt(record.id, 10));
}
