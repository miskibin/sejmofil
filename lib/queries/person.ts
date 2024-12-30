import { runQuery } from "../db/client";
import { Envoy, EnvoyCommittee, EnvoyShort, Person } from "../types/person";

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
