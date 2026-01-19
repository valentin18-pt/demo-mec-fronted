import axiosPrivate from "./axiosPrivate";

const getDatosAbc = (perfil_id, usuario_id, periodo_fecha) => {
  return axiosPrivate.post("getDatosAbc", {
    perfil_id,
    usuario_id,
    periodo_fecha
  }).then(response => response.data);
};

const insertDatosAbc = (datosAbc) => {
    return axiosPrivate.post("insertDatosAbc", datosAbc)
        .then(response => response.data);
};

const updateDatosAbc = (datosAbc) => {
    return axiosPrivate.post("updateDatosAbc", datosAbc)
        .then(response => response.data);
};

const deleteDatosAbc = (datosAbc) => {
    return axiosPrivate.post("deleteDatosAbc", datosAbc)
        .then(response => response.data);
};

const registerDatosAbc = (datosAbc) => {
    return axiosPrivate.post("registerDatosAbc", datosAbc)
        .then(response => response.data);
};

export default {
    getDatosAbc,
    insertDatosAbc,
    updateDatosAbc,
    deleteDatosAbc,
    registerDatosAbc
};