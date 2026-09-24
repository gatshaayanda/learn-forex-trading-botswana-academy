'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createCourse, createLesson, createAssessment, createForumPost, updateInstructorCourseStatus, announceToCourse } from '@/app/actions/academy'

type InstructorPortalProps = {
  user: { id: string; name: string; email: string }
  courses: any[]
  notifications: any[]
  lessons: any[]
  assessments: any[]
  enrollments: any[]
  forumPosts: any[]
}

export function InstructorPortal({ user, courses, notifications, lessons, assessments, enrollments, forumPosts }: InstructorPortalProps) {
  const router = useRouter()
  const [section, setSection] = useState('dashboard')
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  useEffect(() => { const handle = (event: Event) => setSection((event as CustomEvent<string>).detail || 'dashboard'); window.addEventListener('portal:navigate', handle); return () => window.removeEventListener('portal:navigate', handle) }, [])

  const run = (action: () => Promise<unknown>) => startTransition(async () => {
    setMessage('')
    try {
      await action()
      setMessage('✓ Saved successfully')
      router.refresh()
    } catch (error) {
      setMessage(`✗ ${error instanceof Error ? error.message : 'Request failed'}`)
    }
  })

  return (
    <div className="space-y-8">
      {message && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${
          message.startsWith('✓')
            ? 'border-green-500/30 bg-green-500/10 text-green-600'
            : 'border-red-500/30 bg-red-500/10 text-red-600'
        }`}>
          {message}
        </div>
      )}

      {section === 'dashboard' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Instructor Dashboard</h2>
            <p className="mt-1 text-muted-foreground">Manage your courses and student learning</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'My Courses', value: courses.length },
              { label: 'Notifications', value: notifications.length },
              { label: 'Students Enrolled', value: new Set(enrollments.filter((item: any) => courses.some((course: any) => course.id === item.courseId)).map((item: any) => item.studentId)).size },
              { label: 'Lessons', value: lessons.filter((lesson: any) => courses.some((course: any) => course.id === lesson.courseId)).length },
              { label: 'Assessments', value: assessments.filter((assessment: any) => lessons.some((lesson: any) => lesson.id === assessment.lessonId && courses.some((course: any) => course.id === lesson.courseId))).length },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold">My Courses</h3>
              <div className="mt-4 space-y-2">
                {courses.length > 0 ? (
                  courses.map((course: any) => (
                    <div key={course.id} className="text-sm">
                      <p className="font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{course.status}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No courses created yet</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold">Announcements</h3>
              <div className="mt-4 space-y-3">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notif) => (
                    <div key={notif.id} className="text-sm border-l-2 border-primary/30 pl-3 py-2">
                      <p className="font-medium text-sm">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">{notif.body}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No announcements</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <InstructorActionCard
              title="Create Course"
              description="Launch a new course"
              onClick={() => setSection('courses')}
            />
            <InstructorActionCard title="Course Analytics" description="Review learner progress" onClick={() => setSection('analytics')} />
            <InstructorActionCard title="Manage Content" description="Edit lessons and assessments" onClick={() => setSection('content')} />
            <InstructorActionCard title="Publish & Announce" description="Release courses and reach learners" onClick={() => setSection('announcements')} />
            <InstructorActionCard
              title="Add Lesson"
              description="Create lesson content"
              onClick={() => setSection('lessons')}
            />
            <InstructorActionCard
              title="Create Assessment"
              description="Add assignment or quiz"
              onClick={() => setSection('assessments')}
            />
            <InstructorActionCard
              title="Discussion Forum"
              description="Start discussion thread"
              onClick={() => setSection('forums')}
            />
          </div>
        </div>
      )}

      {section === 'analytics' && <InstructorAnalytics courses={courses} lessons={lessons} assessments={assessments} enrollments={enrollments} forumPosts={forumPosts} onBack={() => setSection('dashboard')} />}

      {section === 'content' && <InstructorContent courses={courses} lessons={lessons} assessments={assessments} onBack={() => setSection('dashboard')} />}

      {section === 'courses' && <InstructorCourses courses={courses} run={run} pending={pending} onBack={() => setSection('dashboard')} />}

      {section === 'announcements' && <InstructorAnnouncement courses={courses} run={run} pending={pending} onBack={() => setSection('dashboard')} />}

      {section === 'lessons' && (
        <InstructorCreateLesson courses={courses} run={run} pending={pending} onBack={() => setSection('dashboard')} />
      )}

      {section === 'assessments' && (
        <InstructorCreateAssessment lessons={lessons} run={run} pending={pending} onBack={() => setSection('dashboard')} />
      )}

      {section === 'forums' && (
        <InstructorCreateForum courses={courses} run={run} pending={pending} onBack={() => setSection('dashboard')} />
      )}
    </div>
  )
}

function InstructorAnalytics({ courses, lessons, assessments, enrollments, forumPosts, onBack }: any) {
  const ownedCourseIds = new Set(courses.map((course: any) => course.id))
  const ownedLessons = lessons.filter((lesson: any) => ownedCourseIds.has(lesson.courseId))
  const ownedLessonIds = new Set(ownedLessons.map((lesson: any) => lesson.id))
  const ownedEnrollments = enrollments.filter((item: any) => ownedCourseIds.has(item.courseId))
  const ownedPosts = forumPosts.filter((post: any) => ownedCourseIds.has(post.courseId))
  return <div className="space-y-6"><button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button><div><h2 className="text-2xl font-bold">Course Analytics</h2><p className="mt-1 text-muted-foreground">Monitor the health of your teaching portfolio.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['Courses', courses.length], ['Learners', new Set(ownedEnrollments.map((item: any) => item.studentId)).size], ['Lessons', ownedLessons.length], ['Discussions', ownedPosts.length]].map(([label, value]) => <div key={label as string} className="rounded-xl border border-border bg-card p-5"><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p></div>)}</div><div className="rounded-xl border border-border bg-card p-6"><h3 className="font-semibold">Portfolio health</h3><div className="mt-4 space-y-4">{courses.length ? courses.map((course: any) => { const enrolled = ownedEnrollments.filter((item: any) => item.courseId === course.id); const content = ownedLessons.filter((lesson: any) => lesson.courseId === course.id); const courseAssessments = assessments.filter((assessment: any) => ownedLessonIds.has(assessment.lessonId)); return <div key={course.id} className="flex flex-col gap-3 border-b border-border pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{course.title}</p><p className="text-sm text-muted-foreground">{enrolled.length} enrollments · {content.length} lessons · {courseAssessments.length} assessments</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs capitalize">{course.status}</span></div> }) : <p className="text-sm text-muted-foreground">Create your first course to see analytics.</p>}</div></div></div>
}

function InstructorContent({ courses, lessons, assessments, onBack }: any) {
  const courseName = (courseId: string) => courses.find((course: any) => course.id === courseId)?.title || 'Unknown course'
  const lessonName = (lessonId: string) => lessons.find((lesson: any) => lesson.id === lessonId)?.title || 'Unknown lesson'
  return <div className="space-y-6"><button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button><div><h2 className="text-2xl font-bold">Content Library</h2><p className="mt-1 text-muted-foreground">Review the learning material you have authored.</p></div><div className="grid gap-4 lg:grid-cols-2"><div className="rounded-xl border border-border bg-card p-6"><h3 className="font-semibold">Lessons</h3><div className="mt-4 space-y-3">{lessons.length ? lessons.map((lesson: any) => <div key={lesson.id} className="rounded-lg border border-border/70 p-4"><p className="font-medium">{lesson.title}</p><p className="mt-1 text-xs text-muted-foreground">{courseName(lesson.courseId)} · {lesson.contentType}</p></div>) : <p className="text-sm text-muted-foreground">No lessons yet.</p>}</div></div><div className="rounded-xl border border-border bg-card p-6"><h3 className="font-semibold">Assessments</h3><div className="mt-4 space-y-3">{assessments.length ? assessments.map((assessment: any) => <div key={assessment.id} className="rounded-lg border border-border/70 p-4"><p className="font-medium">{assessment.title}</p><p className="mt-1 text-xs text-muted-foreground">{lessonName(assessment.lessonId)} · {assessment.type}</p></div>) : <p className="text-sm text-muted-foreground">No assessments yet.</p>}</div></div></div></div>
}

function InstructorActionCard({ title, description, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:bg-primary/5 transition"
    >
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </button>
  )
}

function InstructorCourses({ courses, run, pending, onBack }: any) {
  return <div className="space-y-6"><button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button><div><h2 className="text-2xl font-bold">Course publishing</h2><p className="mt-1 text-muted-foreground">Prepare, publish, and archive your course catalog.</p></div><div className="grid gap-4">{courses.map((course: any) => <article key={course.id} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold">{course.title}</h3><p className="mt-1 text-sm text-muted-foreground">/{course.slug} · {course.description || 'No description yet.'}</p></div><select value={course.status} disabled={pending} onChange={(event) => run(() => updateInstructorCourseStatus({ courseId: course.id, status: event.target.value as 'draft' | 'published' | 'archived' }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm capitalize"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></article>)}{!courses.length && <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Create a course to begin publishing.</div>}</div></div>
}

function InstructorAnnouncement({ courses, run, pending, onBack }: any) {
  const [courseId, setCourseId] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  return <div className="space-y-6"><button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button><div><h2 className="text-2xl font-bold">Learner announcement</h2><p className="mt-1 text-muted-foreground">Send a notification to every learner enrolled in a course.</p></div><div className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-6"><select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-2"><option value="">Choose a course...</option>{courses.map((course: any) => <option key={course.id} value={course.id}>{course.title}</option>)}</select><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Announcement title" className="w-full rounded-lg border border-border bg-background px-4 py-2" /><textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write your announcement" className="min-h-28 w-full rounded-lg border border-border bg-background px-4 py-2" /><button disabled={pending || !courseId || !title.trim() || !body.trim()} onClick={() => run(() => announceToCourse({ courseId, title, body }))} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50">Send announcement</button></div></div>
}

function InstructorCreateCourse({ run, pending, onBack }: any) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
      <div>
        <h2 className="text-2xl font-bold">Create Course</h2>
        <p className="mt-1 text-muted-foreground">Launch a new course for your students</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4 max-w-md">
        <div>
          <label className="text-sm font-semibold">Course Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Market Analysis Fundamentals"
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="market-analysis-fundamentals"
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Course overview and objectives"
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary h-24"
          />
        </div>
        <button
          disabled={pending || !title || !slug}
          onClick={() => run(() => createCourse({ title, slug, description }))}
          className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50"
        >
          Create Course
        </button>
      </div>
    </div>
  )
}

function InstructorCreateLesson({ courses, run, pending, onBack }: any) {
  const [courseId, setCourseId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
      <div>
        <h2 className="text-2xl font-bold">Create Lesson</h2>
        <p className="mt-1 text-muted-foreground">Add lesson content to your course</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4 max-w-md">
        <div>
          <label className="text-sm font-semibold">Course</label>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary">
            <option value="">Choose a course...</option>
            {courses.map((course: any) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">Lesson Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Introduction to Market Structure"
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Lesson content or resource URL"
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary h-24"
          />
        </div>
        <button
          disabled={pending || !courseId || !title}
          onClick={() => run(() => createLesson({ courseId, title, contentType: 'text', content }))}
          className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50"
        >
          Create Lesson
        </button>
      </div>
    </div>
  )
}

function InstructorCreateAssessment({ lessons, run, pending, onBack }: any) {
  const [lessonId, setLessonId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
      <div>
        <h2 className="text-2xl font-bold">Create Assessment</h2>
        <p className="mt-1 text-muted-foreground">Add an assignment or quiz to test student learning</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4 max-w-md">
        <div>
          <label className="text-sm font-semibold">Lesson</label>
          <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary">
            <option value="">Choose a lesson...</option>
            {lessons.map((lesson: any) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">Assessment Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Market Structure Quiz"
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Instructions</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Assessment instructions and questions"
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary h-24"
          />
        </div>
        <button
          disabled={pending || !lessonId || !title}
          onClick={() => run(() => createAssessment({ lessonId, type: 'assignment', title, description }))}
          className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50"
        >
          Create Assessment
        </button>
      </div>
    </div>
  )
}

function InstructorCreateForum({ courses, run, pending, onBack }: any) {
  const [courseId, setCourseId] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
      <div>
        <h2 className="text-2xl font-bold">Discussion Forum</h2>
        <p className="mt-1 text-muted-foreground">Start a discussion thread for your students</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4 max-w-md">
        <div>
          <label className="text-sm font-semibold">Course</label>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary">
            <option value="">Choose a course...</option>
            {courses.map((course: any) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">Topic</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Discussion topic"
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm font-semibold">Post</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Your post content"
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary h-24"
          />
        </div>
        <button
          disabled={pending || !courseId || !title || !body}
          onClick={() => run(() => createForumPost({ courseId, title, body }))}
          className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50"
        >
          Publish Discussion
        </button>
      </div>
    </div>
  )
}
