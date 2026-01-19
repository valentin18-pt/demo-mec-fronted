import axiosPrivate from "./axiosPrivate";

const getCajaFinancieroMovimiento = (perfil_id, usuario_id, periodo_fecha) => {
  return axiosPrivate.post("getCajaFinancieroMovimiento", {
    perfil_id,
    usuario_id,
    periodo_fecha
  }).then(response => response.data);
};

const insertCajaFinancieroMovimiento = (data) => {
    return axiosPrivate.post("insertCajaFinancieroMovimiento", data)
        .then(response => response.data);
};

const updateCajaFinancieroMovimiento = (data) => {
    return axiosPrivate.post("updateCajaFinancieroMovimiento", data)
        .then(response => response.data);
};

const deleteCajaFinancieroMovimiento = (data) => {
    return axiosPrivate.post("deleteCajaFinancieroMovimiento", data)
        .then(response => response.data);
};

export default {
    getCajaFinancieroMovimiento,
    insertCajaFinancieroMovimiento,
    updateCajaFinancieroMovimiento,
    deleteCajaFinancieroMovimiento
};