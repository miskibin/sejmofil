'use server'

import { runQuery } from '@/lib/db/client'

export interface Club {
  id: string
  name: string
  membersCount: number
  email: string
  phone: string
  fax: string
}

export interface ClubWithStats extends Club {
  activeMembers: number
  bills: number
  topics: number
  avgAbsences: number
  avgParticipationRate: number
}

export interface ClubDemographics {
  name: string
  totalMembers: number
  femaleCount: number
  maleCount: number
  femalePercentage: number
  malePercentage: number
}

export interface ClubInfluence {
  id: string
  name: string
  members: number
  billsAuthored: number
  topicDiversity: number
  votingsInfluenced: number
  influenceScore: number
}

export interface TopicCount {
  topic: string
  printsCount: number
}

export interface ClubMember {
  id: number
  firstName: string
  lastName: string
  email: string
  profession: string
  districtName: string
  voivodeship: string
  active: boolean
  numberOfVotes: number
  absents: number
}

export interface VoivodeshipDistribution {
  region: string
  membersCount: number
}

// Get all clubs with basic info
export async function getAllClubs(): Promise<Club[]> {
  const query = `
    MATCH (c:Club)
    RETURN c.id as id, c.name as name, c.membersCount as membersCount, 
           c.email as email, c.phone as phone, c.fax as fax
    ORDER BY c.membersCount DESC
  `
  return runQuery<Club>(query)
}

// Get clubs with comprehensive stats
export async function getClubsWithStats(): Promise<ClubWithStats[]> {
  const query = `
    MATCH (c:Club)
    OPTIONAL MATCH (c)<-[:BELONGS_TO]-(p:Person)
    OPTIONAL MATCH (p)-[:AUTHORED]->(pr:Print)
    OPTIONAL MATCH (pr)-[:REFERS_TO]->(t:Topic)
    WITH c, 
         count(DISTINCT p) as members,
         count(DISTINCT CASE WHEN p.active = true THEN p END) as activeMembers,
         count(DISTINCT pr) as bills,
         count(DISTINCT t) as topics,
         avg(coalesce(p.absents, 0)) as avgAbsences,
         avg(CASE 
           WHEN p.numberOfVotes > 0 
           THEN ((p.numberOfVotes - coalesce(p.absents, 0)) * 100.0 / p.numberOfVotes) 
           ELSE 0 
         END) as avgParticipationRate
    RETURN c.id as id, c.name as name, c.membersCount as membersCount,
           c.email as email, c.phone as phone, c.fax as fax,
           coalesce(activeMembers, 0) as activeMembers,
           coalesce(bills, 0) as bills,
           coalesce(topics, 0) as topics,
           round(avgAbsences, 1) as avgAbsences,
           round(coalesce(avgParticipationRate, 0), 1) as avgParticipationRate
    ORDER BY members DESC
  `
  return runQuery<ClubWithStats>(query)
}

// Get club demographics
export async function getClubDemographics(clubId: string): Promise<ClubDemographics | null> {
  const query = `
    MATCH (p:Person)-[:BELONGS_TO]->(c:Club {id: $clubId})
    WITH c, 
         count(p) as totalMembers,
         sum(CASE WHEN p.isFemale THEN 1 ELSE 0 END) as femaleCount,
         sum(CASE WHEN NOT p.isFemale THEN 1 ELSE 0 END) as maleCount
    RETURN c.name as name, totalMembers, femaleCount, maleCount,
           round(femaleCount * 100.0 / totalMembers, 2) as femalePercentage,
           round(maleCount * 100.0 / totalMembers, 2) as malePercentage
  `
  const results = await runQuery<ClubDemographics>(query, { clubId })
  return results[0] || null
}

// Get club influence scores
export async function getClubInfluenceScores(): Promise<ClubInfluence[]> {
  const query = `
    MATCH (c:Club)<-[:BELONGS_TO]-(p:Person)
    OPTIONAL MATCH (p)-[:AUTHORED]->(pr:Print)
    OPTIONAL MATCH (pr)-[:REFERS_TO]->(t:Topic)
    OPTIONAL MATCH (pr)<-[:RELATED_TO]-(v:Voting)
    WITH c,
         count(DISTINCT p) as members,
         count(DISTINCT pr) as billsAuthored,
         count(DISTINCT t) as topicDiversity,
         count(DISTINCT v) as votingsInfluenced,
         avg(coalesce(p.numberOfVotes, 0) - coalesce(p.absents, 0)) as avgParticipation
    WITH c, members, billsAuthored, topicDiversity, votingsInfluenced, avgParticipation,
         (billsAuthored * 2 + topicDiversity * 3 + votingsInfluenced + coalesce(avgParticipation, 0) * 0.1) as influenceScore
    RETURN c.id as id, c.name as name, members, billsAuthored, topicDiversity, 
           votingsInfluenced, round(influenceScore, 2) as influenceScore
    ORDER BY influenceScore DESC
  `
  return runQuery<ClubInfluence>(query)
}

// Get club's main topics
export async function getClubTopics(clubId: string, limit: number = 15): Promise<TopicCount[]> {
  const query = `
    MATCH (p:Person)-[:BELONGS_TO]->(c:Club {id: $clubId})
    MATCH (p)-[:AUTHORED]->(pr:Print)-[:REFERS_TO]->(t:Topic)
    WITH t, count(pr) as printsCount
    RETURN t.name as topic, printsCount
    ORDER BY printsCount DESC
    LIMIT toInteger($limit)
  `
  return runQuery<TopicCount>(query, { clubId, limit: Math.floor(limit) })
}

// Get club members
export async function getClubMembers(clubId: string, limit: number = 20): Promise<ClubMember[]> {
  const query = `
    MATCH (p:Person)-[:BELONGS_TO]->(c:Club {id: $clubId})
    RETURN p.id as id, p.firstName as firstName, p.lastName as lastName, 
           p.email as email, p.profession as profession,
           p.districtName as districtName, p.voivodeship as voivodeship, 
           p.active as active, p.numberOfVotes as numberOfVotes,
           coalesce(p.absents, 0) as absents
    ORDER BY p.lastName
    LIMIT toInteger($limit)
  `
  return runQuery<ClubMember>(query, { clubId, limit: Math.floor(limit) })
}

// Get voivodeship distribution
export async function getClubVoivodeshipDistribution(clubId: string): Promise<VoivodeshipDistribution[]> {
  const query = `
    MATCH (p:Person)-[:BELONGS_TO]->(c:Club {id: $clubId})
    WHERE p.voivodeship IS NOT NULL
    WITH p.voivodeship as region, count(p) as membersCount
    RETURN region, membersCount
    ORDER BY membersCount DESC
  `
  return runQuery<VoivodeshipDistribution>(query, { clubId })
}
