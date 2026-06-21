# KOLLAB — Codex Agent Instructions
# Two-sided gig marketplace: Artists ↔ Local Businesses

## PROJECT OVERVIEW
App: KOLLAB — a mobile-responsive web app connecting emerging digital
artists (reels editors, photographers, designers) with local SMBs
(cafés, boutiques, hotels) in Mumbai/Thane, India for short-term gigs.

## TECH STACK (never deviate from this)
- Framework:    Next.js 14 App Router, TypeScript strict mode
- Styling:      Tailwind CSS + shadcn/ui component library
- Database:     Supabase (PostgreSQL) — connection via @supabase/ssr
- Auth:         Supabase Auth (email/password + OAuth Google)
- Storage:      Supabase Storage (portfolio uploads, gig attachments)
- Realtime:     Supabase Realtime (in-app chat, escrow state updates)
- Maps:         Leaflet.js + react-leaflet + OpenStreetMap (free tiles)
- Icons:        lucide-react
- Forms:        react-hook-form + zod validation
- State:        React Context + useReducer (no Redux)
- Hosting:      Cloudflare Pages (output: next export or edge runtime)

## FILE STRUCTURE CONVENTIONS
src/
  app/                    # Next.js App Router pages
    (auth)/               # Auth route group (login, register, reset)
    (artist)/             # Artist-only pages
    (business)/           # Business-only pages
    (shared)/             # Pages both roles see (chat, profile, tracker)
    api/                  # API route handlers
  components/
    ui/                   # shadcn/ui primitives
    kollab/               # Custom KOLLAB components
  lib/
    supabase/             # Supabase client + server helpers
    utils/                # Shared utilities
  types/                  # TypeScript interfaces and enums

## USER ROLES
Two roles: ARTIST and BUSINESS. Role stored in profiles.role column.
Middleware in middleware.ts enforces role-based access:
- /artist/* routes → ARTIST only
- /business/* routes → BUSINESS only
- /shared/* routes → both roles (authenticated)

## CODING STANDARDS
- Always use TypeScript, never `any` type — use `unknown` if needed
- Use Server Components by default; add 'use client' only when needed
- All Supabase queries go through lib/supabase/ helper functions
- All user inputs validated with Zod before any DB operation
- Use named exports only (no default exports except page components)
- CSS: Tailwind utilities only — no inline styles, no CSS modules
- Error handling: every async function wrapped in try/catch
- Accessibility: all interactive elements must have aria-labels

## TESTING RULES (MANDATORY)
After every code change, Codex must:
1. Run: npm run type-check        (TypeScript strict check)
2. Run: npm run lint               (ESLint + Prettier)
3. Run: npm run build              (catch build errors early)
4. Describe what manual smoke test to run for the changed feature

## ENVIRONMENT VARIABLES REQUIRED
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-side only, never expose to client
NEXT_PUBLIC_APP_URL=             # e.g., https://kollab.pages.dev

## KOLLAB BRAND COLOURS (use in Tailwind config)
primary:    #7C3AED  (purple)
secondary:  #F97316  (orange — business-side accents)
accent:     #0D9488  (teal — escrow/trust elements)
success:    #16A34A
warning:    #D97706
danger:     #DC2626

## WHAT NEVER TO DO
- Never install Prisma — use Supabase client directly
- Never use Redux — use React Context
- Never hardcode Supabase credentials — always use env vars
- Never skip Zod validation on form inputs
- Never create /pages/ directory — App Router only
- Never expose SUPABASE_SERVICE_ROLE_KEY to client components
