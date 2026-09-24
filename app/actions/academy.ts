'use server'

import { randomUUID } from 'node:crypto'
import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { isAdminEmail } from '@/lib/access'
import { sendInvitationEmail } from '@/lib/mailer'
import { db } from '@/lib/db'
import { assessments, courses, enrollments, forumPosts, lessons, notifications, userProfiles } from '@/lib/db/schema'

async function currentUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user
}

async function requireAdmin() {
  const user = await currentUser()
  if (!isAdminEmail(user.email)) throw new Error('Forbidden')
  return user
}

export async function listCourses() {
  await currentUser()
  return db.select().from(courses).orderBy(desc(courses.createdAt))
}

export async function createCourse(input: { title: string; slug: string; description?: string; priceCents?: number }) {
  const user = await currentUser()
  const profile = await db.select().from(userProfiles).where(eq(userProfiles.id, user.id)).limit(1)
  if (!isAdminEmail(user.email) && profile[0]?.role !== 'instructor') throw new Error('Only administrators and instructors can create courses.')
  const title = input.title.trim()
  const slug = input.slug.trim().toLowerCase()
  if (!title || !slug) throw new Error('Course title and slug are required.')
  const course = { id: randomUUID(), title, slug, description: input.description?.trim() ?? '', instructorId: user.id, priceCents: Math.max(0, Math.round(input.priceCents ?? 0)), status: 'draft' as const }
  await db.insert(courses).values(course)
  revalidatePath('/admin')
  revalidatePath('/instructor')
  return course
}

export async function createLesson(input: { courseId: string; title: string; contentType: string; content: string; videoUrl?: string }) {
  const user = await currentUser()
  const profile = await db.select().from(userProfiles).where(eq(userProfiles.id, user.id)).limit(1)
  if (!isAdminEmail(user.email) && profile[0]?.role !== 'instructor') throw new Error('Forbidden')
  const courseId = input.courseId.trim()
  const title = input.title.trim()
  const content = input.content.trim()
  if (!courseId || !title || !content) throw new Error('Course, lesson title, and lesson content are required.')
  const lesson = { id: randomUUID(), courseId, title, contentType: input.contentType, content, videoUrl: input.videoUrl?.trim() }
  await db.insert(lessons).values(lesson)
  revalidatePath('/admin')
  revalidatePath('/instructor')
  return lesson
}

export async function markLessonComplete(lessonId: string) {
  const user = await currentUser()
  const id = lessonId.trim()
  if (!id) throw new Error('Choose a lesson first.')
  const lesson = await db.select({ courseId: lessons.courseId }).from(lessons).where(eq(lessons.id, id)).limit(1)
  if (!lesson.length) throw new Error('Lesson not found.')
  const enrollment = await db.select({ id: enrollments.id }).from(enrollments).where(and(eq(enrollments.courseId, lesson[0].courseId), eq(enrollments.studentId, user.id))).limit(1)
  if (!enrollment.length) throw new Error('Enroll in this course before completing lessons.')
  await db.update(enrollments).set({ progress: 100 }).where(eq(enrollments.id, enrollment[0].id))
  revalidatePath('/portal')
  return { completed: true }
}

export async function enrollInCourse(courseId: string) {
  const user = await currentUser()
  const normalizedCourseId = courseId.trim()
  if (!normalizedCourseId) throw new Error('Choose a course before enrolling.')
  const existingCourse = await db.select({ id: courses.id }).from(courses).where(eq(courses.id, normalizedCourseId)).limit(1)
  if (!existingCourse.length) throw new Error('That course is no longer available.')
  const enrollment = { id: randomUUID(), courseId: normalizedCourseId, studentId: user.id, status: 'active' as const, progress: 0 }
  await db.insert(enrollments).values(enrollment).onConflictDoNothing()
  revalidatePath('/portal')
  return enrollment
}

export async function createAssessment(input: { lessonId: string; type: 'assignment' | 'quiz'; title: string; description?: string; content?: Record<string, unknown> }) {
  const user = await currentUser()
  const profile = await db.select().from(userProfiles).where(eq(userProfiles.id, user.id)).limit(1)
  if (!isAdminEmail(user.email) && profile[0]?.role !== 'instructor') throw new Error('Forbidden')
  const lessonId = input.lessonId.trim()
  const title = input.title.trim()
  if (!lessonId || !title) throw new Error('Lesson and assessment title are required.')
  const assessment = { id: randomUUID(), lessonId, type: input.type, title, description: input.description?.trim() ?? '', content: input.content ?? {} }
  await db.insert(assessments).values(assessment)
  revalidatePath('/instructor')
  revalidatePath('/admin')
  return assessment
}

export async function listCourseForums(courseId: string) {
  const user = await currentUser()
  const id = courseId.trim()
  if (!id) throw new Error('Choose a course first.')
  const enrollment = await db.select({ id: enrollments.id }).from(enrollments).where(and(eq(enrollments.courseId, id), eq(enrollments.studentId, user.id))).limit(1)
  if (!enrollment.length) throw new Error('You must be enrolled to view this forum.')
  return db.select().from(forumPosts).where(eq(forumPosts.courseId, id)).orderBy(desc(forumPosts.createdAt))
}

export async function createForumPost(input: { courseId: string; title: string; body: string }) {
  const user = await currentUser()
  const courseId = input.courseId.trim()
  const title = input.title.trim()
  const body = input.body.trim()
  if (!courseId || !title || !body) throw new Error('Course, topic, and message are required.')
  const post = { id: randomUUID(), courseId, authorId: user.id, title, body }
  await db.insert(forumPosts).values(post)
  revalidatePath('/portal')
  return post
}

export async function inviteAcademyMember(input: { email: string; role: 'instructor' | 'student' }) {
  const admin = await requireAdmin()
  const email = input.email.trim().toLowerCase()
  if (!email.includes('@')) throw new Error('Enter a valid recipient email address.')
  const inviteUrl = `${process.env.BETTER_AUTH_URL ?? process.env.V0_RUNTIME_URL ?? 'http://localhost:3000'}/sign-up?invite=${encodeURIComponent(email)}&role=${input.role}`
  try {
    await sendInvitationEmail({ to: email, url: inviteUrl, role: input.role })
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Invitation email could not be sent.')
  }
  return { invitedBy: admin.id, email, role: input.role }
}

export async function updateInstructorCourseStatus(input: { courseId: string; status: 'draft' | 'published' | 'archived' }) {
  const user = await currentUser()
  const courseId = input.courseId.trim()
  if (!courseId) throw new Error('Choose a course.')
  const owned = await db.select({ id: courses.id }).from(courses).where(and(eq(courses.id, courseId), eq(courses.instructorId, user.id))).limit(1)
  if (!owned.length) throw new Error('You can only update courses you own.')
  await db.update(courses).set({ status: input.status, updatedAt: new Date() }).where(eq(courses.id, courseId))
  revalidatePath('/instructor')
  revalidatePath('/portal')
  return { courseId, status: input.status }
}

export async function updateCourseStatus(input: { courseId: string; status: 'draft' | 'published' | 'archived' }) {
  await requireAdmin()
  const courseId = input.courseId.trim()
  if (!courseId) throw new Error('Choose a course.')
  await db.update(courses).set({ status: input.status, updatedAt: new Date() }).where(eq(courses.id, courseId))
  revalidatePath('/admin')
  revalidatePath('/portal')
  revalidatePath('/instructor')
  return { courseId, status: input.status }
}

export async function updateUserRole(input: { userId: string; role: 'student' | 'instructor' | 'admin' }) {
  await requireAdmin()
  const userId = input.userId.trim()
  if (!userId) throw new Error('Choose a user.')
  await db.update(userProfiles).set({ role: input.role, updatedAt: new Date() }).where(eq(userProfiles.id, userId))
  revalidatePath('/admin')
  return { userId, role: input.role }
}

export async function markNotificationRead(notificationId: string) {
  const user = await currentUser()
  const id = notificationId.trim()
  if (!id) throw new Error('Choose a notification.')
  await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.id, id), eq(notifications.recipientId, user.id)))
  revalidatePath('/admin')
  revalidatePath('/portal')
}

export async function announceToCourse(input: { courseId: string; title: string; body: string }) {
  const user = await currentUser()
  const courseId = input.courseId.trim()
  const title = input.title.trim()
  const body = input.body.trim()
  if (!courseId || !title || !body) throw new Error('Course, title, and announcement are required.')
  const owned = await db.select({ id: courses.id }).from(courses).where(and(eq(courses.id, courseId), eq(courses.instructorId, user.id))).limit(1)
  if (!owned.length) throw new Error('You can only announce to your own courses.')
  const students = await db.select({ studentId: enrollments.studentId }).from(enrollments).where(eq(enrollments.courseId, courseId))
  if (students.length) await db.insert(notifications).values(students.map((student) => ({ id: randomUUID(), recipientId: student.studentId, title, body })))
  revalidatePath('/instructor')
  revalidatePath('/portal')
  return { recipients: students.length }
}

export async function sendNotification(input: { recipientId: string; title: string; body: string }) {
  await requireAdmin()
  const recipientId = input.recipientId.trim()
  const title = input.title.trim()
  const body = input.body.trim()
  if (!recipientId || !title || !body) throw new Error('Recipient, title, and message are required.')
  const notification = { id: randomUUID(), recipientId, title, body }
  await db.insert(notifications).values(notification)
  revalidatePath('/admin')
  return notification
}

export async function getMyNotifications() {
  const user = await currentUser()
  return db.select().from(notifications).where(eq(notifications.recipientId, user.id)).orderBy(desc(notifications.createdAt))
}

export async function updateProfile(input: { displayName: string; avatarUrl?: string }) {
  const user = await currentUser()
  const displayName = input.displayName.trim()
  if (!displayName) throw new Error('Display name is required.')
  const values = { id: user.id, displayName, avatarUrl: input.avatarUrl?.trim() ?? '', updatedAt: new Date() }
  await db.insert(userProfiles).values(values).onConflictDoUpdate({ target: userProfiles.id, set: values })
  revalidatePath('/portal')
  return values
}
