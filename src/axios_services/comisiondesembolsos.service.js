import axiosPrivate from "./axiosPrivate";

const getComisionDesembolsos = (fecha_min, fecha_max) => {
  return axiosPrivate.post("comision-desembolsos", {
    fecha_min,
    fecha_max
  }).then(response => response.data);
};

export default {
  getComisionDesembolsos
};