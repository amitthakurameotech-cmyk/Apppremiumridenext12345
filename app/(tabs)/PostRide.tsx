import { ridepostapi } from "@/services/RidePostApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// ✅ Type for form
type RideForm = {
  fromCity: string;
  toCity: string;
  pickupLocation: string;
  dropLocation: string;
  departureDate: string;
  departureTime: string;
  availableSeats: string;
  pricePerSeat: string;
  carModel: string;
  smokingAllowed: boolean;
  musicAllowed: boolean;
  petsAllowed: boolean;
  instantBooking: boolean;
  notes: string;
};

export default function PostRide() {
  const [form, setForm] = useState<RideForm>({
    fromCity: "",
    toCity: "",
    pickupLocation: "",
    dropLocation: "",
    departureDate: "",
    departureTime: "",
    availableSeats: "",
    pricePerSeat: "",
    carModel: "",
    smokingAllowed: false,
    musicAllowed: true,
    petsAllowed: false,
    instantBooking: true,
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ Load userId once
  useEffect(() => {
    const loadUserId = async () => {
      const id = await AsyncStorage.getItem("userid");
      if (!id) {
        Alert.alert("Error", "No user ID found. Please login again.");
        router.replace("/auth/login");
        return;
      }
      setUserId(id);
    };
    loadUserId();
  }, []);

  const travelPrefs: { key: keyof RideForm; label: string }[] = [
    { key: "smokingAllowed", label: "Smoking Allowed" },
    { key: "musicAllowed", label: "Music Allowed" },
    { key: "petsAllowed", label: "Pets Allowed" },
    { key: "instantBooking", label: "Instant Booking" },
  ];

  const handleChange = (key: keyof RideForm, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleToggle = (key: keyof RideForm) => {
    setForm({ ...form, [key]: !(form[key] as boolean) });
  };

  const handleSubmit = async () => {
    if (
      !form.fromCity ||
      !form.toCity ||
      !form.departureDate ||
      !form.departureTime ||
      !form.availableSeats ||
      !form.pricePerSeat
    ) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rideData = { ...form, userid: userId };
      const response = await ridepostapi.createride(rideData);
      console.log("Ride Posted:", response);
      Alert.alert("Success", "✅ Ride posted successfully!");
       router.replace("../MyBooking");

      // Reset form
      setForm({
        fromCity: "",
        toCity: "",
        pickupLocation: "",
        dropLocation: "",
        departureDate: "",
        departureTime: "",
        availableSeats: "",
        pricePerSeat: "",
        carModel: "",
        smokingAllowed: false,
        musicAllowed: true,
        petsAllowed: false,
        instantBooking: true,
        notes: "",
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to post ride");
      Alert.alert("Error", err.message || "⚠️ Failed to post ride");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.title}>🚗 Post New Ride</Text>

      {/* Route Information */}
      <Text style={styles.sectionTitle}>Route Information</Text>
      <TextInput
        style={styles.input}
        placeholder="From City *"
        value={form.fromCity}
        onChangeText={(text) => handleChange("fromCity", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="To City *"
        value={form.toCity}
        onChangeText={(text) => handleChange("toCity", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Pickup Location"
        value={form.pickupLocation}
        onChangeText={(text) => handleChange("pickupLocation", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Drop Location"
        value={form.dropLocation}
        onChangeText={(text) => handleChange("dropLocation", text)}
      />

      {/* Schedule */}
      <Text style={styles.sectionTitle}>Schedule</Text>
      <TextInput
        style={styles.input}
        placeholder="Departure Date (YYYY-MM-DD) *"
        value={form.departureDate}
        onChangeText={(text) => handleChange("departureDate", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Departure Time (HH:mm) *"
        value={form.departureTime}
        onChangeText={(text) => handleChange("departureTime", text)}
      />

      {/* Seats & Pricing */}
      <Text style={styles.sectionTitle}>Seats & Pricing</Text>
      <TextInput
        style={styles.input}
        placeholder="Available Seats *"
        keyboardType="numeric"
        value={form.availableSeats}
        onChangeText={(text) => handleChange("availableSeats", text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Price per Seat *"
        keyboardType="numeric"
        value={form.pricePerSeat}
        onChangeText={(text) => handleChange("pricePerSeat", text)}
      />

      {/* Vehicle Info */}
      <Text style={styles.sectionTitle}>Vehicle Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Car Model & Year"
        value={form.carModel}
        onChangeText={(text) => handleChange("carModel", text)}
      />

      {/* Travel Preferences */}
      <Text style={styles.sectionTitle}>Travel Preferences</Text>
      {travelPrefs.map((pref) => (
        <View key={pref.key} style={styles.switchRow}>
          <Text style={styles.switchLabel}>{pref.label}</Text>
          <Switch
            value={form[pref.key] as boolean}
            onValueChange={() => handleToggle(pref.key)}
          />
        </View>
      ))}

      {/* Additional Notes */}
      <Text style={styles.sectionTitle}>Additional Information</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Write any additional notes here..."
        value={form.notes}
        onChangeText={(text) => handleChange("notes", text)}
        multiline
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>🚀 Post Ride</Text>}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f3f4f6" },
  title: { fontSize: 26, fontWeight: "bold", color: "#1D4ED8", marginBottom: 16, textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginVertical: 8, color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  switchLabel: { fontSize: 16, color: "#374151" },
  button: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  errorText: { color: "red", marginTop: 10, textAlign: "center" },
});


