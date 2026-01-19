import axios from "axios";
import API_URL_BASE, { API_BASE_URL } from "./apiConfig";

const axiosPublic = axios.create({
  baseURL: API_URL_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

axiosPublic.interceptors.request.use(
  async (config) => {
    if (!document.cookie.includes('XSRF-TOKEN')) {
      try {
        await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, {
          withCredentials: true
        });
      } catch (error) {
        console.error('Error obteniendo CSRF token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosPublic;