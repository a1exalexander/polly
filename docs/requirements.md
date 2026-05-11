# Polly — Functional Requirements

**Product:** Polly — Real-Time Task Estimation and Voting Platform
**Type:** Web application (Planning Poker for agile teams)
**Status:** Living document, derived from the current codebase and UI
**Last updated:** 2026-05-07

---

## 1. Overview

Polly is a real-time, web-based planning poker tool. Authenticated users create rooms with a chosen estimation scale (days, weeks, or boolean), invite teammates by sharing the room URL, and run voting rounds on stories. Votes stay hidden until the round ends, results are revealed simultaneously, and an average is calculated automatically. The session updates live for everyone in the room through Supabase Realtime channels.

The product is free to use and only requires Google sign-in.

### 1.1 Goals

- Reduce friction in estimation sessions for distributed agile teams.
- Provide instant, real-time feedback so all participants see the same state at the same time.
- Support different estimation scales without forcing a single methodology.
- Stay lightweight: no project setup, no installation, no credit card.

### 1.2 Out of scope

- Issue tracker integration (Jira, Linear, GitHub).
- Per-story drill-down dashboards (only aggregate room-level stats are exposed; see §4.24).
- Custom estimation scales beyond days / weeks / boolean.
- Multi-tenant workspaces or organization accounts.
- Native mobile apps (the web UI is responsive but not packaged).

---

## 2. Glossary

| Term | Meaning |
|---|---|
| **Room** | A persistent estimation space owned by one user. Has a title and a fixed estimation scale (`type`). |
| **Owner / Host** | The user who created the room. Has full control: members, admins, story flow. The "host" terminology in code is interchangeable with "owner". |
| **Admin** | A member promoted by the owner. Can manage the session (start/stop/next story, remove non-owner members) but cannot promote other admins. |
| **Member** | Any signed-in user who has joined a room. Votes on the active story. |
| **Observer / Spectator** | A member who has switched to non-voting mode (`active = false`). Counted in the room but excluded from progress and average calculations. |
| **Story** | A single estimation round. Has lifecycle states: idle → active → finished. |
| **Vote / Estimate** | A numeric value chosen by an active member from the room's scale. |
| **Scale (`type`)** | The estimation scale of a room: `days`, `weeks`, or `boolean`. Cannot be changed after creation. |
| **Average** | The arithmetic mean of all numeric votes from active voters, revealed when the round finishes. |

---

## 3. User Roles & Permissions

| Capability | Visitor (unauth) | Member | Admin | Owner |
|---|:-:|:-:|:-:|:-:|
| Sign in / sign up | ✅ | — | — | — |
| Browse public marketing page (`/start`) | ✅ | ✅ | ✅ | ✅ |
| Create a room | — | ✅ | ✅ | ✅ |
| Open own rooms list | — | ✅ | ✅ | ✅ |
| Open recently-visited rooms list | — | ✅ | ✅ | ✅ |
| Join a room (any room ID via URL) | redirected to sign-in | ✅ | ✅ | ✅ |
| View room stats page | redirected to sign-in | ✅ | ✅ | ✅ |
| Vote on the active story | — | ✅ (active) | ✅ (active) | ✅ (active) |
| Toggle own active/observer mode | — | ✅ | ✅ | ✅ |
| Leave the room (remove self) | — | ✅ | ✅ | ✅ |
| Start / stop / next story | — | — | ✅ | ✅ |
| Reveal hidden votes during round | — | — | ✅ | ✅ |
| Remove another member (non-owner) | — | — | ✅ | ✅ |
| Promote member → admin | — | — | — | ✅ |
| Demote admin → member | — | — | — | ✅ |
| Sign out | — | ✅ | ✅ | ✅ |

> Notes:
> - Only signed-in users may access `/` and `/room/[id]`. Middleware redirects unauthenticated users to `/start`.
> - The owner cannot be removed by anyone, including admins. The owner can leave their own room voluntarily.
> - Admins cannot grant or revoke admin rights — only the owner can.

---

## 4. Functional Requirements

### 4.1 Authentication (FR-AUTH)

- **FR-AUTH-1** — The system shall support sign-in via **Google OAuth** as the only authentication provider.
- **FR-AUTH-2** — On successful first sign-in, a public `Users` record shall be created or updated with `user_id`, `email`, and `name` (resolved from Google profile metadata; default `"cat"` if absent).
- **FR-AUTH-3** — The system shall persist the user session via Supabase SSR cookies and refresh expired sessions transparently in middleware.
- **FR-AUTH-4** — Unauthenticated requests to protected paths (`/`, `/room`) shall be redirected to `/start`.
- **FR-AUTH-5** — The legacy path `/sign-in` shall permanently redirect (301) to `/start`.
- **FR-AUTH-6** — A `redirect_to` query parameter on `/start` shall be honored after sign-in (e.g., a deep link to a specific room).
- **FR-AUTH-7** — Signing out shall clear the Supabase session and redirect to `/start`.
- **FR-AUTH-8** — Sign-in errors shall surface to the user via an `error` query parameter on `/start`.

### 4.2 Marketing / Sign-in Page (FR-LANDING)

- **FR-LANDING-1** — `/start` shall be a public, indexable landing page describing the product.
- **FR-LANDING-2** — The page shall display: product name (Polly), tagline, three feature highlights (Team Collaboration, Flexible Estimation, Instant Results), and a single CTA "Get Started with Google".
- **FR-LANDING-3** — The page shall include a decorative animated illustration showing voting cards (3, 5, 8, ?) and "Voting in progress" hint.
- **FR-LANDING-4** — SEO metadata shall include OpenGraph and Twitter card data, plus relevant keywords (planning poker, agile, scrum, estimation, sprint planning, story points).
- **FR-LANDING-5** — The page shall display the "Free to use • No credit card required" assurance below the CTA.

### 4.3 Home / Dashboard (FR-HOME)

- **FR-HOME-1** — `/` shall be the authenticated user's home dashboard.
- **FR-HOME-2** — The dashboard shall render two areas:
  - A **Create Room** form.
  - A **Room List** with two sections: "Recently Visited" and "My Rooms".
- **FR-HOME-3** — When the user has no recently-visited rooms, the section shall be hidden entirely.
- **FR-HOME-4** — When the user owns no rooms, "My Rooms" shall display the empty-state message **"No rooms yet"**.
- **FR-HOME-5** — A persistent **Sign Out** button shall be available in the page footer.

### 4.4 Room Creation (FR-ROOM-CREATE)

- **FR-ROOM-CREATE-1** — A signed-in user shall be able to create a room from the home page.
- **FR-ROOM-CREATE-2** — A new room requires:
  - **Title** — required, 2–400 characters.
  - **Values type** — required, one of `days`, `weeks`, `boolean`.
- **FR-ROOM-CREATE-3** — Selecting a values type shall preview the resulting card list inline (truncated with `…` if more than 10 values; for boolean: "No" and "Yes").
- **FR-ROOM-CREATE-4** — On submit, the system shall persist the room (with the current user as owner) and redirect the creator to `/room/{newRoomId}`.
- **FR-ROOM-CREATE-5** — Validation failures (missing title, missing type) shall redirect back to `/` with a localized error message in the `error` query parameter.
- **FR-ROOM-CREATE-6** — Each successful submit shall fire a PostHog `create_room` event including the form payload.

### 4.5 Room Listing (FR-ROOM-LIST)

- **FR-ROOM-LIST-1** — "My Rooms" shall list every room owned by the current user.
- **FR-ROOM-LIST-2** — "Recently Visited" shall list up to **5** rooms ordered by `last_visited_at` descending (most recent first).
- **FR-ROOM-LIST-3** — Each room card shall display:
  - Room title.
  - Estimation type tag (color-coded: days = info, weeks = warning, boolean = danger).
  - Total members count and online (active) members count with icons.
  - For recently-visited rooms only, a relative "Visited X ago" label (powered by `date-fns`).
- **FR-ROOM-LIST-4** — Clicking a room card shall navigate to `/room/{id}`.
- **FR-ROOM-LIST-5** — Room and member-count changes shall update in real time without page reload (Supabase Realtime).
- **FR-ROOM-LIST-6** — While initial data loads, the list shall display a loading overlay.

### 4.6 Joining a Room (FR-ROOM-JOIN)

- **FR-ROOM-JOIN-1** — Visiting `/room/{id}` while authenticated shall add the user as a member if not already present.
- **FR-ROOM-JOIN-2** — The first time any user joins a room, a default story titled **"Story 1"** shall be created and attached to that room.
- **FR-ROOM-JOIN-3** — A new joiner who is **not** the room owner shall be added in **active (voter)** mode by default. The owner shall be added in observer mode by default to avoid biasing the round.
- **FR-ROOM-JOIN-4** — Returning users shall have their `last_visited_at` and `active` flags refreshed on every visit.
- **FR-ROOM-JOIN-5** — The `RecentlyVisitedRooms` table shall be upserted on every visit to power the recently-visited list across sessions and devices.
- **FR-ROOM-JOIN-6** — An unauthenticated user visiting `/room/{id}` shall be redirected to `/start?redirect_to=/room/{id}` so the deep link resolves after sign-in.
- **FR-ROOM-JOIN-7** — The browser tab title shall include the room title (`{Room Title} | Polly`).

### 4.7 Room Page Layout (FR-ROOM-PAGE)

- **FR-ROOM-PAGE-1** — The room page shall display:
  - A type tag in the top-right showing the room's estimation type.
  - A **Navbar** (top) with room title, current story title, controls, and timer/average.
  - A **TimeGrid** (center) — the voting cards.
  - A **MemberList** (right/bottom on small screens) — participants with vote indicators and progress bar.
  - A **Footer** with copyright, Sign Out, and Sound toggle.
- **FR-ROOM-PAGE-2** — While room data is loading, an **Animation** placeholder shall render with the message "Room is loading...".
- **FR-ROOM-PAGE-3** — Boolean rooms shall use a column layout instead of the default grid.
- **FR-ROOM-PAGE-4** — When a story is finished, the page background shall reflect the finished state (visual cue).
- **FR-ROOM-PAGE-5** — If the current user is removed by the owner/admin, the page shall automatically redirect to `/`.

### 4.8 Story Lifecycle (FR-STORY)

A story has three states, derived from `started_at` and `finished_at`:

| State | Condition |
|---|---|
| `IDLE` | `started_at` is null |
| `ACTIVE` | `started_at` set, `finished_at` null |
| `FINISHED` | both set |

- **FR-STORY-1** — Owner/admin shall be able to start the active story (`Start Story`). This sets `started_at = now()`.
- **FR-STORY-2** — Owner/admin shall be able to finish the active story (`Finish Story`). This sets `finished_at = now()` and reveals all votes.
- **FR-STORY-3** — Owner/admin shall be able to advance to the next story (`Next Story`) from `IDLE` or `FINISHED` states. A new story is created with title `"Story N"` where N is the next sequential index.
- **FR-STORY-4** — On Start, a button labeled "Start story" shall also be visible inside the time grid for owners/admins as a convenience CTA.
- **FR-STORY-5** — Each story shall support **automatic completion**: when every active member has cast a vote, the system shall finish the story automatically (see FR-STORY-AUTO).
- **FR-STORY-6** — A live elapsed-time counter (`mm:ss`) shall be shown in the navbar while the story is `ACTIVE`. When `FINISHED`, it is replaced by the average.

#### Auto-completion (FR-STORY-AUTO)

- **FR-STORY-AUTO-1** — The system shall expose `POST /api/stories/auto-complete` accepting `{ storyId, roomId }` (positive integers).
- **FR-STORY-AUTO-2** — The endpoint shall verify: story exists, story is `ACTIVE`, room has at least one active user, every active user has a numeric vote.
- **FR-STORY-AUTO-3** — When all conditions hold, the endpoint shall atomically set `finished_at = now()` only if it is currently null, preventing double-completion under race conditions.
- **FR-STORY-AUTO-4** — The endpoint shall return `{ autoCompleted: boolean, reason?: string }` where `reason` is one of: `already_finished`, `not_started`, `not_enough_active_users`, `not_all_voted`.
- **FR-STORY-AUTO-5** — The client shall trigger an auto-complete check after: vote selection, user removal, user-becomes-inactive, user-exit.
- **FR-STORY-AUTO-6** — Each auto-completion event shall be reported to PostHog with the trigger reason (`vote`, `user_removed`, `user_became_inactive`, `user_exit`).

### 4.9 Voting (FR-VOTE)

#### Estimation scales

| Type | Values | Sub-values | Display |
|---|---|---|---|
| `days` | 0, 1, 2, …, 11 | quarters: `.25`, `.5`, `.75` per integer | Numeric |
| `weeks` | 1, 1.5, 2, 2.5, …, 12 | none | Numeric |
| `boolean` | 0, 1 | none | "No" / "Yes" |

- **FR-VOTE-1** — The TimeGrid shall render one card per allowed value. For `days`, each integer card shall expose three sub-buttons for the quarter increments.
- **FR-VOTE-2** — Voting shall be enabled only when:
  - the story is `ACTIVE` (`started_at` set, `finished_at` null), AND
  - the current user is `active` (voter, not observer).
- **FR-VOTE-3** — When voting is disabled, the user shall see a primary CTA:
  - **Start story** if owner/admin and the story is `IDLE`.
  - **Participate** if currently in observer mode.
- **FR-VOTE-4** — Selecting a card shall persist the value in `UsersOnStories` (upsert by `story_id` + `public_user_id`).
- **FR-VOTE-5** — A user may change their vote any number of times while the story is `ACTIVE`.
- **FR-VOTE-6** — The currently selected card shall be visually distinguished from the others.
- **FR-VOTE-7** — When a story is finished, every card except the user's own selected card shall be visually de-emphasized.
- **FR-VOTE-8** — Each vote selection shall be reported to PostHog as `story_time_selected` with the user payload.

### 4.10 Vote Visibility (FR-REVEAL)

- **FR-REVEAL-1** — While a story is `ACTIVE`, every member's vote shall be hidden from other users by default.
- **FR-REVEAL-2** — Members who have voted shall be marked with a check-badge icon (without exposing the value).
- **FR-REVEAL-3** — Owner/admin shall be able to toggle a "peek" eye-icon button on the member list that reveals all current votes only for them, while a blurred overlay protects others' screens.
- **FR-REVEAL-4** — When the story is `FINISHED`, all votes shall be visible to everyone.
- **FR-REVEAL-5** — For `boolean` rooms, the result section shall display `Yes: X | No: Y` instead of an arithmetic average.
- **FR-REVEAL-6** — For `days` and `weeks` rooms, the average shall display rounded to two decimal places, computed only over active voters with numeric votes.

### 4.11 Member List & Member Cards (FR-MEMBER)

- **FR-MEMBER-1** — The member list shall render every user currently in the room (`UsersOnRooms` rows).
- **FR-MEMBER-2** — Members shall be sorted with the following precedence:
  1. Owners, admins, and active voters first.
  2. Within the same group, alphabetically by display name (case-insensitive, locale-aware).
- **FR-MEMBER-3** — Each member card shall show:
  - Display name.
  - **Star icon** with tooltip "Room owner" if the member is the owner.
  - **Shield icon** with tooltip "Admin — can manage the session" if the member is an admin (and not the owner).
  - Vote slot (value, check-badge, or empty).
- **FR-MEMBER-4** — A 3-dot context menu shall be visible on a member card when:
  - The viewer is the owner or an admin (manage others), OR
  - The card is the viewer's own card (leave the room).
- **FR-MEMBER-5** — Menu items by viewer role:
  | Viewer | Target | Items |
  |---|---|---|
  | Owner | Self | Leave room |
  | Owner | Other non-owner | Make/Revoke admin · Remove |
  | Admin | Self | Leave room |
  | Admin | Other non-owner non-admin | Remove |
  | Admin | Owner | (no menu) |
  | Member | Self | Leave room |
  | Member | Other | (no menu) |
- **FR-MEMBER-6** — All destructive menu actions shall require confirmation through a modal (focus-trapped, Esc-dismissable, with "Cancel" + "Remove"/"Leave room").
- **FR-MEMBER-7** — Leaving the room shall remove the row from `UsersOnRooms` and navigate to `/`.
- **FR-MEMBER-8** — The owner cannot be removed via the UI; the menu does not offer the action.
- **FR-MEMBER-9** — Inactive members shall render in a de-emphasized state and be excluded from the progress bar and average.
- **FR-MEMBER-10** — User-management actions (`room_user_removed`, `room_user_admin_toggled`, `room_user_activity_changed`) shall be reported to PostHog.

### 4.12 Voting Progress (FR-PROGRESS)

- **FR-PROGRESS-1** — A horizontal progress bar at the top of the member list shall reflect the proportion of active members who have voted.
- **FR-PROGRESS-2** — While `ACTIVE`, the bar label shall show `{voted}/{total active}`.
- **FR-PROGRESS-3** — When `FINISHED`:
  - Days/Weeks: label shows `Average: {value}`.
  - Boolean: label shows `Yes: X | No: Y`.

### 4.13 Observer / Voter Toggle (FR-ACTIVITY)

- **FR-ACTIVITY-1** — Every member shall be able to toggle their participation between **voter** (`active = true`) and **observer** (`active = false`).
- **FR-ACTIVITY-2** — The toggle shall live in the navbar:
  - Label/icon when active: "Just watch" / coffee icon.
  - Label/icon when observer: "Participate" / vote icon.
- **FR-ACTIVITY-3** — A tooltip shall describe the next state ("Switch to observer mode" / "Switch to voting mode").
- **FR-ACTIVITY-4** — Switching to observer mode shall trigger an auto-complete check (the user no longer blocks the round).
- **FR-ACTIVITY-5** — Observers shall not appear in the progress bar or contribute to the average.

### 4.14 Real-time Synchronization (FR-RT)

The application uses Supabase Realtime channels to keep clients in sync.

- **FR-RT-1** — All clients in a room shall receive updates for:
  - Room metadata changes (`Rooms`).
  - Story creation/update (`Stories`, `StoriesOnRooms`).
  - Vote creation/update (`UsersOnStories` filtered by `story_id`).
  - Member join/leave/update (`UsersOnRooms` filtered by `room_id`).
  - User profile updates (`Users`).
- **FR-RT-2** — The dashboard shall receive room-list and member-presence updates via a separate channel scoped to the current user's owned rooms.
- **FR-RT-3** — When the browser tab becomes visible again (`visibilitychange` → `visible`), the room page shall re-fetch room/users/story/usersOnStory to recover from missed events while backgrounded.
- **FR-RT-4** — Channels shall be cleaned up on unmount to prevent leaks.

### 4.15 Recently Visited Rooms (FR-RECENT)

- **FR-RECENT-1** — A `RecentlyVisitedRooms` row shall be upserted (`onConflict: public_user_id, room_id`) on every room visit, both server-side (in `joinRoomAction`) and client-side (after the room page mounts).
- **FR-RECENT-2** — The "Recently Visited" section shall list up to 5 rooms ordered by `last_visited_at` desc.
- **FR-RECENT-3** — Visit history shall persist across sign-out and across devices, since it is stored on the server.
- **FR-RECENT-4** — Visit cards shall display the relative time since last visit (e.g., "Visited 2 hours ago").

### 4.16 Theming (FR-THEME)

- **FR-THEME-1** — The application shall support a **light** and a **dark** theme.
- **FR-THEME-2** — A circular theme toggle (sun/moon icon) shall be visible in a fixed corner on every page.
- **FR-THEME-3** — The selected theme shall be persisted in a cookie named `polly-theme` (1-year expiry, `SameSite=Lax`, `path=/`).
- **FR-THEME-4** — On request, the cookie shall be read server-side and applied to `<html data-theme=...>` to prevent FOUC on first paint.
- **FR-THEME-5** — The default theme for first-time visitors shall be **light**.

### 4.17 Audio Feedback (FR-SOUND)

- **FR-SOUND-1** — When a story transitions from `ACTIVE` to `FINISHED`, a success sound (`/success.wav`) shall play once for the user.
- **FR-SOUND-2** — A toggle in the footer shall enable/disable the sound. Preference shall be stored in `localStorage` under `sound-state` (default: enabled).
- **FR-SOUND-3** — The toggle icon shall reflect the current state: music-note (on) / muted (off).

### 4.18 Favicon Status Indicator (FR-FAVICON)

- **FR-FAVICON-1** — The browser favicon shall change based on the current story status:
  - `IDLE` → `/favicon.png`
  - `ACTIVE` → `/favicon-2.png`
  - `FINISHED` → `/favicon-3.png`
- **FR-FAVICON-2** — The favicon shall update without page reload as story status changes.

### 4.19 Updates / Changelog (FR-UPDATES)

- **FR-UPDATES-1** — The product shall expose a public, indexable changelog at `/updates`.
- **FR-UPDATES-2** — Posts shall be authored as MDX files in `src/content/updates/*.mdx` with frontmatter: `title`, `date`, `description`, `slug`.
- **FR-UPDATES-3** — The index page shall list all posts sorted by `date` descending (most recent first), each as a clickable card showing date, title, and description.
- **FR-UPDATES-4** — When no posts exist, the index shall show **"No updates yet. Check back soon!"**.
- **FR-UPDATES-5** — Each post shall be reachable at `/updates/{slug}` and rendered as MDX with GFM (tables, autolinks, strikethrough). Static params shall be generated at build time.
- **FR-UPDATES-6** — A non-existent slug shall return Next.js `notFound()` (404).
- **FR-UPDATES-7** — Each post page shall include a "All Updates" back link, formatted publish date, and post title.

### 4.20 Analytics & Error Tracking (FR-ANALYTICS)

- **FR-ANALYTICS-1** — The system shall integrate **PostHog** for product analytics. Page views shall be auto-captured; the user shall be identified by Supabase `user.id` with `email` and `name`.
- **FR-ANALYTICS-2** — Custom events shall be fired for: `create_room`, `room_joined`, `room_exit`, `room_user_removed`, `room_user_admin_toggled`, `room_user_activity_changed`, `story_started`, `story_stopped`, `story_next`, `story_time_selected`, `story_auto_complete_check`, `story_auto_completed`.
- **FR-ANALYTICS-3** — The system shall integrate **Sentry** (browser, server, edge) for error tracking. The signed-in user (id, email, username) shall be attached to error reports.
- **FR-ANALYTICS-4** — A diagnostic route `/sentry-example-page` shall be available for verifying Sentry setup.
- **FR-ANALYTICS-5** — On sign-out, the Sentry user context shall be cleared.

### 4.21 Error Handling (FR-ERROR)

- **FR-ERROR-1** — A global error boundary (`src/app/global-error.tsx`) shall catch unhandled rendering errors and display a fallback UI.
- **FR-ERROR-2** — Server-action validation errors shall redirect with `?error=<message>` to the originating page.
- **FR-ERROR-3** — All Supabase failures in services shall be logged via `console.error` and degrade gracefully (e.g., return `null` or `[]`) without crashing the UI.
- **FR-ERROR-4** — The auto-complete API shall return well-formed HTTP errors (400 for invalid input, 404 for missing story, 500 for server errors) with a JSON `{ error }` body.

### 4.22 Accessibility (FR-A11Y)

- **FR-A11Y-1** — Confirmation modals shall trap focus, restore focus to the trigger on close, and be dismissable with Esc.
- **FR-A11Y-2** — Tooltips shall be rendered with `role="tooltip"` and have stable text accessible to screen readers.
- **FR-A11Y-3** — The dropdown menu shall use `role="menu"` / `role="menuitem"` with `aria-haspopup`, `aria-expanded`, and `aria-busy` for in-flight actions.
- **FR-A11Y-4** — Decorative SVGs shall carry `aria-hidden="true"`.
- **FR-A11Y-5** — Icon-only buttons shall expose an `aria-label` (e.g., the theme switch announces the next state).
- **FR-A11Y-6** — Owner and admin role badges shall be announced via `aria-label`.

### 4.23 Responsiveness (FR-RESPONSIVE)

- **FR-RESPONSIVE-1** — The app shall remain usable on common desktop, tablet, and mobile viewports.
- **FR-RESPONSIVE-2** — The boolean room shall switch from a horizontal grid to a column layout where appropriate.
- **FR-RESPONSIVE-3** — Modals and dropdowns shall reposition on viewport scroll/resize to stay within the visible area.

### 4.24 Room Statistics (FR-STATS)

A per-room statistics view surfaces three layers of analytics across the room's lifetime:
1. **Aggregate** — totals and rates across finished stories.
2. **Team consensus** — how often and how closely the team agrees.
3. **Per-member accuracy** — how each member's votes compare to the team's average, including bias and consensus rate.

To support fast queries over long time ranges and to enable accuracy analytics that compare each member's vote against the team's consensus, the system shall persist a denormalized snapshot per finished story (`StoryStats`) and shall retain raw votes (`UsersOnStories`) indefinitely.

#### Access

- **FR-STATS-1** — Each room shall expose a stats view at `/room/{id}/stats`.
- **FR-STATS-2** — Access shall follow the same auth rules as the room page: signed-in users only. Unauthenticated visits shall redirect to `/start?redirect_to=/room/{id}/stats`.
- **FR-STATS-3** — The stats page shall be visible to every member of the room (owner, admin, voter, observer). Visiting the URL shall add the user as a member if not already present (consistent with FR-ROOM-JOIN-1).
- **FR-STATS-4** — A **"Stats"** entry point shall be reachable from the room navbar. The stats page shall reciprocally provide a **"Back to room"** link to `/room/{id}`.

#### Time-range filter

- **FR-STATS-5** — The page shall offer three mutually-exclusive time-range filters:
  - **All time** (default)
  - **Last 30 days**
  - **Last 7 days**
- **FR-STATS-6** — The selected range shall filter rows by `StoryStats.finished_at`. Unstarted (`IDLE`) and in-progress (`ACTIVE`) stories are always excluded.
- **FR-STATS-7** — The current selection shall be reflected in the URL via a `?range=all|month|week` query parameter so a chosen view is shareable. Invalid or missing values shall fall back to `all`.

#### Persistence model

- **FR-STATS-8** — A new `StoryStats` table shall hold one row per finished story with the following columns:
  - `story_id` (FK → `Stories`, unique), `room_id` (FK → `Rooms`),
  - `room_type` (`days` | `weeks` | `boolean`, denormalized for fast filtering),
  - `started_at`, `finished_at`, `duration_seconds`,
  - `active_voter_count`, `vote_count`,
  - `average_value` (numeric, null when no numeric votes),
  - `mode_value`, `min_value`, `max_value`, `stddev_value` (population standard deviation),
  - `unanimous` (boolean — true when all numeric votes were equal),
  - `yes_count`, `no_count` (boolean rooms only; null otherwise).
- **FR-STATS-9** — A `StoryStats` row shall be written when a story transitions from `ACTIVE` → `FINISHED`, in the same transaction as the `finished_at` update — both on the manual `Finish Story` action (FR-STORY-2) and on the auto-complete endpoint (FR-STORY-AUTO-3). The write shall be guarded so the row is created exactly once per story even under concurrent finish attempts.
- **FR-STATS-10** — Raw per-vote rows in `UsersOnStories` shall be retained indefinitely for the lifetime of the room, since per-member accuracy metrics depend on individual vote values. Existing flows shall not delete `UsersOnStories` rows when stories transition state.
- **FR-STATS-11** — A backfill migration shall populate `StoryStats` for all existing finished stories at deployment time, computed from `Stories` and `UsersOnStories`.
- **FR-STATS-12** — Foreign keys shall cascade so that deleting a `Story` removes its `StoryStats` and `UsersOnStories` rows, and deleting a `Room` removes all dependent stats rows.
- **FR-STATS-13** — `StoryStats` is a denormalized cache; on detected drift, the system shall be able to recompute a row from `UsersOnStories` on demand (e.g., via an admin endpoint) without affecting room behavior.

#### Metrics — per-room aggregate

- **FR-STATS-14** — For `days` and `weeks` rooms, the page shall display these aggregate cards over the filtered story set:
  - **Stories completed** — `count(StoryStats)` in range.
  - **Total estimation time** — `sum(duration_seconds)`, formatted `Hh Mm` (e.g., `2h 14m`).
  - **Average time per story** — `total / stories completed`, formatted `mm:ss` (under 1 h) or `Hh Mm`.
  - **Average final estimate** — `mean(average_value)` across in-range rows.
  - **Most common estimate** — mode of `mode_value`; ties broken by the higher value.
  - **Total votes cast** — `sum(vote_count)`.
  - **Unique participants** — distinct users in `UsersOnStories` joined to in-range stories.
- **FR-STATS-15** — A **vote distribution chart** shall render one horizontal bar per allowed scale value showing how many votes that value received in range. Days sub-values (`.25`, `.5`, `.75`) shall each get their own bar.
- **FR-STATS-16** — For **boolean** rooms, the "Average final estimate" and "Most common estimate" cards shall be replaced by a **Yes / No tally** card (counts and percentages from summed `yes_count` / `no_count`, consistent with FR-REVEAL-5). The distribution chart shall show two bars: **Yes** and **No**.

#### Metrics — team consensus

- **FR-STATS-17** — A **Team Consensus** card shall display, over the filtered story set:
  - **Unanimous round rate** — `count(unanimous = true) / stories completed`, as a percentage.
  - **Average vote spread** — `mean(stddev_value)` across in-range rows, two decimals. Lower = more agreement. *(Hidden for boolean rooms.)*
  - **Average vote range** — `mean(max_value − min_value)`, two decimals. *(Hidden for boolean rooms.)*
- **FR-STATS-18** — A **Velocity** card shall display stories completed per active week in range — `stories completed / count(distinct ISO-week containing ≥1 finished story)`.

#### Metrics — per-member accuracy

For each member in `UsersOnRooms`, the system shall compute per-member metrics by joining their `UsersOnStories` rows against `StoryStats` for in-range, in-room stories.

- **FR-STATS-19** — A sortable **Member Accuracy** table shall display one row per member with these columns (for `days` / `weeks` rooms):
  - **Member** — display name with owner/admin badge.
  - **Votes cast** — count of in-range stories the member voted on.
  - **Average vote** — mean of the member's vote values, two decimals.
  - **Deviation from team** — `mean(|user_vote − story.average_value|)`, two decimals. Lower = closer to team consensus.
  - **Bias** — `mean(user_vote − story.average_value)`, two decimals. Positive = tends to over-estimate; negative = tends to under-estimate.
  - **Consensus rate** — `count(stories where |user_vote − story.average_value| ≤ tolerance) / votes cast`, as a percentage. **Tolerance**: `0.5` for weeks rooms, `0.25` for days rooms (one sub-step of the scale).
  - **Most common vote** — modal vote for this member in range; ties broken by higher value.
- **FR-STATS-20** — The Member Accuracy table shall be sortable by any column and shall default-sort by **Votes cast** descending so prolific contributors surface first.
- **FR-STATS-21** — Members with zero in-range votes shall still appear with `—` placeholders, and shall sort to the bottom regardless of column.
- **FR-STATS-22** — For **boolean** rooms the table shall replace numeric accuracy columns with a single **Agreement rate** column: `count(stories where user_vote == majority) / votes cast`, where majority is whichever of yes/no had more votes for that story (ties → not counted as agreement).
- **FR-STATS-23** — Each member row shall be expandable to reveal that member's **personal vote distribution** (same chart as the team distribution but filtered to that member's votes in range).

#### Edge cases

- **FR-STATS-24** — All numeric averages and deviations shall be rounded to **two decimal places** (consistent with FR-REVEAL-6).
- **FR-STATS-25** — A finished story with zero numeric votes (everyone was an observer) shall create a `StoryStats` row with `vote_count = 0`, `active_voter_count = 0`, and null value fields. It counts toward "Stories completed" and "Total estimation time" but does not contribute to any vote-based metric.
- **FR-STATS-26** — When the filtered set contains no completed stories, the page shall hide all metric cards/charts/tables and display the empty-state message **"No completed stories in this range yet."**
- **FR-STATS-27** — When a story has only one numeric vote, the deviation/bias for that voter against `average_value` is `0` (the voter is the team); the row shall still be included in counts.
- **FR-STATS-28** — `stddev_value` is `0` for stories with one vote and null for stories with zero votes; both cases are excluded from the team-spread average.

#### Data freshness

- **FR-STATS-29** — Stats shall be computed on page load by querying `StoryStats` (aggregates) and joining `UsersOnStories` (per-member). No client-side recomputation of historical averages from raw votes is required.
- **FR-STATS-30** — The page shall subscribe to a Supabase Realtime channel for `StoryStats` filtered by `room_id` so newly finished stories appear without manual reload (extending FR-RT-1).
- **FR-STATS-31** — On `visibilitychange` → `visible`, the page shall re-fetch its data set (consistent with FR-RT-3).
- **FR-STATS-32** — While the initial fetch is in flight, the page shall render a loading overlay matching the dashboard pattern (FR-ROOM-LIST-6).

#### Layout

- **FR-STATS-33** — The page shall reuse the room header (room title, type tag) and the global footer (copyright, Sign Out, sound toggle, theme toggle).
- **FR-STATS-34** — Below the header, the page shall display, top-to-bottom: time-range selector → aggregate cards → team consensus + velocity cards → vote distribution chart → per-member accuracy table.
- **FR-STATS-35** — The page shall be responsive: cards collapse from a row to a single column on narrow viewports; the member accuracy table becomes horizontally scrollable.
- **FR-STATS-36** — Each metric shall include a tooltip explaining its computation (e.g., *"Mean absolute deviation of this member's votes from the team average per story"*).
- **FR-STATS-37** — The browser tab title shall be `Stats — {Room Title} | Polly`.

#### Analytics

- **FR-STATS-38** — Opening the stats page shall fire a PostHog `room_stats_viewed` event with `{ roomId, range }`.
- **FR-STATS-39** — Changing the time-range filter shall fire `room_stats_range_changed` with the new range.
- **FR-STATS-40** — Sorting the member accuracy table shall fire `room_stats_member_table_sorted` with `{ column, direction }`.
- **FR-STATS-41** — Expanding a member row shall fire `room_stats_member_expanded` with the target user id.

---

## 5. Data Model (informational)

The Postgres schema (managed via Supabase migrations) consists of:

| Table | Purpose |
|---|---|
| `Users` | Mirrors `auth.users` with public profile fields (`name`, `email`). |
| `Rooms` | Owned room with `title`, `type`, `public_user_id` (owner). |
| `UsersOnRooms` | Membership join table (`active`, `is_admin`, `last_visited_at`). |
| `Stories` | Story records with `started_at`, `finished_at`, `title`. |
| `StoriesOnRooms` | Story ↔ Room link. |
| `UsersOnStories` | Per-user vote (`value`) on a story. Retained indefinitely so per-member accuracy stats can be recomputed (FR-STATS-10). |
| `StoryStats` | Per-finished-story denormalized snapshot (duration, average, mode, stddev, min/max, unanimous flag, yes/no counts). Written in the same transaction that finishes a story; powers `/room/{id}/stats` (FR-STATS-8 – FR-STATS-13). |
| `RecentlyVisitedRooms` | Persistent visit history per user (1 row per user/room, updated on each visit). |

Foreign keys cascade deletes from `Users` and `Rooms` to dependent tables where defined.

---

## 6. Non-functional Notes

These are not full NFRs but they are baked into the current implementation and should be preserved.

- **Stack:** Next.js 15 App Router · React 18 · TypeScript · Supabase (Auth + Postgres + Realtime) · CSS Modules · `usehooks-ts` · `date-fns`.
- **Auth:** Server-side session via `@supabase/ssr`, refreshed in middleware.
- **Performance:** Initial room data fetched in parallel (`Promise.all`); auto-complete check uses parallel DB queries; the `Sound` component is dynamically imported.
- **Concurrency safety:** The auto-complete API uses an atomic conditional update (`is('finished_at', null)`) to prevent double-finish under races.
- **SEO:** `/start` and `/updates` are public and indexable; protected paths are not exposed.
- **Browser support:** Modern evergreen browsers (uses CSS variables, `requestAnimationFrame`, OAuth popups, audio element).

---

## 7. Suggested Improvements (optional)

These are minor, low-risk additions that align with the current product. They are **not implemented today** — listed here as candidates worth considering.

1. **Copy-room-link button** in the room navbar — today users must copy the URL from the address bar to invite teammates.
2. **Editable story titles** — stories are auto-named "Story N"; a quick rename inline would help when revisiting estimates after the session.
3. **Re-vote / clear votes** action for the owner so a finished story can be reopened without creating a new one.
4. **Per-room presence channel** — switch user `active` reflection to Realtime presence instead of relying solely on row updates, which would also cover ungraceful disconnects (closed laptop, lost network).
5. **Server-side rate limiting** on `/api/stories/auto-complete` — the route is currently called from multiple client paths and is a public POST endpoint.
6. **Default user avatar / initials** in member cards — currently the card shows only the name.
7. **Empty-state CTA on the home page** — when "My Rooms" is empty, scroll/highlight the Create Room form rather than just showing "No rooms yet".
8. **Confirmation on rapid Next Story clicks** — defensively debounce or disable while a request is in-flight (the loading state already handles a single click, but no protection against duplicate stories created back-to-back).
9. **History of recent stories per room** — surface previous story estimates in a collapsed panel for retrospectives.
10. **Sign-in providers beyond Google** — at least GitHub, given the developer audience.

---

## 8. Open Questions

- Should an admin be able to demote themselves, or only the owner can demote admins?
- What is the desired behavior if the owner leaves the room — transfer ownership, keep ownership, or archive the room?
- Should observer mode be persisted per-room across sessions, or reset on each visit (current behavior is "set to active on rejoin")?
- Boolean rooms currently store `0`/`1` in the average computation but display only the Yes/No tally. Should the average field be hidden in the navbar for boolean rooms? Today it shows `Average: NaN` or `Average: 0.5` style values in some flows — worth aligning with the member-list summary.
