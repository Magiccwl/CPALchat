
import axios from "axios";

const baseUrl = "http://localhost:3000";

export const request = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

request.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem("accessToken");
    config.headers.Authorization = `Bearer ${accessToken || ""}`
    return config;
  },
  (err) => {
    throw new Error(err);
  }
);
