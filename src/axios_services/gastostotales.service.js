import axiosPrivate from "./axiosPrivate";

const getGastosTotales = (perfil_id, usuario_id, periodo_fecha) => {
    return axiosPrivate.post("getGastosTotales", {
        perfil_id,
        usuario_id,
        periodo_fecha
    }).then(response => response.data);
};

const insertGastosTotales = (gastoData) => {
    return axiosPrivate.post("insertGastosTotales", gastoData)
        .then(response => response.data);
};

const updateGastosTotales = (gastoData) => {
    return axiosPrivate.post("updateGastosTotales", gastoData)
        .then(response => response.data);
};

const deleteGastosTotales = (gastoIdObject) => {
    return axiosPrivate.post("deleteGastosTotales", gastoIdObject)
        .then(response => response.data);
};

export default {
    getGastosTotales,
    insertGastosTotales,
    updateGastosTotales,
    deleteGastosTotales
};