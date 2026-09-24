'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode, blockedEmail }: { mode: 'sign-in' | 'sign-up'; blockedEmail?: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (mode === 'sign-up' && blockedEmail && email.trim().toLowerCase() === blockedEmail.trim().toLowerCase()) {
      setError('Administrator accounts are provisioned by the academy owner.')
      return
    }
    setPending(true)
    const result = mode === 'sign-up'
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password })
    setPending(false)
    if (result.error) {
      setError('We could not complete that request. Check your details and try again.')
      return
    }
    window.location.assign('/auth/continue')
  }

  async function handleGoogleSignIn() {
    setError('')
    setPending(true)
    const result = await authClient.signIn.social({ provider: 'google', callbackURL: '/auth/continue' })
    if (result.error) {
      setError('Google sign-in could not be completed. Please try again.')
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form flex flex-col gap-5">
      {mode === 'sign-up' ? <label className="flex flex-col gap-2 text-sm font-medium">Full name<input required value={name} onChange={(event) => setName(event.target.value)} className="rounded-xl border border-border bg-background px-4 py-3 outline-none ring-primary focus:ring-2" /></label> : null}
      <label className="flex flex-col gap-2 text-sm font-medium">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-xl border border-border bg-background px-4 py-3 outline-none ring-primary focus:ring-2" /></label>
      <label className="flex flex-col gap-2 text-sm font-medium">Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-xl border border-border bg-background px-4 py-3 outline-none ring-primary focus:ring-2" /></label>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <button disabled={pending} className="rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Please wait…' : mode === 'sign-up' ? 'Create account' : 'Sign in'}</button>
      {mode === 'sign-in' ? <>
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
        <button type="button" onClick={handleGoogleSignIn} disabled={pending} className="rounded-xl border border-border bg-background/70 px-4 py-3 font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"><span aria-hidden="true" className="mr-2 font-bold text-primary">G</span>Continue with Google</button>
      </> : null}
    </form>
  )
}
