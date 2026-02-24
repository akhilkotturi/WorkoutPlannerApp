// AI Service for Workout Plan Generation
// Currently using: GROQ
// Easy to switch: just change the imports and API client below
// Supports: Groq, Gemini, OpenAI, or any other LLM

// Originally used OpenAI, then switched to Gemini API, but using Groq due to some issues.
import Groq from 'groq-sdk';

const getApiKey = () => {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!key) {
    throw new Error('EXPO_PUBLIC_GROQ_API_KEY is not set. Get a free key from https://console.groq.com/keys');
  }
  return key;
};

let groqClient: Groq | null = null;

const getAIClient = () => {
  if (!groqClient) {
    groqClient = new Groq({ 
      apiKey: getApiKey(),
      dangerouslyAllowBrowser: true // Required for React Native/Expo
    });
  }
  return groqClient;
};

export interface SurveyAnswers {
  fitnessLevel: string;
  goal: string;
  daysPerWeek: string;
  equipment: string;
  duration: string;
}

export interface WorkoutPlan {
  title: string;
  description: string;
  weeklySchedule: DayPlan[];
}

export interface DayPlan {
  day: string;
  focus: string;
  exercises: Exercise[];
  notes?: string;
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest?: string;
}

export interface WorkoutChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Temporary mock function for testing while we debug the API
function generateMockWorkoutPlan(answers: SurveyAnswers): WorkoutPlan {
  const days = parseInt(answers.daysPerWeek.split(' ')[0]);
  const schedule: DayPlan[] = [];
  
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const focuses = ['Upper Body Push', 'Lower Body', 'Upper Body Pull', 'Full Body', 'Core & Cardio'];
  
  for (let i = 0; i < days; i++) {
    schedule.push({
      day: dayNames[i],
      focus: focuses[i % focuses.length],
      exercises: [
        { name: 'Warm-up: 5-10 min cardio', sets: '1', reps: '5-10 min', rest: '-' },
        { name: 'Push-ups', sets: '3', reps: '10-15', rest: '60s' },
        { name: 'Squats', sets: '3', reps: '12-15', rest: '60s' },
        { name: 'Plank', sets: '3', reps: '30-60s', rest: '45s' },
      ],
      notes: `Adjust intensity based on ${answers.fitnessLevel} level. Focus on proper form.`
    });
  }
  
  return {
    title: `${days}-Day ${answers.goal} Plan`,
    description: `Personalized ${answers.fitnessLevel} workout plan focusing on ${answers.goal.toLowerCase()} with ${answers.equipment.toLowerCase()}.`,
    weeklySchedule: schedule
  };
}

export async function generateWorkoutPlan(answers: SurveyAnswers): Promise<WorkoutPlan> {
  try {
    const client = getAIClient();
    
    const prompt = `You are a professional fitness trainer. Create a detailed weekly workout plan based on these preferences:

Fitness Level: ${answers.fitnessLevel}
Goal: ${answers.goal}
Days per Week: ${answers.daysPerWeek}
Available Equipment: ${answers.equipment}
Workout Duration: ${answers.duration}

Generate a comprehensive workout plan in JSON format with this exact structure:
{
  "title": "Descriptive plan title",
  "description": "Brief overview of the plan",
  "weeklySchedule": [
    {
      "day": "Monday",
      "focus": "e.g., Upper Body Push",
      "exercises": [
        {
          "name": "Exercise name",
          "sets": "3-4",
          "reps": "8-12",
          "rest": "60-90s"
        }
      ],
      "notes": "Optional tips for the day"
    }
  ]
}
Include ${answers.daysPerWeek} workout days. Make exercises specific to the equipment available and appropriate for the fitness level. Include warm-up suggestions in notes where relevant. Return ONLY valid JSON, no markdown formatting.`;

    const completion = await client.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile', 
      temperature: 0.7,
      max_tokens: 2000,
    });

    const text = completion.choices[0]?.message?.content || '';
    
    // Clean up the response - remove markdown code blocks if present
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const plan = JSON.parse(jsonText);
    console.log('Successfully generated workout plan');
    return plan;
    
  } catch (error: any) {
    console.error('AI API error:', error);
    console.warn('⚠️ Using temporary mock workout plan due to API error');
    return generateMockWorkoutPlan(answers);
  }
}

export async function askWorkoutQuestion(params: {
  plan: WorkoutPlan;
  answers: SurveyAnswers;
  question: string;
  history?: WorkoutChatMessage[];
}): Promise<string> {
  const { plan, answers, question, history = [] } = params;

  try {
    const client = getAIClient();

    const profileContext = [
      `Fitness Level: ${answers.fitnessLevel}`,
      `Primary Goal: ${answers.goal}`,
      `Days Per Week: ${answers.daysPerWeek}`,
      `Equipment: ${answers.equipment}`,
      `Session Duration: ${answers.duration}`,
    ].join("\n");

    const latestHistory = history.slice(-8);

    const systemPrompt = `You are a dedicated workout coach for one specific user.

Your job:
- Answer questions ONLY using the user's workout plan and profile context.
- Be highly personalized: reference specific days, exercises, sets/reps/rest, and progression ideas from the given plan.
- Keep answers practical and concise (2-5 short paragraphs or bullet points).
- If asked for substitutions, keep the same training intent and equipment constraints.
- If nutrition/medical/injury advice is requested beyond scope, provide safe general guidance and recommend a professional when needed.

Never invent details that conflict with the plan.`;

    const userPrompt = [
      "USER PROFILE:",
      profileContext,
      "",
      "WORKOUT PLAN JSON:",
      JSON.stringify(plan),
      "",
      "USER QUESTION:",
      question,
      "",
      "Respond as their personal coach and base your answer on this exact plan.",
    ].join("\n");

    const completion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...latestHistory.map((message) => ({ role: message.role, content: message.content })),
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) {
      throw new Error('No response from AI');
    }

    return response;
  } catch (error) {
    console.error('Workout chat error:', error);
    return `I can still help based on your plan. Since your goal is ${answers.goal.toLowerCase()} and you're training ${answers.daysPerWeek.toLowerCase()}, focus on progressive overload week to week and keep exercise form strict. Ask me something specific like "How should I progress Day 2?" or "What can I swap for squats with my equipment?".`;
  }
}
