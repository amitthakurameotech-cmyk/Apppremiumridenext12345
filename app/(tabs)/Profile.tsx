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
  View,
} from "react-native";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const router = useRouter();

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
        setUser(res.data);
        setForm(res.data); // set form values same as profile
      } catch (err: any) {
        Alert.alert("Error", err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [Auth.getProfile]);
 

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/auth/login");
  };

  const handleSave = async () => {
    try {
      const id = await AsyncStorage.getItem("userid");
      if (!id) return;
      const updated = await Auth.updateProfile( form);
      console.log(updated)
      setUser(updated); // update local profile
    
      setEditing(false);
       console.log(user)
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No profile data found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <View style={styles.container}>
        <Text style={profileStyles.title}>My Profile</Text>

        <View style={profileStyles.card}>
          {[
            { label: "Full Name", key: "fullName" },
            { label: "Email", key: "email" },
            { label: "Phone Number", key: "phoneNumber" },
            { label: "Date of Birth", key: "dateOfBirth" },
            { label: "City", key: "city" },
            { label: "Account Type", key: "accountType" },
            { label: "Bio", key: "bio" },
            { label: "Car Model", key: "carModel" },
            { label: "License Plate", key: "licensePlate" },
            { label: "Driving License Number", key: "drivingLicenseNumber" },
          ].map((field) => (
            <View key={field.key} style={{ marginBottom: 12 }}>
              <Text style={profileStyles.label}>{field.label}</Text>
              {editing ? (
                <TextInput
                  style={profileStyles.input}
                  value={form[field.key] ? String(form[field.key]) : ""}
                  onChangeText={(text) =>
                    setForm({ ...form, [field.key]: text })
                  }
                />
              ) : (
                <Text style={profileStyles.value}>
                  {form[field.key] || "Not Provided"}
                </Text>
              )}
            </View>
          ))}
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

