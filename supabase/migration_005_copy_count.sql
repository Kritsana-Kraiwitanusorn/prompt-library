-- Migration 005 — Copy count tracking
-- Run this once if your project already has schema.sql applied. Fresh
-- installs: already folded into schema.sql, don't run both.

do $$
begin
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'prompts') then
    raise exception 'Run supabase/schema.sql first — this migration assumes the base schema already exists.';
  end if;
end $$;

alter table prompts add column if not exists copy_count integer not null default 0;
create index if not exists idx_prompts_copy_count on prompts (copy_count desc);
