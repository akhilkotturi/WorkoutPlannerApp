import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SoftPageBackground from "@/components/SoftPageBackground";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ProfileTab() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";
  const muted = theme.icon;
  const cardBg = colorScheme === "dark" ? "#262733" : "#f6f8fa";
  const logoutTextColor = colorScheme === "dark" ? theme.background : "#fff";
  const insets = useSafeAreaInsets();

  const [name, setName] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(70);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const incrementHeight = () => setHeight(prev => Math.min(250, prev + 1));
  const decrementHeight = () => setHeight(prev => Math.max(100, prev - 1));
  const incrementWeight = () => setWeight(prev => Math.min(300, prev + 0.5));
  const decrementWeight = () => setWeight(prev => Math.max(30, prev - 0.5));

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, gender, height, weight")
        .eq("id", session.user.id)
        .maybeSingle();

      setName(data?.full_name ?? "");
      setGender(data?.gender ?? "");
      setHeight(data?.height ?? 170);
      setWeight(data?.weight ?? 70);
    };

    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          gender: gender || null,
          height: height,
          weight: weight,
        })
        .eq("id", session.user.id);

      if (error) throw error;

      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#1B1C22" : "#E9B07F", paddingTop: insets.top + 20 }]}>
      <SoftPageBackground variant="profile" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
          <Pressable
            onPress={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={saving}
            style={({ pressed }) => [
              styles.editButton,
              {
                backgroundColor: isEditing ? theme.tint : "transparent",
                borderColor: theme.tint,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.editButtonText,
                { color: isEditing ? (colorScheme === "dark" ? "#000" : "#fff") : theme.tint },
              ]}
            >
              {saving ? "Saving..." : isEditing ? "Save" : "Edit"}
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.card,
            { borderColor: muted, backgroundColor: cardBg },
          ]}
        >
          <View style={styles.field}>
            <Text style={[styles.label, { color: muted }]}>Name</Text>
            <Text style={[styles.value, { color: theme.text }]}>{name || "—"}</Text>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: muted }]}>Gender</Text>
            {isEditing ? (
              <TextInput
                value={gender}
                onChangeText={setGender}
                placeholder="e.g., Male, Female, Other"
                placeholderTextColor={muted}
                style={[styles.input, { color: theme.text, borderColor: muted }]}
              />
            ) : (
              <Text style={[styles.value, { color: theme.text }]}>{gender || "—"}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: muted }]}>Height (cm)</Text>
            {isEditing ? (
              <View style={styles.inputWithStepperContainer}>
                <TextInput
                  value={height.toString()}
                  onChangeText={(val) => {
                    const num = parseFloat(val) || 0;
                    if (num >= 100 && num <= 250) setHeight(num);
                  }}
                  placeholder="e.g., 175"
                  placeholderTextColor={muted}
                  keyboardType="numeric"
                  style={[styles.inputWithStepper, { color: theme.text, borderColor: muted }]}
                />
                <View style={styles.stepperButtonsGroup}>
                  <TouchableOpacity
                    onPress={decrementHeight}
                    style={[styles.smallStepperButton, { borderColor: muted }]}
                  >
                    <Text style={[styles.smallStepperButtonText, { color: theme.text }]}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={incrementHeight}
                    style={[styles.smallStepperButton, { borderColor: muted }]}
                  >
                    <Text style={[styles.smallStepperButtonText, { color: theme.text }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={[styles.value, { color: theme.text }]}>{height ? `${height} cm` : "—"}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: muted }]}>Weight (kg)</Text>
            {isEditing ? (
              <View style={styles.inputWithStepperContainer}>
                <TextInput
                  value={weight.toString()}
                  onChangeText={(val) => {
                    const num = parseFloat(val) || 0;
                    if (num >= 30 && num <= 300) setWeight(num);
                  }}
                  placeholder="e.g., 70"
                  placeholderTextColor={muted}
                  keyboardType="decimal-pad"
                  style={[styles.inputWithStepper, { color: theme.text, borderColor: muted }]}
                />
                <View style={styles.stepperButtonsGroup}>
                  <TouchableOpacity
                    onPress={decrementWeight}
                    style={[styles.smallStepperButton, { borderColor: muted }]}
                  >
                    <Text style={[styles.smallStepperButtonText, { color: theme.text }]}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={incrementWeight}
                    style={[styles.smallStepperButton, { borderColor: muted }]}
                  >
                    <Text style={[styles.smallStepperButtonText, { color: theme.text }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={[styles.value, { color: theme.text }]}>{weight ? `${weight} kg` : "—"}</Text>
            )}
          </View>
        </View>

        {isEditing && (
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsEditing(false)}
            style={({ pressed }) => [
              styles.cancelButton,
              {
                borderColor: muted,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
          </Pressable>
        )}

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18 },
  scrollContent: { paddingBottom: 40, gap: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  title: { fontSize: 28, fontWeight: "800" },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  card: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 16 },
  field: { gap: 6 },
  label: { fontWeight: "700", fontSize: 14 },
  value: { fontSize: 18, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
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
  inputWithStepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputWithStepper: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  stepperButtonsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  smallStepperButton: {
    width: 36,
    height: 36,
    borderWidth: 1.5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallStepperButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderWidth: 1.5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  stepperValue: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  stepperValueText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
