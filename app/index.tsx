import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolateColor,
} from "react-native-reanimated";

// Simplified interfaces - avoiding shared values completely
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  angle: number;
  color: string;
  // Simple animation progress - normal JS value
  progress: number;
}

export default function LynxDemoRN() {
  // Simple state for testing interactivity
  const [count, setCount] = useState(0);
  const [animationItems, setAnimationItems] = useState<
    { id: number; progress: number }[]
  >([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [listItems, setListItems] = useState<string[]>([]);
  const [lastAnimId, setLastAnimId] = useState(0);

  // Single animation progress value that we'll update based on current state
  const animationProgress = useSharedValue(0);
  const bgColorProgress = useSharedValue(0);

  // Generate a random color
  const getRandomColor = () => {
    const colors = ["#4a90e2", "#e24a4a", "#4ae24a", "#e2e24a", "#e24ae2"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Format time in 24-hour format with seconds like "HH:MM:SS"
  const formatTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  // Simple increment function with animation
  const increment = useCallback(() => {
    const nextCount = count + 1;
    setCount(nextCount);

    // Add new animation item for the +1 text
    const newAnimId = lastAnimId + 1;
    setLastAnimId(newAnimId + 10);

    // Add floating +1 animation
    setAnimationItems((prev) => [...prev, { id: newAnimId, progress: 0 }]);

    // Create new particles with 0 progress
    const newParticles: Particle[] = [];
    for (let i = 0; i < 10; i++) {
      newParticles.push({
        id: newAnimId + i + 1,
        x: 50 + Math.random() * 30 - 15,
        y: 50,
        size: 5 + Math.random() * 10,
        angle: Math.random() * 360,
        color: getRandomColor(),
        progress: 0,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);

    // Increment list by adding a new item at the top with formatted time
    setListItems((prev) => [
      `Count: ${nextCount} added at ${formatTime()}`,
      ...prev,
    ]);

    // Flash the background color
    bgColorProgress.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 850 })
    );

    // Trigger animation
    animationProgress.value = 0;
    animationProgress.value = withTiming(1, { duration: 1500 });
  }, [count, lastAnimId, bgColorProgress, animationProgress]);

  // Update animations based on animationProgress
  useEffect(() => {
    // This effect handles animation updates using JS timers
    // instead of Reanimated's worklet functions
    const animationFrame = () => {
      // Update animation items
      setAnimationItems((prev) => {
        if (prev.length === 0) return prev;

        return prev
          .map((item) => ({
            ...item,
            progress: Math.min(item.progress + 0.02, 1),
          }))
          .filter((item) => item.progress < 1);
      });

      // Update particles
      setParticles((prev) => {
        if (prev.length === 0) return prev;

        return prev
          .map((particle) => ({
            ...particle,
            progress: Math.min(particle.progress + 0.01, 1),
          }))
          .filter((particle) => particle.progress < 1);
      });
    };

    // Start animation timer if we have items to animate
    if (animationItems.length > 0 || particles.length > 0) {
      const timerId = setInterval(animationFrame, 16);
      return () => clearInterval(timerId);
    }
  }, [animationItems, particles]);

  // Background color animated style
  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        bgColorProgress.value,
        [0, 1],
        ["#333333", "rgb(151, 101, 251)"]
      ),
    };
  });

  // Render a list item (memoized for better performance)
  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <View
        style={[
          styles.listItem,
          {
            borderWidth: 1,
            borderColor: index === 0 ? "#e24a4a" : "#4a90e2",
            borderStyle: "solid",
            height: 56, // Fixed height to match original
          },
        ]}
      >
        <Text
          style={[
            styles.listItemText,
            {
              color: index === 0 ? "#e24a4a" : "white",
              fontSize: index === 0 ? 18 : 16,
              fontWeight: index === 0 ? "bold" : "normal",
              textAlign: "left",
            },
          ]}
        >
          {item}
        </Text>
      </View>
    ),
    []
  );

  // Memoized keyExtractor
  const keyExtractor = useCallback(
    (_: string, index: number) => `item-${index}`,
    []
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentArea}>
        <Text style={styles.titleText}>Lynx.js Demo in React Native</Text>

        <Animated.View
          style={[styles.counterContainer, animatedBackgroundStyle]}
        >
          <View style={styles.counterRelativeContainer}>
            <Text style={styles.counterValue}>Count: {count}</Text>

            {/* Animation elements that stack */}
            {animationItems.map((item) => {
              // Calculate styles directly from current progress
              const top = -50 * item.progress;
              const opacity =
                item.progress < 0.7
                  ? 1 - (item.progress / 0.7) * 0.3
                  : 1 - item.progress;
              const fontSize = 40 - 20 * item.progress;

              return (
                <Animated.View
                  key={`anim-${item.id}`}
                  style={[
                    styles.animatedTextContainer,
                    {
                      top,
                      opacity,
                    },
                  ]}
                >
                  <Animated.Text style={[styles.animatedText, { fontSize }]}>
                    +1
                  </Animated.Text>
                </Animated.View>
              );
            })}

            {/* Particle effects */}
            {particles.map((particle) => {
              // Calculate particle position and size based on progress
              const size = particle.size * (1 - particle.progress);
              const xOffset =
                Math.cos(particle.angle * (Math.PI / 180)) *
                50 *
                particle.progress;
              const yOffset =
                Math.sin(particle.angle * (Math.PI / 180)) *
                50 *
                particle.progress;
              const opacity =
                particle.progress < 0.7
                  ? 1 - (particle.progress / 0.7) * 0.5
                  : 0.5 - (particle.progress - 0.7) * (0.5 / 0.3);

              return (
                <View
                  key={`particle-${particle.id}`}
                  style={[
                    styles.particle,
                    {
                      width: size,
                      height: size,
                      backgroundColor: particle.color,
                      borderRadius: 50,
                      opacity,
                      left: `${particle.x + xOffset}%`,
                      top: `${particle.y + yOffset}%`,
                    },
                  ]}
                />
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={increment}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Increment</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Enhanced list that grows with each increment */}
        <View style={styles.listContainer}>
          <FlatList
            data={listItems}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            style={styles.list}
            showsVerticalScrollIndicator={true}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={{ paddingVertical: 6 }}
            maxToRenderPerBatch={5}
            windowSize={3}
            removeClippedSubviews={true}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#222222",
    paddingTop: 69,
  },
  contentArea: {
    width: "100%",
    height: "85%",
    flexDirection: "column",
    alignItems: "center",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2196f3",
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  counterContainer: {
    backgroundColor: "#333333",
    padding: 15,
    margin: 10,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
    overflow: "hidden",
  },
  counterRelativeContainer: {
    position: "relative",
    width: "100%",
    alignItems: "center",
    height: 50,
    marginBottom: 10,
  },
  counterValue: {
    color: "#ffffff",
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  animatedTextContainer: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  animatedText: {
    color: "#4a90e2",
    fontWeight: "bold",
    textAlign: "center",
  },
  particle: {
    position: "absolute",
  },
  button: {
    backgroundColor: "#4a90e2",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  listContainer: {
    width: "100%",
    height: "60%",
    marginTop: 34,
  },
  list: {
    width: "100%",
    height: 370, // Exact height to show 5 items
  },
  listItem: {
    backgroundColor: "#333333",
    padding: 15,
    margin: 8,
    borderRadius: 5,
  },
  listItemText: {
    color: "#ffffff",
    fontSize: 16,
  },
});
