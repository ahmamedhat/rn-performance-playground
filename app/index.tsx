// import { Dimensions, Image, ScrollView, Text, View } from "react-native";
// const chairSrc = require("../assets/images/chair.png");

// export default function Index() {
//   const chair = {
//     src: chairSrc,
//     width: 1024,
//     height: 1467,
//   };

//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "black",
//       }}
//     >
//       <ScrollView>
//         {Array.from({ length: 10000 }).map((_, index) => (
//           <View key={index}>
//             <View
//               key={index}
//               style={{
//                 height: Dimensions.get("screen").height - 330,
//                 width: "100%",
//                 marginBottom: 2,
//               }}
//             >
//               <Image
//                 source={chair.src}
//                 style={{
//                   aspectRatio: chair.width / chair.height,
//                   height: "100%",
//                   width: "100%",
//                   objectFit: "contain",
//                 }}
//               />
//             </View>
//             <Text style={{ color: "white" }}>Index: {index}</Text>
//           </View>
//         ))}
//       </ScrollView>
//     </View>
//   );
// }

import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from "react-native";

// Particle interface for additional animation effects
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  angle: number;
  color: string;
  // Add animated values for React Native
  animValue: Animated.Value;
}

export default function LynxDemoRN() {
  // Simple state for testing interactivity
  const [count, setCount] = useState(0);
  const [animationItems, setAnimationItems] = useState<
    {
      id: number;
      top: number;
      opacity: number;
      fontSize: number;
      animValue: Animated.Value;
    }[]
  >([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [listItems, setListItems] = useState<string[]>([]);
  const [lastAnimId, setLastAnimId] = useState(0);
  const [bgColorIntensity] = useState(new Animated.Value(0));

  // Generate a random color
  const getRandomColor = () => {
    const colors = ["#4a90e2", "#e24a4a", "#4ae24a", "#e2e24a", "#e24ae2"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Create multiple particles
  const createParticles = (count: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const id = lastAnimId + i;
      const animValue = new Animated.Value(0);

      // Start particle animation
      Animated.timing(animValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start();

      newParticles.push({
        id,
        x: 50 + Math.random() * 30 - 15, // centered with some variation
        y: 50,
        size: 5 + Math.random() * 10,
        speed: 1 + Math.random() * 3,
        opacity: 1,
        angle: Math.random() * 360,
        color: getRandomColor(),
        animValue,
      });
    }
    return newParticles;
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
    setCount(count + 1);

    // Add new animation item for the +1 text
    const newAnimId = lastAnimId + 1;
    setLastAnimId(newAnimId + 20); // Reserve IDs for particles

    // Create new animated value for +1 text
    const animValue = new Animated.Value(0);

    // Start the animation
    Animated.timing(animValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    // Add floating +1 animation
    setAnimationItems((prev) => [
      ...prev,
      { id: newAnimId, top: 0, opacity: 1, fontSize: 40, animValue },
    ]);

    // Add particles
    setParticles((prev) => [...prev, ...createParticles(20)]);

    // Increment list by adding a new item at the top with formatted time
    setListItems((prev) => [
      `Count: ${count + 1} added at ${formatTime()}`,
      ...prev,
    ]);

    // Flash the background color
    Animated.sequence([
      Animated.timing(bgColorIntensity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(bgColorIntensity, {
        toValue: 0,
        duration: 850,
        useNativeDriver: false,
      }),
    ]).start();
  }, [count, lastAnimId, bgColorIntensity]);

  // Animation effect for the +1 texts
  useEffect(() => {
    if (animationItems.length === 0) return;

    const timerId = setTimeout(() => {
      setAnimationItems((prevItems) => {
        // Update each animation's position and opacity
        const updatedItems = prevItems.map((item) => ({
          ...item,
          top: item.top - 3, // Move upward
          opacity: Math.max(0, item.opacity - 0.05), // Fade out
          fontSize: item.fontSize - 2, // Decrease font size
        }));

        // Remove finished animations (fully transparent)
        return updatedItems.filter((item) => item.opacity > 0);
      });
    }, 50);

    return () => clearTimeout(timerId);
  }, [animationItems]);

  // Animation effect for particles
  useEffect(() => {
    if (particles.length === 0) return;

    const timerId = setTimeout(() => {
      setParticles((prevParticles) => {
        // Update each particle's position and opacity
        const updatedParticles = prevParticles.map((particle) => ({
          ...particle,
          x:
            particle.x +
            Math.cos(particle.angle * (Math.PI / 180)) * particle.speed,
          y:
            particle.y +
            Math.sin(particle.angle * (Math.PI / 180)) * particle.speed,
          size: Math.max(0, particle.size - 0.2),
          opacity: Math.max(0, particle.opacity - 0.02),
        }));

        // Remove finished particles
        return updatedParticles.filter((particle) => particle.opacity > 0);
      });
    }, 30); // Faster update for smoother particle movement

    return () => clearTimeout(timerId);
  }, [particles]);

  // Calculate background color based on intensity (for animation)
  const backgroundColor = bgColorIntensity.interpolate({
    inputRange: [0, 1],
    outputRange: ["#333333", "rgb(151, 101, 251)"],
  });

  // Render a list item
  const renderItem = ({ item, index }: { item: string; index: number }) => (
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
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentArea}>
        <Text style={styles.titleText}>Lynx.js Demo in React Native</Text>

        <Animated.View style={[styles.counterContainer, { backgroundColor }]}>
          <View style={styles.counterRelativeContainer}>
            <Text style={styles.counterValue}>Count: {count}</Text>

            {/* Animation elements that stack */}
            {animationItems.map((item) => (
              <Animated.View
                key={`anim-${item.id}`}
                style={[
                  styles.animatedTextContainer,
                  {
                    top: item.animValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -50],
                    }),
                    opacity: item.animValue.interpolate({
                      inputRange: [0, 0.7, 1],
                      outputRange: [1, 0.7, 0],
                    }),
                  },
                ]}
              >
                <Animated.Text
                  style={[
                    styles.animatedText,
                    {
                      fontSize: item.animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 20],
                      }),
                    },
                  ]}
                >
                  +1
                </Animated.Text>
              </Animated.View>
            ))}

            {/* Particle effects */}
            {particles.map((particle) => (
              <Animated.View
                key={`particle-${particle.id}`}
                style={[
                  styles.particle,
                  {
                    width: particle.animValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [particle.size, 0],
                    }),
                    height: particle.animValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [particle.size, 0],
                    }),
                    backgroundColor: particle.color,
                    borderRadius: 50,
                    opacity: particle.animValue.interpolate({
                      inputRange: [0, 0.7, 1],
                      outputRange: [1, 0.5, 0],
                    }),
                    left: particle.animValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        `${particle.x}%`,
                        `${particle.x + Math.cos(particle.angle * (Math.PI / 180)) * 50}%`,
                      ],
                    }),
                    top: particle.animValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        `${particle.y}%`,
                        `${particle.y + Math.sin(particle.angle * (Math.PI / 180)) * 50}%`,
                      ],
                    }),
                  },
                ]}
              />
            ))}
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
            keyExtractor={(_, index) => `item-${index}`}
            style={styles.list}
            showsVerticalScrollIndicator={true}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={{ paddingVertical: 6 }}
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
