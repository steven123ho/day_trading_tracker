import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Auth from '@/components/Auth'

export default async function Home() {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()

  if (data.user) {
    redirect('/dashboard')
  }

  return <Auth />
}
