-- Run this in the Supabase SQL Editor

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  full_name text,
  rules text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trading accounts (supports multi-account per user)
create table if not exists public.accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  broker text,
  starting_balance numeric(12,2) default 0,
  currency text default 'USD',
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Strategies / tags
create table if not exists public.strategies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  color text default '#3b82f6',
  description text,
  rules jsonb default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trade entries
create table if not exists public.trades (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references public.accounts on delete set null,
  strategy_id uuid references public.strategies on delete set null,
  symbol text,
  trade_date date not null,
  direction text check (direction in ('long', 'short')),
  entry_price numeric(12,6),
  exit_price numeric(12,6),
  position_size numeric(12,2),
  stop_loss numeric(12,6),
  take_profit numeric(12,6),
  fees numeric(12,2) default 0,
  pnl numeric(12,2),
  pnl_pips numeric(12,2),
  notes text,
  followed_rules boolean default false,
  status text default 'open' check (status in ('open', 'closed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Images attached to trades
create table if not exists public.trade_images (
  id uuid default gen_random_uuid() primary key,
  trade_id uuid references public.trades on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  storage_path text not null,
  url text not null,
  caption text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sticky notes on dashboard
create table if not exists public.sticky_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  content text default '',
  x numeric(12,2) default 0,
  y numeric(12,2) default 0,
  width numeric(12,2) default 200,
  height numeric(12,2) default 160,
  rotation numeric(8,4) default 0,
  color text default '#facc15',
  transparent boolean default false,
  z_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.strategies enable row level security;
alter table public.trades enable row level security;
alter table public.trade_images enable row level security;
alter table public.sticky_notes enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Accounts policies
create policy "Users can view own accounts"
  on public.accounts for select using (auth.uid() = user_id);

create policy "Users can create own accounts"
  on public.accounts for insert with check (auth.uid() = user_id);

create policy "Users can update own accounts"
  on public.accounts for update using (auth.uid() = user_id);

create policy "Users can delete own accounts"
  on public.accounts for delete using (auth.uid() = user_id);

-- Strategies policies
create policy "Users can view own strategies"
  on public.strategies for select using (auth.uid() = user_id);

create policy "Users can create own strategies"
  on public.strategies for insert with check (auth.uid() = user_id);

create policy "Users can update own strategies"
  on public.strategies for update using (auth.uid() = user_id);

create policy "Users can delete own strategies"
  on public.strategies for delete using (auth.uid() = user_id);

-- Trades policies
create policy "Users can view own trades"
  on public.trades for select using (auth.uid() = user_id);

create policy "Users can create own trades"
  on public.trades for insert with check (auth.uid() = user_id);

create policy "Users can update own trades"
  on public.trades for update using (auth.uid() = user_id);

create policy "Users can delete own trades"
  on public.trades for delete using (auth.uid() = user_id);

-- Trade images policies
create policy "Users can view own trade images"
  on public.trade_images for select using (auth.uid() = user_id);

create policy "Users can create own trade images"
  on public.trade_images for insert with check (auth.uid() = user_id);

create policy "Users can delete own trade images"
  on public.trade_images for delete using (auth.uid() = user_id);

-- Sticky notes policies
create policy "Users can view own sticky notes"
  on public.sticky_notes for select using (auth.uid() = user_id);

create policy "Users can create own sticky notes"
  on public.sticky_notes for insert with check (auth.uid() = user_id);

create policy "Users can update own sticky notes"
  on public.sticky_notes for update using (auth.uid() = user_id);

create policy "Users can delete own sticky notes"
  on public.sticky_notes for delete using (auth.uid() = user_id);

-- Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage bucket for trade images
insert into storage.buckets (id, name, public) values ('trade-images', 'trade-images', true)
  on conflict (id) do nothing;

create policy "Users can upload own trade images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'trade-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can view own trade images"
  on storage.objects for select to authenticated
  using (bucket_id = 'trade-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own trade images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'trade-images' and (storage.foldername(name))[1] = auth.uid()::text);
