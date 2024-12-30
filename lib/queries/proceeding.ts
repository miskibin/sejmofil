import { runQuery } from "../db/client";
import { ProceedingDates } from "../types/process";

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
  return result[0]?.totalDays;
}

export async function getProceedingDates(): Promise<ProceedingDates[]> {
  const query = `
      MATCH (p:Proceeding)
      UNWIND p.proceeding_dates AS date
      RETURN p.proceeding_number AS proceeding_number, 
             collect(date) AS proceeding_dates
      ORDER BY proceeding_number;
    `;

  const result = await runQuery<Record<string, unknown> & ProceedingDates>(
    query
  );
  return result;
}
