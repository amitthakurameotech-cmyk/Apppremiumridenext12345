import { ridepostapi } from "@/services/RidePostApi";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,    
  TouchableOpacity,
  View
} from "react-native";

type Ride = {
  _id: string;
  fromCity: string;
  toCity: string;
  pickupLocation: string;
  dropLocation: string;
  departureDate: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  carModel?: string;
};

export default function SearchRides() {
  const [filters, setFilters] = useState({
    fromCity: "",
    toCity: "",
    availableSeats: "",
    minPrice: "",
    maxPrice: "",
    date: "",
  });

  const [rides, setRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch rides from backend
  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        const res = await ridepostapi.getride();
        setRides(res.data);
        setFilteredRides(res.data);
      } catch (err) {
        console.error("Error fetching rides:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  const handleChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleSearch = () => {
    const results = rides.filter((ride) => {
      const matchesFrom =
        !filters.fromCity ||
        ride.fromCity?.toLowerCase().includes(filters.fromCity.toLowerCase());
      const matchesTo =
        !filters.toCity ||
        ride.toCity?.toLowerCase().includes(filters.toCity.toLowerCase());

      const matchesMinPrice =
        !filters.minPrice || ride.pricePerSeat >= parseInt(filters.minPrice);
      const matchesMaxPrice =
        !filters.maxPrice || ride.pricePerSeat <= parseInt(filters.maxPrice);
      const matchesSeats =
        !filters.availableSeats ||
        ride.availableSeats >= parseInt(filters.availableSeats);

      return (
        matchesFrom &&
        matchesTo &&
        matchesSeats &&
        matchesMinPrice &&
        matchesMaxPrice

      );
    });
    setFilteredRides(results);
  };

  const handleNavigate = (ride: string) => {
    if (!ride) return;
    router.push({
      pathname: "/booking/id",
       params: { id: ride },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>🚗 Find Your Perfect Ride</Text>
      <Text style={styles.subtitle}>Search and book rides with ease</Text>

      {/* Filters */}
      <View style={styles.filterBox}>
        <Text style={styles.sectionTitle}>🔍 Search Filters</Text>

        <TextInput
          style={styles.input}
          placeholder="From City"
          value={filters.fromCity}
          onChangeText={(text) => handleChange("fromCity", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="To City"
          value={filters.toCity}
          onChangeText={(text) => handleChange("toCity", text)}
        />
        {/* <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={filters.date}
          onChangeText={(text) => handleChange("date", text)}
        /> */}
        <TextInput
          style={styles.input}
          placeholder="Min Price"
          keyboardType="numeric"
          value={filters.minPrice}
          onChangeText={(text) => handleChange("minPrice", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Max Price"
          keyboardType="numeric"
          value={filters.maxPrice}
          onChangeText={(text) => handleChange("maxPrice", text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Min Seats"
          keyboardType="numeric"
          value={filters.availableSeats}
          onChangeText={(text) => handleChange("availableSeats", text)}
        />

        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchText}>Search Rides</Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      <Text style={styles.resultTitle}>Available Rides ({filteredRides.length})</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1D4ED8" />
      ) : filteredRides.length > 0 ? (
        filteredRides.map((ride) => (
          <View key={ride._id} style={styles.rideCard}>
            <Text style={styles.rideTitle}>
              {ride.fromCity} → {ride.toCity}
            </Text>
            <Text style={styles.rideText}>Pickup: {ride.pickupLocation}</Text>
            <Text style={styles.rideText}>Drop: {ride.dropLocation}</Text>
            <Text style={styles.rideText}>
              {new Date(ride.departureDate).toLocaleDateString()} at {ride.departureTime}
            </Text>
            <Text style={styles.rideText}>
              🚘 Car: {ride.carModel || "Not specified"}
            </Text>
            <Text style={styles.rideText}>
              {ride.availableSeats} seats left | ₹{ride.pricePerSeat} per seat
            </Text>
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => handleNavigate(ride._id)}
            >
              <Text style={styles.bookText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.noRide}>No rides found.</Text>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9fafb" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", color: "#1f2937" },
  subtitle: { textAlign: "center", color: "#6b7280", marginBottom: 16 },
  filterBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12, color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  searchBtn: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  searchText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  resultTitle: { fontSize: 20, fontWeight: "600", marginBottom: 10, color: "#111827" },
  rideCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  rideTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  rideText: { fontSize: 14, color: "#374151", marginTop: 2 },
  bookBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  bookText: { color: "#fff", fontWeight: "600" },
  noRide: { textAlign: "center", color: "#6b7280", marginTop: 20 },
});

