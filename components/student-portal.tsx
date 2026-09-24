'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { enrollInCourse, createForumPost, updateProfile, markLessonComplete } from '@/app/actions/academy'

type StudentPortalProps = {
  user: { id: string; name: string; email: string }
  courses: any[]
  notifications: any[]
  enrollments: any[]
  lessons: any[]
  assessments: any[]
}

export function StudentPortal({ user, courses, notifications, enrollments, lessons, assessments }: StudentPortalProps) {
  const router = useRouter()
  const [section, setSection] = useState('dashboard')
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null)
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
            <h2 className="text-2xl font-bold">Learning Dashboard</h2>
            <p className="mt-1 text-muted-foreground">Track your progress and continue learning</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Available Courses', value: courses.length },
              { label: 'Enrolled', value: enrollments.length },
              { label: 'Lessons Ready', value: lessons.length },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold">Course Catalog</h3>
              <div className="mt-4 space-y-3">
                {courses.length > 0 ? (
                  courses.slice(0, 5).map((course: any) => (
                    <div key={course.id} className="text-sm border-l-2 border-primary/30 pl-3 py-2">
                      <p className="font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.description || 'No description'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No courses available yet</p>
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
            <StudentActionCard
              title="Browse Courses"
              description="Explore available courses"
              onClick={() => setSection('courses')}
            />
            <StudentActionCard
              title="Continue Learning"
              description="Open your enrolled lessons"
              onClick={() => setSection('learning')}
            />
            <StudentActionCard
              title="My Assignments"
              description="View your assignments"
              onClick={() => setSection('assignments')}
            />
            <StudentActionCard
              title="Discussion Forums"
              description="Join course discussions"
              onClick={() => setSection('forums')}
            />
            <StudentActionCard
              title="My Profile"
              description="Update your profile"
              onClick={() => setSection('profile')}
            />
          </div>
        </div>
      )}

      {section === 'courses' && (
        <StudentCoursesSection
          courses={courses}
          enrollments={enrollments}
          run={run}
          pending={pending}
          onBack={() => setSection('dashboard')}
        />
      )}

      {section === 'learning' && (
        <StudentLearningSection lessons={lessons} enrollments={enrollments} run={run} pending={pending} onBack={() => setSection('dashboard')} />
      )}

      {section === 'assignments' && (
        <StudentAssignmentsSection assessments={assessments} lessons={lessons} selectedAssessment={selectedAssessment} setSelectedAssessment={setSelectedAssessment} run={run} pending={pending} onBack={() => setSection('dashboard')} />
      )}

      {section === 'forums' && (
        <StudentForumsSection courses={courses} enrollments={enrollments} run={run} pending={pending} onBack={() => setSection('dashboard')} />
      )}

      {section === 'profile' && (
        <StudentProfileSection user={user} run={run} pending={pending} onBack={() => setSection('dashboard')} />
      )}
    </div>
  )
}

function StudentActionCard({ title, description, onClick }: any) {
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

function StudentCoursesSection({ courses, enrollments, run, pending, onBack }: any) {
  const enrolledIds = new Set(enrollments.map((enrollment: any) => enrollment.courseId))
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
      <div>
        <h2 className="text-2xl font-bold">Course Catalog</h2>
        <p className="mt-1 text-muted-foreground">Browse and enroll in courses</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.length > 0 ? (
          courses.map((course: any) => (
            <div key={course.id} className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold">{course.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{course.description || 'Course description coming soon.'}</p>
              <button
                disabled={pending || enrolledIds.has(course.id)}
                onClick={() => run(() => enrollInCourse(course.id))}
                className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {enrolledIds.has(course.id) ? 'Enrolled' : 'Enroll Now'}
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="text-muted-foreground">No courses available yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StudentLearningSection({ lessons, enrollments, run, pending, onBack }: any) {
  const enrolledCourses = new Set(enrollments.map((item: any) => item.courseId))
  const availableLessons = lessons.filter((lesson: any) => enrolledCourses.has(lesson.courseId))
  return <div className="space-y-6">
    <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
    <div><h2 className="text-2xl font-bold">Continue Learning</h2><p className="mt-1 text-muted-foreground">Work through lessons from your enrolled courses.</p></div>
    {availableLessons.length ? <div className="grid gap-4 md:grid-cols-2">{availableLessons.map((lesson: any) => <article key={lesson.id} className="rounded-xl border border-border bg-card p-5"><p className="text-xs font-semibold uppercase tracking-widest text-primary">{lesson.contentType}</p><h3 className="mt-2 font-semibold">{lesson.title}</h3><p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{lesson.content}</p>{lesson.videoUrl ? <a className="mt-4 inline-block text-sm font-semibold text-primary hover:underline" href={lesson.videoUrl} target="_blank" rel="noreferrer">Watch lesson video</a> : null}<button disabled={pending} onClick={() => run(() => markLessonComplete(lesson.id))} className="mt-4 block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">Mark complete</button></article>)}</div> : <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center"><p className="text-muted-foreground">Enroll in a course to unlock lessons.</p></div>}
  </div>
}

function StudentAssignmentsSection({ assessments, lessons, selectedAssessment, setSelectedAssessment, run, pending, onBack }: any) {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
      <div>
        <h2 className="text-2xl font-bold">My Assignments</h2>
        <p className="mt-1 text-muted-foreground">Track assessments and continue your coursework.</p>
      </div>
      {selectedAssessment && <div className="rounded-xl border border-primary/30 bg-primary/5 p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">{selectedAssessment.type}</p><h3 className="mt-2 text-xl font-bold">{selectedAssessment.title}</h3></div><button onClick={() => setSelectedAssessment(null)} className="text-sm text-muted-foreground hover:text-foreground">Close</button></div><p className="mt-4 text-sm text-muted-foreground">{selectedAssessment.description || 'Review the instructions below before completing this assessment.'}</p><pre className="mt-4 overflow-x-auto rounded-lg bg-background p-4 text-xs text-muted-foreground">{JSON.stringify(selectedAssessment.content, null, 2)}</pre><p className="mt-4 text-sm font-medium">Submission workspace ready. Your instructor will review completed work.</p></div>}
      {assessments.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {assessments.map((assessment: any) => {
            const lesson = lessons.find((item: any) => item.id === assessment.lessonId)
            return <article key={assessment.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">{assessment.type}</p><h3 className="mt-2 font-semibold">{assessment.title}</h3></div><span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">Not started</span></div>
              <p className="mt-3 text-sm text-muted-foreground">{assessment.description || `From lesson: ${lesson?.title || 'Course lesson'}`}</p>
              <button disabled={pending} onClick={() => setSelectedAssessment(assessment)} className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50">Open assessment</button>
            </article>
          })}
        </div>
      ) : <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center"><p className="text-muted-foreground">No assignments have been published for your courses yet.</p></div>}
    </div>
  )
}

function StudentForumsSection({ courses, enrollments, run, pending, onBack }: any) {
  const [courseId, setCourseId] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
      <div>
        <h2 className="text-2xl font-bold">Discussion Forums</h2>
        <p className="mt-1 text-muted-foreground">Join course discussions and connect with peers</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4 max-w-md">
        <div>
          <label className="text-sm font-semibold">Select a Course</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary"
          >
            <option value="">Choose your course...</option>
            {enrollments.length > 0 ? enrollments.map((enrollment: any) => {
              const course = courses?.find((c: any) => c.id === enrollment.courseId)
              return <option key={enrollment.id} value={enrollment.courseId}>{course?.title || 'Unknown course'}</option>
            }) : <option disabled>No enrolled courses</option>}
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
          <label className="text-sm font-semibold">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Your message"
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary h-20"
          />
        </div>
        <button
          disabled={pending || !courseId || !title || !body}
          onClick={() => run(() => createForumPost({ courseId, title, body }))}
          className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50"
        >
          Post Discussion
        </button>
      </div>
    </div>
  )
}

function StudentProfileSection({ user, run, pending, onBack }: any) {
  const [name, setName] = useState(user.name)

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
      <div>
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <p className="mt-1 text-muted-foreground">Update your account information</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4 max-w-md">
        <div>
          <label className="text-sm font-semibold">Email</label>
          <p className="mt-2 px-4 py-2 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div>
          <label className="text-sm font-semibold">Display Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary"
          />
        </div>
        <button
          disabled={pending || !name}
          onClick={() => run(() => updateProfile({ displayName: name }))}
          className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
