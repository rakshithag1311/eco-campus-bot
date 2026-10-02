import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatLayout } from '@/components/chat/chat-layout'

export default async function ChatPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch existing conversations for the sidebar
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, title, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(30)

  // Fetch user profile for display name
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <ChatLayout
      user={{ id: user.id, email: user.email ?? '', displayName: profile?.display_name ?? null, avatarUrl: profile?.avatar_url ?? null }}
      initialConversations={conversations ?? []}
    />
  )
}
