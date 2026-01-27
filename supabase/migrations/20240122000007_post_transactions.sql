-- New table post_transactions
create table public.post_transactions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references public.profiles(id),
  post_id uuid not null references public.getlate_posts(id),

  wallet_address text not null,
  chain_id text not null,

  tx_hash text unique,
  amount_eth numeric(36, 18) not null,
  currency text default 'ETH',

  status text not null
    check (status in ('pending', 'confirmed', 'failed')),

  created_at timestamptz default now(),
  confirmed_at timestamptz
);
