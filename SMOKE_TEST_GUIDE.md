# KOLLAB Smoke Test Guide

Use this guide after `npm run type-check`, `npm run lint`, and `npm run build` pass. Test on mobile width first, then spot-check tablet and desktop.

## Auth And Onboarding

### AUTH-001
- **Test Name:** Landing page loads
- **Preconditions:** App is running locally.
- **Steps:**
  1. Open `/`.
  2. Verify the hero section, two join buttons, value props, safety section, and footer.
- **Expected Result:** Public landing page renders without layout overlap or console errors.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### AUTH-002
- **Test Name:** Register role selection
- **Preconditions:** User is signed out.
- **Steps:**
  1. Open `/register`.
  2. Select "I'm a Creator".
  3. Return and select "I'm a Business".
- **Expected Result:** Large role cards select the correct role and reveal the registration form.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### AUTH-003
- **Test Name:** Register validation
- **Preconditions:** User is on `/register` with a role selected.
- **Steps:**
  1. Submit an empty form.
  2. Enter mismatched passwords.
  3. Enter an invalid email.
- **Expected Result:** Zod validation messages appear for each invalid field.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### AUTH-004
- **Test Name:** Register success redirect
- **Preconditions:** Supabase Auth is configured and user email is unused.
- **Steps:**
  1. Complete the register form with valid details.
  2. Submit the form once.
- **Expected Result:** Submit button disables while pending, profile metadata is sent, and user lands on `/onboarding`.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### AUTH-005
- **Test Name:** Login flow
- **Preconditions:** A valid artist and business test account exist.
- **Steps:**
  1. Open `/login`.
  2. Toggle password visibility.
  3. Login as artist.
  4. Logout or reset session, then login as business.
- **Expected Result:** Artist redirects to `/artist/home`; business redirects to `/business/home`.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### AUTH-006
- **Test Name:** Login error handling
- **Preconditions:** User is signed out.
- **Steps:**
  1. Open `/login`.
  2. Submit wrong credentials.
- **Expected Result:** Friendly toast appears without raw Supabase error text.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### AUTH-007
- **Test Name:** Reset password
- **Preconditions:** Supabase Auth email is configured.
- **Steps:**
  1. Open `/reset-password`.
  2. Submit an invalid email.
  3. Submit a valid email.
- **Expected Result:** Invalid email shows validation; valid email shows confirmation.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### AUTH-008
- **Test Name:** Role-specific onboarding
- **Preconditions:** User has just registered.
- **Steps:**
  1. Open `/onboarding` as artist and complete artist fields.
  2. Open `/onboarding` as business and complete business fields.
- **Expected Result:** Artist data saves to artist profile; business data saves to business profile; each redirects home.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

## Artist Screens

### ART-001
- **Test Name:** Artist dashboard
- **Preconditions:** Signed in as artist.
- **Steps:**
  1. Open `/artist/home`.
  2. Review greeting, open-to-gigs toggle, stats, gig cards, applications, and bottom nav.
- **Expected Result:** Dashboard loads with no overlap and all controls are tappable.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### ART-002
- **Test Name:** Artist availability toggle
- **Preconditions:** Signed in as artist on `/artist/home`.
- **Steps:**
  1. Toggle "Open to Gigs" off.
  2. Toggle it back on.
- **Expected Result:** Toggle state updates and failures show a friendly toast.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### ART-003
- **Test Name:** Browse gig filters
- **Preconditions:** Signed in as artist.
- **Steps:**
  1. Open `/artist/browse`.
  2. Search for a term.
  3. Open filters and adjust skill, budget, distance, and work type.
- **Expected Result:** Gig list updates and empty state appears when no gigs match.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### ART-004
- **Test Name:** Gig detail and map
- **Preconditions:** Signed in as artist.
- **Steps:**
  1. Open a gig detail from browse.
  2. Verify description, business info, budget, deadline, and map.
- **Expected Result:** Gig details and Leaflet map render correctly.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### ART-005
- **Test Name:** Artist application validation
- **Preconditions:** Signed in as artist on a live gig.
- **Steps:**
  1. Click "Apply for this Gig".
  2. Submit a short pitch.
  3. Enter a quoted rate outside the budget.
  4. Submit valid pitch and rate.
- **Expected Result:** Zod errors show for invalid fields; valid application submits once.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### ART-006
- **Test Name:** Portfolio upload
- **Preconditions:** Signed in as artist.
- **Steps:**
  1. Open `/artist/portfolio`.
  2. Upload jpg, png, mp4, or pdf under 50MB.
  3. Try an unsupported file.
- **Expected Result:** Supported upload appears in grid; invalid file shows friendly error.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### ART-007
- **Test Name:** Artist profile edit
- **Preconditions:** Signed in as artist.
- **Steps:**
  1. Open `/artist/profile`.
  2. Open edit sheet.
  3. Change name, bio, location, skills, rate, and availability.
  4. Save.
- **Expected Result:** Zod validation protects fields and saved values update the profile.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### ART-008
- **Test Name:** Earnings filters
- **Preconditions:** Signed in as artist.
- **Steps:**
  1. Open `/artist/earnings`.
  2. Switch between All, Held, Released, and Disputed.
- **Expected Result:** Ledger filters correctly and totals remain visible.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

## Business Screens

### BUS-001
- **Test Name:** Business dashboard
- **Preconditions:** Signed in as business.
- **Steps:**
  1. Open `/business/home`.
  2. Verify summary, active gig cards, quick stats, FAB, and nav.
- **Expected Result:** Dashboard renders with orange business accent and no layout issues.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### BUS-002
- **Test Name:** Post gig step 1 validation
- **Preconditions:** Signed in as business.
- **Steps:**
  1. Open `/business/post-gig`.
  2. Leave title and description invalid.
  3. Click Continue.
- **Expected Result:** Skill, title, and description errors appear and step does not advance.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### BUS-003
- **Test Name:** Post gig budget and deadline validation
- **Preconditions:** Signed in as business on post-gig step 2.
- **Steps:**
  1. Set max budget below min budget.
  2. Set deadline less than two days away.
  3. Click Continue.
- **Expected Result:** Budget and deadline validation messages appear.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### BUS-004
- **Test Name:** Post gig submit
- **Preconditions:** Signed in as business with valid post-gig details.
- **Steps:**
  1. Complete all three steps.
  2. Attach up to three reference files.
  3. Click Post Gig.
- **Expected Result:** Submit button disables, gig is created, and user redirects to `/business/gig/[id]`.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### BUS-005
- **Test Name:** Artist discovery
- **Preconditions:** Signed in as business.
- **Steps:**
  1. Open `/business/artists`.
  2. Verify map pins and creator list.
  3. Adjust filters.
- **Expected Result:** List filters by skill, budget, distance, and rating.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### BUS-006
- **Test Name:** Invite artist
- **Preconditions:** Signed in as business with a live gig.
- **Steps:**
  1. Open `/business/artists`.
  2. Click "Invite to Gig" on a creator.
  3. Select an active gig and send invite.
- **Expected Result:** Invite action succeeds or shows a friendly error toast.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### BUS-007
- **Test Name:** Application management
- **Preconditions:** Signed in as business with pending applications.
- **Steps:**
  1. Open `/business/gig/[id]`.
  2. Accept one application.
  3. Decline another pending application.
- **Expected Result:** Accepted application creates escrow, gig moves in progress, and pending alternatives decline.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### BUS-008
- **Test Name:** Work review actions
- **Preconditions:** Signed in as business with gig under review.
- **Steps:**
  1. Open `/business/gig/[id]/review`.
  2. Request revision with a note.
  3. Raise dispute with a note.
  4. Approve and rate artist.
- **Expected Result:** Each action updates status or escrow correctly and shows user-friendly feedback.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

## Shared Features

### SHARED-001
- **Test Name:** Shared chat header
- **Preconditions:** Signed in as gig party.
- **Steps:**
  1. Open `/shared/chat/[gigId]`.
  2. Verify gig title, other party, avatar initials, and escrow chip.
- **Expected Result:** Chat header reflects the gig context.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### SHARED-002
- **Test Name:** Send text message
- **Preconditions:** Signed in as gig party on chat screen.
- **Steps:**
  1. Type a message.
  2. Click send.
- **Expected Result:** Message appears as a right-side sent bubble with IST timestamp.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### SHARED-003
- **Test Name:** Send attachment
- **Preconditions:** Signed in as gig party on chat screen.
- **Steps:**
  1. Attach a deliverable file under 50MB.
  2. Send the message.
- **Expected Result:** File uploads to deliverables storage and appears as an attachment chip.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### SHARED-004
- **Test Name:** Realtime chat
- **Preconditions:** Two browser sessions are signed in as opposite gig parties.
- **Steps:**
  1. Open the same chat in both sessions.
  2. Send a message from session A.
- **Expected Result:** Session B receives the message without a refresh.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### SHARED-005
- **Test Name:** Read receipts
- **Preconditions:** Chat has unread messages from the other party.
- **Steps:**
  1. Open `/shared/chat/[gigId]`.
  2. Refresh database messages table.
- **Expected Result:** Messages from the other party are marked read.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### SHARED-006
- **Test Name:** Progress tracker
- **Preconditions:** Signed in as gig party.
- **Steps:**
  1. Open `/shared/tracker/[gigId]`.
  2. Review all five stepper states.
  3. Check escrow card and deadline countdown.
- **Expected Result:** Stepper matches gig status and deadline warning appears under five days.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### SHARED-007
- **Test Name:** Context-aware tracker action
- **Preconditions:** Artist has in-progress gig or business has under-review gig.
- **Steps:**
  1. Open tracker as artist on in-progress gig.
  2. Click "Submit My Work".
  3. Open tracker as business on under-review gig.
  4. Click "Review & Approve".
- **Expected Result:** Artist submits work; business navigates to review screen.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### SHARED-008
- **Test Name:** Double-blind ratings
- **Preconditions:** Escrow status is released.
- **Steps:**
  1. Open tracker.
  2. Submit a star rating and optional review.
  3. Submit rating from the other party.
- **Expected Result:** First side sees waiting message; both ratings become visible after both submit.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

## Notifications

### NOTIF-001
- **Test Name:** Notification unread count
- **Preconditions:** User has unread notifications.
- **Steps:**
  1. Open any authenticated top bar.
  2. Inspect notification bell.
- **Expected Result:** Bell shows unread count badge.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### NOTIF-002
- **Test Name:** Notification mark read
- **Preconditions:** User has unread notifications.
- **Steps:**
  1. Click notification bell.
  2. Close and reopen dropdown.
- **Expected Result:** Notifications display and unread count clears.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### NOTIF-003
- **Test Name:** Notification types
- **Preconditions:** Seed notifications of each type.
- **Steps:**
  1. Open notification dropdown.
  2. Verify NEW_APPLICATION, APPLICATION_ACCEPTED, WORK_SUBMITTED, PAYMENT_RELEASED, and NEW_MESSAGE messages.
- **Expected Result:** Each notification type has readable user-facing copy.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

## Security And Routing

### SEC-001
- **Test Name:** Artist route protection
- **Preconditions:** User is signed out.
- **Steps:**
  1. Open `/artist/home`.
- **Expected Result:** User redirects to `/login?next=/artist/home`.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### SEC-002
- **Test Name:** Business route protection
- **Preconditions:** User is signed out.
- **Steps:**
  1. Open `/business/home`.
- **Expected Result:** User redirects to `/login?next=/business/home`.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### SEC-003
- **Test Name:** Shared route protection
- **Preconditions:** User is signed out.
- **Steps:**
  1. Open `/shared/tracker/[gigId]`.
- **Expected Result:** User redirects to login with next parameter.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### SEC-004
- **Test Name:** Service role isolation
- **Preconditions:** Codebase is available locally.
- **Steps:**
  1. Search client components for `SUPABASE_SERVICE_ROLE_KEY`.
  2. Search browser bundles for service role references.
- **Expected Result:** Service role appears only in server-only helpers or env docs.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

## Accessibility

### A11Y-001
- **Test Name:** Keyboard navigation
- **Preconditions:** App is running.
- **Steps:**
  1. Use Tab and Shift+Tab through landing, auth, artist, business, and shared screens.
  2. Activate controls with Enter or Space.
- **Expected Result:** Focus is visible and all interactive controls are reachable.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### A11Y-002
- **Test Name:** Accessible names
- **Preconditions:** Browser accessibility inspector is available.
- **Steps:**
  1. Inspect buttons, links, inputs, selects, and textareas.
- **Expected Result:** Every interactive control has visible text or an aria-label.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### A11Y-003
- **Test Name:** Image alternatives
- **Preconditions:** App is running.
- **Steps:**
  1. Inspect all image and avatar surfaces.
- **Expected Result:** Images have alt text or avatar initials where no image is loaded.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### A11Y-004
- **Test Name:** Color contrast
- **Preconditions:** Use a WCAG contrast checker.
- **Steps:**
  1. Check primary, secondary, accent, success, warning, danger, and muted text combinations.
- **Expected Result:** Normal text meets WCAG AA contrast and focus states remain visible.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

## Responsive Layout

### RESP-001
- **Test Name:** Mobile viewport
- **Preconditions:** Browser dev tools are available.
- **Steps:**
  1. Set viewport to 390 x 844.
  2. Visit all primary routes.
- **Expected Result:** Text, cards, nav, dialogs, and maps fit without horizontal scrolling.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### RESP-002
- **Test Name:** Tablet viewport
- **Preconditions:** Browser dev tools are available.
- **Steps:**
  1. Set viewport to 768 x 1024.
  2. Visit auth, artist, business, shared, and landing screens.
- **Expected Result:** Layout uses available width without overlapping content.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### RESP-003
- **Test Name:** Desktop viewport
- **Preconditions:** Browser dev tools are available.
- **Steps:**
  1. Set viewport to 1440 x 900.
  2. Visit all dashboard and detail screens.
- **Expected Result:** Content remains centered and readable with no excessive stretching.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

## Regression Checks

### REG-001
- **Test Name:** Loading and error states
- **Preconditions:** Use network throttling or disable Supabase briefly.
- **Steps:**
  1. Open async screens while throttled.
  2. Trigger failed saves.
- **Expected Result:** Loading skeletons appear and errors are friendly.
- **Pass/Fail:** - [ ] Pass - [ ] Fail

### REG-002
- **Test Name:** Double submission prevention
- **Preconditions:** Use forms that submit data.
- **Steps:**
  1. Submit register, login, onboarding, post gig, apply, invite, review, and rating forms.
  2. Try clicking submit repeatedly while pending.
- **Expected Result:** Submit buttons disable during pending work and only one request is sent.
- **Pass/Fail:** - [ ] Pass - [ ] Fail
