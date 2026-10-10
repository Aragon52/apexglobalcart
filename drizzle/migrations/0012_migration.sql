create or replace function public.protect_reseller_financials()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_sla_user(auth.uid())
     or coalesce(current_setting('app.financial_guard_bypass', true), '') = 'on' then
    return new;
  end if;
  new.balance := old.balance;
  new.pending_balance := old.pending_balance;
  new.unpicked_balance := old.unpicked_balance;
  new.total_deposits := old.total_deposits;
  new.total_withdrawals := old.total_withdrawals;
  new.total_earnings := old.total_earnings;
  new.total_orders := old.total_orders;
  new.level := old.level;
  new.product_limit := old.product_limit;
  new.credit_score := old.credit_score;
  new.star_rating := old.star_rating;
  new.verified := old.verified;
  new.member_of_admin_id := old.member_of_admin_id;
  new.referred_by_staff_id := old.referred_by_staff_id;
  new.reseller_id := old.reseller_id;
  new.referral_code := old.referral_code;
  new.referral_id := old.referral_id;
  return new;
end $$;

create or replace function public.request_withdrawal(_amount numeric, _method text, _account_info text)
returns uuid language plpgsql security definer set search_path = public as $$
declare _uid uuid := auth.uid(); _bal numeric; _id uuid;
begin
  if _uid is null then raise exception 'not_authenticated'; end if;
  if _amount is null or _amount <= 0 then raise exception 'invalid_amount'; end if;
  select balance into _bal from public.reseller_profiles where id = _uid for update;
  if not found then raise exception 'no_reseller_profile'; end if;
  if coalesce(_bal,0) < _amount then raise exception 'insufficient_balance'; end if;
  perform set_config('app.financial_guard_bypass', 'on', true);
  update public.reseller_profiles set balance = coalesce(_bal,0) - _amount, updated_at = now() where id = _uid;
  perform set_config('app.financial_guard_bypass', 'off', true);
  insert into public.withdrawal_requests ("resellerDocId", amount, status, method, account_info)
  values (_uid, _amount, 'Pending', _method, _account_info) returning id into _id;
  return _id;
end $$;