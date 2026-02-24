import { File, Paths } from "expo-file-system";
import * as LegacyFileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert, Platform, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import WorkoutPlanChat from "@/components/WorkoutPlanChat";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { WorkoutPlan } from "@/lib/gemini";
import { SurveyAnswers } from "@/components/WorkoutSurvey";

interface WorkoutPlanDisplayProps {
  plan: WorkoutPlan;
  answers?: SurveyAnswers;
}

const toWorkoutPlanText = (plan: WorkoutPlan) => {
  const lines: string[] = [];

  lines.push(`${plan.title}`);
  lines.push("");

  if (plan.description) {
    lines.push(`${plan.description}`);
    lines.push("");
  }

  lines.push("WEEKLY SCHEDULE");
  lines.push("================");
  lines.push("");

  plan.weeklySchedule.forEach((day, dayIndex) => {
    lines.push(`${dayIndex + 1}. ${day.day} — ${day.focus}`);

    day.exercises.forEach((exercise, exerciseIndex) => {
      const restPart = exercise.rest ? ` | Rest: ${exercise.rest}` : "";
      lines.push(
        `   ${exerciseIndex + 1}) ${exercise.name} | Sets: ${exercise.sets} | Reps: ${exercise.reps}${restPart}`
      );
    });

    if (day.notes) {
      lines.push(`   Notes: ${day.notes}`);
    }

    lines.push("");
  });

  return lines.join("\n");
};

const toSafeFileName = (title: string) => {
  const cleaned = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned.length > 0 ? cleaned : "workout-plan";
};

const writeShareFile = async (fileName: string, content: string) => {
  const locations = [Paths.cache, Paths.document];

  for (const location of locations) {
    try {
      const file = new File(location, fileName);
      file.create({ overwrite: true, intermediates: true });
      file.write(content, { encoding: "utf8" });
      return file.uri;
    } catch {
      continue;
    }
  }

  const legacyBaseDir = LegacyFileSystem.cacheDirectory ?? LegacyFileSystem.documentDirectory;
  if (legacyBaseDir) {
    const legacyUri = `${legacyBaseDir}${fileName}`;
    try {
      await LegacyFileSystem.writeAsStringAsync(legacyUri, content, { encoding: "utf8" });
      return legacyUri;
    } catch {
      return null;
    }
  }

  return null;
};

export default function WorkoutPlanDisplay({ plan, answers }: WorkoutPlanDisplayProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";
  const muted = isDark ? "rgba(236, 237, 238, 0.88)" : "#5f6061";
  const planCardBg = isDark ? "#262733" : "#E7DED5";
  const dayCardBg = isDark ? "rgba(255, 255, 255, 0.11)" : "rgba(255, 255, 255, 0.45)";
  const exerciseBg = isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(255, 255, 255, 0.7)";

  const handleSharePlan = async () => {
    try {
      const content = toWorkoutPlanText(plan);

      if (Platform.OS === "web") {
        if (typeof navigator !== "undefined" && navigator.share) {
          await navigator.share({
            title: plan.title,
            text: content,
          });
          return;
        }

        Alert.alert("Share not supported", "Native sharing is not available in this browser.");
        return;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert("Share unavailable", "Sharing is not available on this device.");
        return;
      }

      const fileName = `${toSafeFileName(plan.title)}.txt`;
      const fileUri = await writeShareFile(fileName, content);

      if (fileUri) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/plain",
          UTI: "public.plain-text",
          dialogTitle: "Share Workout Plan",
        });
        return;
      }

      await Share.share({
        title: plan.title,
        message: content,
      });
    } catch (error: any) {
      console.error("Share workout failed:", error);
      Alert.alert("Share Error", error?.message ?? "Failed to share workout plan.");
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.planCard, { backgroundColor: planCardBg }]}> 
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleSharePlan}
            style={[
              styles.shareButton,
              {
                borderColor: isDark ? "rgba(255,255,255,0.34)" : "rgba(17,24,28,0.18)",
                backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.5)",
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Share workout plan as text file"
          >
            <IconSymbol name="square.and.arrow.up" size={18} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>{plan.title}</Text>
          <Text style={[styles.description, { color: muted }]}>{plan.description}</Text>
        </View>

        {plan.weeklySchedule.map((day, index) => (
          <View 
            key={`${day.day}-${index}`}
            style={[styles.dayCard, { backgroundColor: dayCardBg, borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(17,24,28,0.10)" }]}
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
                  style={[styles.exerciseCard, { backgroundColor: exerciseBg, borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(17,24,28,0.10)" }]}
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
      </View>

      {answers && <WorkoutPlanChat plan={plan} answers={answers} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  planCard: {
    borderRadius: 24,
    padding: 18,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    gap: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  shareButton: {
    alignSelf: "flex-end",
    borderWidth: 1,
    borderRadius: 999,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: "96%",
  },
  dayCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  dayHeader: {
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  focusTag: {
    fontSize: 12,
    fontWeight: "700",
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    textAlign: "center",
  },
  exercisesContainer: {
    gap: 10,
  },
  exerciseCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    textAlign: "center",
  },
  exerciseDetails: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  exerciseDetail: {
    fontSize: 14,
    textAlign: "center",
  },
  notesContainer: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginTop: 4,
    alignItems: "center",
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    textAlign: "center",
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
