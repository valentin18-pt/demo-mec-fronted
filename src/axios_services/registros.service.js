import axiosPrivate from "./axiosPrivate";

const registrarAsignaciones = (usuario_id, gestor_id, prospecto_ids) => {
  return axiosPrivate.post("registrarAsignaciones", 
    {
      usuario_id, 
      gestor_id,
      prospecto_ids
    }
  ).then(response => response.data);
};

export default {
  registrarAsignaciones,
};
