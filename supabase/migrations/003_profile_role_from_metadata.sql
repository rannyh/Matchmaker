-- Update the new-user trigger to also set role from auth metadata.
-- This ensures role is persisted even when email confirmation is enabled
-- (where the client-side upsert after signUp() has no session yet).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, contact_email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'role'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
