import { useIsFocused } from "@react-navigation/native";
import { useEffect } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

type BackgroundVariant = "create" | "home" | "profile";

interface SoftPageBackgroundProps {
  variant: BackgroundVariant;
}

const variantConfig = {
  create: { size: 700, right: -200, bottom: -250, tx: 18, ty: -28 },
  home: { size: 800, right: -50, bottom: -300, tx: -6, ty: -12 },
  profile: { size: 790, right: -200, bottom: -512, tx: -20, ty: -24 },
} as const;

const defaultConfig = variantConfig.create;

const sharedAnimated = {
  size: new Animated.Value(defaultConfig.size),
  right: new Animated.Value(defaultConfig.right),
  bottom: new Animated.Value(defaultConfig.bottom),
  tx: new Animated.Value(defaultConfig.tx),
  ty: new Animated.Value(defaultConfig.ty),
};

export default function SoftPageBackground({ variant }: SoftPageBackgroundProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isFocused = useIsFocused();

  const baseBackground = isDark ? "#1B1C22" : "#E9B07F";
  const bubbleColor = isDark ? "#3B3850" : "#D7CDD6";

  const config = variantConfig[variant];

  useEffect(() => {
    if (!isFocused) return;

    Animated.parallel([
      Animated.timing(sharedAnimated.size, {
        toValue: config.size,
        duration: 420,
        useNativeDriver: false,
      }),
      Animated.timing(sharedAnimated.right, {
        toValue: config.right,
        duration: 420,
        useNativeDriver: false,
      }),
      Animated.timing(sharedAnimated.bottom, {
        toValue: config.bottom,
        duration: 420,
        useNativeDriver: false,
      }),
      Animated.spring(sharedAnimated.tx, {
        toValue: config.tx,
        friction: 10,
        tension: 70,
        useNativeDriver: false,
      }),
      Animated.spring(sharedAnimated.ty, {
        toValue: config.ty,
        friction: 10,
        tension: 70,
        useNativeDriver: false,
      }),
    ]).start();
  }, [config.bottom, config.right, config.size, config.tx, config.ty, isFocused]);

  const bubbleRadius = Animated.divide(sharedAnimated.size, 2);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: baseBackground }]} />
      {isFocused ? (
        <Animated.View
          style={[
            styles.bubble,
            {
              width: sharedAnimated.size,
              height: sharedAnimated.size,
              borderRadius: bubbleRadius,
              right: sharedAnimated.right,
              bottom: sharedAnimated.bottom,
              backgroundColor: bubbleColor,
              transform: [{ translateX: sharedAnimated.tx }, { translateY: sharedAnimated.ty }],
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.bubble,
            {
              width: config.size,
              height: config.size,
              borderRadius: config.size / 2,
              right: config.right,
              bottom: config.bottom,
              backgroundColor: bubbleColor,
              transform: [{ translateX: config.tx }, { translateY: config.ty }],
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
  },
});
