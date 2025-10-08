// app/booking/[id].tsx
import { ridepostapi } from "@/services/RidePostApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookingPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [formData, setFormData] = useState({
    seatsBooked: "1",
    pickupLocation: "",
    dropLocation: "",
    passengerPhone: "",
    specialRequests: "",
  });

  useEffect(() => {
    if (id) {
      ridepostapi
        .getRideById(id)
        .then((res) => {
          setRide(res.data);
          setLoading(false);
          // Animate content in
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
        })
        .catch((err) => {
          console.error("Error fetching ride:", err);
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const userId = await AsyncStorage.getItem("userid");
      if (!userId) throw new Error("User not logged in");
      if (!ride) throw new Error("Ride not loaded");

      const bookingPayload = {
        ride: id,
        userid: userId,
        fromCity: ride.fromCity,
        toCity: ride.toCity,
        departureDate: ride.departureDate,
        departureTime: ride.departureTime,
        pricePerSeat: ride.pricePerSeat,
        seatsBooked: Number(formData.seatsBooked),
        totalAmount: Number(formData.seatsBooked) * ride.pricePerSeat,
        pickupLocation: formData.pickupLocation,
        dropLocation: formData.dropLocation,
        passengerPhone: formData.passengerPhone,
        specialRequests: formData.specialRequests,
        status: "Booked",
      };

      await ridepostapi.createbooking(bookingPayload);
      Alert.alert("✅ Booking successful!");
      router.push("../MyBooking");
    } catch (err: any) {
      console.error("Error creating booking:", err);
      Alert.alert("Error", err.message || "Failed to create booking");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading ride details...</Text>
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No ride found.</Text>
      </View>
    );
  }

  const totalAmount =
    Number(formData.seatsBooked) * Number(ride.pricePerSeat || 0);

  return (
    <LinearGradient
      colors={["#f0fdf4", "#ffffff"]}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Ride Details Card with Animation */}
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Text style={styles.cityText}>
            {ride.fromCity} → {ride.toCity}
          </Text>
          <Text style={styles.dateText}>
            {new Date(ride.departureDate).toLocaleDateString()} at{" "}
            {ride.departureTime}
          </Text>
          <Text style={styles.driverText}>
            🚗 Driver: {ride.driver?.fullName} ({ride.driver?.carModel})
          </Text>
        </Animated.View>

        {/* Input Fields */}
        <InputField
          label="Number of Seats"
          value={formData.seatsBooked}
          onChange={(v) => handleChange("seatsBooked", v)}
          keyboardType="numeric"
        />
        <InputField
          label="Pickup Location"
          value={formData.pickupLocation}
          onChange={(v) => handleChange("pickupLocation", v)}
          placeholder="Enter pickup point"
        />
        <InputField
          label="Drop-off Location"
          value={formData.dropLocation}
          onChange={(v) => handleChange("dropLocation", v)}
          placeholder="Enter drop point"
        />
        <InputField
          label="Your Phone Number"
          value={formData.passengerPhone}
          onChange={(v) => handleChange("passengerPhone", v)}
          placeholder="+91 9876543210"
          keyboardType="phone-pad"
        />
        <InputField
          label="Special Requests"
          value={formData.specialRequests}
          onChange={(v) => handleChange("specialRequests", v)}
          placeholder="Any notes for driver?"
          multiline
        />

        {/* Price Breakdown */}
        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Price per seat: ₹{ride.pricePerSeat}</Text>
          <Text style={styles.priceLabel}>Seats: {formData.seatsBooked}</Text>
          <Text style={styles.totalPrice}>Total: ₹{totalAmount}</Text>
        </View>

        {/* Warning Box */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ The driver will review your request and respond within 24 hours.
          </Text>
        </View>

        {/* Submit Button with Gradient */}
        <TouchableOpacity onPress={handleSubmit} style={{ marginTop: 20 }}>
          <LinearGradient
            colors={["#16a34a", "#15803d"]}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Confirm Booking</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

// ✅ Reusable InputField
function InputField({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#4b5563",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
  },
  card: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
  },
  cityText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  dateText: {
    fontSize: 14,
    color: "#d1fae5",
    marginTop: 4,
  },
  driverText: {
    fontSize: 14,
    color: "#bbf7d0",
    marginTop: 8,
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "white",
  },
  priceBox: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    elevation: 2,
  },
  priceLabel: {
    fontSize: 14,
    color: "#374151",
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#15803d",
    marginTop: 6,
  },
  warningBox: {
    backgroundColor: "#fef9c3",
    borderWidth: 1,
    borderColor: "#facc15",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  warningText: {
    color: "#92400e",
    fontSize: 13,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
