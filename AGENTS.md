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

## 9. Academy Operating Model

The academy is not only a course website. It is being built as a digital academy and student-management service.

Known programme information supplied by the academy owner:

- Prestige Course — 2,100 historical students; academy's most popular programme.
- 5 Weeks Course — 1,020 historical students; five-week programme.
- Legacy Trader Programme — 80 historical students; advanced programme conducted by the company CEO.
- Combined historical population reported by the owner: 3,200+.
- Programmes have different post-completion relationships: some are short courses where students complete and leave; others include ongoing/lifetime mentorship.
- Completed students and alumni must be representable separately from currently active students.
- BQA accreditation is an important academy trust/marketing requirement. Do not invent accreditation scope, registration numbers, programme accreditation, or qualification details. Use the owner's official BQA documentation before publishing exact claims.

The student lifecycle should support, where appropriate:

- prospect
- lead
- applied
- enrolled
- active
- completed
- alumni
- lifetime mentorship
- returning student

The product should eventually connect public acquisition, WhatsApp, student learning, teacher operations, assessments, documents, communication, alumni, and owner reporting through one Firebase-backed system.

Do not seed the reported 3,200+ as fake current users. Treat those figures as historical programme counts until the owner supplies/imports actual student records.

## 10. WhatsApp Chatbot

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

Required production variables include `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and optional `WHATSAPP_OWNER_PHONE`.

`WHATSAPP_VERIFY_TOKEN` is an arbitrary secret chosen by the developer and must exactly match the token entered in Meta webhook configuration. It is not the Meta access token.

The chatbot should not require an LLM for basic FAQ routing.

The webhook should progressively support lead capture, programme categorisation, existing-student routing, owner escalation, and conversation records. Do not invent course fees or accreditation details.

## Firebase Service Credentials

The browser Firebase configuration is public application configuration and uses `NEXT_PUBLIC_FIREBASE_*` variables.

Server-side Firebase Admin access uses `FIREBASE_ADMIN_KEY`, containing the complete JSON private key downloaded from Firebase Console → Project Settings → Service accounts → Firebase Admin SDK → Generate new private key. Use the Firebase Admin SDK service-account key, not a browser API key and not an unrelated Google service account. Never commit the JSON key.

The current Firebase project is `learn-fx-trading-bw-academy`.

Firebase Security Rules must default-deny and be evolved with the data model. The project should use Firebase Authentication, Firestore, and Storage only where the product needs them.


AI can be considered later when there is a demonstrated need.

---

## 11. UI / UX Rules

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

## 12. Existing Code Migration

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

## 13. Dependencies

Keep dependencies minimal.

Before adding a package, determine whether:

- the existing platform already provides the capability
- the functionality can be implemented simply without another dependency
- the dependency is actually needed in production

Remove dependencies that become unused after the backend migration.

---

## 14. Environment Variables

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

## 15. Deployment

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

## 16. Scope Control

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

## 17. Quality Standard

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

## 18. Current Migration Plan

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

## 19. Recovery Rule

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
## 19. Product Model — Academy, Not Just Chatbot

The product is a digital academy and student-management platform. WhatsApp is an entry/support channel, not the whole product.

The academy must support these lifecycle states where appropriate:
- prospect
- applicant
- enrolled
- active student
- completed
- alumni
- lifetime mentorship
- inactive/returning

Programme categories currently supplied by the owner:
- Prestige Course — largest programme
- 5 Weeks Course — short programme
- Legacy Trader Programme — smaller advanced programme led by the CEO

Historical programme counts supplied by the owner are 2,100 Prestige, 1,020 5 Weeks, and 80 Legacy Trader, totaling 3,200+. Treat these as owner-supplied historical figures, not live database counts.

Do not confuse historical student counts with course prices.

### Student experience

The target student PWA should progressively support:
- dashboard
- enrolled programmes
- lesson/module progression
- assessments and grade/results records
- assignments and document uploads
- teacher feedback
- announcements and notifications
- course resources
- teacher communication
- student/community communication where appropriate
- completion/alumni status
- lifetime mentorship access where the student's programme provides it
- WhatsApp support

### Staff / instructor experience

The target staff workspace should progressively support:
- assigned students
- course/lesson management
- assessment review
- grading/results
- feedback
- announcements
- student communication
- document/resource management

### Owner experience

The target owner/admin workspace should progressively support:
- student lifecycle management
- programme/enrollment management
- progress monitoring
- assessment/results monitoring
- staff management
- leads and WhatsApp conversations
- announcements
- alumni/lifetime mentorship
- operational reporting
- evidence-based cohort and engagement analysis

Do not invent analytics or predictions before the required data exists. When enough real data exists, derive projections from observed completion, engagement, retention, assessment and re-enrollment data.

### Accreditation

The owner has stated that the academy is BQA accredited. Until official BQA documentation/details are supplied and checked, do not invent or display a registration number, qualification level, or programme accreditation claim. Store verified accreditation details as structured academy information when available.

## 20. WhatsApp Production Workflow

WhatsApp is being implemented through Meta WhatsApp Business Platform/Cloud API and the Next.js route `/api/whatsapp/webhook`.

Required production environment variables:
- `WHATSAPP_PHONE_NUMBER_ID` — Meta's Phone Number ID for the connected WhatsApp business number.
- `WHATSAPP_ACCESS_TOKEN` — Meta access token used server-side to call the WhatsApp Graph API. Never expose it to client code or commit it.
- `WHATSAPP_VERIFY_TOKEN` — a secret string chosen by this project and entered identically in Meta's webhook configuration. It is not the Meta access token.
- `WHATSAPP_OWNER_PHONE` — digits-only international phone number used for owner handoff, e.g. `267...`.
- `NEXT_PUBLIC_BASE_URL` — public academy URL used in WhatsApp responses.

Never paste or commit WhatsApp access tokens.

The initial chatbot is deterministic. Its first useful workflows should cover:
1. welcome/menu
2. programme discovery
3. fees/payment enquiry without inventing prices
4. how training works
5. existing-student portal/support
6. owner/human handoff
7. prospect capture
8. alumni/returning-student routing

WhatsApp is a lead/support channel. The academy PWA remains the source of truth for student progress, courses, assessments, documents and staff workflows.

## 21. Firebase Credential Rules

The project Firebase backend is `learn-fx-trading-bw-academy`.

Use the Firebase Web App configuration for browser/client initialization.

Use a Firebase Admin SDK service-account private key for privileged server access. Firebase documents that Admin SDK service-account credentials grant privileged access and private keys must be kept secret.

For Vercel, the preferred project secret is `FIREBASE_ADMIN_KEY` containing the JSON credentials for a service account belonging to this Firebase project.

If multiple private keys have been generated for the same service account/project, do not guess which one to use. Use the newest intended key, verify it belongs to `learn-fx-trading-bw-academy`, add it only to the server environment, test the backend, then revoke/delete unused keys. Never commit the JSON file.

Firebase client API configuration may be exposed through `NEXT_PUBLIC_*` variables; Admin service-account credentials and WhatsApp tokens may not.

## 22. Data Architecture Direction

Initial Firestore collections should remain understandable and small:
- `admins`
- `users`
- `courses`
- `lessons`
- `enrollments`
- `progress`
- `assessments`
- `submissions`
- `announcements`
- `notifications`
- `resources`
- `conversations` / `conversationMessages` where required for WhatsApp workflows

Prefer stable document IDs, explicit timestamps, and user/programme references.

Student data must be protected by Firebase Security Rules. Admin/staff operations must not rely only on hidden UI controls.

## 23. PWA Direction

The academy should become installable and mobile-first.

Offline support should be introduced in controlled stages:
1. reliable app shell/navigation
2. cached public/static academy information
3. local persistence for appropriate student state
4. queued writes/synchronization only where the workflow can safely reconcile changes
5. explicit offline/online status where useful

Never claim a workflow is offline-capable until it has been tested offline and after reconnection.

## 24. Client/Commercial Scope Control

This is a real paying client project. Protect production trust.

Do not fabricate:
- prices
- accreditation numbers
- student counts as live database counts
- completion statistics
- grades
- predictions
- student records
- payment status

Build the smallest reliable workflow first, then expand.

The commercial product is intended to become a long-term digital service: implementation, ongoing platform/support, and controlled future feature work. Avoid one-off architecture that prevents continued maintenance.

## 25. Current WhatsApp Bot Checkpoint — 25 September 2026

The Academy chatbot now has a shared response engine used by both the PWA chat widget and the WhatsApp webhook.

Current first-release behavior:
- natural-language intent matching for programmes, fees/enrolment, training, existing students, alumni/returning students, menu and human support
- truthful fee handling: the bot does not invent prices
- truthful accreditation handling: the bot does not invent BQA details
- academy URL included where useful
- human handoff uses WHATSAPP_OWNER_PHONE when configured and otherwise tells the user that human takeover is required
- WhatsApp webhook logs safe event/send diagnostics without logging access tokens
- non-message WhatsApp status/events are acknowledged without attempting a reply
- Graph API version is v26.0

This is the reliable first chatbot layer. It is intentionally deterministic until an approved AI provider/key is configured. The next AI step can add natural-language generation on top of the same academy knowledge and safety rules without replacing the WhatsApp transport.

Production WhatsApp target number supplied by the client: 26775337250. This is the business number the Meta/WhatsApp Business setup must ultimately connect; do not confuse it with a Meta development/test sender.

Do not store or commit the client's WhatsApp access token. Required secrets remain Vercel environment variables.
