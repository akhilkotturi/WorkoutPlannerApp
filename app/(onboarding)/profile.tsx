import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../../lib/supabase"; // adjust if needed

export default function ProfileOnboarding() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    const name = fullName.trim().replace(/\s+/g, " "); // ✅ normalize whitespace

    if (!name) {
      Alert.alert("Missing name", "Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session) throw new Error("Not signed in.");

      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        full_name: name,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      router.replace("/(tabs)"); // go to main app
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Quick Setup</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>
          What should we call you?
        </Text>

        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="Your name"
          placeholderTextColor={colorScheme === "dark" ? "#888" : "#999"}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={save}
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: colorScheme === "dark" ? "#2A2A2A" : "#fff",
              borderColor: colorScheme === "dark" ? "#444" : "#ccc",
            },
          ]}
        />

        <TouchableOpacity
          onPress={save}
          disabled={loading}
          style={[styles.button, { opacity: loading ? 0.6 : 1 }]}
        >
          <Text style={styles.buttonText}>{loading ? "Saving..." : "Continue"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
