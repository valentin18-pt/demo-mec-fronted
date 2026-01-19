import axiosPrivate from "./axiosPrivate";

const getCajaCategoria = (perfil_id) => {
    return axiosPrivate.post("getCajaCategoria", {
        perfil_id
    }).then(response => response.data);
};

const insertCajaCategoria = (data) => {
    return axiosPrivate.post("insertCajaCategoria", data)
        .then(response => response.data);
};

const updateCajaCategoria = (data) => {
    return axiosPrivate.post("updateCajaCategoria", data)
        .then(response => response.data);
};

const deleteCajaCategoria = (data) => {
    return axiosPrivate.post("deleteCajaCategoria", data)
        .then(response => response.data);
};

const getCajaConcepto = (perfil_id) => {
    return axiosPrivate.post("getCajaConcepto", {
        perfil_id
    }).then(response => response.data);
};

const insertCajaConcepto = (data) => {
    return axiosPrivate.post("insertCajaConcepto", data)
        .then(response => response.data);
};

const updateCajaConcepto = (data) => {
    return axiosPrivate.post("updateCajaConcepto", data)
        .then(response => response.data);
};

const deleteCajaConcepto = (data) => {
    return axiosPrivate.post("deleteCajaConcepto", data)
        .then(response => response.data);
};

export default {
    getCajaCategoria,
    insertCajaCategoria,
    updateCajaCategoria,
    deleteCajaCategoria,
    getCajaConcepto,
    insertCajaConcepto,
    updateCajaConcepto,
    deleteCajaConcepto
};