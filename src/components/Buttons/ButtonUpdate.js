import React from 'react';
import { Edit2 } from 'lucide-react';
import './ButtonUpdate.css';

const ButtonUpdate = ({ onClick, title, disabled }) => {
  return (
    <button className="boton-actualizar" onClick={onClick} title="Actualizar">
      <Edit2 />
    </button>
  );
};

export default ButtonUpdate;