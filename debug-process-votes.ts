/**
 * Debug script to test process votes functionality
 * Run with: npx tsx debug-process-votes.ts
 */

import { createClient as createServerClient } from './utils/supabase/server'
import { createClient as createBrowserClient } from './utils/supabase/client'

async function testServerClient() {
  console.log('\n=== Testing Server Client ===')
  try {
    console.log('Creating server client...')
    const supabase = await createServerClient()
    console.log('✓ Server client created')
    
    console.log('\nTesting simple query...')
    const { data: testData, error: testError } = await supabase
      .from('process_votes')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('✗ Simple query failed:', testError)
    } else {
      console.log('✓ Simple query succeeded:', testData)
    }
    
    console.log('\nTesting process vote counts query for process_id=1...')
    const { data, error } = await supabase
      .from('process_votes')
      .select('vote_type')
      .eq('process_id', 1)
      .not('vote_type', 'is', null)
    
    if (error) {
      console.error('✗ Vote counts query failed:', error)
      return
    }
    
    console.log('✓ Query succeeded. Raw data:', data)
    
    // Aggregate
    const counts = ((data || []) as Array<{ vote_type: string | null }>).reduce(
      (acc, vote) => {
        if (vote.vote_type === 'up') acc.upvotes++
        if (vote.vote_type === 'down') acc.downvotes++
        return acc
      },
      { upvotes: 0, downvotes: 0 }
    )
    
    console.log('✓ Aggregated counts:', counts)
    
  } catch (error) {
    console.error('✗ Server client test failed with exception:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
  }
}

async function testEnvironmentVariables() {
  console.log('\n=== Testing Environment Variables ===')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing')
  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('URL value:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  }
}

async function testBrowserClient() {
  console.log('\n=== Testing Browser Client (for comparison) ===')
  try {
    console.log('Creating browser client...')
    const supabase = createBrowserClient()
    console.log('✓ Browser client created')
    
    console.log('\nTesting simple query...')
    const { data, error } = await supabase
      .from('process_votes')
      .select('vote_type')
      .eq('process_id', 1)
      .limit(5)
    
    if (error) {
      console.error('✗ Browser client query failed:', error)
    } else {
      console.log('✓ Browser client query succeeded:', data)
    }
  } catch (error) {
    console.error('✗ Browser client test failed:', error)
  }
}

async function testTableExists() {
  console.log('\n=== Testing if process_votes table exists ===')
  try {
    const supabase = await createServerClient()
    
    // Try to get table info
    const { data, error } = await supabase
      .from('process_votes')
      .select('id')
      .limit(0)
    
    if (error) {
      console.error('✗ Table might not exist or is not accessible:', error)
    } else {
      console.log('✓ Table exists and is accessible')
    }
  } catch (error) {
    console.error('✗ Table check failed:', error)
  }
}

async function main() {
  console.log('🔍 Starting Process Votes Debug Script\n')
  console.log('Node version:', process.version)
  console.log('Current directory:', process.cwd())
  
  await testEnvironmentVariables()
  await testTableExists()
  await testServerClient()
  await testBrowserClient()
  
  console.log('\n✅ Debug script completed\n')
}

main().catch(console.error)
