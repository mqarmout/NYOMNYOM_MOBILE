import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

// TODO: design the sign-in screen — currently just a bare functional stub
// TODO: add a register flow (tab or toggle between sign in / register)
// TODO: show loading state while request is in flight
// TODO: style with the app's design system once that's decided

export default function SignIn() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    const { ok, error } = await login(username, password);
    if (!ok) setError(error ?? "Login failed");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NYOMNYOM</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} autoCapitalize="none" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button title="Sign In" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 32, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10, marginBottom: 12 },
  error: { color: "red", marginBottom: 12, textAlign: "center" },
});
