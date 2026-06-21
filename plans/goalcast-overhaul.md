# GoalCast Professional Overhaul — Implementation Plan

## Component 1: Instant Channel Updates (Admin → Main Site)
**Problem:** When you edit a channel URL in admin, the main site may serve stale data because `getAllCountries()` in `search.ts` reads from MongoDB on every call but Next.js server-side rendering can cache the result.

**Fix:**
- Ensure `force-dynamic` on all watch/channel pages and disable any Next.js data cache for `getAllCountries`.
- **Modify** `search.ts`:
  - Add `mongoose.connection.readyState` check before querying to ensure fresh connection.
  - The Fuse.js in-memory cache is already disabled (by user's own edit).
- **Verify** `page.tsx` (watch channel) already has `export const dynamic = 'force-dynamic'` — confirm no ISR/revalidation is overriding this.

## Component 2: Delete Non-Sports/FIFA Channels from Database
**Problem:** User wants only "Sports" and "FIFA 2026" category channels. All other categories must be removed from MongoDB.

**Solution:**
- **NEW** `cleanup_channels.ts` (one-time Node.js script):
  - Connects to MongoDB using the same `MONGODB_URI` from `.env.local`.
  - Reads the channels store document.
  - For each country, filters channels keeping only those with category matching `Sports` or `FIFA 2026` (case-insensitive).
  - Removes countries with zero remaining channels.
  - Saves back to MongoDB.
  - Prints a summary of how many channels were removed vs kept.
- **MODIFY** `page.tsx` (admin channels):
  - Update `CATEGORIES` constant to only `['FIFA 2026', 'Sports']` so the admin dropdown no longer shows other options.

## Component 3: Live Match Ticker Redesign (ESPN Live Data)
**Problem:** Ticker currently works but user wants:
- Show only today's matches (not yesterday's)
- Live matches show real-time scores
- Finished matches disappear at end of day
- Upcoming matches show kickoff time
- Works on both mobile and web

**Changes:**
- **MODIFY** `route.ts` (ticker API):
  - Add date filtering: only return matches where `event.date` is today (UTC).
  - Filter out `status === 'post'` (finished) matches that ended more than 2 hours ago to keep ticker fresh.
  - Sort: live matches first, then upcoming by kickoff time.
  - Include team names in the response for display.
- **MODIFY** `ScoresTicker.tsx`:
  - Make ticker taller on mobile for readability (`48px → 52px`).
  - Show team names alongside flags: `"ARG 2 - 1 BRA"` format.
  - Add `"LIVE"`, `"FT"` (full time), and `"HT"` (half time) badges.
  - Improve mobile scroll behavior — ensure touch-scrollable when paused.

## Component 4: Mobile Bottom Nav — Replace "Discover" with "Scores"
**Problem:** "Discover" doesn't work well on mobile. User wants live match data instead.

**Changes:**
- **NEW** `page.tsx` (scores):
  - New `/scores` page showing all of today's matches in a card grid layout.
  - Each match card shows: teams, flags, scores (if live/finished), kickoff time (if upcoming), venue.
  - Auto-refreshes every 30 seconds.
  - Responsive: stacked cards on mobile, grid on desktop.
- **MODIFY** `MobileBottomNav.tsx`:
  - Change `NAV_ITEMS[1]` from `{ label: 'Discover', href: '/country', icon: Search }` to `{ label: 'Scores', href: '/scores', icon: Trophy }`.

## Component 5: Responsive Video Player (Mobile + Web)
**Problem:** Player needs to be more responsive on mobile — aspect ratio, controls, and layout.

**Changes:**
- **MODIFY** `WatchPageClient.tsx`:
  - Mobile layout: On screens `< lg`, stack everything vertically: player → servers → channels list.
  - Player aspect ratio: Use `aspect-video` (16:9) on desktop, but on very small screens use a slightly taller ratio via CSS `max-height: 56vw` to prevent the player from being too small.
  - Fullscreen: Add a fullscreen toggle button overlay.
  - Touch-friendly controls: Increase tap target sizes on mobile.
  - Channel list on mobile: Make it a horizontal scrollable row instead of vertical list.

## Component 6: Auto-Retry on Offline (3-second auto-refresh)
**Problem:** When a channel goes offline and the user sees the error screen, they must manually click "Try Again." User wants automatic retry after 3 seconds.

**Changes:**
- **MODIFY** `WatchPageClient.tsx`:
  - Add a `useEffect` that watches the error state.
  - When error becomes non-null, start a 3-second countdown timer.
  - After 3 seconds, auto-increment `retryCount` to trigger a re-connection attempt.
  - Show a countdown in the error overlay: "Auto-retrying in 3s… 2s… 1s…"
  - Cap auto-retries at 3 attempts to avoid infinite loops on truly dead streams.
  - After 3 failed auto-retries, show the manual "Try Again" and "Switch Channel" buttons.

## Component 7: Professional Polish
**Changes:**
- **MODIFY** `globals.css`:
  - Ensure smooth video player transitions.
  - Add responsive breakpoints for the player container.
- **MODIFY** `layout.tsx`:
  - Verify favicon is working (already fixed — confirm).

## Verification Plan
### Automated Tests
```bash
npx tsc --noEmit
```
TypeScript compilation must pass with zero errors.

### Manual Verification
- **Admin channel edit → instant reflection:**
  Edit a channel URL in admin → visit the channel on the main site → confirm new URL loads immediately.
- **Category cleanup:**
  After running the cleanup script, verify only Sports and FIFA 2026 channels remain.
- **Ticker:**
  Verify live scores show real data from ESPN.
  Verify finished games from yesterday don't appear.
- **Mobile bottom nav:**
  Verify "Scores" tab appears and navigates to `/scores` page.
- **Auto-retry:**
  Set a channel to an invalid URL → watch the error screen → confirm it auto-retries 3 times with countdown, then shows manual buttons.
- **Responsive player:**
  Test on mobile viewport (375px) and desktop (1440px) — player should fill width appropriately.
- **Push to GitHub:**
  ```bash
  git add . && git commit && git push
  ```

## Mermaid Diagram (High-Level Flow)
```mermaid
flowchart TD
    A[Admin edits channel] --> B[Instant DB fetch (search.ts)]
    C[Run cleanup_channels.ts] --> D[DB now only Sports/FIFA]
    E[GET /api/admin/ticker] --> F[Filter today’s matches]
    F --> G[ScoresTicker renders live ticker]
    H[Mobile Nav Scores button] --> I[/scores page shows match cards]
    J[Watch page loads] --> K[Responsive VideoPlayer layout]
    K --> L[Error state?]
    L -->|yes| M[Auto‑retry (3 s, max 3)]
    L -->|no| N[Normal playback]
    O[Polish CSS & layout] --> P[Final commit & push]
    B & D & G & I & N & P --> Q[GoalCast Professional Overhaul complete]