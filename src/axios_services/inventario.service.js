import axiosPrivate from "./axiosPrivate";

const crearInventario = (datosInventario) => {
  return axiosPrivate.post("createRegistroInventario", datosInventario)
    .then(response => response.data);
};

const getListaInventario = (filters = {}) => {
  return axiosPrivate.post("getRegistroInventario", filters)
    .then(response => response.data);
};

const actualizarInventario = (id, datosActualizados) => {
  return axiosPrivate.post(`updateRegistroInventario/${id}`, datosActualizados)
    .then(response => response.data);
};

const eliminarRegistroInventario = (id) => {
  return axiosPrivate.post(`deleteRegistroInventario/${id}`, {})
    .then(response => response.data);
};

export default {
  crearInventario,
  getListaInventario,
  actualizarInventario,
  eliminarRegistroInventario,
};

