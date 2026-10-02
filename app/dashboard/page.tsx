import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserEcoPointsServer } from '@/lib/eco-points'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  // Fetch conversations for sidebar
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, title, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(30)

  // Fetch campus stats
  const { data: stats } = await supabase
    .from('campus_stats')
    .select('stat_key, value, label, suffix, trend, bar')

  // Fetch eco actions count for this user
  const { count: ecoActionsCount } = await supabase
    .from('eco_actions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Fetch real eco points summary
  const ecoPointsSummary = await getUserEcoPointsServer(user.id)

  return (
    <DashboardLayout
      user={{
        id: user.id,
        email: user.email ?? '',
        displayName: profile?.display_name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
      }}
      initialConversations={conversations ?? []}
      campusStats={stats ?? []}
      userEcoActions={ecoActionsCount ?? 0}
      initialEcoPoints={ecoPointsSummary}
    />
  )
}
