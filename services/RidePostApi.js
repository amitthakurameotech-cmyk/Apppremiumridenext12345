import API from "./Api";

export const ridepostapi = {
     createride: async (rideData) => {
    const res = await API.post("/createride",rideData);
    console.log(res.data)
    return res.data;
  },
    getride: async (id) => {
    const res = await API.get("/getride");
    //console.log(res.data)
    return res.data;
  },
};
