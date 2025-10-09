
import { Auth } from "@/services/Auth";
import { styles } from "@/styles/auth.styles";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const router = useRouter();
  const handleLogin = async () => {
    try {
      const user = await Auth.login(email, password);
      await AsyncStorage.setItem("token", user.token);
      await AsyncStorage.setItem("email", user.email);
      await AsyncStorage.setItem("Fullname", user.fullName);
      await AsyncStorage.setItem("userid", user.id);
      
       alert("✅ Login successful!");
      router.replace("/(tabs)");
    } catch (err: any) {
      alert( "Invalid Email or Password");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back 👋</Text>

        {/* Email Field */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#999"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password Field */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Gradient Login Button */}
        <TouchableOpacity onPress={handleLogin} style={{ marginTop: 15 }}>
          <LinearGradient
            colors={["#4c6ef5", "#7950f2"]}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <Text style={styles.signupText}>
          Don’t have an account?
          <Text  style={styles.signupLink} onPress={()=>router.push("/auth/signup")}>Sign Up</Text>
        </Text>
      </View>
    </View>
  );
}
