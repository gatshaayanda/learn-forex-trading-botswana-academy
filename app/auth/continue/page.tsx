import { redirect } from 'next/navigation'
import { getCurrentUser, getUserRole } from '@/lib/access'

export default async function ContinuePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')
  const role = await getUserRole(user.id, user.email)
  redirect(role === 'admin' ? '/admin' : role === 'instructor' ? '/instructor' : '/portal')
}
