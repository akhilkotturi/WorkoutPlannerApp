# 🏋️ Quick Start Guide

## What I Built For You

I've created a complete workout planner app with:

### ✅ Features Implemented
1. **Survey System** - 5 multiple-choice questions about fitness preferences
2. **LLM Integration** - Generates personalized workout plans (FREE API)
3. **Beautiful UI** - Survey form and workout plan display with dark/light mode
4. **Database Integration** - Saves workout plans to Supabase
5. **Home Screen** - View all saved workouts, tap to view details, long-press to delete

### 📁 Files Created/Modified
- `lib/llm.ts` - LLM service layer
- `components/WorkoutSurvey.tsx` - Survey UI component
- `components/WorkoutPlanDisplay.tsx` - Displays generated workout plans
- `app/(tabs)/create.tsx` - Updated to use survey + AI generation
- `app/(tabs)/index.tsx` - Updated to show saved workouts
- `supabase-schema.sql` - Database schema for workouts table
- `SETUP.md` - Detailed setup instructions

## 🚀 Next Steps (DO THESE NOW)

### Step 1: Get Groq API Key (2 minutes)
1. Go to https://console.groq.com/keys
2. Sign in to your Groq account
3. Create an API key
4. Copy the key

### Step 2: Create .env File
1. Copy `.env.example` to `.env`
2. Add your LLM API key:
   ```
  EXPO_PUBLIC_GROQ_API_KEY=paste-your-key-here
   ```

### Step 3: Set Up Supabase Database
1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy everything from `supabase-schema.sql` and paste it
5. Click "Run" to create the workouts table

### Step 4: Test It!
```bash
npx expo start
```

## 🎯 How to Use the App

1. **Sign In** - Use your existing auth (already working)
2. **Go to "Create" Tab** - Answer 5 survey questions
3. **Generate Plan** - AI creates a personalized workout plan
4. **View Plans** - Go to "Home" tab to see all saved workouts
5. **View Details** - Tap a workout to see the full plan
6. **Delete** - Long-press a workout to delete it

## 💡 Survey Questions

The survey asks about:
1. Fitness level (Beginner/Intermediate/Advanced)
2. Goal (Build Muscle/Lose Weight/etc.)
3. Days per week (3-7 days)
4. Equipment available (Full Gym/Home/Bodyweight/etc.)
5. Workout duration (30-90+ minutes)

## 🎨 What the AI Generates

For each workout plan, you'll get:
- Custom title based on preferences
- Weekly schedule with the requested number of days
- Each day includes:
  - Muscle group focus
  - 5-8 exercises with sets/reps/rest times
  - Tips and notes

## 🆓 Cost Breakdown

- **LLM API (Groq)**: FREE tier available
- **Supabase**: FREE tier (500MB database, 2GB bandwidth)

## 🔧 Troubleshooting

**"API key not set" error?**
- Make sure you created `.env` (not `.env.example`)
- Restart the expo server after adding the key

**Workouts not saving?**
- Run the SQL script in Supabase to create the table
- Check Supabase dashboard → Table Editor → workouts

**JSON parsing error?**
- This is rare; retry once if the provider returns a transient response error
- Just try generating again

## 📱 What's Next? (Optional Enhancements)

Want to add more features? Here are some ideas:
- Progress tracking (mark exercises as complete)
- Exercise video links/animations
- Ability to edit generated workouts
- Export to PDF
- Share workouts with friends
- Nutrition recommendations
- Rest day suggestions

Let me know if you want help with any of these! 🚀
