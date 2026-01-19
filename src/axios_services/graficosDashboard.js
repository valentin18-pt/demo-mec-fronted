import axiosPrivate from "./axiosPrivate";

const getMapaDesembolsos = (params = {}) => {
  return axiosPrivate.post("getMapaDesembolsos", params)
    .then(response => response.data);
};

const getDetalleDesembolsos = (params = {}) => {
  return axiosPrivate.post("getDetalleDesembolsos", params)
    .then(response => response.data);
};

const getAvancesMensuales = (params = {}) => {
  return axiosPrivate.post("getAvancesMensuales", params)
    .then(response => response.data);
};

const getAvancesSemestrales = (params = {}) => {
  return axiosPrivate.post("getAvancesSemestrales", params)
    .then(response => response.data);
};

export default {
  getDetalleDesembolsos,
  getMapaDesembolsos,
  getAvancesMensuales,
  getAvancesSemestrales
};
