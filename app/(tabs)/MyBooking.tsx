import { mybooking } from "@/services/Mybooking";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { JSX } from "react/jsx-runtime";

// Types
interface IUser {
  fullName: string;
  phoneNumber: string;
}

interface IBooking {
  _id: string;
  fromCity: string;
  toCity: string;
  seatsBooked?: number;
  availableSeats?: number;
  departureDate: string;
  userid: IUser;
  totalAmount: number;
}

type TabType = "bookings" | "rides" | "requests";

export default function MyBooking(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>("bookings");
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<{
    bookings: IBooking[];
    rides: IBooking[];
    requests: IBooking[];
  }>({
    bookings: [],
    rides: [],
    requests: [],
  });
  // keep track of which request is being processed
  const [processingMap, setProcessingMap] = useState<Record<string, boolean>>({});

  // Fetch data from API service WITH PROPER userID CONTROL!
  const fetchData = async () => {
    setLoading(true);
    try {
      const userID = await AsyncStorage.getItem("userid");

      if (!userID) {
        Alert.alert("Error", "User ID not found. Please log in again.");
        setData({ bookings: [], rides: [], requests: [] });
        setLoading(false);
        return; // Important: Prevent API call!
      }

      // Fetch only if userID is valid
      const [bookings, rides, requests] = await Promise.all([
        mybooking.getBookingData(userID),
        mybooking.getRideData(userID),
        mybooking.getRequestData(userID),
      ]);

      setData({ bookings, rides, requests });
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load bookings. Please try again.");
      setData({ bookings: [], rides: [], requests: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // helper that actually performs the network call
  const performApprove = async (bookingId: string) => {
    console.log("performApprove called for", bookingId);
    try {
      setProcessingMap((p) => ({ ...p, [bookingId]: true }));
      const res = await mybooking.approverequest(bookingId);
      console.log("approverequest returned:", res);
      if (res) {
        // If backend returns success or updated resource, re-fetch lists to reflect DB state
        if (res?.success === false && res?.message) {
          Alert.alert("Error", res.message.toString());
        } else {
          await fetchData();
          Alert.alert("Success", res?.message ?? "Request approved.");
        }
      } else {
        Alert.alert("Error", "Failed to approve request.");
      }
    } catch (err) {
      console.error("performApprove error", err);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setProcessingMap((p) => ({ ...p, [bookingId]: false }));
    }
  };

  const handleApprove = (bookingId: string) => {
    console.log("handleApprove clicked", bookingId);
    Alert.alert("Confirm", "Approve this request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () => {
          // call the async worker but don't await here (Alert callbacks shouldn't return promises)
          performApprove(bookingId);
        },
      },
    ]);
  };

  const tabs: { key: TabType; label: string; color: string }[] = [
    { key: "bookings", label: "As Passenger", color: "#60a5fa" },
    { key: "rides", label: "As Driver", color: "#a78bfa" },
    { key: "requests", label: "Requests", color: "#34d399" },
  ];

  const currentData: IBooking[] = data[activeTab];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🚗 My Bookings & Rides</Text>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && { backgroundColor: tab.color },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && { color: "#fff", fontWeight: "bold" },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#60a5fa" />
          <Text style={{ marginTop: 14, color: "#64748b" }}>
            Loading your bookings...
          </Text>
        </View>
      ) : currentData.length === 0 ? (
        <Text style={styles.emptyText}>
          No{" "}
          {activeTab === "bookings"
            ? "bookings"
            : activeTab === "rides"
            ? "rides"
            : "requests"}{" "}
          found.
        </Text>
      ) : (
        currentData.map((item) => (
          <View key={item._id} style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="route" size={18} color="#60a5fa" />
              <Text style={styles.cardTitle}>
                {item.fromCity} → {item.toCity}
              </Text>
            </View>
            <Text style={styles.cardDetail}>
              <MaterialIcons name="date-range" size={15} color="#6366f1" />{" "}
              {item.departureDate} •{" "}
              {item.seatsBooked ?? item.availableSeats ?? 0} seats
            </Text>
            <Text style={styles.cardDetail}>
              <Ionicons name="person" size={15} color="#f472b6" />{" "}
              {activeTab === "rides" ? "Driver:" : "Passenger:"}{" "}
              {item.userid?.fullName ?? "Unknown"}
            </Text>
            <Text style={styles.cardDetail}>
              <Ionicons name="call" size={15} color="#10b981" /> Contact:{" "}
              {item.userid?.phoneNumber ?? "-"}
            </Text>
            <Text style={styles.cardDetail}>
              <FontAwesome5 name="money-bill" size={15} color="#fbbf24" /> Total: ₹
              {(item.totalAmount ?? 0).toFixed(2)}
            </Text>
            {activeTab === "requests" ? (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.approveBtn,
                    processingMap[item._id] && { opacity: 0.7 },
                  ]}
                  onPress={() => handleApprove(item._id)}
                  disabled={!!processingMap[item._id]}
                >
                  <Text style={styles.actionText}>
                    {processingMap[item._id] ? "Processing..." : "Approve"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.cancelBtn}>
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f0f4fa",
    minHeight: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#334155",
    alignSelf: "center",
    marginVertical: 18,
  },
  tabBar: {
    flexDirection: "row",
    marginBottom: 16,
    justifyContent: "center",
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 17,
    borderRadius: 9,
    marginHorizontal: 5,
    backgroundColor: "#e0e7ef",
  },
  tabText: {
    color: "#334155",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginVertical: 11,
    shadowColor: "#0ea5e9",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: "#e0e7ef",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
    gap: 5,
  },
  cardTitle: {
    marginLeft: 7,
    fontSize: 17,
    fontWeight: "600",
    color: "#2563eb",
  },
  cardDetail: {
    color: "#475569",
    fontSize: 14,
    marginVertical: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 8,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: "#10b981",
    borderRadius: 7,
    padding: 11,
    marginRight: 7,
    alignItems: "center",
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    borderRadius: 7,
    padding: 11,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    padding: 11,
    alignItems: "center",
    marginTop: 8,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  centered: {
    alignItems: "center",
    marginVertical: 40,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 28,
    color: "#64748b",
    fontStyle: "italic",
    fontSize: 16,
  },
});
