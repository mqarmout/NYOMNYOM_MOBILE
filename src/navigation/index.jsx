import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../context/AuthContext";

import SignIn from "../screens/SignIn";
import SpendingScreen from "../screens/spending/SpendingScreen";
import JobsScreen from "../screens/jobs/JobsScreen";
import FitnessScreen from "../screens/fitness/FitnessScreen";
import PortfolioScreen from "../screens/portfolio/PortfolioScreen";
import ClimbingScreen from "../screens/climbing/ClimbingScreen";
import ProjectsScreen from "../screens/projects/ProjectsScreen";

// TODO: replace Text labels with icons once an icon library is chosen
// Options: @expo/vector-icons (bundled with Expo), react-native-vector-icons

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // TODO: style tab bar to match the app's design language
        // tabBarStyle, tabBarActiveTintColor, tabBarInactiveTintColor
      }}
    >
      <Tab.Screen name="Spending"   component={SpendingScreen} />
      <Tab.Screen name="Jobs"       component={JobsScreen} />
      <Tab.Screen name="Fitness"    component={FitnessScreen} />
      <Tab.Screen name="Portfolio"  component={PortfolioScreen} />
      <Tab.Screen name="Climbing"   component={ClimbingScreen} />
      <Tab.Screen name="Projects"   component={ProjectsScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { user, loading } = useAuth();

  // TODO: show a splash/loading screen while auth state is resolving
  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="App" component={AppTabs} />
        ) : (
          <Stack.Screen name="SignIn" component={SignIn} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
