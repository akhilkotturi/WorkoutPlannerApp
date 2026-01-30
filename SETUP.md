# Workout Planner App - Setup Guide

## Overview
This app generates personalized weekly workout plans using AI (Google Gemini). Users answer a short survey and receive a custom workout plan based on their fitness level, goals, and preferences.

## Features
- ✅ User authentication (sign in/sign out via Supabase)
- ✅ Multiple choice survey (5 questions)
- ✅ AI-powered workout plan generation (Gemini API - FREE tier)
- ✅ Save and view workout plans
- ✅ Dark/Light mode support

## Setup Instructions

### 1. Get Gemini API Key (FREE)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### 2. Set Up Supabase Database
You need to create a `workouts` table in your Supabase project:

```sql
create table workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  plan_data jsonb not null,
  survey_answers jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table workouts enable row level security;

-- Create policies
create policy "Users can view their own workouts"
  on workouts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own workouts"
  on workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own workouts"
  on workouts for delete
  using (auth.uid() = user_id);
```

### 3. Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
   ```

### 4. Install Dependencies & Run
```bash
npm install
npx expo start
```

## How It Works

### Survey Questions
1. **Fitness Level**: Beginner, Intermediate, Advanced
2. **Goal**: Build Muscle, Lose Weight, Get Stronger, Improve Endurance, General Fitness
3. **Days Per Week**: 3-7 days
4. **Equipment**: Full Gym, Home Gym, Bodyweight Only, Limited Equipment
5. **Duration**: 30, 45, 60, or 90+ minutes

### AI Workflow
1. User completes survey
2. Answers are sent to Gemini API with a structured prompt
3. Gemini generates a JSON workout plan with:
   - Title and description
   - Weekly schedule (as many days as requested)
   - Exercises with sets, reps, and rest times
   - Daily tips and notes
4. Plan is displayed and saved to Supabase

### Data Structure
```typescript
{
  title: "4-Day Upper/Lower Split",
  description: "Focus on strength and muscle building",
  weeklySchedule: [
    {
      day: "Monday",
      focus: "Upper Body Push",
      exercises: [
        {
          name: "Bench Press",
          sets: "4",
          reps: "8-10",
          rest: "90s"
        }
      ],
      notes: "Focus on form, progressive overload"
    }
  ]
}
```

## Free Tier Limits
- **Gemini API**: 60 requests per minute (very generous for personal use)
- **Supabase**: 500MB database, 2GB bandwidth (free tier)

## Troubleshooting

### "EXPO_PUBLIC_GEMINI_API_KEY is not set"
Make sure you created a `.env` file (not `.env.example`) with your actual API key.

### API Key Not Working
- Verify the key is correct on [Google AI Studio](https://makersuite.google.com/app/apikey)
- Make sure you're using `gemini-1.5-flash` model (free tier)
- Check for any API restrictions or quotas

### Supabase Connection Issues
- Verify your Supabase URL and anon key
- Check that the `workouts` table exists
- Verify RLS policies are set up correctly

## Future Enhancements
- Add workout tracking/progress
- Exercise video demonstrations
- Custom exercise substitutions
- Export workout plans as PDF
- Share plans with friends
- Nutrition recommendations
