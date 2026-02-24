import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { askWorkoutQuestion, WorkoutChatMessage, WorkoutPlan } from "@/lib/gemini";
import { SurveyAnswers } from "@/components/WorkoutSurvey";

interface WorkoutPlanChatProps {
  plan: WorkoutPlan;
  answers: SurveyAnswers;
}

export default function WorkoutPlanChat({ plan, answers }: WorkoutPlanChatProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<WorkoutChatMessage[]>([]);

  const initialMessage = useMemo(
    () =>
      `I’m your coach for "${plan.title}". Ask anything about this exact plan—progression, swaps, scheduling, intensity, recovery, or form cues.`,
    [plan.title]
  );

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const nextMessages: WorkoutChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const response = await askWorkoutQuestion({
      plan,
      answers,
      question,
      history: nextMessages,
    });

    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const cardBg = isDark ? "#262733" : "#E7DED5";
  const inputBg = isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.65)";

  return (
    <View style={[styles.container, { backgroundColor: cardBg, borderColor: isDark ? "rgba(255,255,255,0.16)" : "rgba(17,24,28,0.12)" }]}> 
      <Text style={[styles.title, { color: theme.text }]}>Workout Coach Chat</Text>
      <Text style={[styles.subtitle, { color: theme.icon }]}>{initialMessage}</Text>

      <View style={styles.messagesContainer}>
        {messages.length === 0 && (
          <Text style={[styles.emptyState, { color: theme.icon }]}>Try: “How should I progress this next week?”</Text>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <View
              key={`${message.role}-${index}`}
              style={[
                styles.bubble,
                isUser ? styles.userBubble : styles.assistantBubble,
                {
                  backgroundColor: isUser
                    ? theme.tint
                    : isDark
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.8)",
                },
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  {
                    color: isUser ? (isDark ? "#000" : "#fff") : theme.text,
                  },
                ]}
              >
                {message.content}
              </Text>
            </View>
          );
        })}

        {loading && (
          <View style={[styles.loadingRow, { borderColor: isDark ? "rgba(255,255,255,0.16)" : "rgba(17,24,28,0.12)" }]}>
            <ActivityIndicator size="small" color={theme.tint} />
            <Text style={[styles.loadingText, { color: theme.icon }]}>Thinking about your plan...</Text>
          </View>
        )}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about this workout plan"
          placeholderTextColor={theme.icon}
          multiline
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(17,24,28,0.16)",
              backgroundColor: inputBg,
            },
          ]}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={loading || !input.trim()}
          style={[styles.sendButton, { backgroundColor: theme.tint }, (!input.trim() || loading) && { opacity: 0.5 }]}
        >
          <Text style={[styles.sendButtonText, { color: isDark ? "#000" : "#fff" }]}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  messagesContainer: {
    gap: 10,
  },
  emptyState: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  bubble: {
    borderRadius: 12,
    padding: 10,
    maxWidth: "90%",
  },
  userBubble: {
    alignSelf: "flex-end",
  },
  assistantBubble: {
    alignSelf: "flex-start",
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingRow: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  inputRow: {
    gap: 8,
  },
  input: {
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: "top",
  },
  sendButton: {
    alignSelf: "flex-end",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
