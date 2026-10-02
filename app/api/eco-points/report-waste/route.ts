import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { awardEcoPointsServer } from '@/lib/eco-points'

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

  const { title, locationName, issueType, description } = body

  if (!locationName || typeof locationName !== 'string' || !locationName.trim()) {
    return NextResponse.json({ error: 'Location is required' }, { status: 400 })
  }

  const reportTitle = (title && typeof title === 'string' && title.trim())
    ? title.trim()
    : `Waste report at ${locationName.trim()}`

  const reportType = ['overflowing_bin', 'damaged_bin', 'litter_hotspot', 'hazardous_waste', 'other'].includes(issueType)
    ? issueType
    : 'other'

  const admin = createAdminClient()

  // Try inserting into waste_reports table
  const { error: repError } = await admin.from('waste_reports').insert({
    user_id: user.id,
    title: reportTitle,
    location_name: locationName.trim(),
    issue_type: reportType,
    description: description || null,
    status: 'reported',
  })

  if (repError) {
    console.warn('[waste_reports] insert error, continuing to award points:', repError.message)
  }

  // Award +10 points securely on server
  const result = await awardEcoPointsServer({
    userId: user.id,
    actionType: 'report_waste',
    description: `Reported ${reportType.replace('_', ' ')} at ${locationName.trim()}`,
    metadata: { location: locationName.trim(), issueType: reportType },
  })

  return NextResponse.json({
    ...result,
    success: true,
  })
}
