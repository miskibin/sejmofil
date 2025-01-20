import { runQuery } from '../db/client'
import {
  Envoy,
  EnvoyCommittee,
  EnvoyShort,
  Person,
  RecordHolder,
} from '../types/person'

export async function getPrintAuthors(number: string): Promise<Person[]> {
  const query = `
      MATCH (person:Person)-[:AUTHORED]->(p:Print {number: $number})
      RETURN person.firstLastName AS firstLastName, person.club AS club
    `
  return runQuery<Person>(query, { number })
}

export async function getPrintSubjects(number: string): Promise<Person[]> {
  const query = `
    MATCH (person:Person)-[:SUBJECT]->(p:Print {number: $number})
    RETURN person.firstLastName AS firstLastName, person.club AS club
  `
  return runQuery<Person>(query, { number })
}

export async function getEnvoyInfo(id: number): Promise<Envoy> {
  const query = `
    MATCH (p:Person {id: toInteger($id)})
    RETURN p {.*} as envoy
  `
  const result = await runQuery<{ envoy: Envoy }>(query, { id })
  return result[0].envoy
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
      absents: p.absents,
      lastName: p.lastName,
      numberOfVotes: p.numberOfVotes,
      role: p.role,
      profession: p.profession
    } as envoy
  `
  const result = await runQuery<{ envoy: EnvoyShort }>(query)
  return result.map((record) => record.envoy)
}

export async function getEnvoyCommittees(
  id: number
): Promise<EnvoyCommittee[]> {
  const query = `
    MATCH (p:Person {id: toInteger($id)})-[r:JEST_CZŁONKIEM]->(c:Committee)
    RETURN c.name as name, r.function as role
  `
  return runQuery<{ name: string; role: string }>(query, { id })
}

export async function getEnvoySpeeches(id: number): Promise<number> {
  const query = `
    MATCH (p:Person {id: toInteger($id)})-[:SAID]->()
    RETURN count(*) as count
  `
  const result = await runQuery<{ count: number }>(query, { id })
  return result[0]?.count || 0
}

interface PersonStatements extends Record<string, unknown> {
  id: string
  numberOfStatements: number
}
interface PersonInterruptions extends Record<string, unknown> {
  id: string
  numberOfInterruptions: number
}

export async function getPersonStatementCounts(): Promise<PersonStatements[]> {
  const query = `
    MATCH (p:Person)-[r:SAID]->(s)
    WHERE p.role IS NOT NULL
    WITH p.id as id, count(r) as numberOfStatements\
    RETURN id, numberOfStatements
    ORDER BY numberOfStatements DESC
  `
  return runQuery<PersonStatements>(query)
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
  `
  return runQuery<PersonInterruptions>(query)
}
export async function getPersonWithMostInterruptions(): Promise<RecordHolder> {
  const query = `
    MATCH (p:Person)-[r:INTERRUPTS]->(s)
    WHERE p.role IS NOT NULL AND p.active 
    WITH p, count(r) as numberOfInterruptions
    RETURN p.firstLastName as name, numberOfInterruptions as count, p.id as id
    ORDER BY numberOfInterruptions DESC
    LIMIT 1
  `
  const result = await runQuery<RecordHolder>(query)
  return result[0]
}

export async function getPersonWithMostAbsents(
  invert = false
): Promise<RecordHolder> {
  const query = `
    MATCH (p:Person)
    WHERE p.role IS NOT NULL AND p.active
    WITH p, COALESCE(p.absents, 0) as absents
    RETURN p.firstLastName as name, absents as count, p.id as id
    ORDER BY absents ${invert ? 'ASC' : 'DESC'}
    LIMIT 1
  `
  const result = await runQuery<RecordHolder>(query)
  return result[0]
}
export async function getPersonWithMostStatements(
  invert = false
): Promise<RecordHolder> {
  const query = `
    MATCH (p:Person)-[r:SAID]->(s)
    WHERE p.role IS NOT NULL AND s.statement_number <> "0"
    WITH p, count(r) as numberOfStatements
    RETURN p.firstLastName as name, numberOfStatements as count, p.id as id
    ORDER BY numberOfStatements ${invert ? 'ASC' : 'DESC'}
    LIMIT 1
  `
  const result = await runQuery<RecordHolder>(query)
  return result[0]
}

export async function getIdsFromNames(names: string[]): Promise<number[]> {
  const query = `
    MATCH (p:Person)
    WHERE p.firstLastName IN $names
    RETURN p.firstLastName as name, p.id as id
  `
  const result = await runQuery<{ name: string; id: string }>(query, { names })

  // Create a map of name to id
  const nameToId = result.reduce(
    (acc, { name, id }) => {
      acc[name] = parseInt(id, 10)
      return acc
    },
    {} as Record<string, number>
  )

  // Map original names array to preserve order
  return names.map((name) => nameToId[name])
}

export async function getClubsByNames(
  names: string[]
): Promise<Array<{ name: string; club: string }>> {
  const query = `
    MATCH (p:Person)
    WHERE p.firstLastName IN $names
    RETURN p.firstLastName as name, p.club as club
  `
  return runQuery<{ name: string; club: string }>(query, { names })
}

export async function getClubAndIdsByNames(
  names: string[]
): Promise<Array<{ name: string; club: string; id: number }>> {
  const query = `
    MATCH (p:Person)
    WHERE p.firstLastName IN $names
    RETURN p.firstLastName as name, p.club as club, p.id as id
  `
  const result = await runQuery<{ name: string; club: string; id: number }>(
    query,
    { names }
  )
  return result || []
}

export async function searchPersons(
  searchQuery: string
): Promise<EnvoyShort[]> {
  const query = `
    CALL db.index.fulltext.queryNodes("person_names", $searchQuery) YIELD node, score
    WHERE node.club IS NOT NULL
    RETURN node {
      active: node.active,
      club: node.club,
      firstName: node.firstName,
      id: node.id,
      districtName: node.districtName,
      lastName: node.lastName,
      role: node.role,
      profession: node.profession
    } as person,
    score
    ORDER BY score DESC
    LIMIT 10
  `
  const result = await runQuery<{ person: EnvoyShort }>(query, { searchQuery })
  return result.map((record) => record.person)
}
