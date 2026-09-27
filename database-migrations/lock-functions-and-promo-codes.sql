-- Applied 2026-09-27 after RLS stage 3.
-- auth_check_pin returned staff names, roles and plain PINs to anyone with the
-- public key (and accepted a kennitala). Only mama-manager's server calls it.
revoke execute on function public.auth_check_pin(text) from public, anon, authenticated;
grant execute on function public.auth_check_pin(text) to service_role;

-- delete_user_account let anyone delete any songstudy profile by id.
create or replace function public.delete_user_account(user_id uuid)
returns void language plpgsql security definer set search_path = public as $function$
begin
  if auth.uid() is null or auth.uid() <> user_id then
    raise exception 'Not allowed';
  end if;
  delete from songstudy_profiles where id = user_id;
end;
$function$;
revoke execute on function public.delete_user_account(uuid) from public, anon;
grant execute on function public.delete_user_account(uuid) to authenticated, service_role;

-- Anyone could list every active promo code with the public key.
drop policy if exists "Allow read active event promo codes" on public.event_promo_codes;
