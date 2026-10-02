import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLeaderboardServer, getUserEcoPointsServer } from '@/lib/eco-points'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  try {
    const leaderboard = await getLeaderboardServer(user?.id)
    let currentUserEntry = null
    let currentUserSummary = null

    if (user) {
      currentUserEntry = leaderboard.find((e) => e.userId === user.id) ?? null
      currentUserSummary = await getUserEcoPointsServer(user.id)
    }

    return NextResponse.json({
      leaderboard,
      currentUser: currentUserEntry,
      userSummary: currentUserSummary,
    })
  } catch (err: any) {
    console.error('[leaderboard] GET error:', err)
    return NextResponse.json({ error: err.message ?? 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
