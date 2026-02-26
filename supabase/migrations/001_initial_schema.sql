-- ─────────────────────────────────────────────────────────────────────────────
-- Matchmaker — Initial Schema
-- Run this in your Supabase SQL editor or via `supabase db push`
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── profiles ─────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  role          text check (role in ('researcher', 'industry')),
  organization  text,
  bio           text,
  contact_email text,
  avatar_url    text,
  is_verified   boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Automatically create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, contact_email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── posts ─────────────────────────────────────────────────────────────────────
create table if not exists posts (
  id                  uuid primary key default uuid_generate_v4(),
  author_id           uuid not null references profiles(id) on delete cascade,
  post_type           text not null check (post_type in ('feature_request', 'research_topic')),
  title               text not null,
  description         text not null,
  tags                text[] not null default '{}',
  skills_required     text[] not null default '{}',
  timeline            text,
  has_funding         boolean not null default false,
  funding_details     text,
  open_source_project text,
  status              text not null default 'open' check (status in ('open', 'in_progress', 'completed')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Full-text search index
create index if not exists posts_fts_idx
  on posts using gin(to_tsvector('english', title || ' ' || description));

create index if not exists posts_tags_idx on posts using gin(tags);
create index if not exists posts_skills_idx on posts using gin(skills_required);
create index if not exists posts_author_idx on posts(author_id);
create index if not exists posts_status_idx on posts(status);
create index if not exists posts_type_idx on posts(post_type);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_updated_at on posts;
create trigger posts_updated_at
  before update on posts
  for each row execute procedure update_updated_at();

-- ── collaborations ─────────────────────────────────────────────────────────────
create table if not exists collaborations (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid not null references posts(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  message    text,
  status     text not null default 'interested' check (status in ('interested', 'active', 'withdrawn')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists collabs_post_idx on collaborations(post_id);
create index if not exists collabs_user_idx on collaborations(user_id);

-- ── comments ──────────────────────────────────────────────────────────────────
create table if not exists comments (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid not null references posts(id) on delete cascade,
  author_id  uuid not null references profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comments_post_idx on comments(post_id);
create index if not exists comments_author_idx on comments(author_id);

drop trigger if exists comments_updated_at on comments;
create trigger comments_updated_at
  before update on comments
  for each row execute procedure update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Row-Level Security
-- ─────────────────────────────────────────────────────────────────────────────

alter table profiles enable row level security;
alter table posts enable row level security;
alter table collaborations enable row level security;
alter table comments enable row level security;

-- profiles: public read, owner write
create policy "profiles_select_public"
  on profiles for select using (true);

create policy "profiles_insert_own"
  on profiles for insert with check (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update using (auth.uid() = id);

-- Admins can update is_verified (via service_role or a separate policy)
-- Using service_role key server-side bypasses RLS for admin operations.

-- posts: public read, owner insert/update/delete
create policy "posts_select_public"
  on posts for select using (true);

create policy "posts_insert_own"
  on posts for insert with check (auth.uid() = author_id);

create policy "posts_update_own"
  on posts for update using (auth.uid() = author_id);

create policy "posts_delete_own"
  on posts for delete using (auth.uid() = author_id);

-- collaborations: participants can see; auth users can insert; owner can update
create policy "collabs_select"
  on collaborations for select using (true);

create policy "collabs_insert_auth"
  on collaborations for insert with check (auth.uid() = user_id);

create policy "collabs_update_own"
  on collaborations for update using (auth.uid() = user_id);

-- comments: public read; auth users can insert own; owner can update/delete
create policy "comments_select_public"
  on comments for select using (true);

create policy "comments_insert_auth"
  on comments for insert with check (auth.uid() = author_id);

create policy "comments_update_own"
  on comments for update using (auth.uid() = author_id);

create policy "comments_delete_own"
  on comments for delete using (auth.uid() = author_id);
