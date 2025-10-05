import { getServerSupabase } from '@/lib/supabase/server-ssr'
import { redirect } from 'next/navigation'

export default async function BusinessMeRedirectPage() {
  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: biz } = await supabase
    .from('business_profiles')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()

  if (biz?.id) redirect(`/business/${biz.id}`)
  redirect('/business')
}


