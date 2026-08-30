# Prompt Library

A shared, tag-searchable library of AI prompts. No login — anyone with the
link can browse, add, and edit. Fast to load via client-side caching (React
Query); requires a connection to sync changes.

**Status: Phase 1 — data layer + project scaffold.** No browsing/editing UI
yet; the app currently only shows a connection checkpoint screen.

## Stack

- React + Vite
- Tailwind CSS v4
- Supabase (Postgres) — free tier, public read/write, no auth
- TanStack React Query — cache-first data fetching

## 1. Create the database

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in the dashboard, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it.
   This creates `categories`, `prompts`, `prompt_versions`, indexes,
   versioning triggers, public RLS policies, and the public storage bucket
   used for prompt preview images. **New setups only need this file** —
   don't also run the migration below.

**Already had this project running before the image feature existed** (i.e.
your database already has a `prompts` table from an earlier `schema.sql`
run)? Run [`supabase/migration_002_images.sql`](./supabase/migration_002_images.sql)
once to add the `image_url` column and the storage bucket/policies without
touching your existing data. Running it against a database that doesn't
have `prompts` yet (e.g. a brand-new Supabase project) will fail on purpose
with a message telling you to run `schema.sql` first.

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
