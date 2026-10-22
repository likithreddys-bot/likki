# AI Zero to Hero

A gamified, unlock-based learning platform that takes complete beginners (data analysts with zero AI knowledge) from "What is AI?" to building their own research assistant with Claude.

- **6 topics · 31 sessions · 39 practice questions · 52 final-quiz questions**
- Pass each topic's final quiz with **70%** to unlock the next one. Practice questions never block you.
- Earn **+100 XP** per topic, keep a daily **streak**, climb ranks (**Beginner → Explorer → Builder → AI Pro**) and watch a live **leaderboard**.
- A little robot duck (Bolt) **walks the roadmap** — slowly, with a waddle — to the topic you're on, and sits down on it.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui-style components · Supabase (auth, Postgres, realtime) · `next-mdx-remote` · `lucide-react`.

Design: Figma file **"AI Zero to Hero UI"** — <https://www.figma.com/design/Pm11CaY5F8SyKck2iNdl3D>

---

## Quick start

### 1. Create a Supabase project

1. Go to <https://supabase.com> → **New project**.
2. **Project Settings → API**: copy the **Project URL** and the **anon public** key.
3. **Authentication → Providers → Email**: for local testing you can switch off *Confirm email* (otherwise new users must click the link in their inbox first). Under **Authentication → URL Configuration** add `http://localhost:3000/auth/callback` to the redirect URLs.

### 2. Add the database

In the Supabase **SQL editor**, run these two files, in order:

1. `supabase/migrations/0001_init.sql` — tables, row-level security, unlock/XP/rank/streak functions, leaderboard view, realtime.
2. `supabase/seed.sql` — the full curriculum (safe to re-run).

(With the Supabase CLI: `supabase db push` for the migration, then run the seed file.)

### 3. Configure and run

```bash
cd ai-zero-to-hero
cp .env.example .env.local        # then paste your URL + anon key
npm install
npm run dev                       # http://localhost:3000
```

`.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
```

Only the **anon** key is used. Nothing in this app needs the `service_role` key — never put it in `.env.local` or the browser.

If the two values are missing, the app shows a friendly setup page instead of crashing.

---

## How the rules are enforced

All the game rules live in Postgres (`supabase/migrations/0001_init.sql`), **not** in the UI, so they can't be bypassed from the browser:

| Rule | Where |
| --- | --- |
| Topic 1 is open to everyone; topic *n* opens when topic *n−1*'s final quiz is passed (≥ 70%) | `is_topic_unlocked()`; Row Level Security on `sessions` / `inline_quizzes` hides locked content |
| Final-quiz answers never reach the browser before submitting | `final_quizzes` has no read policy; `get_final_quiz()` strips `correct_index` and explanations |
| Grading, XP, streak | `submit_final_quiz()` grades on the server; **+100 XP only on the first pass** of each topic; best score is kept |
| Ranks: 0–99 Beginner · 100–299 Explorer · 300–499 Builder · 500+ AI Pro | `rank_for_xp()` + a trigger on `users_profile`, so rank can't drift from XP |
| Streak | `touch_streak()` — consecutive days increment, a gap resets to 1 (triggered by finishing a session or passing a quiz; uses the database's UTC date) |
| Users can't edit their own XP / streak / rank | Column-level grants: only `name` is writable |
| Leaderboard | `leaderboard` view (rank = position by XP, badge = tier). The page subscribes to **Supabase realtime** changes on `users_profile` and re-reads the view, sorted by XP descending |

## The roadmap & the duck

- `src/lib/trail.ts` — trail geometry (smooth path through the stops, measured in JS).
- `src/lib/walker.ts` — advances the duck along the trail at a fixed px/s (46 px/s ≈ a slow waddle).
- `src/components/duck/*` — sprites (walking frames swap with CSS, waddle, sit "plop", breathing) and the `useTrailWalker` hook.
- On the dashboard the duck remembers the last stop it sat on (localStorage), walks from there to your **current** topic, sits, and says "you are here!". Hover or focus an open topic and it waddles over to visit, then returns.
- On the landing page it tours the six stops forwards and backwards.
- **A duck walks across the content of every page.** `RoamingDuck` (in the root layout) picks a spot anywhere in the visible page, waddles there at a steady ~46 px/s (turning to face where it's going), sits for a few seconds, then heads somewhere else — usually across to the other side. It floats above the page on every route (landing, login, trail, topics, quizzes, results, leaderboard, setup, 404 and error screens), never blocks clicks, and under reduced motion it just sits in the bottom-right corner. The movement rules are in `src/lib/roam.ts` (unit tested).
- Respects `prefers-reduced-motion` (the duck simply appears at the right stop).

The robot images were generated with Higgsfield (pink/orange/yellow palette, background removed) and live in `public/robot/`.

## Curriculum content

Single source of truth: `src/content/topics/*.ts` (Markdown theory, practice questions, final quiz, videos).

```bash
npm run seed:generate    # regenerates supabase/seed.sql from the content files
```

The generator shuffles answer options with a fixed seed so the correct answer isn't always in the same slot.

> **Videos:** eight sessions link to videos I'm confident exist (3Blue1Brown, Andrej Karpathy, Henrik Kniberg). The rest use clearly-labelled *YouTube search* links ("Find a video · optional") because I couldn't verify specific video IDs from here. Swap them for curated videos in `src/content/topics/*.ts` and re-run the generator.

## Design tokens

Tokens come from the Figma variable collection **Tokens** and are applied as CSS variables in `src/app/globals.css` and mapped in `tailwind.config.ts`:

`paper #FBF3E7` · `paper-2 #F4E8D5` · `card #FFFDF8` · `ink #231A17` · `soft #6E5F55` · `pink #E5307F` · `pink-soft #FFD3E4` · `pink-deep #B81F5E` · `orange #F5821F` · `yellow #F7B928` · `cream #EFE3CC` · `green #3F8F5B` · radii **12px** cards / **8px** buttons · fonts **Fraunces** (headings), **Inter** (body), **Caveat** (hand-written notes) — self-hosted via `@fontsource`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` · `npm run lint` | TypeScript and ESLint |
| `npm test` | Vitest: curriculum counts, rank rules, trail geometry, walker speed, helpers |
| `npm run test:sql` | Runs the migration + seed + 77 assertions on a throw-away local Postgres (needs Postgres binaries; uses a stub of Supabase's `auth` schema) |
| `npm run seed:generate` | Rebuilds `supabase/seed.sql` |
| `node scripts/screenshots.mjs` | Screenshots the design preview screens (needs `npm run dev`) |
| `node scripts/check-duck.mjs` | Samples the duck's position over time to prove it walks, slowly, and sits |
| `node scripts/check-roaming.mjs` | Proves the duck walks across the content on every page (10 routes × desktop and phone), rests and walks again, and stands still under reduced motion |

**Design preview (development only):** `/preview/dashboard`, `/preview/session`, `/preview/quiz`, `/preview/results`, `/preview/leaderboard` render the real screens from fixture data without a database. They return 404 in production builds.

## Known limitations

- The 15:00 quiz countdown runs in the browser and auto-submits at 00:00; the server does not enforce the time limit.
- Email confirmation links need the redirect URL configured in Supabase (see step 1).
- I could not run the app against a live Supabase project from my environment. The SQL was tested on Postgres 16 with an auth stub, and the UI was exercised with fixtures; the Supabase client calls (auth, RPC, realtime) are therefore unverified end-to-end until you run through the quick start once.
