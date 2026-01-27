-- Create RPC function to deduct credit safely
create or replace function public.deduct_credit(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Ensure user has enough credits
  if not exists (
    select 1 from public.user_credits 
    where user_id = p_user_id and credits_remaining > 0
  ) then
    raise exception 'Insufficient credits';
  end if;

  update public.user_credits
  set credits_remaining = credits_remaining - 1,
      updated_at = now()
  where user_id = p_user_id;

  -- Log the usage
  insert into public.credit_usage_logs (user_id, action, credits_used)
  values (p_user_id, 'deduct_credit', 1);
end;
$$;

-- Create RPC function to refund credit safely
create or replace function public.refund_credit(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.user_credits
  set credits_remaining = credits_remaining + 1,
      updated_at = now()
  where user_id = p_user_id;

  -- Log the refund
  insert into public.credit_usage_logs (user_id, action, credits_used)
  values (p_user_id, 'refund_credit', -1);
end;
$$;

-- Create RPC function to topup credit safely
create or replace function public.topup_credit(p_user_id uuid, p_amount integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.user_credits
  set credits_remaining = credits_remaining + p_amount,
      updated_at = now()
  where user_id = p_user_id;

  -- Log the topup
  insert into public.credit_usage_logs (user_id, action, credits_used)
  values (p_user_id, 'topup_credit', -p_amount);
end;
$$;
