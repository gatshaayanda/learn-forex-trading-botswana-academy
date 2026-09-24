'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Menu, X, ChevronDown, LogOut, RefreshCw } from 'lucide-react'

type LMSShellProps = {
  mode: 'admin' | 'instructor' | 'student'
  user: { id: string; name: string; email: string }
  children: React.ReactNode
}

export function LMSShell({ mode, user, children }: LMSShellProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const navItems = mode === 'admin'
    ? [
        { label: 'Dashboard', href: '#dashboard', icon: '📊' },
        { label: 'Users & Roles', href: '#users', icon: '👥' },
        { label: 'Courses', href: '#courses', icon: '📚' },
        { label: 'Lessons', href: '#lessons', icon: '✏️' },
        { label: 'Assessments', href: '#assessments', icon: '📋' },
        { label: 'Announcements', href: '#announcements', icon: '📢' },
        { label: 'Pricing', href: '#pricing', icon: '💰' },
        { label: 'Analytics', href: '#analytics', icon: '📈' },
        { label: 'Settings', href: '#settings', icon: '⚙️' },
      ]
    : mode === 'instructor'
    ? [
        { label: 'Dashboard', href: '#dashboard', icon: '📊' },
        { label: 'My Courses', href: '#courses', icon: '📚' },
        { label: 'Lessons', href: '#lessons', icon: '✏️' },
        { label: 'Assignments', href: '#assignments', icon: '📝' },
        { label: 'Student Progress', href: '#progress', icon: '📈' },
        { label: 'Discussion Forums', href: '#forums', icon: '💬' },
        { label: 'Grading', href: '#grading', icon: '✅' },
        { label: 'Profile', href: '#profile', icon: '👤' },
      ]
    : [
        { label: 'Dashboard', href: '#dashboard', icon: '📊' },
        { label: 'My Courses', href: '#courses', icon: '📚' },
        { label: 'Assignments', href: '#assignments', icon: '📝' },
        { label: 'Grades', href: '#grades', icon: '📊' },
        { label: 'Discussion Forums', href: '#forums', icon: '💬' },
        { label: 'Notifications', href: '#notifications', icon: '🔔' },
        { label: 'Profile', href: '#profile', icon: '👤' },
      ]

  async function signOut() {
    startTransition(async () => {
      await authClient.signOut()
      router.push('/')
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-card/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden rounded-lg p-2 hover:bg-muted"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-2 hover:bg-muted transition"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="font-semibold text-lg">
                Learn Forex <span className="text-primary">{mode === 'admin' ? 'Admin' : mode === 'instructor' ? 'Instructor' : 'Academy'}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => router.refresh()}
              className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-foreground"
              title="Refresh page"
            >
              <RefreshCw className="h-5 w-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card shadow-lg">
                  <button
                    onClick={signOut}
                    disabled={pending}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-muted rounded-t-xl disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } fixed inset-y-14 left-0 z-20 overflow-y-auto border-r border-border/80 bg-card/50 backdrop-blur transition-all duration-300 md:static md:inset-auto`}
        >
          <nav className="space-y-1 p-4">
            <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {mode === 'admin' ? 'Administration' : 'Learning'}
            </p>
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => window.dispatchEvent(new CustomEvent('portal:navigate', { detail: item.href.slice(1) }))}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition hover:bg-muted text-foreground/80 hover:text-foreground"
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 top-14 z-10 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Main content */}
        <main className={`flex-1 ${!sidebarOpen && 'md:ml-0'}`}>
          <div className="mx-auto max-w-7xl p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
