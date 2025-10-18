/**
 * Simple debug test for batch vote counts
 * Run with: pnpm dev (in another terminal) then curl this endpoint
 */

import { getBatchProcessVoteCounts } from '@/lib/supabase/processVotes'

export async function GET() {
  try {
    console.log('Testing batch vote counts...')
    
    // Test with a few process IDs
    const testIds = [1, 2, 3, 4, 5]
    const result = await getBatchProcessVoteCounts(testIds)
    
    // Convert Map to object for JSON response
    const resultObj = Object.fromEntries(result)
    
    console.log('Success! Results:', resultObj)
    
    return Response.json({
      success: true,
      message: 'Batch vote counts retrieved successfully',
      data: resultObj,
      testedIds: testIds
    })
  } catch (error) {
    console.error('Error in debug route:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
