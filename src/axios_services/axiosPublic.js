import axios from "axios";
import { API_URL_BASE, API_URL_SANCTUM } from "./apiConfig";

const axiosPublic = axios.create({
  baseURL: API_URL_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const getCsrfToken = async () => {
  try {
    await axios.get(`${API_URL_SANCTUM}/sanctum/csrf-cookie`, {
      withCredentials: true
    });
  } catch (error) {
    console.error('Error obteniendo CSRF token:', error);
    throw error;
  }
};

export default axiosPublic;