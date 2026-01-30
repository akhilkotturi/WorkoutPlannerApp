-- Workout Planner Database Schema
-- Run this in your Supabase SQL Editor

-- Create workouts table
create table if not exists workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  plan_data jsonb not null,
  survey_answers jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster queries
create index if not exists workouts_user_id_idx on workouts(user_id);
create index if not exists workouts_created_at_idx on workouts(created_at desc);

-- Enable Row Level Security
alter table workouts enable row level security;

-- Drop existing policies if they exist (for re-running this script)
drop policy if exists "Users can view their own workouts" on workouts;
drop policy if exists "Users can insert their own workouts" on workouts;
drop policy if exists "Users can delete their own workouts" on workouts;

-- Create RLS policies
create policy "Users can view their own workouts"
  on workouts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own workouts"
  on workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own workouts"
  on workouts for delete
  using (auth.uid() = user_id);

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant all on workouts to anon, authenticated;
