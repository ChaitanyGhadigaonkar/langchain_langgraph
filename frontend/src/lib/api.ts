import axios from "axios";

export const axiosClient = axios.create({
  baseURL: typeof window === "undefined" ? process.env.API_BASE_URL || "http://127.0.0.1:8000" : "/api",
  headers: {
    user_id: "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b",
  },
});
