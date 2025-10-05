-- Storage policies for Business bucket
-- Supports both 'business' and 'Business' bucket names

-- Enable RLS on storage.objects is managed by Supabase by default

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Business bucket read'
  ) then
    create policy "Business bucket read" on storage.objects
      for select using (bucket_id in ('business','Business'));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Business bucket upload'
  ) then
    create policy "Business bucket upload" on storage.objects
      for insert to authenticated with check (bucket_id in ('business','Business'));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Business bucket update'
  ) then
    create policy "Business bucket update" on storage.objects
      for update to authenticated using (bucket_id in ('business','Business')) with check (bucket_id in ('business','Business'));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Business bucket delete'
  ) then
    create policy "Business bucket delete" on storage.objects
      for delete to authenticated using (bucket_id in ('business','Business'));
  end if;
end $$;


