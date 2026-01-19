import React from 'react';
import { Download } from 'lucide-react';
import './ButtonExcel.css';

const ButtonExcel = ({ onClick, disabled }) => {
  return (
    <button 
      className="boton-excel" 
      onClick={onClick} 
      disabled={disabled}
      title="Exportar a Excel"
    >
      <Download />
      <span>Exportar</span>
    </button>
  );
};

export default ButtonExcel;