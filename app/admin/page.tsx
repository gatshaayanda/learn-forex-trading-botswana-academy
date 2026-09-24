import { redirect } from 'next/navigation'
import { LMSShell } from '@/components/lms-shell'
import { AdminPortal } from '@/components/admin-portal'
import { getCurrentUser, getUserRole } from '@/lib/access'
import { db } from '@/lib/db'
import { courses, notifications, userProfiles, lessons, assessments, enrollments, forumPosts } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')
  const role = await getUserRole(user.id, user.email)
  if (role !== 'admin') redirect(role === 'instructor' ? '/instructor' : '/portal')
  const [courseRows, notificationRows, profileRows, lessonRows, assessmentRows, enrollmentRows, forumRows] = await Promise.all([
    db.select().from(courses).orderBy(desc(courses.createdAt)),
    db.select().from(notifications).orderBy(desc(notifications.createdAt)),
    db.select().from(userProfiles).orderBy(desc(userProfiles.createdAt)),
    db.select().from(lessons).orderBy(desc(lessons.createdAt)),
    db.select().from(assessments).orderBy(desc(assessments.createdAt)),
    db.select().from(enrollments).orderBy(desc(enrollments.createdAt)),
    db.select().from(forumPosts).orderBy(desc(forumPosts.createdAt)),
  ])
  return <LMSShell mode="admin" user={user}><AdminPortal user={user} courses={courseRows} notifications={notificationRows} profiles={profileRows} lessons={lessonRows} assessments={assessmentRows} enrollments={enrollmentRows} forumPosts={forumRows} /></LMSShell>
}

export const metadata = { title: 'Admin Portal | Learn Forex Botswana' }
