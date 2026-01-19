import React from 'react';
import { X } from 'lucide-react';
import './ButtonCancel.css';

const ButtonCancel = ({ onClick }) => {
  return (
    <button className="boton-cancelar" onClick={onClick} title="Cancelar">
      <X />
    </button>
  );
};

export default ButtonCancel;