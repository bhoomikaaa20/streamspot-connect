
-- Roles enum and table
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users view own roles" on public.user_roles
  for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Admins manage roles" on public.user_roles
  for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create profile + default user role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));

  insert into public.user_roles (user_id, role)
  values (new.id, 'user');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Movies
create table public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  genre text not null,
  description text not null default '',
  duration_seconds integer not null default 0,
  category text not null default 'General',
  poster_url text not null,
  video_url text not null,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.movies enable row level security;

create policy "Anyone can view movies" on public.movies
  for select using (true);

create policy "Admins insert movies" on public.movies
  for insert with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins update movies" on public.movies
  for update using (public.has_role(auth.uid(), 'admin'));

create policy "Admins delete movies" on public.movies
  for delete using (public.has_role(auth.uid(), 'admin'));

-- Watch history
create table public.watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id uuid not null references public.movies(id) on delete cascade,
  progress_seconds integer not null default 0,
  watched_at timestamptz not null default now(),
  unique (user_id, movie_id)
);

alter table public.watch_history enable row level security;

create policy "Users view own watch history" on public.watch_history
  for select using (auth.uid() = user_id);

create policy "Users insert own watch history" on public.watch_history
  for insert with check (auth.uid() = user_id);

create policy "Users update own watch history" on public.watch_history
  for update using (auth.uid() = user_id);

create policy "Users delete own watch history" on public.watch_history
  for delete using (auth.uid() = user_id);

create index idx_watch_history_user on public.watch_history(user_id, watched_at desc);

-- Updated_at triggers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger movies_updated_at before update on public.movies
  for each row execute function public.set_updated_at();
