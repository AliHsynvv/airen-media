-- Purpose: Prune Realtime publications to only required tables
-- Keep: public.notifications, public.user_follows
-- This reduces Realtime overhead and avoids unnecessary replication traffic.

-- Inspect current publication tables (run manually to verify)
-- select pubname, schemaname, tablename from pg_publication_tables where pubname = 'supabase_realtime';

-- Ensure replica identity for UPDATE/DELETE events are visible to Realtime
alter table if exists public.notifications replica identity full;
alter table if exists public.user_follows replica identity full;

-- Reset the publication to only the allowed tables
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    -- Note: correct syntax is SET TABLE (not "set tables =")
    execute 'alter publication supabase_realtime set table public.notifications, public.user_follows';
  end if;
end$$;

-- Optional: Re-add another table later if needed (example)
-- alter publication supabase_realtime add table public.story_likes;

-- Verify after applying (run manually)
-- select pubname, schemaname, tablename from pg_publication_tables where pubname = 'supabase_realtime';


