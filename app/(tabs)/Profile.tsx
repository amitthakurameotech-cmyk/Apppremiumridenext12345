import { Auth } from "@/services/Auth";
import { styles } from "@/styles/auth.styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const router = useRouter();

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const id = await AsyncStorage.getItem("userid");
        if (!id) {
          Alert.alert("Error", "No user ID found. Please login again.");
          router.replace("/auth/login");
          return;
        }
        const res = await Auth.getProfile(id);
        //console.log("Profile response:", res); // ✅ debug
        const profileData = res?.data ?? res;
        setUser(profileData);
        setForm(profileData);
      } catch (err: any) {
        console.error("Profile error:", err);
        Alert.alert("Error", err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Logout
  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/auth/login");
  };

  
  // Save profile
  const handleSave = async () => {
    try {
      const id = await AsyncStorage.getItem("userid");
      if (!id) {
        Alert.alert("Error", "User ID not found. Please login again.");
        return;
      }

      // Ensure id is sent with form
      const payload = { id, ...form };

      const res = await Auth.updateProfile(payload);
      console.log("Update response:", res); // ✅ debug

      //const newData = res?.data ?? payload; // use updated data if returned
      setUser(res);
      setUser(res);

      setEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err: any) {
      console.error("Update error:", err);
      Alert.alert("Error", err.response?.data?.message || "Update failed");
    }
  };

  // Loading
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  // No user
  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No profile data found</Text>
      </View>
    );
  }

  // Fields
  const fields = [
    { label: "Full Name", key: "fullName" },
    { label: "Email", key: "email" },
    { label: "Phone Number", key: "phoneNumber" },
    { label: "Date of Birth", key: "dateOfBirth", type: "date" },
    { label: "City", key: "city" },
    { label: "Account Type", key: "accountType" },
    { label: "Bio", key: "bio" },
    { label: "Car Model", key: "carModel" },
    { label: "License Plate", key: "licensePlate" },
    { label: "Driving License Number", key: "drivingLicenseNumber" },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <View style={styles.container}>
        <Text style={profileStyles.title}>My Profile</Text>

        <View style={profileStyles.card}>
          {fields.map((field) => {
            let value = form[field.key] || "";
            if (field.type === "date" && value) {
              try {
                value = new Date(value).toISOString().split("T")[0]; // format YYYY-MM-DD
              } catch {
                value = form[field.key];
              }
            }

            return (
              <View key={field.key} style={{ marginBottom: 12 }}>
                <Text style={profileStyles.label}>{field.label}</Text>
                {editing ? (
                  <TextInput
                    style={profileStyles.input}
                    value={value}
                    placeholder={field.type === "date" ? "YYYY-MM-DD" : field.label}
                    onChangeText={(text) => setForm({ ...form, [field.key]: text })}
                  />
                ) : (
                  <Text style={profileStyles.value}>
                    {value || "No Data Available"}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {editing ? (
          <Button title="Save" onPress={handleSave} />
        ) : (
          <Button title="Edit Profile" onPress={() => setEditing(true)} />
        )}

        <View style={{ marginTop: 15 }}>
          <Button title="Logout" color="red" onPress={handleLogout} />
        </View>
      </View>
    </ScrollView>
  );
}

const profileStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    backgroundColor: "#fdfdfd",
  },
});
