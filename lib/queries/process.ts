import { runQuery } from "../db/client";
import { PrintShort } from "../types/print";
import { ProcessStage } from "../types/process";

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
  console.log(resp);
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
