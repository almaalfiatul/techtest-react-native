import { fakeLogin } from "@/services/fakeAuth";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  useColorScheme,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

type GoogleUser = {
  email: string;
  name: string;
  picture?: string;
};

export default function LoginScreen({ navigation }: Props) {
  const colorScheme = useColorScheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<GoogleUser | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      "282881306173-u9kd7mntcsbtdf95jel35orajtg4ia6p.apps.googleusercontent.com",
    iosClientId:
      "282881306173-b63esigfemb6hjp81bi6dfq9jh8v07vl.apps.googleusercontent.com",
    androidClientId:
      "282881306173-l0n136nr5tsn3om43np5qmak1bo7in61.apps.googleusercontent.com",
  });

  useEffect(() => {
    loadGoogleUser();
  }, []);

  useEffect(() => {
    if (
      response?.type === "success" &&
      response.authentication?.accessToken
    ) {
      fetchGoogleUser(response.authentication.accessToken);
    }
  }, [response]);

  const loadGoogleUser = async () => {
    const data = await AsyncStorage.getItem("@googleUser");
    if (!data) return;

    const user = JSON.parse(data);
    setUserInfo(user);
    navigation.replace("Home", { email: user.email });
  };

  const fetchGoogleUser = async (token: string) => {
    try {
      const res = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = await res.json();

      const cleanUser = {
        email: user.email,
        name: user.name,
        picture: user.picture,
      };

      await AsyncStorage.setItem("@googleUser", JSON.stringify(cleanUser));
      setUserInfo(cleanUser);

      navigation.replace("Home", { email: cleanUser.email });
    } catch (err) {
      console.log("Google login failed", err);
    }
  };

  const handleEmailLogin = async () => {
    setError(null);

    if (!/\S+@\S+\.\S+/.test(email)) {
      return setError("Invalid email format");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      const result = await fakeLogin(email, password);

      await AsyncStorage.setItem("authToken", result.token);
      navigation.replace("Home", { email });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={[
            styles.container,
            { backgroundColor: colorScheme === "dark" ? "#121212" : "#F7F9FC" },
          ]}
        >
          <Image
            source={require("../assets/image1.png")}
            style={styles.logo}
          />

          <Text
            style={[
              styles.subtitle,
              { color: colorScheme === "dark" ? "#E5E7EB" : "#6B7280" },
            ]}
          >
            Enter valid email & password to continue
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleEmailLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Login</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.or}>OR</Text>

          {!userInfo && (
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={() => promptAsync()}
              disabled={!request}
            >
              <Text style={styles.googleText}>Login with Google</Text>
            </TouchableOpacity>
          )}

          {userInfo && (
            <View style={styles.card}>
              {userInfo.picture && (
                <Image source={{ uri: userInfo.picture }} style={styles.image} />
              )}
              <Text>{userInfo.name}</Text>
              <Text>{userInfo.email}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  logo: { width: 200, height: 200, alignSelf: "center" },
  subtitle: { textAlign: "center", marginBottom: 30 },
  inputContainer: { borderWidth: 1, borderRadius: 10, marginBottom: 12, padding: 12 },
  loginBtn: {
    backgroundColor: "#003D82",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  loginText: { color: "#fff", fontWeight: "600" },
  error: { color: "red", textAlign: "center", marginTop: 6 },
  or: { textAlign: "center", marginVertical: 14 },
  googleBtn: {
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  googleText: { fontWeight: "600" },
  card: { marginTop: 20, borderWidth: 1, padding: 15, borderRadius: 15 },
  image: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
});