import axiosPrivate from "./axiosPrivate";

const getSeguimientoDesembolsos = (
    fecha_min,
    fecha_max,
    gestor_id,
    supervisor_id,
    zonal_id  
) => {
  return axiosPrivate.post("seguimiento-desembolsos", {
    fecha_min,
    fecha_max,
    gestor_id,
    supervisor_id,
    zonal_id
  }).then(response => response.data);
};

const createSeguimientoDesembolso = (data) => {
  return axiosPrivate.post("seguimiento-desembolso", data)
    .then(response => response.data);
};

const updateSeguimientoDesembolso = (data) => {
  return axiosPrivate.put("seguimiento-desembolso", data)
    .then(response => response.data);
};

export default {
  getSeguimientoDesembolsos,
  createSeguimientoDesembolso,
  updateSeguimientoDesembolso
}