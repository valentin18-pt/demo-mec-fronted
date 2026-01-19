import axiosPrivate from "./axiosPrivate";

const guardarExpedientillo = (propuesta_solicitud_id, usuario_id, archivo_expedientillo) => {
  const formData = new FormData();
  formData.append("propuesta_solicitud_id", propuesta_solicitud_id);
  formData.append("usuario_id", usuario_id);
  formData.append("archivo_expedientillo", archivo_expedientillo);

  return axiosPrivate.post("guardarExpedientillo", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then(res => res.data);
};

const getExpedientillo = (propuesta_solicitud_id) => {
  return axiosPrivate.post("getExpedientillo", { propuesta_solicitud_id })
    .then(res => res.data.data);
};

const guardarAudio = (prospecto_id, usuario_id, archivo_audio) => {
  const formData = new FormData();
  formData.append("prospecto_id", prospecto_id);
  formData.append("usuario_id", usuario_id);
  formData.append("archivo_audio", archivo_audio);

  return axiosPrivate.post("guardarAudio", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then(res => res.data);
};

const getAudio = (prospecto_id) => {
  return axiosPrivate.post("getAudio", { prospecto_id })
    .then(res => res.data.data);
};

const getEvidenciaBonoDescuento = (bono_descuento_id) => {
  return axiosPrivate.post("getEvidenciaBonoDescuento", { bono_descuento_id })
    .then(res => res.data.data);
};

const getFicha = (usuario_id) => {
  return axiosPrivate.post("getFicha", { usuario_id })
    .then(res => res.data.data);
};

const getContrato = (usuario_id) => {
  return axiosPrivate.post("getContrato", { usuario_id })
    .then(res => res.data.data);
};

const getDni = (usuario_id) => {
  return axiosPrivate.post("getDni", { usuario_id })
    .then(res => res.data.data);
};

const getReciboLuzAgua = (usuario_id) => {
  return axiosPrivate.post("getReciboLuzAgua", { usuario_id })
    .then(res => res.data.data);
};

const getCertijoven = (usuario_id) => {
  return axiosPrivate.post("getCertijoven", { usuario_id })
    .then(res => res.data.data);
};

const guardarImagenInventario = (archivo_inventario, origen_id, usuario_id) => {
  const formData = new FormData();
  formData.append("archivo_inventario", archivo_inventario);
  formData.append("origen_id", origen_id);
  formData.append("usuario_id", usuario_id);

  return axiosPrivate.post("guardarImagenInventario", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then(res => res.data);
};

const getImagenInventario = (origen_id) => {
  return axiosPrivate.post("getImagenInventario", { origen_id })
    .then(res => res.data.data);
};

const guardarFacturaInventario = (archivo_factura, origen_id, usuario_id) => {
  const formData = new FormData();
  formData.append("archivo_factura", archivo_factura);
  formData.append("origen_id", origen_id);
  formData.append("usuario_id", usuario_id);

  return axiosPrivate.post("guardarFacturaInventario", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then(res => res.data);
};

const getFacturaInventario = (origen_id) => {
  return axiosPrivate.post("getFacturaInventario", { origen_id })
    .then(res => res.data.data);
};

const guardarReciboPorHonorarios = (archivo_recibo_honorarios, origen_id, usuario_id, periodo_fecha) => {
  const formData = new FormData();
  formData.append("archivo_recibo_honorarios", archivo_recibo_honorarios);
  formData.append("origen_id", origen_id);
  formData.append("usuario_id", usuario_id);
  formData.append("periodo_fecha", periodo_fecha);

  return axiosPrivate.post("guardarReciboPorHonorarios", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then(res => res.data);
};

const getReciboPorHonorarios = (origen_id, periodo_fecha) => {
  return axiosPrivate.post("getReciboPorHonorarios", { origen_id, periodo_fecha })
    .then(res => res.data.data);
};

const guardarArchivoViaticoSolicitud = (archivo_viatico_solicitud, origen_id, usuario_id) => {
  const formData = new FormData();
  formData.append("archivo_viatico_solicitud", archivo_viatico_solicitud);
  formData.append("origen_id", origen_id);
  formData.append("usuario_id", usuario_id);

  return axiosPrivate.post("guardarDocumentoViaticoSolicitud", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }).then(res => res.data);
};

const getArchivoViaticoSolicitud = (origen_id) => {
  return axiosPrivate.post("getDocumentoViaticoSolicitud", { origen_id })
    .then(res => res.data);
};

export default {
  guardarExpedientillo,
  getExpedientillo,
  guardarAudio,
  getAudio,
  getEvidenciaBonoDescuento,
  getFicha,
  getContrato,
  getDni,
  getReciboLuzAgua,
  getCertijoven,
  guardarImagenInventario,
  getImagenInventario,
  guardarFacturaInventario,
  getFacturaInventario,
  guardarReciboPorHonorarios,
  getReciboPorHonorarios,
  guardarArchivoViaticoSolicitud,
  getArchivoViaticoSolicitud
};