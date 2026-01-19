import axiosPrivate from "./axiosPrivate";

const getGastosConcepto = (perfil_id, usuario_id) => {
  return axiosPrivate.post("getGastosConcepto", {
    perfil_id,
    usuario_id
  }).then(response => response.data);
};

export default {
    getGastosConcepto,
};