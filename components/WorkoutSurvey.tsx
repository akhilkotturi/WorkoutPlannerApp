import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export interface SurveyAnswers {
  fitnessLevel: string;
  goal: string;
  daysPerWeek: string;
  equipment: string;
  duration: string;
}

interface WorkoutSurveyProps {
  onComplete: (answers: SurveyAnswers) => void;
  loading?: boolean;
}

const QUESTIONS = [
  {
    id: 'fitnessLevel',
    question: 'What is your current fitness level?',
    options: ['Beginner', 'Intermediate', 'Advanced'],
  },
  {
    id: 'goal',
    question: 'What is your primary fitness goal?',
    options: ['Build Muscle', 'Lose Weight', 'Get Stronger', 'Improve Endurance', 'General Fitness'],
  },
  {
    id: 'daysPerWeek',
    question: 'How many days per week can you work out?',
    options: ['3 days', '4 days', '5 days', '6 days', '7 days'],
  },
  {
    id: 'equipment',
    question: 'What equipment do you have access to?',
    options: ['Full Gym', 'Home Gym (Dumbbells/Bands)', 'Bodyweight Only', 'Limited Equipment'],
  },
  {
    id: 'duration',
    question: 'How long can each workout session be?',
    options: ['30 minutes', '45 minutes', '60 minutes', '90+ minutes'],
  },
];

export default function WorkoutSurvey({ onComplete, loading }: WorkoutSurveyProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const muted = theme.icon;
  const cardBg = colorScheme === "dark" ? "#1f2123" : "#f6f8fa";

  const [answers, setAnswers] = useState<Partial<SurveyAnswers>>({});

  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const isComplete = QUESTIONS.every(q => answers[q.id as keyof SurveyAnswers]);

  const handleSubmit = () => {
    if (isComplete) {
      onComplete(answers as SurveyAnswers);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {QUESTIONS.map((q, index) => (
        <View key={q.id} style={[styles.questionCard, { backgroundColor: cardBg, borderColor: muted }]}>
          <Text style={[styles.questionNumber, { color: muted }]}>Question {index + 1}</Text>
          <Text style={[styles.questionText, { color: theme.text }]}>{q.question}</Text>
          
          <View style={styles.optionsContainer}>
            {q.options.map((option) => {
              const isSelected = answers[q.id as keyof SurveyAnswers] === option;
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => selectAnswer(q.id, option)}
                  style={[
                    styles.option,
                    { borderColor: muted },
                    isSelected && { 
                      backgroundColor: theme.tint, 
                      borderColor: theme.tint 
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.text },
                      isSelected && { 
                        color: colorScheme === "dark" ? "#000" : "#fff",
                        fontWeight: "700" 
                      },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!isComplete || loading}
        style={[
          styles.submitButton,
          { backgroundColor: theme.tint },
          (!isComplete || loading) && { opacity: 0.5 },
        ]}
      >
        <Text style={[styles.submitButtonText, { color: colorScheme === "dark" ? "#000" : "#fff" }]}>
          {loading ? "Generating Your Plan..." : "Generate Workout Plan"}
        </Text>
      </TouchableOpacity>

      {!isComplete && (
        <Text style={[styles.hint, { color: muted }]}>
          Please answer all questions to continue
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
    gap: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  questionCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  questionText: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 8,
    marginTop: 4,
  },
  option: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    backgroundColor: "transparent",
  },
  optionText: {
    fontSize: 15,
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "700",
  },
  hint: {
    textAlign: "center",
    fontSize: 13,
    marginTop: -8,
  },
});
