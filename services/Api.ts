import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API = axios.create({
  baseURL: "https://ridenext-12.onrender.com", // 🔴 replace with backend
  timeout: 1000000,
});

// Attach token automatically if present in AsyncStorage
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token && config && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      // ignore token attach errors
      console.warn("Failed to read token for request interceptor", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;