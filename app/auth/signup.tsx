import { Auth } from "@/services/Auth"; // your Auth.js service
import { styles } from "@/styles/auth.styles";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";

export default function Signup() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSignup = async () => {
    if (!fullName || !email || !password || !phoneNumber) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      // Call your Auth.js register endpoint
      const user = await Auth.register({ fullName, email, password, phoneNumber });
           alert("✅ Sign up successful!");
      //Alert.alert("Signup Successful 🎉", `Welcome ${user.fullName}`);
      
      // Navigate to login page
      router.replace("/auth/login");
    } catch (err: any) {
      Alert.alert(
        "Signup Failed",
        err.response?.data?.message || "Unable to register"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text >Create Account</Text>

      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <Button title="Sign Up" onPress={handleSignup} />

      <Text style={styles.signupText}>
        Already have an account?{" "}
        <Text
          style={styles.signupLink}
          onPress={() => router.push("/auth/login")}
        >
          Login
        </Text>
      </Text>
    </View>
  );
}
