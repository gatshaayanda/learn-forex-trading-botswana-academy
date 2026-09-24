# Learn Forex Trading Botswana Academy — Project Contract

## 1. Project Role

This repository is the source of truth for the Learn Forex Trading Botswana Academy PWA.

The product is being built for the academy owner and his students.

The intended product is:

- A student-facing learning academy/PWA.
- An owner/admin workspace.
- Course, lesson, enrollment, progress, assessment and communication functionality.
- A WhatsApp chatbot that handles repetitive student/prospect questions.
- Offline-friendly PWA behavior where practical.
- A clean path from the existing public academy website into the academy experience.

The Lyon-Case project is the UI/LMS foundation only. It is not the backend architecture to preserve.

---

## 2. Development Workflow

Always follow:

START → BUILD → VERIFY → CHECKPOINT → CONTINUE

### START

Before changing code:

1. Inspect the actual repository.
2. Read this `AGENTS.md`.
3. Inspect relevant files rather than assuming they exist.
4. Check:
   - current branch
   - git status
   - recent commits
   - package configuration
   - deployment state when relevant
   - Firebase configuration when relevant
5. Identify the smallest controlled change required.

### BUILD

Make the smallest change that solves the identified task.

Do not perform unrelated refactors.

Do not replace working architecture merely because another approach is available.

### VERIFY

After changes:

1. Inspect the diff.
2. Run the relevant checks.
3. Run a production build when appropriate.
4. Test the affected user flow.
5. Fix actual failures before continuing.

### CHECKPOINT

When the work is verified:

1. Commit a meaningful checkpoint.
2. Push to the intended branch.
3. Confirm the remote state.
4. Deploy only when appropriate.
5. Verify the deployed result.

### Golden Rule

Unexpected result = STOP → inspect reality → then act.

Never guess at repository state, Firebase state, deployment state, or application behavior.

---

## 3. Git Rules

The production repository is:

`gatshaayanda/learn-forex-trading-botswana-academy`

The primary branch is:

`main`

`main` is the intended production branch unless explicitly changed by the product owner.

Before committing:

- inspect `git status`
- inspect the diff
- make sure no unrelated files are included
- use a meaningful commit message

Never force-push unless explicitly authorized.

Never overwrite another checkpoint to hide a mistake.

GitHub is the source-of-truth history for the project.

---

## 4. Architecture Direction

### UI / Product Foundation

The current UI and LMS experience originated from the Lyon-Case Learn Forex Academy project.

Preserve and improve useful:

- visual design
- academy branding
- landing page
- student portal
- instructor portal
- admin portal
- LMS shell
- course/lesson experience
- authentication screens
- responsive/mobile experience

Do not blindly preserve implementation details that conflict with the new architecture.

### Backend

The Lyon-Case PostgreSQL/Drizzle backend is being removed.

Do not introduce or restore:

- PostgreSQL
- `pg`
- Drizzle ORM
- the Lyon-Case database schema
- the Lyon-Case database connection
- database credentials
- database migrations

Firebase is the backend direction for this project.

Use Firebase services only where they provide a clear product need.

Prefer a simple architecture over unnecessary infrastructure.

---

## 5. Firebase Migration

Before implementing the Firebase migration:

1. Inspect an existing proven Admin Hub Firebase project/repository.
2. Identify the reusable Firebase configuration pattern.
3. Identify how client Firebase initialization is handled.
4. Identify how server/Admin Firebase access is handled.
5. Identify authentication patterns.
6. Identify Firestore structure and security-rule patterns.
7. Identify environment-variable conventions.
8. Reuse proven patterns where appropriate.

Do not blindly copy an existing application's entire database model.

The Learn Forex Academy data model must be adapted to the academy's actual requirements.

The production Learn Forex Firebase project must have its own credentials/configuration.

Never commit Firebase secrets or service-account credentials.

Environment-specific configuration belongs in environment variables.

---

## 6. Authentication

Authentication must support the academy's actual users:

- students
- instructors where required
- administrators/owner

Authorization must be enforced server-side for privileged operations.

Do not rely only on hidden UI controls for authorization.

The owner/admin role must be clearly separated from ordinary student access.

Do not preserve Lyon-Case authentication simply because it already exists if it depends on PostgreSQL/Better Auth infrastructure being removed.

---

## 7. Academy Data Model

The product may require entities such as:

- users/profiles
- roles
- courses
- lessons
- enrollments
- lesson progress
- assessments
- submissions/results
- announcements
- notifications
- forum/community content
- academy resources

The exact Firebase/Firestore structure must be designed from the academy's requirements.

Do not recreate the Lyon-Case schema one-for-one.

Keep the initial data model small and understandable.

---

## 8. PWA / Offline-First

The application should behave as a real PWA where practical.

Priorities:

- responsive mobile experience
- installability
- reliable navigation
- useful offline behavior
- graceful handling of temporary network loss
- local persistence where appropriate

Do not claim functionality is offline-capable until it has actually been tested offline.

Do not add unnecessary offline infrastructure before the core product works.

---

## 9. WhatsApp Chatbot

The WhatsApp chatbot is part of the product direction.

Initial implementation should be deterministic rather than AI-first.

Expected initial conversation areas include:

- courses
- fees
- how training works
- becoming a student
- existing student support
- speaking to the owner

The intended integration is:

WhatsApp user
→ Meta WhatsApp Business Platform
→ webhook
→ academy backend
→ deterministic conversation logic
→ WhatsApp response

The initial webhook is expected to live at:

`/api/whatsapp/webhook`

WhatsApp credentials must remain in environment variables.

The chatbot should not require an LLM for basic FAQ routing.

AI can be considered later when there is a demonstrated need.

---

## 10. UI / UX Rules

Mobile-first is important.

Do not sacrifice usability for visual effects.

Prioritize:

- readable text
- obvious navigation
- clear calls to action
- simple student workflows
- useful empty states
- useful loading/error states
- accessible controls
- consistent academy branding

Do not introduce placeholder screens that imply functionality has been built when it has not.

Do not advertise unbuilt features as available.

---

## 11. Existing Code Migration

When removing Lyon-Case infrastructure:

1. Identify dependencies that exist only for PostgreSQL/Drizzle/Better Auth.
2. Remove them deliberately.
3. Identify imports that depend on those packages.
4. Replace affected functionality with the Firebase architecture.
5. Remove dead files only after confirming they are no longer referenced.
6. Run the build after each meaningful migration stage.

Do not mass-delete files without checking their references.

Do not rewrite the entire application in one uncontrolled operation.

---

## 12. Dependencies

Keep dependencies minimal.

Before adding a package, determine whether:

- the existing platform already provides the capability
- the functionality can be implemented simply without another dependency
- the dependency is actually needed in production

Remove dependencies that become unused after the backend migration.

---

## 13. Environment Variables

Secrets and environment-specific values must never be hardcoded.

Examples include:

- Firebase configuration
- Firebase Admin credentials
- WhatsApp credentials
- email provider credentials
- deployment-specific URLs

Use `.env.local` for local development.

Keep secret environment files out of Git.

Document required environment variables without exposing their values.

---

## 14. Deployment

Deployment target:

Vercel.

Normal lifecycle:

Local development
→ local verification
→ Git checkpoint
→ GitHub
→ Vercel
→ live verification

Do not repeatedly deploy blindly.

If a deployment fails:

STOP → inspect the actual failure → fix → verify locally → deploy again.

---

## 15. Scope Control

The product owner decides product direction.

Do not independently add major features.

Do not:

- introduce unnecessary architecture
- rebuild working UI without reason
- add speculative integrations
- add unnecessary AI
- create multiple competing backend systems
- create a second source of truth
- change branding without direction

When a requirement is unclear, inspect existing project evidence first.

If the ambiguity materially affects architecture or product behavior, stop and ask.

---

## 16. Quality Standard

A feature is not complete merely because the code compiles.

Completion means:

- implementation exists
- relevant flow works
- mobile behavior is checked
- error states are considered
- relevant data persistence works
- production build passes
- Git diff has been reviewed
- checkpoint has been committed

The product should remain understandable and maintainable by the owner/development workflow.

---

## 17. Current Migration Plan

The current controlled sequence is:

1. Establish this repository from the Lyon-Case foundation.
2. Establish Git history against the empty Learn Forex GitHub repository.
3. Inspect a proven Admin Hub Firebase implementation.
4. Remove PostgreSQL/Drizzle/Lyon-Case database infrastructure.
5. Implement Firebase configuration.
6. Adapt authentication.
7. Adapt academy data operations.
8. Verify student/admin/instructor flows.
9. Establish PWA behavior.
10. Deploy and verify.
11. Implement the deterministic WhatsApp chatbot.
12. Connect chatbot flows to the academy where useful.
13. Continue product development through controlled checkpoints.

Do not skip ahead simply because later functionality is planned.

---

## 18. Recovery Rule

If the application behaves differently from expectations:

STOP.

Do not immediately patch the symptom.

Inspect:

- actual files
- actual runtime behavior
- browser console
- server logs
- network requests
- Firebase state
- Git diff
- deployment state

Then identify the smallest correction.

Reality comes before assumptions.