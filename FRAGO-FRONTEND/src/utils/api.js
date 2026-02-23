import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config.url;
      if (
        !url.includes("/login") &&
        !url.includes("/register") &&
        !url.includes("/verify-otp")
      ) {
        window.dispatchEvent(new CustomEvent("sessionExpired"));
      }
    }
    return Promise.reject(error);
  },
);

export default api;
