-- Migration 003 — Prompt status (draft / review / production / archived)
-- Run this once if your project already has schema.sql applied. Fresh
-- installs: already folded into schema.sql, don't run both.

do $$
begin
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'prompts') then
    raise exception 'The "prompts" table does not exist yet. Run supabase/schema.sql first.';
  end if;
end $$;

alter table prompts add column if not exists status text not null default 'draft';

alter table prompts drop constraint if exists prompts_status_check;
alter table prompts add constraint prompts_status_check
  check (status in ('draft', 'review', 'production', 'archived'));

create index if not exists idx_prompts_status on prompts (status);
