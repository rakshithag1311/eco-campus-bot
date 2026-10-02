import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserEcoPointsServer } from '@/lib/eco-points'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const summary = await getUserEcoPointsServer(user.id)
    return NextResponse.json(summary)
  } catch (err: any) {
    console.error('[eco-points] GET error:', err)
    return NextResponse.json({ error: err.message ?? 'Failed to fetch points' }, { status: 500 })
  }
}
