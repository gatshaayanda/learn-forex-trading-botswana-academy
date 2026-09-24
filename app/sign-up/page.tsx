import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'

export default function SignUpPage() {
  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12"><section className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-2xl shadow-black/20"><Link href="/" className="text-sm font-semibold text-primary">Learn Forex Botswana</Link><h1 className="mt-8 text-3xl font-bold tracking-tight">Start learning</h1><p className="mt-2 leading-6 text-muted-foreground">Create your account and access the academy.</p><div className="mt-8"><AuthForm mode="sign-up" blockedEmail={process.env.ADMIN_EMAILS?.split(',')[0]} /></div><p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link href="/sign-in" className="font-semibold text-primary">Sign in</Link></p></section></main>
}
