import API from "./Api";

export const Auth = {
    login: async (email, password) => {
        const res = await API.post("/login", { email, password });
        //console.log(res.data)
        return res.data;
    },
    register: async (data) => {
        const res = await API.post("/register", data);
        return res.data;
    },
     getProfile: async () => {
    const res = await API.get(`/getuser/${id}`);
    return res.data;
  },
}

