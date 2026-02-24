import { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import SoftPageBackground from "@/components/SoftPageBackground";
import WorkoutPlanDisplay from "@/components/WorkoutPlanDisplay";
import WorkoutSurvey, { SurveyAnswers } from "@/components/WorkoutSurvey";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { generateWorkoutPlan, WorkoutPlan } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

export default function CreateTab() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [loading, setLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [latestAnswers, setLatestAnswers] = useState<SurveyAnswers | null>(null);

  const handleSurveyComplete = async (answers: SurveyAnswers) => {
    setLoading(true);
    try {
      // Generate workout plan using Gemini
      const plan = await generateWorkoutPlan(answers);
      setWorkoutPlan(plan);
      setLatestAnswers(answers);

      // Optional: Save to Supabase for future reference
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('workouts').insert({
          user_id: session.user.id,
          title: plan.title,
          plan_data: plan,
          survey_answers: answers,
        });
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to generate workout plan");
      console.error("Workout generation error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#2B211A" : "#E9B07F" }]}>
      <SoftPageBackground variant="create" />
      {!workoutPlan ? (
        <WorkoutSurvey onComplete={handleSurveyComplete} loading={loading} />
      ) : (
        <View style={styles.contentContainer}>
          <View style={[styles.header, { borderBottomColor: isDark ? "rgba(236, 237, 238, 0.24)" : "rgba(17, 24, 28, 0.18)" }]}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Your Plan</Text>
            <TouchableOpacity
              onPress={() => {
                setWorkoutPlan(null);
                setLatestAnswers(null);
              }}
            >
              <Text style={[styles.newPlanButton, { color: theme.tint }]}>Create Another</Text>
            </TouchableOpacity>
          </View>
          <WorkoutPlanDisplay plan={workoutPlan} answers={latestAnswers ?? undefined} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  contentContainer: {
    flex: 1,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    zIndex: 3,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  newPlanButton: {
    fontSize: 16,
    fontWeight: '700',
  },
});
