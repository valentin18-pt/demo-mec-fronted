import React from 'react';
import { Trash2 } from 'lucide-react';
import './ButtonDelete.css';

const ButtonDelete = ({ onClick }) => {
  return (
    <button className="boton-eliminar" onClick={onClick} title="Eliminar">
      <Trash2 />
    </button>
  );
};

export default ButtonDelete;