# Prompt Library

A shared, tag-searchable library of AI prompts and reference notes. No
login — anyone with the link can browse, add, and edit. Cache-first for
fast loads and read-while-offline; writes sync once you're back online.

**Status:** feature-complete for personal/small-team use — prompts (with
versioning, images, status, variables, favorites/pin), a separate Skills
section for reference notes, a dashboard, trash with recovery, light/dark
glass UI, and keyboard shortcuts. **Not yet deployed** — see "Deploying"
below when you're ready.

## Stack

- React + Vite
- Tailwind CSS v4
- Supabase (Postgres) — free tier, public read/write, no auth
- TanStack React Query — cache-first data fetching

## 1. Create the database

**New setup (no existing Supabase project for this app)?** Create a free
project at [supabase.com](https://supabase.com), open **SQL Editor**, paste
the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it.
That single file includes everything below — skip the migrations list.

**Already have this project's database from an earlier version?** Run
these in order (each is safe to skip if you're already past that point —
every migration checks what it needs and either applies cleanly or tells
you what to run first):

1. [`migration_002_images.sql`](./supabase/migration_002_images.sql) — adds
   `image_url` + the public storage bucket for preview images.
2. [`migration_003_status.sql`](./supabase/migration_003_status.sql) — adds
   the `status` column (draft/review/production/archived).
3. [`migration_004_skills.sql`](./supabase/migration_004_skills.sql) —
   creates the `skills` table.
4. [`migration_005_copy_count.sql`](./supabase/migration_005_copy_count.sql)
   — adds `copy_count` for usage tracking.

## 2. Configure the app

```bash
cp .env.example .env.local
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from
**Project Settings → API** in your Supabase dashboard.

## 3. Run locally

```bash
npm install
npm run dev
```

Open the printed local URL — you should see three green "OK" checks
confirming env vars, the `categories` table, and the `prompts` table are all
reachable.

## Data model

- **prompts** — title, content, tags[], category, `is_favorite`, `is_pinned`,
  soft `is_deleted`, `current_version`.
- **prompt_versions** — append-only history. Editing a prompt's title or
  content automatically snapshots the previous version via a DB trigger, so
  nothing is lost and old versions can be restored.
- **categories** — small named groups (color-tagged) separate from the more
  free-form `tags[]`.

Data access lives in `src/lib/prompts.js`: CRUD, favorite/pin toggles,
version history + restore, and JSON export/import (`exportPromptsAsJson` /
`importPromptsFromJson`).

## Deploying (free)

1. Push this project to a GitHub repo.
2. Import it in [Vercel](https://vercel.com) (or Netlify).
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment
   variables in the project settings.
4. Deploy — build command `npm run build`, output directory `dist`.

## Roadmap

- [x] Phase 1 — data model, Supabase wiring, project scaffold
- [x] Phase 2 — browse/add/edit/delete UI, favorites/pin, version history, export/import
- [x] Phase 3 — search, category/tag filtering, sort
- [x] Phase 4 — persisted cache, optimistic updates, loading skeletons, offline handling
- [x] Phase 5 (partial) — responsive polish. **Deploy intentionally deferred** pending testing/review.
- [x] Extra — category management (add/edit/delete) via a Settings tab, plus UI/UX polish pass
- [x] Extra — left sidebar navigation, Trash (soft-delete recovery), preview images, light/dark theme
- [x] Extra — prompt status, preview modal, dashboard, permanent delete from Trash, mobile bottom nav, bug fixes
- [x] Extra — iOS-style mobile UX overhaul, Skills section, decluttered filters, lucide icon system
- [x] Extra — Apple-style glass visual redesign, prompt variables, copy-count tracking, keyboard shortcuts

**New setup requires two more migrations:** run
[`supabase/migration_005_copy_count.sql`](./supabase/migration_005_copy_count.sql)
once if your database already exists (fresh installs already have it via
`schema.sql`). No migration was needed for the glass redesign or keyboard
shortcuts — those are frontend-only.

## Glass visual redesign

- Every surface — sidebar, cards, modals, the action sheet, the toast —
  is now a translucent, blurred glass panel (`backdrop-filter: blur(...)
  saturate(...)`) over a soft, fixed gradient "wallpaper" behind the app
  (`body::before` in `index.css`), which is what makes the blur actually
  visible instead of blurring a flat color into itself.
- Corners are rounded throughout (cards ~20px, modals ~24px, buttons fully
  pill-shaped) and typography now uses the system font stack
  (`-apple-system, BlinkMacSystemFont, ...`) instead of a decorative serif,
  both closer to how iOS/macOS actually looks.
- Both light and dark theme now have a glass variant — `--glass-bg`,
  `--glass-border`, `--glass-fill` etc. are redefined per theme, so no
  component needed to change, only the tokens.
- `-webkit-backdrop-filter` is included alongside the standard property
  everywhere, since that prefix is what makes it render correctly in Safari
  and on iOS specifically — easy to accidentally miss and have the "glass"
  silently fall back to a flat color there.

## Prompt variables — {{ }}

- Write `{{customer_name}}` (or any `{{...}}`) anywhere in a prompt's
  content, and copying that prompt now opens a small form asking for each
  variable before copying the filled-in text — instead of copying the
  literal `{{customer_name}}` text (`src/lib/variables.js`,
  `VariableFillModal.jsx`). Prompts without any `{{ }}` copy instantly as
  before — no extra step added for the common case.
- A prompt with variables shows a small `{{n}}` indicator on its card so
  it's clear at a glance which prompts need filling in.

## Usage tracking & keyboard shortcuts

- Every successful copy increments a `copy_count` on that prompt. Sort by
  "ใช้บ่อยที่สุด" in the library, or see the top 5 most-copied prompts on
  the Dashboard.
- Shortcuts: **/** focuses search, **N** opens "add prompt" (library view
  only), **Esc** closes whichever modal/sheet is open. Shortcuts are
  disabled while typing in any field so they never interfere with normal
  text entry.

## Mobile UX overhaul (iOS-inspired)

- Replaced the emoji icon set app-wide with **lucide-react** line icons —
  reads as a deliberately designed icon system rather than ad hoc emoji.
- **Action sheet** (`ActionSheet.jsx`) — an iOS-style bottom sheet with
  grouped actions and a separate Cancel button. On mobile, `PromptCard` and
  `Toolbar` now show only their single most common action up front (Copy;
  Add prompt) plus a "•••" button that opens the sheet for everything else
  (preview, pin, favorite, edit, version history, delete / export, import).
  Desktop keeps the full row of icon buttons, since a mouse-driven hover UI
  doesn't have the same crowding problem a small touch screen does.
- **Card header decluttered** — instead of a status pill + category pill +
  every tag chip all competing for attention, a card now shows a small
  status dot, the category name as plain text, and at most 2 tags inline
  (`+N` for the rest) — full detail is one tap away in the preview modal.
- **Filters decluttered** — category and status went from two walls of
  chips to compact native `<select>` dropdowns; the tag list collapses to 8
  by default with a "+N เพิ่มเติม" expand toggle instead of always showing
  every tag in the library at once.

## Skills

- A second, simpler content type alongside prompts: reference notes (think
  `skill.md` files) like "UX/UI heuristics" or "Analysis checklist" — kept
  separate because they're read as reference material, not run as an
  instruction to a model.
- New `skills` table (`title`, free-text `category`, `content`, `tags`) and
  its own Settings-free CRUD in `SkillsView.jsx` / `SkillFormModal.jsx` /
  `src/lib/skills.js`. No versioning, images, or Trash for skills — kept
  intentionally lighter-weight than prompts. Delete is immediate (behind a
  confirm dialog), not soft-deleted.

## Navigation change

- Removed the "รายการโปรด" (Favorites) sidebar shortcut — it duplicated the
  ★ favorites quick-filter already in the library's filter bar. The
  sidebar's job is switching between distinct sections (Library, Skills,
  Trash, Settings, Dashboard); filtering within a section belongs in that
  section's own filter bar.

## Status, preview, and dashboard

- **Status** — every prompt has a lifecycle status: ฉบับร่าง (draft), รอตรวจสอบ
  (review), ใช้งานจริง (production), or เก็บถาวร (archived). Set it in the
  add/edit form, shown as a badge on each card, filterable in the library.
  This is deliberately separate from favorite/pin, which track importance
  rather than lifecycle stage (`src/lib/constants.js`).
- **Preview** — click a card's image/title, or the 👁 button, to see the full
  image and untruncated content before copying or editing
  (`PromptPreviewModal.jsx`).
- **Dashboard** — new sidebar tab summarizing totals, a status breakdown,
  and a per-category bar chart, computed client-side from data already in
  the cache (`DashboardView.jsx`) — no extra backend calls.
- **Trash → permanent delete** — soft-deleted prompts can now also be
  deleted for good (row + version history + storage image), behind a
  confirm dialog since it's irreversible.
- **Mobile nav** — the sidebar becomes a bottom tab bar on small screens
  instead of a horizontally-scrolling top bar, which is easier to reach
  with a thumb and is the more familiar mobile pattern for 4–5 top-level
  sections.

### Bug fixes in this pass
- Deleting a prompt now updates the Trash list immediately instead of only
  after its next unrelated fetch.
- A newly created prompt with an image no longer briefly loses the image
  during its optimistic (pre-confirmed) state.
- JSON export/import now round-trips `image_url` and `status` — previously
  both were silently dropped.
- Removed a couple of hardcoded colors that didn't adapt to dark mode
  (`.tag-cat`, the offline banner) in favor of the shared `--mustard-ink`
  variable.

## Navigation & Trash

- The old top tab bar is now a **left sidebar** (คลัง / ถังขยะ / ตั้งค่า) —
  collapses to a horizontal bar on mobile (`src/components/Sidebar.jsx`).
- **Trash** lists every soft-deleted prompt with a one-click restore
  (`src/components/TrashView.jsx`). Nothing is ever hard-deleted from the UI,
  which matters more here than in a normal app since there's no login to
  protect against an accidental or bad-faith delete.

## Preview images

- When adding or editing a prompt, you can attach a preview image — handy
  for image-generation prompts where you want to see a sample result at a
  glance (`PromptFormModal.jsx`; thumbnail rendered in `PromptCard.jsx`).
- Images upload to a public Supabase Storage bucket (`prompt-images`), not
  as base64 in the row, so the table stays light and the browser can cache
  the image normally. Removing/replacing an image best-effort cleans up the
  old file in storage.
- Not versioned yet — editing a prompt's image doesn't create a version
  history entry the way title/content edits do. Worth adding later if image
  iteration turns out to matter as much as text iteration.

## Theme

- Settings → Theme toggles light/dark (`src/hooks/useTheme.js`), saved to
  `localStorage` and applied via a `data-theme` attribute so no component
  needed to change — it's all CSS variable overrides in `index.css`. A tiny
  inline script in `index.html` applies the saved theme before first paint
  to avoid a flash of the wrong theme.
- Defaults to the visitor's OS-level light/dark preference if they haven't
  chosen one yet.

## Category management & Settings tab

- The header now has two tabs: **คลัง** (library) and **ตั้งค่า** (settings).
- Settings → Categories lets you add, rename, recolor, or delete categories
  directly from the UI (`src/components/CategoryManager.jsx` +
  `CategoryFormModal.jsx`) — no more editing `categories` in the Supabase
  dashboard by hand.
- Deleting a category never deletes prompts: the schema's
  `on delete set null` means affected prompts just fall back to "ไม่ระบุ"
  (uncategorized).
- The Settings view has a placeholder card for future settings (sharing
  permissions, theme, notifications) so new options have an obvious home.

## UI polish pass

- The sort control was shrunk from a boxed dropdown to a plain text label +
  underlined native `<select>` (`.sort-control` in `index.css`) so it no
  longer competes visually with the search bar.
- The filter bar itself lost its card chrome (border/shadow) in favor of a
  simple bottom hairline — flatter and closer to the rest of the minimalist
  layout.
- Added small, purposeful motion instead of a static page: cards fade/slide
  in on load (staggered per card), lift slightly on hover, pin/favorite
  icons pop on toggle, buttons scale down on press, and toasts slide in
  rather than appearing instantly.

## Responsive polish (Phase 5)

- Modals become a bottom sheet on screens ≤640px (slide-up feel, rounded top
  corners only) instead of a centered box, and their action buttons stack
  full-width with the primary action on top.
- The add/edit form's category + tags fields stack to one column on mobile.
- Touch targets on icon buttons (pin/favorite/delete) were bumped to 34px.
- Long prompt titles/content now wrap safely (`overflow-wrap: anywhere`)
  instead of overflowing their card on narrow screens.
- Toolbar heading and action buttons scale down and go full-width on mobile;
  the category divider in the filter bar only shows from `sm` up, where
  there's room for it to read as a divider rather than clutter.
- Toast notifications stay within the viewport width on small screens.

Deploy steps are already documented above and ready to run once you've
tested the app — nothing else blocks it.

## Cache & offline behavior (Phase 4)

- **Persisted cache** — the React Query cache is written to `localStorage`
  (`src/lib/persister.js`). On reload, the last-known prompt list paints
  immediately instead of a blank/loading screen, then a background refetch
  syncs it once the network responds (`refetchOnReconnect: true`).
- **Optimistic updates** — create, edit, delete, favorite, and pin all update
  the local list instantly, roll back automatically if the request fails, and
  reconcile with the server's response afterward (`src/hooks/usePrompts.js`).
  A newly created prompt shows a subtle "กำลังบันทึก…" state until confirmed.
- **Loading skeletons** — `src/components/PromptCardSkeleton.jsx` replaces
  the old plain-text loading message for the first fetch.
- **Offline handling** — `src/hooks/useOnlineStatus.js` detects connectivity.
  While offline, the app shows a banner and disables actions that require a
  write (add/edit/delete/import); browsing, filtering, and copying already-
  cached prompts keep working.

## Search & filtering (Phase 3)

All filtering runs client-side over the already-fetched prompt list (fast,
no extra round trips):

- **Search** — matches title, content, category name, and tags (case-insensitive).
- **Category** — single-select chip.
- **Tags** — multi-select chips, combined with AND (a prompt must have every selected tag).
- **Quick filter** — All / ★ Favorites / 📌 Pinned (mutually exclusive).
- **Sort** — default (pinned first, then most recent), newest, oldest, or title A–Z.

Logic lives in `src/hooks/useFilteredPrompts.js`; the UI is `src/components/FilterBar.jsx`.

## Security note

Because there's no login, `prompts` and `categories` use permissive RLS
policies (anyone can read/write). Deletes are soft (`is_deleted`) so mistakes
are recoverable. If this ever needs real access control, add Supabase Auth
and tighten the RLS policies in `supabase/schema.sql`.
