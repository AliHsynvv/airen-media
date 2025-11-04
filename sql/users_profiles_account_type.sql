-- Add account_type field to users_profiles to distinguish between user and business accounts
-- Safe to run multiple times (IF NOT EXISTS)

alter table if exists public.users_profiles
  add column if not exists account_type text default 'user' check (account_type in ('user', 'business'));

-- Create index for account_type for faster queries
create index if not exists idx_users_profiles_account_type on public.users_profiles(account_type);

-- Update existing records to have default 'user' account_type if null
update public.users_profiles set account_type = 'user' where account_type is null;

-- Comments for documentation
comment on column public.users_profiles.account_type is 'Type of account: user (regular traveler) or business (business profile owner)';

