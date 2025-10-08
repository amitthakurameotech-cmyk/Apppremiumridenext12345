import API from "./Api";

export const mybooking = {
  getBookingData: async (userid) => {
    try {
      const res = await API.get(`/pasengertab/${userid}`);
      console.log(res.data);
      // Prefer structured payloads (res.data.bookings) but fall back safely
      return res.data?.bookings ?? res.data ?? [];
    } catch (err) {
      console.error("getBookingData error", err);
      return [];
    }
  },

  getRequestData: async (userid) => {
    try {
      const res = await API.get(`/bookingrequest/${userid}`);
      console.log(res.data);
      return res.data?.requests ?? res.data ?? [];
    } catch (err) {
      console.error("getRequestData error", err);
      return [];
    }
  },

  getRideData: async (userid) => {
    try {
      const res = await API.get(`/drivertab/${userid}`);
      console.log(res.data);
      return res.data?.rides ?? res.data ?? [];
    } catch (err) {
      console.error("getRideData error", err);
      return [];
    }
  },
  approverequest: async (bookingId) => {
    try {
      console.log("calling approverequest endpoint for id:", bookingId);
      const res = await API.patch(`/approvecanclerequest/${bookingId}`);
      console.log("approverequest response:", res.data);
      // Return the actual response object so caller can inspect success/failure
      return res.data ?? null;
    } catch (err) {
      console.error("approverequest error", err);
      return null;
    }
  },
};