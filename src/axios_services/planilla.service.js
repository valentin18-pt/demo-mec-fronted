import axiosPrivate from "./axiosPrivate";

const getPlanilla = (perfil_id, usuario_id, periodo_planilla) => {
  return axiosPrivate.post("getPlanilla", {
    perfil_id,
    usuario_id,
    periodo_planilla
  }).then(response => response.data);
};

const guardarPlanilla = (planillas) => {
  return axiosPrivate.post("guardarPlanilla", { planillas })
    .then(response => response.data);
};

const getCargoPago = (periodo_pago) => {
  return axiosPrivate.post("getCargoPago", { periodo_pago })
    .then(response => response.data);
};

const getMontoReciboHonorarios = (usuario_id, periodo_pago, perfil_id) => {
  return axiosPrivate.post("getMontoReciboHonorarios", { usuario_id, periodo_pago, perfil_id })
    .then(response => response.data);
};

const editarValidacionPlanillaArea = (
    usuariosIds,
    nuevoEstado,
    usuario_modifico_id,
    periodo_planilla
) => {
    return axiosPrivate.post("editarValidacionPlanillaArea", {
        usuarios_ids: usuariosIds,
        nuevo_estado: nuevoEstado,
        usuario_modifico_id: usuario_modifico_id,
        periodo_planilla: periodo_planilla,
    }).then(response => response.data);
};

const editarEstadoPago = (
    usuario_id,
    planilla_id,
    estado_pago,
    periodo_pago,
    file
) => {
    const formData = new FormData();
    
    formData.append('usuario_id', usuario_id);
    formData.append('planilla_id', planilla_id);
    formData.append('estado_pago_id', estado_pago);
    formData.append('periodo_pago', periodo_pago);
    
    if (file) {
      formData.append('archivo_factura_pago', file);
    }
    return axiosPrivate.post("editarEstadoPago", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => response.data);
};

export default {
  getPlanilla,
  getCargoPago,
  guardarPlanilla,
  editarValidacionPlanillaArea,
  getMontoReciboHonorarios,
  editarEstadoPago
};
