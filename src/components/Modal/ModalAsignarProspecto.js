import React, {useState, useContext} from "react";
import {AppContext} from '../../application/provider';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Toast, ToastBody,Form, FormGroup} from 'reactstrap';
import "./ModalNuevaPS.css";
import ProspectoService from "../../axios_services/prospectos.service";
import CatalogoService from "../../axios_services/catalogo.service";
import {SearchSelect,SearchSelectItem} from '@tremor/react';
import Loader from '../../components/Loader/Loader'; 


function ModalAsignarProspectos({isOpen}) {

    const [state,setState] = useContext(AppContext);
    const [responsables_agencias, setResponsablesAgencias] = useState([]);
    const isFirstRender = React.useRef(true);
    const [tipo_asignacion, setTipoAsignación] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const [formData, setFormData] = useState({
        tipo_asignacion: '',
        dni_prospecto: '',
        asignar_sin_gestor: false,
        gestor_destino: ''
    });

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        
        // Actualiza el estado basado en el tipo de input
        setFormData(prevFormData => ({
        ...prevFormData,
        [name]: type === 'checkbox' ? checked : value
        }));
    };

return (
    <div>
      <FormGroup>
        <label>Tipo de asignación (*):</label>
        <select 
          className="form-control"
          name="tipo_asignacion" // Agregamos el atributo 'name'
          value={formData.tipo_asignacion} 
          onChange={handleChange}
        >
          <option value="">Selecciona una opción</option>
          <option value="1">Individual (Manual)</option>
          <option value="2">Grupal (Masivo)</option>
        </select>
      </FormGroup>

      {/* Renderizado Condicional */}
      {formData.tipo_asignacion === '1' && (
        <FormGroup>
          <label>DNI del prospecto (*):</label>
          <input 
            type="text" 
            className="form-control"
            name="dni_prospecto" // Agregamos el atributo 'name'
            value={formData.dni_prospecto}
            onChange={handleChange}
            placeholder="Ingrese el DNI del prospecto"
          />
        </FormGroup>
      )}

      {formData.tipo_asignacion === '2' && (
        <FormGroup>
          <FormCheck 
            type="checkbox"
            label="Asignar a todos los prospectos sin gestor"
            name="asignar_sin_gestor" // Agregamos el atributo 'name'
            checked={formData.asignar_sin_gestor}
            onChange={handleChange}
          />
        </FormGroup>
      )}

      {/* Este campo se muestra si se ha seleccionado algún tipo de asignación */}
      {formData.tipo_asignacion && (
        <FormGroup>
          <label>Asignar a:</label>
          <select 
            className="form-control"
            name="gestor_destino" // Agregamos el atributo 'name'
            value={formData.gestor_destino} 
            onChange={handleChange}
          >
            <option value="">Selecciona un gestor</option>
            {gestores.map(gestor => (
              <option key={gestor.id} value={gestor.id}>
                {gestor.nombre}
              </option>
            ))}
          </select>
        </FormGroup>
      )}

      {/* Opcional: Mostrar el estado para depuración */}
      <hr />
      <p>Estado actual:</p>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </div>
  );
};

export default ModalAsignarProspectos;