import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { WorkoutPlan } from "@/lib/gemini";

interface WorkoutPlanDisplayProps {
  plan: WorkoutPlan;
}

export default function WorkoutPlanDisplay({ plan }: WorkoutPlanDisplayProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const muted = theme.icon;
  const cardBg = colorScheme === "dark" ? "#1f2123" : "#f6f8fa";
  const exerciseBg = colorScheme === "dark" ? "#2a2c2e" : "#ffffff";

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{plan.title}</Text>
        <Text style={[styles.description, { color: muted }]}>{plan.description}</Text>
      </View>

      {plan.weeklySchedule.map((day, index) => (
        <View 
          key={`${day.day}-${index}`}
          style={[styles.dayCard, { backgroundColor: cardBg, borderColor: muted }]}
        >
          <View style={styles.dayHeader}>
            <Text style={[styles.dayTitle, { color: theme.text }]}>{day.day}</Text>
            <Text style={[styles.focusTag, { color: theme.tint, borderColor: theme.tint }]}>
              {day.focus}
            </Text>
          </View>

          <View style={styles.exercisesContainer}>
            {day.exercises.map((exercise, exIndex) => (
              <View 
                key={`${exercise.name}-${exIndex}`}
                style={[styles.exerciseCard, { backgroundColor: exerciseBg, borderColor: muted }]}
              >
                <Text style={[styles.exerciseName, { color: theme.text }]}>
                  {exIndex + 1}. {exercise.name}
                </Text>
                <View style={styles.exerciseDetails}>
                  <Text style={[styles.exerciseDetail, { color: muted }]}>
                    {exercise.sets} sets × {exercise.reps} reps
                  </Text>
                  {exercise.rest && (
                    <Text style={[styles.exerciseDetail, { color: muted }]}>
                      Rest: {exercise.rest}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {day.notes && (
            <View style={[styles.notesContainer, { backgroundColor: exerciseBg, borderColor: theme.tint }]}>
              <Text style={[styles.notesLabel, { color: theme.tint }]}>💡 Tips</Text>
              <Text style={[styles.notesText, { color: theme.text }]}>{day.notes}</Text>
            </View>
          )}
        </View>
      ))}
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
  header: {
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  dayCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  focusTag: {
    fontSize: 12,
    fontWeight: "600",
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  exercisesContainer: {
    gap: 10,
  },
  exerciseCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  exerciseDetails: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  exerciseDetail: {
    fontSize: 14,
  },
  notesContainer: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    gap: 6,
    marginTop: 4,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
