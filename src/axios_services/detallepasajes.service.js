import axiosPrivate from "./axiosPrivate";

const getDetallePasajes = () => {
    return axiosPrivate.get("detalle-pasajes")
        .then(response => response.data);
};

const insertDetallePasajes = (data) => {
    return axiosPrivate.post("detalle-pasajes", data)
        .then(response => response.data);
};

const updateDetallePasajes = (data) => {
    return axiosPrivate.put("detalle-pasajes", data)
        .then(response => response.data);
};

const deleteDetallePasajes = (data) => {
    return axiosPrivate.delete("detalle-pasajes", { data })
        .then(response => response.data);
};

export default {
    getDetallePasajes,
    insertDetallePasajes,
    updateDetallePasajes,
    deleteDetallePasajes
};