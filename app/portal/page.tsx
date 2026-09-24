import { redirect } from 'next/navigation'
import { LMSShell } from '@/components/lms-shell'
import { StudentPortal } from '@/components/student-portal'
import { getCurrentUser, getUserRole } from '@/lib/access'
import { db } from '@/lib/db'
import { courses, notifications, enrollments, lessons, assessments } from '@/lib/db/schema'
import { desc, eq, inArray } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function PortalPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')
  const role = await getUserRole(user.id, user.email)
  if (role === 'admin') redirect('/admin')
  if (role === 'instructor') redirect('/instructor')
  const [courseRows, notificationRows, enrollmentRows] = await Promise.all([
    db.select().from(courses).where(eq(courses.status, 'published')).orderBy(desc(courses.createdAt)),
    db.select({ id: notifications.id, title: notifications.title, body: notifications.body, readAt: notifications.readAt }).from(notifications).where(eq(notifications.recipientId, user.id)).orderBy(desc(notifications.createdAt)),
    db.select().from(enrollments).where(eq(enrollments.studentId, user.id)),
  ])
  const enrolledCourseIds = enrollmentRows.map((enrollment) => enrollment.courseId)
  const lessonRows = enrolledCourseIds.length ? await db.select().from(lessons).where(inArray(lessons.courseId, enrolledCourseIds)).orderBy(lessons.position) : []
  const lessonIds = lessonRows.map((lesson) => lesson.id)
  const assessmentRows = lessonIds.length ? await db.select().from(assessments).where(inArray(assessments.lessonId, lessonIds)) : []
  return <LMSShell mode="student" user={user}><StudentPortal user={user} courses={courseRows} notifications={notificationRows} enrollments={enrollmentRows} lessons={lessonRows} assessments={assessmentRows} /></LMSShell>
}

export const metadata = { title: 'Student Portal | Learn Forex Botswana' }
