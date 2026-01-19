import axiosPrivate from "./axiosPrivate";

const getAvanceMetasPorGestor = (
  perfil_id,
  usuario_id,
  periodo_fecha,
  supervisor_id
) => {
  return axiosPrivate.post("getAvanceMetasPorGestor", {
    perfil_id,
    usuario_id,
    periodo_fecha,
    supervisor_id,
  }).then((response) => response.data);
};

const getAvanceMetasPorSupervisor = (
  perfil_id,
  usuario_id,
  periodo_fecha,
  supervisor_id
) => {
  return axiosPrivate.post("getAvanceMetasPorSupervisor", {
    perfil_id,
    usuario_id,
    periodo_fecha,
    supervisor_id,
  }).then((response) => response.data);
};

const getMetasMensuales = (perfil_id, usuario_id, periodo_fecha) => {
  return axiosPrivate.post("getMetasMensuales", {
    perfil_id,
    usuario_id,
    periodo_fecha,
  }).then((response) => response.data);
};

const insertarMetaMensual = (
  periodo_fecha,
  monto,
  usuario_id,
  usuario_asignado_id,
  tipo_meta_id,
  asignacion_meta_id
) => {
  return axiosPrivate.post("insertarMetaMensual", {
    periodo_fecha,
    monto,
    usuario_id,
    usuario_asignado_id,
    tipo_meta_id,
    asignacion_meta_id,
  }).then((response) => response.data);
};

const getJerarquiaSupervisor = (supervisor_id) => {
  return axiosPrivate.post("getJerarquiaSupervisor", {
    supervisor_id,
  }).then((response) => response.data);
};

export default {
  getAvanceMetasPorGestor,
  getAvanceMetasPorSupervisor,
  getMetasMensuales,
  insertarMetaMensual,
  getJerarquiaSupervisor,
};
