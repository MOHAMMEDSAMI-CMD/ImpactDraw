import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  withCredentials: true,
});

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log(
      "API REQUEST:",
      config.method?.toUpperCase(),
      config.url
    );

    console.log(
      "TOKEN EXISTS:",
      !!token
    );

    if (token) {
      config.headers = config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;

      console.log(
        "AUTH HEADER ADDED"
      );
    } else {
      console.log(
        "NO TOKEN IN LOCALSTORAGE"
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      console.log(
        "401 UNAUTHORIZED:",
        error.config?.url
      );

      // Token invalid/expired
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

export default api;