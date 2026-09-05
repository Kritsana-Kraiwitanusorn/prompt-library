-- Prompt Library — Database Schema (Supabase / Postgres)
-- No-login, shared-access model: every visitor reads/writes the same dataset.
-- Run this in the Supabase SQL editor once per project.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- categories: small fixed-ish list, lets the UI group prompts beyond tags
-- ---------------------------------------------------------------------------
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  color       text default '#64748b',          -- hex, for UI chips
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- prompts: the core record. "content" always holds the CURRENT version's text.
-- Historical text lives in prompt_versions so edits are never destructive.
-- ---------------------------------------------------------------------------
create table if not exists prompts (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  content       text not null,
  category_id   uuid references categories(id) on delete set null,
  tags          text[] not null default '{}',   -- denormalized for fast filter/search
  image_url     text,                            -- optional preview image (e.g. sample output)
  status        text not null default 'draft'
                  check (status in ('draft', 'review', 'production', 'archived')),
  is_favorite   boolean not null default false,
  is_pinned     boolean not null default false,
  current_version integer not null default 1,
  is_deleted    boolean not null default false, -- soft delete (no-login = higher risk of accidental/malicious delete)
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- prompt_versions: append-only history. A new row is inserted on every edit,
-- BEFORE prompts.content is overwritten, so version N is always retrievable.
-- ---------------------------------------------------------------------------
create table if not exists prompt_versions (
  id            uuid primary key default gen_random_uuid(),
  prompt_id     uuid not null references prompts(id) on delete cascade,
  version       integer not null,
  title         text not null,
  content       text not null,
  tags          text[] not null default '{}',
  note          text,                            -- optional "what changed" note
  created_at    timestamptz not null default now(),
  unique (prompt_id, version)
);

-- ---------------------------------------------------------------------------
-- indexes for fast tag/category/search lookups
-- ---------------------------------------------------------------------------
create index if not exists idx_prompts_tags        on prompts using gin (tags);
create index if not exists idx_prompts_category     on prompts (category_id);
create index if not exists idx_prompts_favorite     on prompts (is_favorite) where is_favorite = true;
create index if not exists idx_prompts_pinned       on prompts (is_pinned) where is_pinned = true;
create index if not exists idx_prompts_status       on prompts (status);
create index if not exists idx_prompts_not_deleted  on prompts (is_deleted) where is_deleted = false;
create index if not exists idx_prompts_search       on prompts using gin (
  to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content,''))
);
create index if not exists idx_versions_prompt      on prompt_versions (prompt_id, version desc);

-- ---------------------------------------------------------------------------
-- keep updated_at fresh, and auto-snapshot the previous version on edit
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_prompts_updated_at on prompts;
create trigger trg_prompts_updated_at
  before update on prompts
  for each row execute function set_updated_at();

-- When title/content actually change, archive the OLD row as the next
-- version and bump current_version. Tag/favorite/pin-only edits do not
-- create a new version.
create or replace function snapshot_prompt_version()
returns trigger as $$
begin
  if (old.title is distinct from new.title) or (old.content is distinct from new.content) then
    insert into prompt_versions (prompt_id, version, title, content, tags)
    values (old.id, old.current_version, old.title, old.content, old.tags);
    new.current_version = old.current_version + 1;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_prompts_snapshot on prompts;
create trigger trg_prompts_snapshot
  before update on prompts
  for each row execute function snapshot_prompt_version();

-- ---------------------------------------------------------------------------
-- Row Level Security: public read/write, no auth (per product decision).
-- Tighten this later if you outgrow the "shared link, no login" model.
-- ---------------------------------------------------------------------------
alter table categories       enable row level security;
alter table prompts          enable row level security;
alter table prompt_versions  enable row level security;

drop policy if exists "public read categories"   on categories;
drop policy if exists "public write categories"  on categories;
create policy "public read categories"  on categories for select using (true);
create policy "public write categories" on categories for all    using (true) with check (true);

drop policy if exists "public read prompts"   on prompts;
drop policy if exists "public write prompts"  on prompts;
create policy "public read prompts"  on prompts for select using (true);
create policy "public write prompts" on prompts for all    using (true) with check (true);

drop policy if exists "public read versions" on prompt_versions;
create policy "public read versions" on prompt_versions for select using (true);
-- versions are written only via the trigger (server-side), no direct insert policy needed
-- for anon, but we allow it so the app can also write a manual snapshot before bulk import.
drop policy if exists "public write versions" on prompt_versions;
create policy "public write versions" on prompt_versions for insert with check (true);

-- ---------------------------------------------------------------------------
-- seed a few starter categories (safe to skip/edit)
-- ---------------------------------------------------------------------------
insert into categories (name, color) values
  ('Writing',   '#2D6A6A'),
  ('Coding',    '#3B5BA9'),
  ('Marketing', '#C2703D'),
  ('Research',  '#6B5CA5'),
  ('Other',     '#64748b')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- Storage: public bucket for prompt preview images (e.g. sample output for
-- an image-generation prompt). Same "shared link, no login" access model as
-- everything else in this schema.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('prompt-images', 'prompt-images', true)
on conflict (id) do nothing;

drop policy if exists "public read prompt images" on storage.objects;
create policy "public read prompt images"
  on storage.objects for select
  using (bucket_id = 'prompt-images');

drop policy if exists "public upload prompt images" on storage.objects;
create policy "public upload prompt images"
  on storage.objects for insert
  with check (bucket_id = 'prompt-images');

drop policy if exists "public delete prompt images" on storage.objects;
create policy "public delete prompt images"
  on storage.objects for delete
  using (bucket_id = 'prompt-images');
