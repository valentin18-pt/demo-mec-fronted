import axiosPrivate from "./axiosPrivate";

const getResumenFinal = (perfil_id, usuario_id, periodo_fecha, tipo_desembolso = 0) => {
  return axiosPrivate.post("getResumenFinal", {
    perfil_id,
    usuario_id,
    periodo_fecha,
    tipo_desembolso
  }).then(response => response.data);
};

export default {
    getResumenFinal
};