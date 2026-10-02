import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { awardEcoPointsServer, CAMPUS_CHALLENGES } from '@/lib/eco-points'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { challengeId } = body
  if (!challengeId || typeof challengeId !== 'string') {
    return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 })
  }

  const challenge = CAMPUS_CHALLENGES.find((c) => c.id === challengeId)
  if (!challenge) {
    return NextResponse.json({ error: 'Invalid challenge' }, { status: 404 })
  }

  const admin = createAdminClient()

  // Calculate start of today (UTC)
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  // Check if completed today in user_challenge_completions
  const { data: existing, error: checkError } = await admin
    .from('user_challenge_completions')
    .select('id, completed_at')
    .eq('user_id', user.id)
    .eq('challenge_id', challengeId)
    .gte('completed_at', todayStart.toISOString())
    .limit(1)

  if (!checkError && existing && existing.length > 0) {
    return NextResponse.json(
      { error: 'You have already completed this challenge today! Check back tomorrow.' },
      { status: 400 }
    )
  }

  // Record completion
  const { error: compError } = await admin.from('user_challenge_completions').insert({
    user_id: user.id,
    challenge_id: challengeId,
  })

  if (compError) {
    console.warn('[user_challenge_completions] error:', compError.message)
  }

  // Award +20 points
  const result = await awardEcoPointsServer({
    userId: user.id,
    actionType: 'eco_challenge',
    description: `Completed challenge: ${challenge.title}`,
    metadata: { challengeId, challengeTitle: challenge.title },
  })

  return NextResponse.json({
    ...result,
    success: true,
  })
}
