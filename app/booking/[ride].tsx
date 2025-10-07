// app/booking/[id].tsx

import { createbooking, getRideById } from "@/services/Api"; // adjust path
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
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
  const [formData, setFormData] = useState({
    seatsBooked: "1",
    pickupLocation: "",
    dropLocation: "",
    passengerPhone: "",
    specialRequests: "",
  });

  // ✅ Fetch ride details
  useEffect(() => {
    if (id) {
      getRideById(id)
        .then((res) => {
          setRide(res);
          setLoading(false);
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

  // ✅ Submit booking
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

      await createbooking(bookingPayload);
      Alert.alert("✅ Booking successful!");
      router.push("Mybooking");
    } catch (err: any) {
      console.error("Error creating booking:", err);
      Alert.alert("Error", err.message || "Failed to create booking");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="green" />
        <Text className="mt-2">Loading ride details...</Text>
      </View>
    );
  }

  if (!ride) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No ride found.</Text>
      </View>
    );
  }

  const totalAmount =
    Number(formData.seatsBooked) * Number(ride.pricePerSeat || 0);

  return (
    <ScrollView className="flex-1 bg-white p-4">
      {/* Ride Details */}
      <View className="bg-green-50 p-4 rounded-2xl mb-4">
        <Text className="text-lg font-bold">
          {ride.fromCity} → {ride.toCity}
        </Text>
        <Text className="text-sm text-gray-600">
          {new Date(ride.departureDate).toLocaleDateString()} at{" "}
          {ride.departureTime}
        </Text>
        <Text className="mt-1 text-gray-700">
          Driver: {ride.driver?.name} ({ride.driver?.carModel})
        </Text>
      </View>

      {/* Seats */}
      <Text className="font-semibold">Number of Seats</Text>
      <TextInput
        value={formData.seatsBooked}
        onChangeText={(v) => handleChange("seatsBooked", v)}
        keyboardType="numeric"
        className="border rounded-lg p-2 my-2"
      />

      {/* Pickup & Drop */}
      <Text className="font-semibold">Pickup Location</Text>
      <TextInput
        value={formData.pickupLocation}
        onChangeText={(v) => handleChange("pickupLocation", v)}
        placeholder="Enter pickup point"
        className="border rounded-lg p-2 my-2"
      />

      <Text className="font-semibold">Drop-off Location</Text>
      <TextInput
        value={formData.dropLocation}
        onChangeText={(v) => handleChange("dropLocation", v)}
        placeholder="Enter drop point"
        className="border rounded-lg p-2 my-2"
      />

      {/* Phone */}
      <Text className="font-semibold">Your Phone Number</Text>
      <TextInput
        value={formData.passengerPhone}
        onChangeText={(v) => handleChange("passengerPhone", v)}
        placeholder="+91 9876543210"
        keyboardType="phone-pad"
        className="border rounded-lg p-2 my-2"
      />

      {/* Special Requests */}
      <Text className="font-semibold">Special Requests</Text>
      <TextInput
        value={formData.specialRequests}
        onChangeText={(v) => handleChange("specialRequests", v)}
        placeholder="Any notes for driver?"
        multiline
        numberOfLines={3}
        className="border rounded-lg p-2 my-2"
      />

      {/* Price Breakdown */}
      <View className="mt-4 border-t pt-4">
        <Text className="font-semibold mb-1">Price Breakdown</Text>
        <Text>Price per seat: ₹{ride.pricePerSeat}</Text>
        <Text>Seats: {formData.seatsBooked}</Text>
        <Text className="font-bold text-green-700 mt-2">
          Total: ₹{totalAmount}
        </Text>
      </View>

      {/* Notice */}
      <View className="bg-yellow-50 border border-yellow-300 p-3 rounded-lg my-4">
        <Text className="text-yellow-800 text-sm">
          ⚠️ The driver will review your request and respond within 24 hours.
        </Text>
      </View>

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-green-600 py-3 rounded-xl"
      >
        <Text className="text-center text-white font-semibold">
          Confirm Booking
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
