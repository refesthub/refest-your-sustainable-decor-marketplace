create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, display_name text, created_at timestamptz not null default now());
grant select, insert, update on public.profiles to authenticated; grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid()=id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid()=id);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1))); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.listings (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null, description text not null default '',
 category text not null, listing_type text not null check (listing_type in ('sell','rent','exchange','donate')),
 price numeric, city text not null check (city in ('Pune','Mumbai')), area text not null default '',
 condition text not null default 'Good', photos text[] not null default '{}',
 whatsapp text, telegram text,
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
grant select on public.listings to anon; grant select, insert, update, delete on public.listings to authenticated; grant all on public.listings to service_role;
alter table public.listings enable row level security;
create policy "public approved" on public.listings for select to anon, authenticated using (status='approved');
create policy "owner read" on public.listings for select to authenticated using (auth.uid()=user_id);
create policy "admin read" on public.listings for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "owner insert" on public.listings for insert to authenticated with check (auth.uid()=user_id and status='pending');
create policy "owner delete" on public.listings for delete to authenticated using (auth.uid()=user_id);
create policy "admin update" on public.listings for update to authenticated using (public.has_role(auth.uid(),'admin'));
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path=public as $$ begin new.updated_at=now(); return new; end $$;
create trigger listings_touch before update on public.listings for each row execute function public.touch_updated_at();

create policy "photos public read" on storage.objects for select using (bucket_id='listing-photos');
create policy "photos user upload" on storage.objects for insert to authenticated with check (bucket_id='listing-photos' and (storage.foldername(name))[1]=auth.uid()::text);