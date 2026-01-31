import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export interface SurveyAnswers {
  fitnessLevel: string;
  goal: string;
  daysPerWeek: string;
  specificDays?: string[]; // Optional: specific days selected
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
    type: 'stepper',
    min: 1,
    max: 7,
    hasFollowUp: true,
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

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WorkoutSurvey({ onComplete, loading }: WorkoutSurveyProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const muted = theme.icon;
  const cardBg = colorScheme === "dark" ? "#1f2123" : "#f6f8fa";

  const [answers, setAnswers] = useState<Partial<SurveyAnswers>>({});
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [daysCount, setDaysCount] = useState(3);

  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Show day selector when days per week is selected
    if (questionId === 'daysPerWeek') {
      setShowDaySelector(true);
      setSelectedDays([]);
    }
  };

  const handleDaysChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(7, daysCount + delta));
    setDaysCount(newCount);
    setAnswers(prev => ({ ...prev, daysPerWeek: `${newCount} day${newCount > 1 ? 's' : ''}` }));
    setShowDaySelector(true);
    setSelectedDays([]);
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        // Extract number from "X days" format
        const maxDays = parseInt(answers.daysPerWeek?.split(' ')[0] || '0');
        if (prev.length < maxDays) {
          return [...prev, day];
        }
        return prev;
      }
    });
  };

  const isComplete = QUESTIONS.every(q => answers[q.id as keyof SurveyAnswers]) && 
                     (!showDaySelector || selectedDays.length > 0);

  const handleSubmit = () => {
    if (isComplete) {
      onComplete({ 
        ...answers as SurveyAnswers, 
        specificDays: selectedDays.length > 0 ? selectedDays : undefined 
      });
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {QUESTIONS.map((q, index) => (
        <View key={q.id}>
          <View style={[styles.questionCard, { backgroundColor: cardBg, borderColor: muted }]}>
            <Text style={[styles.questionNumber, { color: muted }]}>Question {index + 1}</Text>
            <Text style={[styles.questionText, { color: theme.text }]}>{q.question}</Text>
            
            {q.type === 'stepper' ? (
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  onPress={() => handleDaysChange(-1)}
                  style={[styles.stepperButton, { borderColor: muted }]}
                  disabled={daysCount <= (q.min || 1)}
                >
                  <Text style={[styles.stepperButtonText, { color: theme.text }]}>-</Text>
                </TouchableOpacity>
                
                <View style={[styles.stepperValue, { backgroundColor: theme.tint }]}>
                  <Text style={[styles.stepperValueText, { color: colorScheme === "dark" ? "#000" : "#fff" }]}>
                    {daysCount} day{daysCount > 1 ? 's' : ''}
                  </Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => handleDaysChange(1)}
                  style={[styles.stepperButton, { borderColor: muted }]}
                  disabled={daysCount >= (q.max || 7)}
                >
                  <Text style={[styles.stepperButtonText, { color: theme.text }]}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.optionsContainer}>
                {q.options?.map((option) => {
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
            )}
          </View>

          {/* Show day selector right after daysPerWeek question */}
          {q.id === 'daysPerWeek' && showDaySelector && answers.daysPerWeek && (
            <View style={[styles.questionCard, { backgroundColor: cardBg, borderColor: muted, marginTop: 12 }]}>
              <Text style={[styles.questionNumber, { color: muted }]}>Optional</Text>
              <Text style={[styles.questionText, { color: theme.text }]}>
                Which specific days do you want to work out?
              </Text>
              <Text style={[styles.dayHint, { color: muted }]}>
                Select up to {answers.daysPerWeek?.split(' ')[0]} days (or skip to let us choose)
              </Text>
              
              <View style={styles.daysGrid}>
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  const maxDays = parseInt(answers.daysPerWeek?.split(' ')[0] || '0');
                  const isDisabled = !isSelected && selectedDays.length >= maxDays;
                  
                  return (
                    <TouchableOpacity
                      key={day}
                      onPress={() => toggleDay(day)}
                      disabled={isDisabled}
                      style={[
                        styles.dayButton,
                        { borderColor: muted },
                        isSelected && { 
                          backgroundColor: theme.tint, 
                          borderColor: theme.tint 
                        },
                        isDisabled && { opacity: 0.4 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          { color: theme.text },
                          isSelected && { 
                            color: colorScheme === "dark" ? "#000" : "#fff",
                            fontWeight: "700" 
                          },
                        ]}
                      >
                        {day.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
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
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  stepperButton: {
    width: 50,
    height: 50,
    borderWidth: 1.5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  stepperValue: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  stepperValueText: {
    fontSize: 17,
    fontWeight: '700',
  },  dayHint: {
    fontSize: 13,
    fontStyle: "italic",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  dayButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 70,
    alignItems: "center",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
  },});
