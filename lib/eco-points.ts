import { createAdminClient } from './supabase/admin'

export type EcoActionType =
  | 'waste_classification'
  | 'snap_and_sort'
  | 'report_waste'
  | 'eco_challenge'

export const ECO_ACTION_POINTS: Record<EcoActionType, number> = {
  waste_classification: 5,
  snap_and_sort: 5,
  report_waste: 10,
  eco_challenge: 20,
}

export const ECO_ACTION_LABELS: Record<EcoActionType, { label: string; icon: string }> = {
  waste_classification: { label: 'Waste Classification', icon: 'Recycle' },
  snap_and_sort: { label: 'Snap & Sort', icon: 'Camera' },
  report_waste: { label: 'Report Waste Issue', icon: 'AlertTriangle' },
  eco_challenge: { label: 'Eco Challenge', icon: 'Sparkles' },
}

export type EcoLevel = {
  name: string
  emoji: string
  min: number
  max: number | null
  nextLevel: string | null
  pointsToNext: number
  progress: number // 0 to 100
  badgeBg: string
  badgeBorder: string
  badgeText: string
}

export function getEcoLevel(points: number): EcoLevel {
  const safePoints = Math.max(0, points)

  if (safePoints < 50) {
    return {
      name: 'Eco Starter',
      emoji: '🌱',
      min: 0,
      max: 49,
      nextLevel: 'Green Explorer',
      pointsToNext: 50 - safePoints,
      progress: Math.min(100, Math.round((safePoints / 50) * 100)),
      badgeBg: 'bg-emerald-500/15',
      badgeBorder: 'border-emerald-500/30',
      badgeText: 'text-emerald-400',
    }
  }

  if (safePoints < 150) {
    return {
      name: 'Green Explorer',
      emoji: '🌿',
      min: 50,
      max: 149,
      nextLevel: 'Eco Champion',
      pointsToNext: 150 - safePoints,
      progress: Math.min(100, Math.round(((safePoints - 50) / 100) * 100)),
      badgeBg: 'bg-teal-500/15',
      badgeBorder: 'border-teal-500/30',
      badgeText: 'text-teal-400',
    }
  }

  if (safePoints < 300) {
    return {
      name: 'Eco Champion',
      emoji: '♻️',
      min: 150,
      max: 299,
      nextLevel: 'Green Guardian',
      pointsToNext: 300 - safePoints,
      progress: Math.min(100, Math.round(((safePoints - 150) / 150) * 100)),
      badgeBg: 'bg-cyan-500/15',
      badgeBorder: 'border-cyan-500/30',
      badgeText: 'text-cyan-400',
    }
  }

  if (safePoints < 500) {
    return {
      name: 'Green Guardian',
      emoji: '🌎',
      min: 300,
      max: 499,
      nextLevel: 'Planet Hero',
      pointsToNext: 500 - safePoints,
      progress: Math.min(100, Math.round(((safePoints - 300) / 200) * 100)),
      badgeBg: 'bg-blue-500/15',
      badgeBorder: 'border-blue-500/30',
      badgeText: 'text-blue-400',
    }
  }

  return {
    name: 'Planet Hero',
    emoji: '🌍',
    min: 500,
    max: null,
    nextLevel: null,
    pointsToNext: 0,
    progress: 100,
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-400',
  }
}

export type PointTransaction = {
  id: string
  actionType: EcoActionType
  points: number
  description: string
  createdAt: string
}

export type LeaderboardEntry = {
  rank: number
  userId: string
  displayName: string
  avatarUrl: string | null
  totalPoints: number
  totalActions: number
  level: EcoLevel
  isCurrentUser: boolean
}

export type CampusChallenge = {
  id: string
  title: string
  description: string
  points: number
  icon: string
  completedToday: boolean
}

export const CAMPUS_CHALLENGES: Omit<CampusChallenge, 'completedToday'>[] = [
  {
    id: 'reusable_bottle',
    title: 'Reusable Cup & Bottle Hero',
    description: 'Use a refillable water bottle or reusable coffee mug today instead of single-use cups.',
    points: 20,
    icon: 'CupSoda',
  },
  {
    id: 'cafeteria_sort',
    title: 'Cafeteria Compost Master',
    description: 'Properly sort food scraps and biodegradable waste into the cafeteria green bins.',
    points: 20,
    icon: 'Utensils',
  },
  {
    id: 'bin_scout',
    title: 'Campus E-waste Scout',
    description: 'Locate the library e-waste collection bin and responsibly drop off used batteries or tech.',
    points: 20,
    icon: 'BatteryCharging',
  },
  {
    id: 'power_down',
    title: 'Campus Energy Saver',
    description: 'Switch off idle lights, projectors, or monitors when leaving an empty study hall or lab.',
    points: 20,
    icon: 'Zap',
  },
]

/**
 * Award points securely on the server.
 * Points are hardcoded according to the action type to prevent client manipulation.
 */
export async function awardEcoPointsServer(params: {
  userId: string
  actionType: EcoActionType
  description?: string
  metadata?: Record<string, any>
}): Promise<{
  success: boolean
  pointsAwarded: number
  newTotal: number
  previousLevel: EcoLevel
  currentLevel: EcoLevel
  isLevelUp: boolean
}> {
  const points = ECO_ACTION_POINTS[params.actionType]
  const description =
    params.description ??
    `${ECO_ACTION_LABELS[params.actionType].label} (+${points} pts)`

  const admin = createAdminClient()

  // Get previous points
  const prevSummary = await getUserEcoPointsServer(params.userId)
  const previousLevel = prevSummary.level

  // Try inserting into eco_points table
  const { error: insertError } = await admin.from('eco_points').insert({
    user_id: params.userId,
    action_type: params.actionType,
    points,
    description,
    metadata: params.metadata ?? null,
  })

  // If table doesn't exist yet or any other schema error, fall back to eco_actions
  if (insertError) {
    console.warn('[eco_points] insert error, falling back to eco_actions:', insertError.message)
    await admin.from('eco_actions').insert({
      user_id: params.userId,
      action_type: params.actionType,
      description: `[+${points} pts] ${description}`,
    })
  } else {
    // Also record in eco_actions for general campus activity count
    admin.from('eco_actions').insert({
      user_id: params.userId,
      action_type: params.actionType,
      description,
    }).then(() => {})
  }

  // Increment campus_stats eco_actions if exists
  admin.from('campus_stats')
    .select('value')
    .eq('stat_key', 'eco_actions')
    .single()
    .then(({ data }) => {
      if (data) {
        admin.from('campus_stats')
          .update({ value: Number(data.value) + 1, updated_at: new Date().toISOString() })
          .eq('stat_key', 'eco_actions')
          .then(() => {})
      }
    })

  // Calculate new total
  const newSummary = await getUserEcoPointsServer(params.userId)
  const currentLevel = newSummary.level
  const isLevelUp = currentLevel.name !== previousLevel.name && newSummary.totalPoints > prevSummary.totalPoints

  return {
    success: true,
    pointsAwarded: points,
    newTotal: newSummary.totalPoints,
    previousLevel,
    currentLevel,
    isLevelUp,
  }
}

/**
 * Fetch total points and recent history for a given user from Supabase.
 */
export async function getUserEcoPointsServer(userId: string): Promise<{
  totalPoints: number
  level: EcoLevel
  history: PointTransaction[]
}> {
  const admin = createAdminClient()

  // 1. Try reading from eco_points
  const { data: pointsData, error: pointsError } = await admin
    .from('eco_points')
    .select('id, action_type, points, description, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (!pointsError && pointsData) {
    const totalPoints = pointsData.reduce((sum, row) => sum + (row.points || 0), 0)
    // If user has more rows than limit, get full sum
    let verifiedTotal = totalPoints
    if (pointsData.length === 20) {
      const { data: allRows } = await admin
        .from('eco_points')
        .select('points')
        .eq('user_id', userId)
      if (allRows) {
        verifiedTotal = allRows.reduce((sum, r) => sum + (r.points || 0), 0)
      }
    }

    const history: PointTransaction[] = pointsData.map((row) => ({
      id: row.id,
      actionType: row.action_type,
      points: row.points,
      description: row.description,
      createdAt: row.created_at,
    }))

    return {
      totalPoints: verifiedTotal,
      level: getEcoLevel(verifiedTotal),
      history,
    }
  }

  // 2. Fallback: compute from eco_actions
  const { data: actionsData } = await admin
    .from('eco_actions')
    .select('id, action_type, description, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (actionsData && actionsData.length > 0) {
    let totalPoints = 0
    const history: PointTransaction[] = []

    for (const act of actionsData) {
      const type = act.action_type as EcoActionType
      const pts = ECO_ACTION_POINTS[type] ?? 5
      totalPoints += pts
      history.push({
        id: act.id,
        actionType: type in ECO_ACTION_POINTS ? type : 'waste_classification',
        points: pts,
        description: act.description ?? 'Campus eco action',
        createdAt: act.created_at,
      })
    }

    return {
      totalPoints,
      level: getEcoLevel(totalPoints),
      history: history.slice(0, 20),
    }
  }

  return {
    totalPoints: 0,
    level: getEcoLevel(0),
    history: [],
  }
}

/**
 * Fetch campus leaderboard using real Supabase profiles and real points.
 * Zero fake data.
 */
export async function getLeaderboardServer(currentUserId?: string): Promise<LeaderboardEntry[]> {
  const admin = createAdminClient()

  // Fetch real profiles from Supabase
  const { data: profiles, error: profError } = await admin
    .from('profiles')
    .select('id, display_name, email, avatar_url, created_at')

  if (profError || !profiles) {
    console.error('[leaderboard] failed to fetch profiles:', profError)
    return []
  }

  // Try fetching points from eco_points
  const { data: allPoints, error: pointsErr } = await admin
    .from('eco_points')
    .select('user_id, points')

  // Try fetching eco_actions as well/fallback
  const { data: allActions } = await admin
    .from('eco_actions')
    .select('user_id, action_type')

  const pointsByUser: Record<string, { totalPoints: number; count: number }> = {}

  profiles.forEach((p) => {
    pointsByUser[p.id] = { totalPoints: 0, count: 0 }
  })

  if (!pointsErr && allPoints && allPoints.length > 0) {
    allPoints.forEach((row) => {
      if (pointsByUser[row.user_id]) {
        pointsByUser[row.user_id].totalPoints += row.points || 0
        pointsByUser[row.user_id].count += 1
      }
    })
  } else if (allActions && allActions.length > 0) {
    allActions.forEach((row) => {
      if (pointsByUser[row.user_id]) {
        const pts = ECO_ACTION_POINTS[row.action_type as EcoActionType] ?? 5
        pointsByUser[row.user_id].totalPoints += pts
        pointsByUser[row.user_id].count += 1
      }
    })
  }

  // Sort real users by points desc, then created_at
  const sorted = [...profiles].sort((a, b) => {
    const ptsA = pointsByUser[a.id]?.totalPoints ?? 0
    const ptsB = pointsByUser[b.id]?.totalPoints ?? 0
    if (ptsB !== ptsA) return ptsB - ptsA
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  return sorted.map((p, index) => {
    const totalPoints = pointsByUser[p.id]?.totalPoints ?? 0
    const totalActions = pointsByUser[p.id]?.count ?? 0
    const name = p.display_name?.trim() || (p.email ? p.email.split('@')[0] : 'Campus Eco Hero')

    return {
      rank: index + 1,
      userId: p.id,
      displayName: name,
      avatarUrl: p.avatar_url ?? null,
      totalPoints,
      totalActions,
      level: getEcoLevel(totalPoints),
      isCurrentUser: currentUserId ? p.id === currentUserId : false,
    }
  })
}
