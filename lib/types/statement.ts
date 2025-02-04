export interface Statement {
  id: number
  proceeding_day_id: number
  number_sequence: number
  number_source: number
  official_point: string
  official_topic: string
  text: string
  speaker_name: string
  speaker_function: string
  official_prints: string[]
  voting_numbers: string[]
}

export interface StatementToPoint {
  id: number
  statement_id: number
  proceeding_point_ai_id: number
}

export interface StatementAI {
  id: number
  statement_id: number
  summary_discussion: string
  summary_simple: string
  summary_tldr: string
  interruptions: Record<string, unknown>
  criticism: Record<string, unknown>
  approvals: Record<string, unknown>
  speaker_rating: Record<string, unknown>
  statement_analysis: {
    facts: number
    logic: number
    summary: string
    emotions: number
    manipulation: number
  }
  topic_attitude: {
    score: number // 1 to 5
    explanation: string
  }
  topic: string
  citations: string[]
}
export interface StatementCombined {
  id: number
  number_sequence: number
  official_topic: string
  statement_ai: {
    citations: string[]
    summary_tldr: string
    speaker_rating: {
      facts: number
      logic: number
      emotions: number
      manipulation: number
      summary: string
    }
  }
}
