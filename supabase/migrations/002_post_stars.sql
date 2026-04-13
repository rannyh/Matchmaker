-- ── post_stars ────────────────────────────────────────────────────────────────
-- One star per user per post. Role is denormalized from profiles for fast
-- filtering between researcher and industry stars.

create table if not exists post_stars (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid not null references posts(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists stars_post_idx on post_stars(post_id);
create index if not exists stars_user_idx on post_stars(user_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table post_stars enable row level security;

create policy "stars_select_public"
  on post_stars for select using (true);

create policy "stars_insert_auth"
  on post_stars for insert with check (auth.uid() = user_id);

create policy "stars_delete_own"
  on post_stars for delete using (auth.uid() = user_id);
