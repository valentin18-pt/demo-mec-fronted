import axiosPrivate from "./axiosPrivate";

const getViaticoSolicitud = (usuario_id, mes) => {
    return axiosPrivate.get("viatico-solicitud", {
        params: { usuario_id, mes }
    }).then(response => response.data);
};

const insertViaticoSolicitud = (data) => {
    return axiosPrivate.post("viatico-solicitud", data)
        .then(response => response.data);
};

const updateViaticoSolicitud = (data) => {
    return axiosPrivate.put("viatico-solicitud", data)
        .then(response => response.data);
};

const deleteViaticoSolicitud = (data) => {
    return axiosPrivate.delete("viatico-solicitud", { data })
        .then(response => response.data);
};

const validarViaticoSolicitud = (data) => {
    return axiosPrivate.post("validar-viatico-solicitud", data)
        .then(response => response.data);
};

export default {
    getViaticoSolicitud,
    insertViaticoSolicitud,
    updateViaticoSolicitud,
    deleteViaticoSolicitud,
    validarViaticoSolicitud
};