import axiosPublic from "./axiosPublic";
import axiosPrivate from "./axiosPrivate";

const login = (codigo_usuario, password) => {
  return axiosPublic.post("login", { codigo_usuario, password })
    .then(res => res.data);
};

const logout = () => {
  return axiosPrivate.post('logout')
    .then(res => res.data);
};

const getDatosHistoricosUsuario = (usuario_id) => {
  return axiosPrivate.post("getDatosHistoricosUsuario", { usuario_id })
    .then(res => res.data);
};

const getPersonal = (usuario_id, supervisor_id, zonal_id, perfil_id) => {
  return axiosPrivate.post("getPersonal", {
    usuario_id,
    supervisor_id,
    zonal_id,
    perfil_id
  }).then(res => res.data);
};

const createUsuario = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  return axiosPrivate.post("registerUser", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then(res => res.data);
};

const getUsuarios = () => {
  return axiosPrivate.post("getUsuarios")
    .then(res => res.data);
};

const getUsuariosPorPeriodo = (area_id, periodo_fecha) => {
  return axiosPrivate.post("getUsuariosPorPeriodo", { area_id, periodo_fecha })
    .then(res => res.data);
};

const updateUserRRHH = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  return axiosPrivate.post("updateUserRRHH", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then(res => res.data);
};

const deleteUsuario = (usuario_responsable_id, usuario_id, fecha_cese, motivo_cese_id, comentario, devolvio_fotocheck) => {
  return axiosPrivate.post("deleteUsuario", {
    usuario_responsable_id,
    usuario_id,
    fecha_cese,
    motivo_cese_id,
    comentario,
    devolvio_fotocheck
  }).then(res => res.data);
};

const reestablecerUsuario = (usuario_responsable_id, usuario_id, fecha_ingreso) => {
  return axiosPrivate.post("reestablecerUsuario", {
    usuario_responsable_id,
    usuario_id,
    fecha_ingreso
  }).then(res => res.data);
};

const updatePassword = (usuario_id, password) => {
  return axiosPrivate.post("updatePassword", { usuario_id, password })
    .then(res => res.data);
};

const getGestores = (usuario_id, perfil_id) => {
  return axiosPrivate.post("getGestores", { usuario_id, perfil_id })
    .then(res => res.data);
};

const getSupervisores = (usuario_id, perfil_id) => {
  return axiosPrivate.post("getSupervisores", { usuario_id, perfil_id })
    .then(res => res.data);
};

const getZonales = (usuario_id, perfil_id) => {
  return axiosPrivate.post("getZonales", { usuario_id, perfil_id })
    .then(res => res.data);
};

const calcularPlanilla = (perfil_id, usuario_id, periodo_fecha) => {
  return axiosPrivate.post("calcularPlanilla", { perfil_id, usuario_id, periodo_fecha })
    .then(res => res.data);
};

const getBonosDescuentos = (perfil_id) => {
  return axiosPrivate.post("getBonosDescuentosActuales", { perfil_id })
    .then(res => res.data);
};

const insertarBonoDescuento = (usuario_id, usuario_asignado_id, tipo, monto, descripcion, archivo_evidencia) => {
  const formData = new FormData();
  formData.append("usuario_id", usuario_id);
  formData.append("usuario_asignado_id", usuario_asignado_id);
  formData.append("tipo", tipo);
  formData.append("monto", monto);
  formData.append("descripcion", descripcion);
  formData.append("archivo_evidencia", archivo_evidencia);

  return axiosPrivate.post("insertarBonoDescuento", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  .then(res => res.data)
  .catch(error => {
    console.error("Error al registrar bono/descuento:", error);
    throw error;
  });
};

const getHistorialCesesIngresos = (años) => {
  return axiosPrivate.post("getHistorialCesesIngresos", { años })
    .then(res => res.data);
};

const getCantidadUsuariosPorPeriodo = (años) => {
  return axiosPrivate.post("getCantidadUsuariosPorPeriodo", { años })
    .then(res => res.data);
};

export default {
  login,
  logout,
  getDatosHistoricosUsuario,
  updatePassword,
  getGestores,
  getSupervisores,
  getZonales,
  getPersonal,
  createUsuario,
  updateUserRRHH,
  deleteUsuario,
  reestablecerUsuario,
  getUsuarios,
  getUsuariosPorPeriodo,
  calcularPlanilla,
  getBonosDescuentos,
  insertarBonoDescuento,
  getHistorialCesesIngresos,
  getCantidadUsuariosPorPeriodo
};