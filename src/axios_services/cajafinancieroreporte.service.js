import axiosPrivate from "./axiosPrivate";

const getCajaFinancieroReporte = (perfil_id, usuario_id, periodo_fecha) => {
  return axiosPrivate.post("getCajaFinancieroReporte", {
    perfil_id,
    usuario_id,
    periodo_fecha
  }).then(response => response.data);
};

export default {
    getCajaFinancieroReporte
};