-- KOLLAB Supabase schema
-- Paste this file into the Supabase SQL Editor for a new project.

begin;

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('artist', 'business')),
  display_name text not null,
  bio text,
  location_text text,
  latitude decimal(9,6) check (latitude between -90 and 90),
  longitude decimal(9,6) check (longitude between -180 and 180),
  avatar_url text,
  phone text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'full_name'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create table if not exists public.artist_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  skills text[],
  rate_min integer check (rate_min is null or rate_min >= 0),
  rate_max integer check (rate_max is null or rate_max >= 0),
  portfolio_items jsonb,
  is_open_to_gigs boolean not null default true,
  total_gigs integer not null default 0 check (total_gigs >= 0),
  avg_rating decimal(3,2) not null default 0.00 check (avg_rating between 0 and 5),
  check (rate_min is null or rate_max is null or rate_max >= rate_min)
);

create table if not exists public.business_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  business_name text not null,
  business_type text,
  gst_number text,
  website_url text
);

create table if not exists public.gigs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  skill_required text not null,
  budget_min integer not null check (budget_min >= 0),
  budget_max integer not null check (budget_max >= 0),
  deadline date not null,
  location_text text,
  latitude decimal(9,6) check (latitude between -90 and 90),
  longitude decimal(9,6) check (longitude between -180 and 180),
  radius_km integer not null default 10 check (radius_km > 0),
  work_type text not null default 'either' check (work_type in ('in_person', 'remote', 'either')),
  reference_urls text[],
  status text not null default 'live' check (status in ('draft', 'live', 'in_progress', 'under_review', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (budget_max >= budget_min)
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs(id) on delete cascade,
  artist_id uuid not null references public.profiles(id) on delete cascade,
  pitch_text text not null,
  quoted_rate integer not null check (quoted_rate >= 0),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  unique (gig_id, artist_id)
);

create table if not exists public.escrow (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  business_id uuid not null references public.profiles(id),
  artist_id uuid not null references public.profiles(id),
  amount_held integer not null check (amount_held >= 0),
  platform_fee integer not null check (platform_fee >= 0),
  artist_payout integer not null check (artist_payout >= 0),
  status text not null default 'held' check (status in ('held', 'released', 'refunded', 'disputed')),
  disputed_at timestamptz,
  released_at timestamptz,
  created_at timestamptz not null default now(),
  check (amount_held = platform_fee + artist_payout)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  attachment_url text,
  attachment_type text,
  attachment_name text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages
  add column if not exists attachment_url text,
  add column if not exists attachment_type text,
  add column if not exists attachment_name text;

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs(id) on delete cascade,
  rater_id uuid not null references public.profiles(id),
  ratee_id uuid not null references public.profiles(id),
  stars integer not null check (stars between 1 and 5),
  review_text text,
  submitted_at timestamptz not null default now(),
  visible boolean not null default false,
  unique (gig_id, rater_id),
  check (rater_id <> ratee_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('NEW_APPLICATION', 'APPLICATION_ACCEPTED', 'WORK_SUBMITTED', 'PAYMENT_RELEASED', 'NEW_MESSAGE')),
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_gigs_status on public.gigs(status);
create index if not exists idx_gigs_skill on public.gigs(skill_required);
create index if not exists idx_gigs_business on public.gigs(business_id);
create index if not exists idx_applications_gig on public.applications(gig_id);
create index if not exists idx_applications_artist on public.applications(artist_id);
create index if not exists idx_messages_gig on public.messages(gig_id);
create index if not exists idx_ratings_ratee on public.ratings(ratee_id);
create index if not exists idx_notifications_user_read on public.notifications(user_id, is_read);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_gigs_updated_at on public.gigs;
create trigger set_gigs_updated_at
before update on public.gigs
for each row
execute function public.set_updated_at();

create or replace function public.reveal_completed_rating_pair()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.ratings counterpart
    where counterpart.gig_id = new.gig_id
      and counterpart.rater_id = new.ratee_id
      and counterpart.ratee_id = new.rater_id
  ) then
    update public.ratings
    set visible = true
    where gig_id = new.gig_id
      and (
        (rater_id = new.rater_id and ratee_id = new.ratee_id)
        or (rater_id = new.ratee_id and ratee_id = new.rater_id)
      );
  end if;

  return new;
end;
$$;

drop trigger if exists reveal_completed_rating_pair on public.ratings;
create trigger reveal_completed_rating_pair
after insert on public.ratings
for each row
execute function public.reveal_completed_rating_pair();

create or replace function public.refresh_artist_rating_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.artist_profiles artist
  set
    avg_rating = coalesce((
      select round(avg(ratings.stars)::numeric, 2)
      from public.ratings
      join public.profiles on profiles.id = ratings.ratee_id
      where ratings.ratee_id = artist.id
        and ratings.visible = true
        and profiles.role = 'artist'
    ), 0),
    total_gigs = greatest(
      artist.total_gigs,
      coalesce((
        select count(distinct ratings.gig_id)::integer
        from public.ratings
        join public.profiles on profiles.id = ratings.ratee_id
        where ratings.ratee_id = artist.id
          and ratings.visible = true
          and profiles.role = 'artist'
      ), 0)
    )
  where artist.id in (
    select distinct ratings.ratee_id
    from public.ratings
    join public.profiles on profiles.id = ratings.ratee_id
    where ratings.visible = true
      and profiles.role = 'artist'
  );

  return new;
end;
$$;

drop trigger if exists refresh_artist_rating_stats on public.ratings;
create trigger refresh_artist_rating_stats
after insert or update of visible on public.ratings
for each row
execute function public.refresh_artist_rating_stats();

create or replace function public.profile_has_role(profile_id uuid, expected_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = profile_id
      and profiles.role = expected_role
  );
$$;

create or replace function public.is_live_gig(gig_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.gigs
    where gigs.id = gig_id
      and gigs.status = 'live'
  );
$$;

create or replace function public.is_completed_gig(gig_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.gigs
    where gigs.id = gig_id
      and gigs.status = 'completed'
  );
$$;

create or replace function public.is_gig_business(gig_id uuid, profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.gigs
    where gigs.id = gig_id
      and gigs.business_id = profile_id
  );
$$;

create or replace function public.has_application_for_gig(gig_id uuid, profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.applications
    where applications.gig_id = gig_id
      and applications.artist_id = profile_id
  );
$$;

create or replace function public.is_accepted_artist_for_gig(gig_id uuid, profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.applications
    where applications.gig_id = gig_id
      and applications.artist_id = profile_id
      and applications.status = 'accepted'
  );
$$;

create or replace function public.is_gig_party(gig_id uuid, profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_gig_business(gig_id, profile_id)
    or public.is_accepted_artist_for_gig(gig_id, profile_id);
$$;

alter table public.profiles enable row level security;
alter table public.artist_profiles enable row level security;
alter table public.business_profiles enable row level security;
alter table public.gigs enable row level security;
alter table public.applications enable row level security;
alter table public.escrow enable row level security;
alter table public.messages enable row level security;
alter table public.ratings enable row level security;
alter table public.notifications enable row level security;

grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on table
  public.profiles,
  public.artist_profiles,
  public.business_profiles,
  public.gigs,
  public.applications,
  public.escrow,
  public.messages,
  public.ratings,
  public.notifications
to authenticated;

grant all privileges on table
  public.profiles,
  public.artist_profiles,
  public.business_profiles,
  public.gigs,
  public.applications,
  public.escrow,
  public.messages,
  public.ratings,
  public.notifications
to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-items',
  'portfolio-items',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'video/mp4', 'application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit)
values (
  'gig-attachments',
  'gig-attachments',
  true,
  20971520
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

insert into storage.buckets (id, name, public, file_size_limit)
values (
  'gig-deliverables',
  'gig-deliverables',
  false,
  104857600
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
on storage.objects
for select
using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatars" on storage.objects;
create policy "Users can upload own avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Portfolio items are publicly accessible" on storage.objects;
create policy "Portfolio items are publicly accessible"
on storage.objects
for select
using (bucket_id = 'portfolio-items');

drop policy if exists "Gig attachments are publicly accessible" on storage.objects;
create policy "Gig attachments are publicly accessible"
on storage.objects
for select
using (bucket_id = 'gig-attachments');

drop policy if exists "Gig deliverables are publicly accessible" on storage.objects;
drop policy if exists "Gig parties can view deliverables" on storage.objects;
create policy "Gig parties can view deliverables"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'gig-deliverables'
  and public.is_gig_party(((storage.foldername(name))[1])::uuid, (select auth.uid()))
);

drop policy if exists "Artists can upload own portfolio items" on storage.objects;
create policy "Artists can upload own portfolio items"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portfolio-items'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Businesses can upload own gig attachments" on storage.objects;
create policy "Businesses can upload own gig attachments"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'gig-attachments'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and public.profile_has_role((select auth.uid()), 'business')
);

drop policy if exists "Gig parties can upload deliverables" on storage.objects;
create policy "Gig parties can upload deliverables"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'gig-deliverables'
  and (storage.foldername(name))[2] = (select auth.uid()::text)
  and public.is_gig_party(((storage.foldername(name))[1])::uuid, (select auth.uid()))
);

drop policy if exists "Artists can update own portfolio items" on storage.objects;
create policy "Artists can update own portfolio items"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'portfolio-items'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'portfolio-items'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Businesses can update own gig attachments" on storage.objects;
create policy "Businesses can update own gig attachments"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'gig-attachments'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and public.profile_has_role((select auth.uid()), 'business')
)
with check (
  bucket_id = 'gig-attachments'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and public.profile_has_role((select auth.uid()), 'business')
);

drop policy if exists "Gig parties can update own deliverables" on storage.objects;
create policy "Gig parties can update own deliverables"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'gig-deliverables'
  and (storage.foldername(name))[2] = (select auth.uid()::text)
  and public.is_gig_party(((storage.foldername(name))[1])::uuid, (select auth.uid()))
)
with check (
  bucket_id = 'gig-deliverables'
  and (storage.foldername(name))[2] = (select auth.uid()::text)
  and public.is_gig_party(((storage.foldername(name))[1])::uuid, (select auth.uid()))
);

drop policy if exists "Artists can delete own portfolio items" on storage.objects;
create policy "Artists can delete own portfolio items"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'portfolio-items'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Businesses can delete own gig attachments" on storage.objects;
create policy "Businesses can delete own gig attachments"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'gig-attachments'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and public.profile_has_role((select auth.uid()), 'business')
);

drop policy if exists "Gig parties can delete own deliverables" on storage.objects;
create policy "Gig parties can delete own deliverables"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'gig-deliverables'
  and (storage.foldername(name))[2] = (select auth.uid()::text)
  and public.is_gig_party(((storage.foldername(name))[1])::uuid, (select auth.uid()))
);

drop policy if exists "Users can update own avatars" on storage.objects;
create policy "Users can update own avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "Authenticated users can view profiles" on public.profiles;
create policy "Authenticated users can view profiles"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Authenticated users can view artist profiles" on public.artist_profiles;
create policy "Authenticated users can view artist profiles"
on public.artist_profiles
for select
to authenticated
using (true);

drop policy if exists "Artists can create own artist profile" on public.artist_profiles;
create policy "Artists can create own artist profile"
on public.artist_profiles
for insert
to authenticated
with check (
  (select auth.uid()) = id
  and public.profile_has_role((select auth.uid()), 'artist')
);

drop policy if exists "Artists can update own artist profile" on public.artist_profiles;
create policy "Artists can update own artist profile"
on public.artist_profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Authenticated users can view business profiles" on public.business_profiles;
create policy "Authenticated users can view business profiles"
on public.business_profiles
for select
to authenticated
using (true);

drop policy if exists "Businesses can create own business profile" on public.business_profiles;
create policy "Businesses can create own business profile"
on public.business_profiles
for insert
to authenticated
with check (
  (select auth.uid()) = id
  and public.profile_has_role((select auth.uid()), 'business')
);

drop policy if exists "Businesses can update own business profile" on public.business_profiles;
create policy "Businesses can update own business profile"
on public.business_profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Authenticated users can view live gigs" on public.gigs;
create policy "Authenticated users can view live gigs"
on public.gigs
for select
to authenticated
using (
  status = 'live'
  or business_id = (select auth.uid())
  or public.has_application_for_gig(gigs.id, (select auth.uid()))
);

drop policy if exists "Businesses can create own gigs" on public.gigs;
create policy "Businesses can create own gigs"
on public.gigs
for insert
to authenticated
with check (
  business_id = (select auth.uid())
  and public.profile_has_role((select auth.uid()), 'business')
);

drop policy if exists "Businesses can update own gigs" on public.gigs;
create policy "Businesses can update own gigs"
on public.gigs
for update
to authenticated
using (
  business_id = (select auth.uid())
  and public.profile_has_role((select auth.uid()), 'business')
)
with check (
  business_id = (select auth.uid())
  and public.profile_has_role((select auth.uid()), 'business')
);

drop policy if exists "Businesses can delete own gigs" on public.gigs;
create policy "Businesses can delete own gigs"
on public.gigs
for delete
to authenticated
using (
  business_id = (select auth.uid())
  and public.profile_has_role((select auth.uid()), 'business')
);

drop policy if exists "Artists can create own applications" on public.applications;
create policy "Artists can create own applications"
on public.applications
for insert
to authenticated
with check (
  artist_id = (select auth.uid())
  and public.profile_has_role((select auth.uid()), 'artist')
  and public.is_live_gig(applications.gig_id)
);

drop policy if exists "Artists and gig businesses can view applications" on public.applications;
create policy "Artists and gig businesses can view applications"
on public.applications
for select
to authenticated
using (
  artist_id = (select auth.uid())
  or public.is_gig_business(applications.gig_id, (select auth.uid()))
);

drop policy if exists "Artists and gig businesses can update applications" on public.applications;
create policy "Artists and gig businesses can update applications"
on public.applications
for update
to authenticated
using (
  artist_id = (select auth.uid())
  or public.is_gig_business(applications.gig_id, (select auth.uid()))
)
with check (
  artist_id = (select auth.uid())
  or public.is_gig_business(applications.gig_id, (select auth.uid()))
);

drop policy if exists "Escrow parties can view escrow" on public.escrow;
create policy "Escrow parties can view escrow"
on public.escrow
for select
to authenticated
using (
  business_id = (select auth.uid())
  or artist_id = (select auth.uid())
);

drop policy if exists "Service role can manage escrow" on public.escrow;
create policy "Service role can manage escrow"
on public.escrow
for all
to service_role
using (true)
with check (true);

drop policy if exists "Gig parties can view messages" on public.messages;
create policy "Gig parties can view messages"
on public.messages
for select
to authenticated
using (
  sender_id = (select auth.uid())
  or public.is_gig_party(messages.gig_id, (select auth.uid()))
);

drop policy if exists "Gig parties can send messages" on public.messages;
create policy "Gig parties can send messages"
on public.messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and public.is_gig_party(messages.gig_id, (select auth.uid()))
);

drop policy if exists "Gig parties can update message read states" on public.messages;
create policy "Gig parties can update message read states"
on public.messages
for update
to authenticated
using (
  public.is_gig_party(messages.gig_id, (select auth.uid()))
)
with check (
  public.is_gig_party(messages.gig_id, (select auth.uid()))
);

drop policy if exists "Raters can create own ratings" on public.ratings;
create policy "Raters can create own ratings"
on public.ratings
for insert
to authenticated
with check (
  rater_id = (select auth.uid())
  and public.is_completed_gig(ratings.gig_id)
  and public.is_gig_party(ratings.gig_id, (select auth.uid()))
  and public.is_gig_party(ratings.gig_id, ratings.ratee_id)
);

drop policy if exists "Raters and visible ratees can view ratings" on public.ratings;
create policy "Raters and visible ratees can view ratings"
on public.ratings
for select
to authenticated
using (
  rater_id = (select auth.uid())
  or visible = true
);

drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
on public.notifications
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
on public.notifications
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Service role can create notifications" on public.notifications;
create policy "Service role can create notifications"
on public.notifications
for insert
to service_role
with check (true);

commit;
