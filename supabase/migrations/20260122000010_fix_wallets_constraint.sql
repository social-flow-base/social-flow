-- Modify the wallets table to allow null address and chain
-- This is necessary for the automatic initialization trigger to work
alter table public.wallets 
  alter column address drop not null,
  alter column chain drop not null;

-- Optional: If you already have data and want to make sure it's consistent
-- update public.wallets set address = null where address = '';
