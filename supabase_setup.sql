-- Copy and Run this in your Supabase SQL Editor

-- 1. Create a table for public profiles linked to auth.users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Turn on Row Level Security (RLS) is highly recommended
alter table public.profiles enable row level security;

-- 3. Create policies to allow users to manage their own data
-- Allow users to view their own profile
create policy "Users can view their own profile." 
  on public.profiles for select 
  using (auth.uid() = id);

-- Allow users to insert their own profile
create policy "Users can insert their own profile." 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update their own profile." 
  on public.profiles for update 
  using (auth.uid() = id);

-- Optional: Allow public to view basic info (uncomment if social features needed)
-- create policy "Public profiles are viewable by everyone." 
--   on public.profiles for select 
--   using ( true );
