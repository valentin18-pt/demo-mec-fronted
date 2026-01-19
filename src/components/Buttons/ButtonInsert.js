import React from 'react';
import { Plus } from 'lucide-react';
import './ButtonInsert.css';

const ButtonInsert = ({ onClick }) => {
  return (
    <button className="boton-agregar" onClick={onClick} title="Agregar registro">
      <Plus />
      <span>Agregar</span>
    </button>
  );
};

export default ButtonInsert;