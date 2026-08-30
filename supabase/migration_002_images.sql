-- Migration 002 — Preview images for prompts
-- Run this ONLY on a database that already has schema.sql applied. If you
-- haven't set up the database yet, run supabase/schema.sql instead — it
-- already includes everything in this file for fresh installs.

do $$
begin
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'prompts') then
    raise exception 'The "prompts" table does not exist yet. Run supabase/schema.sql first (it already includes this migration''s changes), then re-run this file only if you still need it.';
  end if;
end $$;

alter table prompts add column if not exists image_url text;

-- Public bucket: consistent with the "no login, shared link" model — anyone
-- with the link can view/upload/replace preview images, same as prompts.
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
