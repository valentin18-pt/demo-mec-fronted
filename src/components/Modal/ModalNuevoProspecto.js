import React, {useState, useContext} from "react";
import {AppContext} from '../../application/provider';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button,Form, FormGroup} from 'reactstrap';
import "./ModalNuevoProspecto.css";
import ProspectoService from "../../axios_services/prospectos.service";


function ModalNuevoProspecto({isOpen}) {

    const [state,setState] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [prospecto, setProspecto] = useState({});

    //CATALOGOS
    const [instituciones] = useState(state.catalogos.instituciones);
    const [departamentos,setDepartamentos] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 1}));
    const [sectores,setSectores] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 2}));
    const [condiciones_contrato,setCondicionesContrato] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 13}));

    const insertarProspecto = async () => {

        if (!prospecto.nombres || prospecto.nombres.trim() === '') {
            alert("Por favor, inserte un nombre válido");
            return;
        }
        if (!prospecto.apellidos || prospecto.apellidos.trim() === '') {
            alert("Por favor, inserte apellidos válido");
            return;
        }
    
        if (!prospecto.dni || prospecto.dni.trim() === '') {
            alert("Por favor, inserte un DNI válido");
            return;
        }

        if (prospecto.dni.trim().length !== 8) {
            alert("El DNI debe contener 8 dígitos. Por favor, verifique e intente nuevamente.");
            return;
        }

        if (!prospecto.institucion) {
            alert("Por favor, seleccione una institución válida");
            return;
        }

        if (!prospecto.celular || !/^\d{9}$/.test(prospecto.celular)) {
            alert("Por favor, ingrese un celular válido");
            return;
        }
        setIsSaved(true);
        try {
            const data = await ProspectoService.insertarProspecto(
                `${prospecto.apellidos.toUpperCase()}, ${prospecto.nombres.toUpperCase()}`,
                prospecto.dni,
                prospecto.institucion,
                prospecto.cargo || '',
                prospecto.contrato_condicion || '',
                prospecto.rango_ingresos || '',
                prospecto.celular,
                state.user?.usuario_id,
                state.zonal_id
            );
            setProspecto({
                nombres: '',
                apellidos: '',
                dni: '',
                institucion: '',
                cargo: '',
                contrato_condicion: '',
                rango_ingresos: '',
                celular: ''
            });
            alert("Prospecto registrado satisfactoriamente");
            setIsSaved(false);
            actualizarSeguimiento();
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                if (error.response.data.errors.dni) {
                    alert("El DNI ingresado ya existe en la base de datos.");
                }
            } else {
                alert("Hubo un error al intentar registrar el prospecto. Por favor, inténtelo de nuevo.");
            }
            setIsSaved(false);
        }
    };

    const actualizarSeguimiento = () => {
        setState((prevState) => ({
            ...prevState, 
            prospectoInsertado: true
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setProspecto((prevDatos) => ({
            ...prevDatos,
            [name]: value,
        }));
    };

    function cerrarModal () {
        setState((prevState) => ({
            ...prevState,
            modalNuevoProspecto: false,
        }));
        setProspecto({});
        setIsSaved(false);
    }; 


    return (
        <Modal isOpen={state.modalNuevoProspecto} className="custom-modal" backdrop={true}>
            <ModalHeader className="modal-header">
                <div class="titulo">
                <h1>NUEVO PROSPECTO</h1>
                <Button className="close-btn" onClick={cerrarModal}>X</Button>
                </div>
            </ModalHeader>
            <div class="modal-body-footer">
            <ModalBody className="modal-body">
                <span>Los campos marcados con (*) son obligatorios para completar el formulario.</span>
                <div class="filter-colum1">
                    <FormGroup>
                        <label>Nombres (*):</label>
                        <div className="input-group custom-input-group">
                            <input
                                className="form-control"
                                name="nombres"
                                type="text"
                                value={prospecto && prospecto.nombres ? prospecto.nombres : ''}
                                onChange={handleChange}
                            />
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <label>Apellidos (*):</label>
                        <div className="input-group custom-input-group">
                            <input
                                className="form-control"
                                name="apellidos"
                                type="text"
                                value={prospecto && prospecto.apellidos ? prospecto.apellidos : ''}
                                onChange={handleChange}
                            />
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <label >DNI (*):</label>
                        <input 
                            className="form-control"
                            name="dni"
                            type="text" 
                            value={prospecto && prospecto.dni ? prospecto.dni : ''}
                            onChange={handleChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label >Celular (*):</label>
                        <input 
                            className="form-control"
                            name="celular"
                            type="text" 
                            value={prospecto && prospecto.celular ? prospecto.celular : ''}
                            onChange={handleChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label >Sector:</label>
                        <select
                            name="sector"
                            className="form-control"
                            value={prospecto?.sector || ''}
                            onChange={(e) => handleChange(e)}
                        >
                            <option value="">Seleccione...</option>
                            {sectores.map((item) => (
                                <option key={item.tipo_id} value={item.tipo_id}>
                                    {item.descripcion}
                                </option>
                            ))}
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <label >Departamento:</label>
                        <select
                            name="departamento"
                            className="form-control"
                            value={prospecto?.departamento || ''}
                            onChange={(e) => handleChange(e)}
                        >
                            <option value="">Seleccione...</option>
                            {departamentos.map((item) => (
                                <option key={item.tipo_id} value={item.tipo_id}>
                                    {item.descripcion}
                                </option>
                            ))}
                        </select>

                    </FormGroup>
                    <FormGroup>
                        <label >Institución (*):</label>
                        <select
                            name="institucion"
                            className="form-control"
                            value={prospecto?.institucion || ''}
                            onChange={(e) => handleChange(e)}
                        >
                            <option value="">Seleccione...</option>
                            {instituciones
                                .filter(institucion => prospecto.sector ? institucion.sector_id === prospecto.sector : true)
                                .filter(institucion => prospecto.departamento ? institucion.region_id === prospecto.departamento : true)
                                .map((item) => (
                                    <option key={item.institucion_id} value={item.institucion_id}>
                                        {item.razon_social}
                                    </option>
                            ))}
                        </select>
                    </FormGroup>                    
                    <FormGroup>
                        <label >Cargo:</label>
                        <input 
                            className="form-control"
                            name="cargo"
                            type="text" 
                            maxLength={20} 
                            value={prospecto.cargo || ''}
                            onChange={handleChange}
                        />
                        <small>{(prospecto.cargo?.length || 0)} / 20</small>
                    </FormGroup>
                    <FormGroup>
                        <label >Condición del contrato:</label>
                        <select
                            name="contrato_condicion"
                            className="form-control"
                            value={prospecto?.contrato_condicion || ''}
                            onChange={(e) => handleChange(e)}
                        >
                            <option value="">Seleccione...</option>
                            {condiciones_contrato.map((item) => (
                                <option key={item.tipo_id} value={item.tipo_id}>
                                    {item.descripcion}
                                </option>
                            ))}
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <label>Rango de ingresos:</label>
                        <div className="input-group custom-input-group">
                            <span className="input-group-text custom-symbol">S/.</span>
                            <input
                                className="form-control"
                                name="rango_ingresos"
                                type="number"
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={prospecto && prospecto.rango_ingresos ? prospecto.rango_ingresos : ''}
                            />
                        </div>
                    </FormGroup>
                </div>
                
            </ModalBody>
            <ModalFooter>
                <div className="button-container">
                    <Button 
                        className="button-custom" 
                        disabled={isSaved}
                        onClick={async () => {await insertarProspecto()}}
                    >
                        Registrar
                    </Button>
                </div>
            </ModalFooter>
            </div>
        </Modal>
    );
}

export default ModalNuevoProspecto;