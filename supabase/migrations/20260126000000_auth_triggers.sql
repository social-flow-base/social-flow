-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Create profile
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  -- Create initial credits (0 credits by default)
  insert into public.user_credits (user_id, credits_remaining)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Trigger to call the function after a user is created in auth.users
-- We use "after insert" to ensure the user ID is available
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
