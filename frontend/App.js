import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Text, TextInput } from "react-native";
import * as Font from "expo-font";

import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { AddProductScreen } from "./src/screens/AddProductScreen";
import { ProductDetailsScreen } from "./src/screens/ProductDetailsScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { baseTextStyle } from "./src/theme/typography";
import { COLORS } from "./src/theme/fonts";
import { ShopScreen } from "./src/screens/ShopScreen";
import { sessionManager } from "./src/utils/sessionManager";
import axios from "axios";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ setIsLoggedIn }) {
  const handleLogout = async () => {
    try {
      await sessionManager.clearSession();
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (Text.defaultProps == null) Text.defaultProps = {};
  Text.defaultProps.style = baseTextStyle;

  if (TextInput.defaultProps == null) TextInput.defaultProps = {};
  TextInput.defaultProps.style = baseTextStyle;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Profile") {
            iconName = "person";
          } else if (route.name === "Add Product") {
            iconName = "add-circle";
          } else if (route.name === "Shop") {
            iconName = "shopping-bag";
          } else if (route.name === "Logout") {
            iconName = "logout";
          }

          const iconColor = route.name === "Logout" ? "red" : color;
          return <Icon name={iconName} size={size} color={iconColor} />;
        },
        tabBarActiveTintColor: route.name === "Logout" ? "red" : COLORS.PRIMARY,
        tabBarInactiveTintColor: route.name === "Logout" ? "red" : "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Add Product" component={AddProductScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen
        name="Logout"
        component={EmptyComponent}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleLogout();
          },
        }}
      />
    </Tab.Navigator>
  );
}

const EmptyComponent = () => null;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          ClashDisplay: require("./assets/fonts/ClashDisplay-Regular.otf"),
          "ClashDisplay-Medium": require("./assets/fonts/ClashDisplay-Medium.otf"),
          "ClashDisplay-Bold": require("./assets/fonts/ClashDisplay-Bold.otf"),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error("Error loading fonts:", error);
      }
    }

    loadFonts();
  }, []);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const isValid = await sessionManager.checkSession();
      setIsLoggedIn(isValid);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await sessionManager.clearSession();
          setIsLoggedIn(false);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  if (!fontsLoaded || isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTintColor: "#000",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        {!isLoggedIn ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              initialParams={{ setIsLoggedIn }}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              options={{ headerShown: false }}
              children={(props) => (
                <MainTabs {...props} setIsLoggedIn={setIsLoggedIn} />
              )}
            />
            <Stack.Screen
              name="ProductDetails"
              component={ProductDetailsScreen}
              options={{
                headerTitle: "Product Details",
                presentation: "modal",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
