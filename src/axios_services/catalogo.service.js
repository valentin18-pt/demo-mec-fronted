import axiosPrivate from "./axiosPrivate";

const getTipos = () => {
  return axiosPrivate.post("getTipos", null)
    .then(response => response.data);
};

const getInstituciones = () => {
  return axiosPrivate.post("getInstituciones", {})
    .then(response => response.data);
};

const getInstitucionesFiltradas = (usuario_id, perfil_id) => {
  return axiosPrivate.post("getInstitucionesFiltradas", { usuario_id, perfil_id })
    .then(response => response.data);
};

const getAgencias = () => {
  return axiosPrivate.post("getAgencias", null)
    .then(response => response.data);
};

const getDirectorioAgencias = () => {
  return axiosPrivate.post("getDirectorioAgencias", null)
    .then(response => response.data);
};

const getResponsablesAgencias = () => {
  return axiosPrivate.post("getResponsablesAgencias", null)
    .then(response => response.data);
};

const getResponsablesPorAgencia = (agencia_id) => {
  return axiosPrivate.post("getResponsablesPorAgencia", { agencia_id })
    .then(response => response.data);
};

const getDistritos = () => {
  return axiosPrivate.post("getDistritos", null)
    .then(response => response.data);
};

export default {
  getTipos,
  getInstituciones,
  getInstitucionesFiltradas,
  getAgencias,
  getDirectorioAgencias,
  getResponsablesAgencias,
  getResponsablesPorAgencia,
  getDistritos
};
