import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import { userProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export function isAdminEmail(email: string) {
  const configured = process.env.ADMIN_EMAILS?.split(',') ?? []
  const allowlist = [...configured, 'admin@learnfxbw.com']
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
  return allowlist.includes(email.trim().toLowerCase())
}

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export async function getUserRole(userId: string, email: string) {
  if (isAdminEmail(email)) return 'admin' as const
  const profile = await db.select({ role: userProfiles.role }).from(userProfiles).where(eq(userProfiles.id, userId)).limit(1)
  return profile[0]?.role === 'instructor' ? 'instructor' as const : 'student' as const
}
