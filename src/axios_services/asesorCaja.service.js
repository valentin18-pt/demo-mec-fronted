import axiosPrivate from "./axiosPrivate"; 

const deleteAsesorAgencia = (responsable_agencia_id) => {
  return axiosPrivate.post("deleteAsesorAgencia", { responsable_agencia_id })
    .then(response => response.data);
};

const updateAsesorCaja = (
  responsable_agencia_id,
  nombres,
  celular,
  correo,
  agencia_id,
  codigo_asesor
) => {
  return axiosPrivate.post("updateAsesorCaja", {
      responsable_agencia_id,
      nombres,
      celular,
      correo,
      agencia_id,
      codigo_asesor
    })
    .then(response => response.data);
};

const registrarAsesorCaja = (
  nombres,
  celular,
  correo,
  agencia_id,
  codigo_asesor
) => {
  return axiosPrivate.post("registrarAsesorCaja", {
      nombres,
      celular,
      correo,
      agencia_id,
      codigo_asesor
    })
    .then(response => response.data);
};

export default {
  deleteAsesorAgencia,
  updateAsesorCaja,
  registrarAsesorCaja
};
