import { runQuery } from '../db/client'

export interface ProcessInfo {
  number: string
  title: string
  documentType: string
  changeDate: string
  latestStage: {
    name: string
    date: string
  } | null
  topics: string[]
}

interface ProcessInfoResponse {
  process: ProcessInfo
}

export async function getProcessesByPrintNumbers(
  printNumbers: string[]
): Promise<ProcessInfo[]> {
  if (!printNumbers || printNumbers.length === 0) {
    return []
  }

  const query = `
    MATCH (print:Print)-[:IS_SOURCE_OF]->(process:Process)
    WHERE print.number IN $printNumbers
    OPTIONAL MATCH (process)-[:RELATES_TO]->(topic:Topic)
    OPTIONAL MATCH (process)-[:HAS]->(stage:Stage)
    WITH process, 
         collect(DISTINCT topic.name) as topics,
         stage
    ORDER BY stage.date DESC
    WITH process,
         topics,
         collect(stage)[0] as latestStage
    RETURN DISTINCT {
      number: process.number,
      title: process.title,
      documentType: process.documentType,
      changeDate: process.changeDate,
      latestStage: CASE 
        WHEN latestStage IS NOT NULL 
        THEN {name: latestStage.stageName, date: latestStage.date}
        ELSE null
      END,
      topics: topics
    } as process
    ORDER BY process.changeDate DESC
  `

  const result = await runQuery<ProcessInfoResponse>(query, { 
    printNumbers: printNumbers.map(String) 
  })
  
  return result.map(r => r.process)
}
