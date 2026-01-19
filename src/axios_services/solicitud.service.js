import axiosPrivate from "./axiosPrivate";

const getReporteDesembolsados = (
  usuario_id, 
  perfil_id,
  fecha_min,
  fecha_max,
  estado_revision,
  gestor_id,
  supervisor_id,
  zonal_id
) => {
  return axiosPrivate.post("getReporteDesembolsados", 
    {
      usuario_id, 
      perfil_id,
      fecha_min,
      fecha_max,
      estado_revision,
      gestor_id,
      supervisor_id,
      zonal_id
    }
  ).then(response => response.data);
};

const getReporteSolicitudesExtra = (
  usuario_id, 
  perfil_id,
  fecha_min,
  fecha_max,
  estado_id,
  gestor_id,
  supervisor_id,
  zonal_id
) => {
  return axiosPrivate.post("getReporteSolicitudesExtra", 
    {
      usuario_id, 
      perfil_id,
      fecha_min,
      fecha_max,
      estado_id,
      gestor_id,
      supervisor_id,
      zonal_id
    }
  ).then(response => response.data);
};

const updateEstadoRevision = (
  propuesta_solicitud_id, 
  estado_revision
) => {
  return axiosPrivate.post("updateEstadoRevision", 
    {
      propuesta_solicitud_id, 
      estado_revision
    }
  ).then(response => response.data);
};

const getSeguimientoER = (
  propuesta_solicitud_id
) => {
  return axiosPrivate.post("getSeguimientoER", 
    {
      propuesta_solicitud_id
    }
  ).then(response => response.data);
};

const updateDesembolsos = (
    usuario_id,
    prospecto_id,
    propuesta_solicitud_id,
    dni,
    nombre,
    monto_bruto_final,
    monto_neto_final,
    responsable_agencia_id,
    fecha_desembolso,
    tasa,
    plazo,
    archivo_expedientillo
) => {
    const formData = new FormData();
    
    formData.append('usuario_id', usuario_id);
    formData.append('prospecto_id', prospecto_id);
    formData.append('propuesta_solicitud_id', propuesta_solicitud_id);
    formData.append('dni', dni);
    formData.append('nombre', nombre);
    formData.append('monto_bruto_final', monto_bruto_final);
    formData.append('monto_neto_final', monto_neto_final);
    formData.append('responsable_agencia_id', responsable_agencia_id);
    formData.append('fecha_desembolso', fecha_desembolso);
    formData.append('tasa', tasa);
    formData.append('plazo', plazo);
    
    if (archivo_expedientillo) {
      formData.append('archivo_expedientillo', archivo_expedientillo);
    }
    return axiosPrivate.post("updateDesembolsos", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => response.data);
};

const deletePropuestaSolicitud = (
  propuesta_solicitud_id,
  prospecto_id,
  n_solicitud,
  usuario_id
) => {
  return axiosPrivate.post("deletePropuestaSolicitud", 
    {
      propuesta_solicitud_id,
      prospecto_id,
      n_solicitud,
      usuario_id
    }
  ).then(response => response.data);
};

const guardarExpedientillo = (
  propuesta_solicitud_id, 
  usuario_id,
  expedientillo_file
) => {
  const formData = new FormData();
  formData.append("propuesta_solicitud_id", propuesta_solicitud_id);
  formData.append("usuario_id", usuario_id);
  formData.append("expedientillo_file", expedientillo_file);

  return axiosPrivate.post("guardarExpedientillo", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
  .then(response => response.data)
  .catch(error => {
    console.error("Error al guardar el expedientillo:", error);
    throw error;
  });
};

const getDatosExpedientillo = (
  propuesta_solicitud_id
) => {
  return axiosPrivate.post("getDatosExpedientillo", 
    {
      propuesta_solicitud_id
    }
  ).then(response => response.data);
};

const getExpedientillo = (
  propuesta_solicitud_id
) => {
  return axiosPrivate.post("getExpedientillo", 
    {
      propuesta_solicitud_id
    }
  ).then(response => response.data.url);
};

const createValidacionCaja = (params = {}) => {
  return axiosPrivate.post("createValidacionCaja", params)
    .then(response => response.data);
};

export default {
  getReporteDesembolsados,
  updateEstadoRevision,
  getSeguimientoER,
  updateDesembolsos,
  deletePropuestaSolicitud,
  guardarExpedientillo,
  getDatosExpedientillo,
  getExpedientillo,
  getReporteSolicitudesExtra,
  createValidacionCaja
};
