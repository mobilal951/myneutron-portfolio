# myNeutron Analytics Dashboard — Portfolio Demo

Public, read-only portfolio fork of the myNeutron analytics + admin dashboard.

**Original:** built at [BIG IMMERSIVE](https://www.bigimmersive.com) by [Muhammad Bilal](https://bilal-pf.vercel.app).
The production dashboard pulls live data from Google Analytics, Postgres, the Chrome extension stats API, and the YouTube / LinkedIn / X (Twitter) APIs — behind a NextAuth admin gate and a password-protected viewer layer.

**This fork:**
- Same UI, same routes, same state — visitors see the dashboard exactly as it works in production.
- All 27 API routes have been rewritten to return shaped synthetic data instead of touching real backends.
- Password gate is intentionally kept; a floating bubble on the password screen shows the demo password and auto-fills the form on click.
- "Sign in with Google" in the GA-connect dialog is kept for UI parity but short-circuited.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind v4 + tw-animate-css
- Recharts + Radix UI
- NextAuth (kept for UI parity; not used in the demo)
- Vercel Functions

## Sections
- Analytics: Traffic Overview, Activity Stats, Demographics, Ads Overview, User Events, Countries, Acquisition
- Users: Profile Completion, Subscriptions, Referrals
- AI Assistant: Chat Summary
- Knowledge Base: Seeds Analytics
- Integrations: Telegram Bot
- Socials: Social Overview + Facebook, Instagram, LinkedIn, Twitter/X, YouTube

## Demo password
`myNeutron_stats26` — shown in the floating bubble on the login screen.

## Running locally
```bash
npm install
npm run dev
```
No env vars required.

## Links
- Portfolio: https://bilal-pf.vercel.app
- LinkedIn: https://www.linkedin.com/in/mobilal951
