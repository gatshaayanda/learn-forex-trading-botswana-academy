import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? '')
}

const configuredFrom = process.env.RESEND_EMAIL_DOMAIN
  ? `Learn Forex Botswana <academy@${process.env.RESEND_EMAIL_DOMAIN}>`
  : 'Learn Forex Botswana <onboarding@resend.dev>'
const sandboxFrom = 'Learn Forex Botswana <onboarding@resend.dev>'

type EmailRequest = { to: string; subject: string; html: string; idempotencyKey: string }

async function sendEmail(request: EmailRequest) {
  const resend = getResend()
  const firstAttempt = await resend.emails.send({ from: configuredFrom, to: [request.to], subject: request.subject, html: request.html }, { idempotencyKey: request.idempotencyKey })
  if (firstAttempt.error) {
    const message = /domain is not verified|domain.*verified/i.test(firstAttempt.error.message)
      ? 'Email delivery is unavailable because the configured Resend sending domain is not verified. Verify groar.ink in Resend before sending invitations.'
      : `Email delivery failed: ${firstAttempt.error.message}`
    throw new Error(message)
  }
  return firstAttempt.data
}

export async function sendVerificationEmail({ to, url, name }: { to: string; url: string; name: string }) {
  return sendEmail({ to, subject: 'Verify your Learn Forex Academy email', html: `<p>Hi ${name},</p><p>Verify your email to activate your Learn Forex Academy account.</p><p><a href="${url}">Verify email address</a></p>`, idempotencyKey: `verify-email/${to}` })
}

export async function sendInvitationEmail({ to, url, role }: { to: string; url: string; role: string }) {
  return sendEmail({ to, subject: `Your Learn Forex ${role} invitation`, html: `<p>You have been invited to Learn Forex Academy as a ${role}.</p><p><a href="${url}">Set your password and join the academy</a></p>`, idempotencyKey: `invitation/${to}/${role}` })
}
