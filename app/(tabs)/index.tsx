import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import WorkoutPlanDisplay from "@/components/WorkoutPlanDisplay";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { WorkoutPlan } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

type WorkoutRow = {
  id: string;
  title: string;
  created_at: string;
  plan_data: WorkoutPlan;
};

export default function HomeTab() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const mutedText = theme.icon;
  const cardBackground = colorScheme === "dark" ? "#1f2123" : "#f6f8fa";
  const insets = useSafeAreaInsets();

  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutRow | null>(null);

  const loadWorkouts = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setWorkouts([]);
        return;
      }

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error: any) {
      console.error('Error loading workouts:', error);
      Alert.alert('Error', 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [loadWorkouts])
  );

  const handleDeleteWorkout = async (id: string) => {
    // Web-compatible confirmation
    const confirmDelete = Platform.OS === 'web' 
      ? window.confirm('Are you sure you want to delete this workout plan?')
      : await new Promise((resolve) => {
          Alert.alert(
            'Delete Workout',
            'Are you sure you want to delete this workout plan?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
            ]
          );
        });

    if (!confirmDelete) return;

    try {
      console.log('Deleting workout with id:', id);
      const { error } = await supabase.from('workouts').delete().eq('id', id);
      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      console.log('Workout deleted successfully');
      setSelectedWorkout(null); // Close modal after deletion
      await loadWorkouts();
    } catch (error: any) {
      console.error('Delete failed:', error);
      const message = error?.message || 'Failed to delete workout';
      if (Platform.OS === 'web') {
        window.alert('Error: ' + message);
      } else {
        Alert.alert('Error', message);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {loading ? (
        <Text style={[styles.sub, { color: mutedText }]}>Loading...</Text>
      ) : workouts.length === 0 ? (
        <View
          style={[
            styles.empty,
            { borderColor: mutedText, backgroundColor: cardBackground },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No workouts yet</Text>
          <Text style={[styles.emptySub, { color: mutedText }]}>Go to Create to generate your first one.</Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 12, paddingTop: 12, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.card,
                { borderColor: mutedText, backgroundColor: cardBackground },
              ]}
              onPress={() => setSelectedWorkout(item)}
              onLongPress={() => handleDeleteWorkout(item.id)}
            >
              <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.cardSub, { color: mutedText }]}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </Pressable>
          )}
        />
      )}

      <Modal
        visible={!!selectedWorkout}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedWorkout(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: mutedText }]}>
            <TouchableOpacity onPress={() => setSelectedWorkout(null)}>
              <Text style={[styles.closeButton, { color: theme.tint }]}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (selectedWorkout) {
                  handleDeleteWorkout(selectedWorkout.id);
                  // Modal will close automatically after deletion confirmation
                }
              }}
            >
              <Text style={[styles.deleteButton, { color: "#ff3b30" }]}>Delete</Text>
            </TouchableOpacity>
          </View>
          {selectedWorkout && <WorkoutPlanDisplay plan={selectedWorkout.plan_data} />}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18 },
  title: { fontSize: 28, fontWeight: "800" },
  sub: { marginTop: 10 },
  empty: { marginTop: 24, padding: 16, borderWidth: 1, borderRadius: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySub: { marginTop: 6 },
  card: { padding: 14, borderWidth: 1, borderRadius: 14 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardSub: { marginTop: 6 },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
  },
  closeButton: {
    fontSize: 17,
    fontWeight: "600",
  },
  deleteButton: {
    fontSize: 17,
    fontWeight: "600",
  },
});
