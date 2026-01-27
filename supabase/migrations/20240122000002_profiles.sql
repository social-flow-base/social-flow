-- Profiles table (linked to auth.users)
-- Includes wallet information directly (1:1 relationship)
create table public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  email text,
  wallet_address text,
  chain_id text, -- eip155:8453, etc
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
