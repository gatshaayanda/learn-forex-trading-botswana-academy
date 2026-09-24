import { redirect } from 'next/navigation'
import { LMSShell } from '@/components/lms-shell'
import { InstructorPortal } from '@/components/instructor-portal'
import { getCurrentUser, getUserRole } from '@/lib/access'
import { db } from '@/lib/db'
import { courses, notifications, lessons, assessments, enrollments, forumPosts } from '@/lib/db/schema'
import { desc, eq, inArray } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function InstructorPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')
  const role = await getUserRole(user.id, user.email)
  if (role === 'admin') redirect('/admin')
  if (role !== 'instructor') redirect('/portal')
  const courseRows = await db.select().from(courses).where(eq(courses.instructorId, user.id)).orderBy(desc(courses.createdAt))
  const courseIds = courseRows.map((course) => course.id)
  const [notificationRows, lessonRows, enrollmentRows, forumRows] = await Promise.all([
    db.select({ id: notifications.id, title: notifications.title, body: notifications.body }).from(notifications).where(eq(notifications.recipientId, user.id)).orderBy(desc(notifications.createdAt)),
    courseIds.length ? db.select().from(lessons).where(inArray(lessons.courseId, courseIds)).orderBy(lessons.position) : Promise.resolve([]),
    courseIds.length ? db.select().from(enrollments).where(inArray(enrollments.courseId, courseIds)) : Promise.resolve([]),
    courseIds.length ? db.select().from(forumPosts).where(inArray(forumPosts.courseId, courseIds)).orderBy(desc(forumPosts.createdAt)) : Promise.resolve([]),
  ])
  const lessonIds = lessonRows.map((lesson) => lesson.id)
  const assessmentRows = lessonIds.length ? await db.select().from(assessments).where(inArray(assessments.lessonId, lessonIds)) : []
  return <LMSShell mode="instructor" user={user}><InstructorPortal user={user} courses={courseRows} notifications={notificationRows} lessons={lessonRows} assessments={assessmentRows} enrollments={enrollmentRows} forumPosts={forumRows} /></LMSShell>
}

export const metadata = { title: 'Instructor Portal | Learn Forex Botswana' }
