-- Migration 004 — Skills (reference notes, separate from prompts)
-- Run this once if your project already has schema.sql applied. Fresh
-- installs: already folded into schema.sql, don't run both.

do $$
begin
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'prompts') then
    raise exception 'Run supabase/schema.sql first — this migration assumes the base schema already exists.';
  end if;
end $$;

create extension if not exists "pgcrypto";

-- A skill is a reference note (skill.md style) — e.g. "UX/UI heuristics",
-- "Analysis checklist" — kept separate from prompts because it's read as
-- reference material rather than run as an instruction to an AI model.
create table if not exists skills (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text,                          -- free-text label, e.g. "UX/UI", "Analysis"
  content     text not null,
  tags        text[] not null default '{}',
  is_deleted  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_skills_not_deleted on skills (is_deleted) where is_deleted = false;
create index if not exists idx_skills_search on skills using gin (
  to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content,'') || ' ' || coalesce(category,''))
);

drop trigger if exists trg_skills_updated_at on skills;
create trigger trg_skills_updated_at
  before update on skills
  for each row execute function set_updated_at();

alter table skills enable row level security;

drop policy if exists "public read skills" on skills;
drop policy if exists "public write skills" on skills;
create policy "public read skills"  on skills for select using (true);
create policy "public write skills" on skills for all    using (true) with check (true);
