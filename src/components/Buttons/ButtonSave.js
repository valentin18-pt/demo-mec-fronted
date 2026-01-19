import React from 'react';
import { Save } from 'lucide-react';
import './ButtonSave.css';

const ButtonSave = ({ onClick }) => {
  return (
    <button className="boton-guardar" onClick={onClick} title="Guardar">
      <Save />
    </button>
  );
};

export default ButtonSave;