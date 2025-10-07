import axios from "axios";

const API = axios.create({
  baseURL: "https://ridenext-12.onrender.com", // 🔴 replace with backend
  timeout: 1000000,
});

// API.interceptors.request.use(
//   async (config) => {
//     const token = await AsyncStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

export default API;