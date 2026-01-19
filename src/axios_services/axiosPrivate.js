import axios from "axios";
import API_URL_BASE from "./apiConfig";

const axiosPrivate = axios.create({
  baseURL: API_URL_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

axiosPrivate.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosPrivate.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("auth_token");
      alert("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
      window.location.href = "/";
      return Promise.reject("Sesión expirada.");
    }
    return Promise.reject(error);
  }
);

export default axiosPrivate;