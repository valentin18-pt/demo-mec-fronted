import axiosPrivate from "./axiosPrivate";

const getCostosDirectos = (perfil_id, usuario_id, periodo_planilla, tipo_desembolso = 0) => {
  return axiosPrivate.post("getCostosDirectos", {
    perfil_id,
    usuario_id,
    periodo_planilla,
    tipo_desembolso
  }).then(response => response.data);
};

export default {
    getCostosDirectos
};