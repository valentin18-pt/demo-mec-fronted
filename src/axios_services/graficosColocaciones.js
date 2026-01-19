import axiosPrivate from "./axiosPrivate";

const getDatosColocaciones = (params = {}) => {
    return axiosPrivate.post("getDatosColocaciones", params)
    .then(response => response.data);
};

export default {
    getDatosColocaciones
};