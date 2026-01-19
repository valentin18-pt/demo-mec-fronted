import axios from "axios";
import API_URL_BASE from "./apiConfig";

const axiosPublic = axios.create({
  baseURL: API_URL_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosPublic;
