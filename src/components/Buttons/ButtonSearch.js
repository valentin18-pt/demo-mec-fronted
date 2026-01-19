import React from 'react';
import { Search } from 'lucide-react';
import './ButtonSearch.css';

const ButtonSearch = ({ 
  onClick, 
  disabled = false,
  isLoading = false,
  className = '',
  children = 'Buscar'
}) => {
  return (
    <button 
      type="button"
      className={`boton-buscar ${className}`}
      onClick={onClick}
      disabled={isLoading}
      title="Buscar registros"
      aria-label="Buscar registros"
    >
      <Search aria-hidden="true" />
      <span>{isLoading ? 'Buscando...' : children}</span>
    </button>
  );
};

export default ButtonSearch;