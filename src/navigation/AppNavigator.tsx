import React from "react";
import HomeScreen from "@/screens/HomeScreen";
import LoginScreen from "@/screens/LoginScreen";
import DetailScreen from "@/screens/DetailScreen";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Login: undefined;
  Home: { email: string };
  Register: undefined;
  EmployeeDetail: { employee: any };
};

type AppNavigatorProps = {
  initialToken: string | null;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator({ initialToken }: AppNavigatorProps) {
  return (
    <Stack.Navigator
      initialRouteName={initialToken ? "Home" : "Login"}
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Login" }}
      />

      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Employee List" }}
      />

      <Stack.Screen
        name="EmployeeDetail"
        component={DetailScreen}
        options={{ title: "Employee Detail" }}
      />
    </Stack.Navigator>
  );
}
