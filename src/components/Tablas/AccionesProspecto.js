import React from "react";
import { Eye, FileText } from "lucide-react";

const AccionesProspecto = ({ prospecto, onVerMas, onPropuestaSolicitud }) => {
  const estadosHabilitados = [3, 11, 4, 5];
  const isPropuestaDisabled = !estadosHabilitados.includes(Number(prospecto.estado_id));

  return (
    <td>
      <div className="acciones-container">
        <button
          className="boton-accion"
          title="Ver más"
          onClick={() => onVerMas(prospecto)}
        >
          <Eye color="#f8a73a" size={25} />
        </button>
        <button
          className="boton-accion"
          title="Propuesta de Solicitud"
          disabled={isPropuestaDisabled}
          onClick={() => onPropuestaSolicitud(prospecto)}
        >
          <FileText 
            color={isPropuestaDisabled ? "#dc3545" : "#28a745"}
            size={25}
          />
        </button>
      </div>
    </td>
  );
};

export default AccionesProspecto;