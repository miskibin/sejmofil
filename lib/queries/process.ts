import { runQuery } from "../db/client";
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
