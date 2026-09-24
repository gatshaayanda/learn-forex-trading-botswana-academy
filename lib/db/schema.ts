import { boolean, integer, jsonb, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'

export const userProfiles = pgTable('user_profiles', {
  id: text('id').primaryKey(),
  role: text('role').notNull().default('student'),
  emailVerified: boolean('email_verified').notNull().default(false),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const courses = pgTable('courses', {
  id: text('id').primaryKey(), title: text('title').notNull(), slug: text('slug').notNull().unique(), description: text('description').notNull().default(''), status: text('status').notNull().default('draft'), instructorId: text('instructor_id'), priceCents: integer('price_cents').notNull().default(0), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const lessons = pgTable('lessons', {
  id: text('id').primaryKey(), courseId: text('course_id').notNull(), title: text('title').notNull(), position: integer('position').notNull().default(0), contentType: text('content_type').notNull().default('text'), content: text('content').notNull().default(''), videoUrl: text('video_url'), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const enrollments = pgTable('enrollments', {
  id: text('id').primaryKey(), courseId: text('course_id').notNull(), studentId: text('student_id').notNull(), status: text('status').notNull().default('active'), progress: integer('progress').notNull().default(0), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({ courseStudent: unique().on(table.courseId, table.studentId) }))

export const assessments = pgTable('assessments', {
  id: text('id').primaryKey(), lessonId: text('lesson_id').notNull(), type: text('type').notNull().default('assignment'), title: text('title').notNull(), description: text('description').notNull().default(''), content: jsonb('content').notNull().default({}), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const forumPosts = pgTable('forum_posts', {
  id: text('id').primaryKey(), courseId: text('course_id').notNull(), authorId: text('author_id').notNull(), title: text('title').notNull(), body: text('body').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(), recipientId: text('recipient_id').notNull(), title: text('title').notNull(), body: text('body').notNull(), readAt: timestamp('read_at', { withTimezone: true }), createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
