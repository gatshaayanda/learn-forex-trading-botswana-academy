import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/477025417_24047448434843867_6373217605156898040_n-X43MYkCQZB2yR3iTIwK4sw40WF2hZe.jpg'

export default function SignInPage() {
  return (
    <main className="auth-page relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-12 text-foreground">
      <div className="absolute inset-0 -z-10 bg-[url('/images/forex-classroom.png')] bg-cover bg-center opacity-55 blur-sm" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-background/65" aria-hidden="true" />
      <div className="auth-chart-vectors absolute inset-0 -z-10" aria-hidden="true" />
      <section className="auth-panel w-full max-w-md rounded-[2rem] border border-primary/20 bg-card/75 p-8 shadow-2xl shadow-background/40 backdrop-blur-2xl sm:p-10">
        <Link href="/" className="flex flex-col items-center text-center">
          <span className="grid size-12 overflow-hidden rounded-xl bg-white">
            <img src={logoUrl} alt="Learn Forex Botswana Academy logo" className="size-full scale-125 object-contain" />
          </span>
          <span><span className="block font-semibold tracking-tight">Learn Forex</span><span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Botswana Academy</span></span>
        </Link>
        <h1 className="mt-8 text-center text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-center leading-6 text-muted-foreground">Sign in to continue your learning journey.</p>
        <div className="mt-8"><AuthForm mode="sign-in" /></div>
        <p className="mt-6 text-center text-sm text-muted-foreground">New to the academy? <Link href="/sign-up" className="font-semibold text-primary">Create an account</Link></p>
      </section>
    </main>
  )
}
