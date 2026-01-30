import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ProfileTab() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const muted = theme.icon;
  const cardBg = colorScheme === "dark" ? "#1f2123" : "#f6f8fa";
  const logoutTextColor = colorScheme === "dark" ? theme.background : "#fff";

  const [name, setName] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .maybeSingle();

      setName(data?.full_name ?? "");
    };

    load();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Profile</Text>

      <View
        style={[
          styles.card,
          { borderColor: muted, backgroundColor: cardBg },
        ]}
      >
        <Text style={[styles.label, { color: muted }]}>Name</Text>
        <Text style={[styles.value, { color: theme.text }]}>{name || "—"}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => supabase.auth.signOut()}
        style={({ pressed }) => [
          styles.logout,
          {
            backgroundColor: theme.tint,
            borderColor: theme.tint,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={[styles.logoutText, { color: logoutTextColor }]}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, gap: 14 },
  title: { fontSize: 28, fontWeight: "800" },
  card: { borderWidth: 1, borderRadius: 12, padding: 14 },
  label: { fontWeight: "700" },
  value: { marginTop: 6, fontSize: 18, fontWeight: "700" },
  logout: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontWeight: "700",
    fontSize: 16,
  },
});
