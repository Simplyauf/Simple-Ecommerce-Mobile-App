import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FONTS, COLORS } from "../theme/fonts";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

interface CarouselItem {
  id: string;
  image: string;
  title: string;
  subtitle: string;
}

const carouselData: CarouselItem[] = [
  {
    id: "1",
    image: "https:
    title: "New Arrivals",
    subtitle: "Check out our latest products",
  },
  {
    id: "2",
    image: "https:
    title: "Special Offers",
    subtitle: "Up to 50% off on selected items",
  },
  {
    id: "3",
    image: "https:
    title: "Premium Products",
    subtitle: "Discover our premium collection",
  },
];

export const HeroCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const timer = setInterval(() => {
      if (activeIndex < carouselData.length - 1) {
        scrollViewRef.current?.scrollTo({
          x: width * (activeIndex + 1),
          animated: true,
        });
      } else {
        scrollViewRef.current?.scrollTo({
          x: 0,
          animated: true,
        });
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [activeIndex]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        setActiveIndex(newIndex);
      },
    }
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {carouselData.map((item, index) => (
          <View key={item.id} style={styles.slide}>
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Shop")}
                style={styles.button}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Shop Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {carouselData.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: scrollX.interpolate({
                  inputRange: [
                    (index - 1) * width,
                    index * width,
                    (index + 1) * width,
                  ],
                  outputRange: [8, 16, 8],
                  extrapolate: "clamp",
                }),
                opacity: scrollX.interpolate({
                  inputRange: [
                    (index - 1) * width,
                    index * width,
                    (index + 1) * width,
                  ],
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: "clamp",
                }),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 400,
    position: "relative",
    backgroundColor: COLORS.BACKGROUND,
  },
  slide: {
    width,
    height: 400,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2, 
  },
  contentContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontFamily: "ClashDisplay-Bold",
    color: COLORS.WHITE,
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: FONTS.CLASH_DISPLAY_REGULAR,
    color: COLORS.WHITE,
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: COLORS.WHITE,

    fontSize: 16,
    fontFamily: FONTS.CLASH_DISPLAY_MEDIUM,
    fontWeight: "600",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    width: "100%",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 4,
  },
});
