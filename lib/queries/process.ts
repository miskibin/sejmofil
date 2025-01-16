import { runQuery } from "../db/client";
import { PrintShort } from "../types/print";
import { ProcessStage } from "../types/process";
import { VotingResult } from "./proceeding";

interface Act {
  ELI: string;
  title: string;
  announcementDate: string;
  comment: string;
  status: string;
  address: string;
}

interface ActResponse {
  act: Act;
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

interface Committee {
  code: string | null;
  name: string;
}

interface Voting {
  sitting: number;
  votingNumber: number;
  yes: number;
  no: number;
}

interface Stage {
  name: string;
  date: string | null;
  number: string;
  votings: Voting[];
  comment: string | null;
  act: string | null;
  prints: PrintShort[];
  childStages: {
    name: string;
    date: string | null;
    number: string;
  }[];
  childPrints: PrintShort[];
  childCommittees: Committee[];
}

export interface ProcessDetailData {
  title: string;
  documentType: string;
  description: string;
  prints: PrintShort[][];
  UE: string;
  comments: string;
  stages: Stage[];
}

interface ProcessDetailResponse {
  processData: ProcessDetailData;
}
export async function getProcessPrint(printNumber: string): Promise<string> {
  const query = `
    MATCH (print:Print {number: $printNumber})
    RETURN  print.processPrint AS processPrint
  `;
  const res = await runQuery<{ processPrint: number[] }>(query, {
    printNumber,
  });
  return String(res[0]?.processPrint[0]);
}
export async function getProcessDetails(
  processNumber: string
): Promise<ProcessDetailData | null> {
  const query = `
MATCH (process:Process {number: $processNumber})
CALL {
    WITH process
    MATCH (process)-[:HAS]->(stage:Stage)
    OPTIONAL MATCH (stage)-[:HAS_CHILD]->(childStage:Stage)
    OPTIONAL MATCH (childStage)-[:CONTAINS]->(childPrint:Print)
    OPTIONAL MATCH (childStage)-[:PERFORMED_BY]->(childCommittee:Committee)
    OPTIONAL MATCH (stage)-[:CONTAINS]->(stagePrint:Print)
    OPTIONAL MATCH (stage)-[:HAS]->(voting:Voting)
    OPTIONAL MATCH (stage)-[:HAS]->(act:Act) // Match the Act related to the Stage
    WITH process, stage, 
         collect(voting {sitting: voting.sitting, votingNumber: voting.votingNumber, yes: voting.yes, no: voting.no}) AS votings,
         collect(stagePrint {attachments: stagePrint.attachments, documentDate: stagePrint.documentDate, summary: stagePrint.summary, title: stagePrint.title}) AS stagePrints,
         collect(childStage {name: childStage.stageName, date: childStage.date, number: childStage.number}) AS childStages,
         collect(childPrint {attachments: childPrint.attachments, documentDate: childPrint.documentDate, summary: childPrint.summary,number: childPrint.number, title: childPrint.title}) AS childPrints,
         collect(childCommittee {code: childCommittee.code, name: childCommittee.name}) AS childCommittees,
         act.ELI AS actELI // Get the ELI field from the Act node
    RETURN 
        stage {
            name: stage.stageName, 
            date: stage.date, 
            number: stage.number,
            comment: stage.comment, 
            votings: votings,
            prints: stagePrints,
            childStages: childStages,
            childPrints: childPrints,
            childCommittees: childCommittees,
            act: actELI // Include Act data here
        } AS stageData,
        [] AS processPrints
    UNION
    WITH process
    MATCH (print:Print)-[:IS_SOURCE_OF]->(process)
    RETURN 
        NULL AS stageData,
        collect(print {attachments: print.attachments, documentDate: print.documentDate, summary: print.summary, number: print.number, title: print.title}) AS processPrints
}
WITH process, collect(stageData) AS stages, collect(processPrints) AS allProcessPrints
RETURN process {
        UE: process.UE,
        comments: process.comments,
        description: process.description,
        documentType: process.documentType,
        title: process.title,
        stages: stages,
        prints: [print IN allProcessPrints WHERE print IS NOT NULL]
    } AS processData
`;

  const resp = (await runQuery<ProcessDetailResponse>(query, {
    processNumber,
  })) as ProcessDetailResponse[];
  return resp[0]?.processData;
}
interface PrintResponse {
  p: PrintShort;
}
export async function getLatestPrints(
  limit: number = 10
): Promise<PrintShort[]> {
  const query = `
    MATCH (p:Print)
    RETURN p {
      number: p.number,
      title: p.title,
      documentDate: p.documentDate,
      processPrint: p.processPrint
    }
    ORDER BY p.documentDate DESC
    LIMIT 10
  `;

  const res = await runQuery<PrintResponse>(query, { limit });
  return res.map((r) => r.p);
}

export async function getPrintsByTopic(
  topicName: string,
  limit: number = 10
): Promise<PrintShort[]> {
  const query = `
    MATCH (p:Print)-[:REFERS_TO]->(t:Topic {name: $topicName})
    RETURN p {
      number: p.number,
      title: p.title,
      documentDate: p.documentDate,
      processPrint: p.processPrint
    }
    ORDER BY p.documentDate DESC
    LIMIT 40
  `;

  const res = await runQuery<PrintResponse>(query, { topicName, limit });
  return res.map((r) => r.p);
}

export async function getActsForProcess(processNumber: string): Promise<Act[]> {
  const query = `
    MATCH (p:Process {number: $processNumber})-[:HAS]->(s:Stage {type: "PUBLICATION"})-[:HAS]->(a:Act)
    RETURN a {
      ELI: a.ELI,
      title: a.title,
      announcementDate: a.announcementDate,
      comments: a.comments,
      status: a.status,
      address: a.address
    } as act
    ORDER BY a.announcementDate DESC
  `;

  const res = await runQuery<ActResponse>(query, { processNumber });
  return res.map((r) => r.act);
}

export async function getProcessVotings(processNumber: string) {
  const query = `
    MATCH (p:Process {number: $processNumber})
    CALL {
      WITH p
      MATCH (p)<-[:IS_SOURCE_OF|REFERS_TO]-(print:Print)<-[:RELATED_TO]-(v:Voting)
      RETURN DISTINCT v {
        sitting: v.sitting,
        votingNumber: v.votingNumber,
        yes: v.yes,
        no: v.no,
        topic: v.topic,
        sitting: v.sitting
      } as voting
    }
    RETURN voting
  `;

  const res = await runQuery<{ voting: VotingResult }>(query, {
    processNumber,
  });
  return res.map((r) => r.voting);
}

export async function getSimilarPrints(
  printNumber: string
): Promise<PrintShort[]> {
  const query = `
    MATCH (sourcePrint:Print {number: $printNumber})
    WITH sourcePrint
    MATCH (otherPrint:Print)
    WHERE otherPrint <> sourcePrint
    WITH otherPrint, sourcePrint,
         gds.similarity.cosine(sourcePrint.embedding, otherPrint.embedding) as similarity
    WHERE similarity > 0.7
    RETURN otherPrint {
      number: otherPrint.number,
      title: otherPrint.title,
      documentDate: otherPrint.documentDate,
      processPrint: otherPrint.processPrint,
      summary: otherPrint.summary,
      similarity: similarity
    } as p
    ORDER BY similarity DESC
    LIMIT 3
  `;

  const res = await runQuery<PrintResponse>(query, { printNumber });
  return res.map((r) => r.p);
}
