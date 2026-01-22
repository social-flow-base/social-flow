-- Create a function to handle new user signups
-- This function will run every time a new user is created in Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- 1. Create a profile for the new user
  insert into public.profiles (id, email)
  values (new.id, new.email);

  -- 2. Initialize credits for the new user (e.g., give 10 free credits)
  insert into public.user_credits (user_id, credits_remaining)
  values (new.id, 10);

  -- 3. Create a placeholder in the wallets table
  insert into public.wallets (user_id, address)
  values (new.id, null);

  return new;
end;
$$;

-- Create the trigger that calls the function after an insert on auth.users
-- Note: 'on_auth_user_created' is a name you can change
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
