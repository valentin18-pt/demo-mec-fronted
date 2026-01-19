import React from "react";
import "./AsignacionProspecto.css";

const CheckboxAsignacion = ({ prospectoId, checked, onChange }) => {
  return (
    <td className="check_asignacion">
      <input
        type="checkbox"
        value={prospectoId}
        onChange={onChange}
        checked={checked}
      />
    </td>
  );
};

export default CheckboxAsignacion;