import React, {useState, useContext} from "react";
import {AppContext} from '../../application/provider';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Toast, ToastBody,Form, FormGroup} from 'reactstrap';
import "./ModalNuevaPS.css";
import ProspectoService from "../../axios_services/prospectos.service";
import CatalogoService from "../../axios_services/catalogo.service";
import {SearchSelect,SearchSelectItem} from '@tremor/react';
import Loader from '../../components/Loader/Loader'; 


function ModalNuevaPS({isOpen}) {

    const [state,setState] = useContext(AppContext);
    const [propuesta_solicitud, setPropuestaSolicitud] = useState({monto_neto_final: 0, monto_bruto_final: 0});
    const [responsables_agencias, setResponsablesAgencias] = useState([]);
    const isFirstRender = React.useRef(true);
    const [loading, setLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    //CATALOGOS
    const [desembolsos,setDesembolsos] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 10}));
    const [canal_captacion,setCanalCaptacion] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 14}));

    const createPropuestaSolicitud = async () => {

        if (!propuesta_solicitud.monto_neto_propuesto) {
            alert("El campo 'Monto Neto Propuesto' es obligatorio.");
            return;
        } else if (Number(propuesta_solicitud.desembolso_id) === 2 && !propuesta_solicitud.monto_bruto_propuesto) {
            alert("El campo 'Monto Bruto Propuesto' es obligatorio.");
            return;
        } else if (!propuesta_solicitud.fecha_envio) {
            alert("El campo 'Fecha de Envío' es obligatorio.");
            return;
        } else if (!propuesta_solicitud.agencia_id) {
            alert("El campo 'Agencia' es obligatorio.");
            return;
        } else if (!propuesta_solicitud.asesor_agencia) {
            alert("El campo 'Asesor de Agencia' es obligatorio.");
            return;
        } else if (propuesta_solicitud.monto_neto_final === undefined || propuesta_solicitud.monto_neto_final === '') {
            alert("El campo 'Monto Neto Final' es obligatorio.");
            return;
        } else if (Number(propuesta_solicitud.desembolso_id) === 2 && (propuesta_solicitud.monto_bruto_final === undefined || propuesta_solicitud.monto_bruto_final === '')) {
            alert("El campo 'Monto Bruto Final' es obligatorio.");
            return;
        } else if (!propuesta_solicitud.tasa) {
            alert("El campo 'Tasa' es obligatorio.");
            return;
        } else if (!propuesta_solicitud.plazo) {
            alert("El campo 'Plazo' es obligatorio.");
            return;
        } else if (!Number.isInteger((Number(propuesta_solicitud.plazo)))) {
            alert("El campo 'Plazo' debe ser entero");
            return;
        } else if (!propuesta_solicitud.desembolso_id) {
            alert("El campo 'Desembolso' es obligatorio.");
            return;
        } else if (!propuesta_solicitud.canal_captacion) {
            alert("El campo 'Canal de captación' es obligatorio.");
            return;
        }

        try {
            if(Number(propuesta_solicitud.desembolso_id) === 1 ){
                propuesta_solicitud.monto_bruto_propuesto = propuesta_solicitud.monto_neto_propuesto
            }

            if(Number(propuesta_solicitud.desembolso_id) === 1 ){
                propuesta_solicitud.monto_bruto_final = propuesta_solicitud.monto_neto_final
            }
                
            const data = await ProspectoService.createPropuestaSolicitud(
                propuesta_solicitud.monto_neto_propuesto, 
                propuesta_solicitud.monto_bruto_propuesto, 
                propuesta_solicitud.fecha_envio,
                state.user?.usuario_id,
                state.gestor_id,
                state.prospecto_id,
                propuesta_solicitud.agencia_id,
                propuesta_solicitud.asesor_agencia,
                propuesta_solicitud.monto_neto_final,
                propuesta_solicitud.monto_bruto_final,
                propuesta_solicitud.tasa,
                propuesta_solicitud.plazo,
                propuesta_solicitud.desembolso_id,
                propuesta_solicitud.canal_captacion,
                state.prospecto_dni,
                state.prospecto_nombre,
                state.prospecto_razon_social_id
            );
            setPropuestaSolicitud({
                monto_neto_propuesto: "",
                monto_bruto_propuesto: "",
                fecha_envio: "",
                agencia_id: "",
                monto_neto_final: "",
                monto_bruto_final: "",
                tasa: "",
                plazo: "",
                desembolso_id: "",
                asesor_agencia: "",
                canal_captacion: ""
            });
            setState((prevState) => ({...prevState, nuevaPropuesta: true}));
            alert("Propuesta de solicitud creada satisfactoriamente");
        } catch (error) {
            console.error("Error al crear la propuesta de solicitud:", error);
            alert("Hubo un error al crear la propuesta de solicitud.");
        }
    };

    const getResponsablesAgencias = async () => {
            const data = await CatalogoService.getResponsablesAgencias();
            setResponsablesAgencias(data);
        };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setPropuestaSolicitud((prevDatos) => ({
            ...prevDatos,
            [name]: value,
        }));
    };

    function cerrarModal () {
        setState((prevState) => ({
            ...prevState,
            modalNuevaPS: false,
        }));
    }; 

    React.useEffect(() => {
            const fetchData = async () => {
                setLoading(true);
                if(state.modalSolicitud === true){
                    await getResponsablesAgencias()
                }
                setLoading(false);
            }
            fetchData();
        }, [state.modalSolicitud]);


    return (
        <>
        {loading ? (
                <Loader />
            ) :(<Modal isOpen={state.modalNuevaPS} className="modal" backdrop={true}>
            <ModalHeader className="modal-header">
                <div class="titulo">
                <h1>NUEVA PROPUESTA</h1>
                <Button className="close-btn" onClick={cerrarModal}>X</Button>
                </div>
            </ModalHeader>
            <div class="modal-body-footer">
            <ModalBody className="modal-body">
            <span>Los campos marcados con (*) son obligatorios para completar el formulario.</span>
                <Form className="fila">
                    <FormGroup>
                        <label >Tipo de desembolso (*):</label>
                        <select 
                            className="form-control"
                            name="desembolso_id"
                            value={propuesta_solicitud.desembolso_id} 
                            onChange={handleChange}
                        >
                            <option value=''>Selecciona tipo de desembolso</option>
                            {desembolsos.map((item) => (
                                    <option key={item.tipo_id} value={item.tipo_id}>
                                        {item.descripcion}
                                    </option>
                                ))}
                        </select>
                    </FormGroup>
                    {Number(propuesta_solicitud.desembolso_id) === 2 && (<FormGroup>
                        <label>Monto bruto propuesto (*):</label>
                        <div className="input-group custom-input-group">
                            <span className="input-group-text custom-symbol">S/.</span>
                            <input
                                className="form-control"
                                name="monto_bruto_propuesto"
                                type="number"
                                value={propuesta_solicitud.monto_bruto_propuesto}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>
                    </FormGroup>)}
                    <FormGroup>
                        <label>Monto neto propuesto (*):</label>
                        <div className="input-group custom-input-group">
                            <span className="input-group-text custom-symbol">S/.</span>
                            <input
                                className="form-control"
                                name="monto_neto_propuesto"
                                type="number"
                                value={propuesta_solicitud.monto_neto_propuesto}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <label >Fecha de envio (*):</label>
                        <input 
                            className="form-control"
                            name="fecha_envio"
                            type="date" 
                            value={propuesta_solicitud.fecha_envio} 
                            onChange={handleChange} 
                            max={new Date(new Date().setHours(0, 0, 0, 0)).toISOString().split('T')[0]}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label >Departamento:</label>
                        <select
                            className="form-control"
                            name="departamento"
                            value={propuesta_solicitud.departamento}
                            onChange={handleChange}
                        >
                            <option value="">Selecciona un departamento</option>
                            {state.catalogos.agencias
                                .filter((value, index, self) => 
                                    index === self.findIndex((t) => t.departamento === value.departamento)
                                )
                                .map((item) => (
                                    <option key={item.departamento} value={item.departamento}>
                                        {item.departamento}
                                    </option>
                                ))}
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <label >Agencia (*):</label>
                        <select 
                            className="form-control"
                            name="agencia_id"
                            value={propuesta_solicitud.agencia_id} 
                            onChange={handleChange}
                        >
                            <option value=''>Selecciona una agencia</option>
                            {state.catalogos.agencias
                                .filter((agencia) =>
                                    propuesta_solicitud.departamento ? agencia.departamento === propuesta_solicitud.departamento : true
                                )
                                .map((item) => (
                                    <option key={item.agencia_id} value={item.agencia_id}>
                                        {item.descripcion}
                                    </option>
                                ))}
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <label >Asesor de agencia (*):</label>
                        <select 
                            className="form-control"
                            name="asesor_agencia"
                            value={propuesta_solicitud.asesor_agencia} 
                            onChange={handleChange}
                        >
                            <option value=''>Selecciona el asesor</option>
                            {responsables_agencias
                                .filter((responsable_agencia) =>
                                    propuesta_solicitud.agencia_id ? Number(responsable_agencia.agencia_id) === Number(propuesta_solicitud.agencia_id) : true
                                )
                                .filter((responsable_agencia) => responsable_agencia.nombres !== null)
                                .map((item) => (
                                    <option key={item.responsable_agencia_id} value={item.responsable_agencia_id}>
                                        {item.nombres}
                                    </option>
                                ))}
                        </select>
                    </FormGroup>
                    <FormGroup>
                        <label>Monto neto final:</label>
                        <div className="input-group custom-input-group">
                            <span className="input-group-text custom-symbol">S/.</span>
                            <input
                                className="form-control"
                                name="monto_neto_final"
                                type="number"
                                value={propuesta_solicitud.monto_neto_final}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>
                    </FormGroup>
                    {Number(propuesta_solicitud.desembolso_id) === 2 && (<FormGroup>
                        <label>Monto bruto final:</label>
                        <div className="input-group custom-input-group">
                            <span className="input-group-text custom-symbol">S/.</span>
                            <input
                                className="form-control"
                                name="monto_bruto_final"
                                type="number"
                                value={propuesta_solicitud.monto_bruto_final}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>
                    </FormGroup>)}
                    <FormGroup>
                        <label>Tasa (*):</label>
                        <div className="input-group custom-input-group">
                            <input
                                className="form-control"
                                name="tasa"
                                type="number"
                                value={propuesta_solicitud.tasa}
                                onChange={handleChange}
                                min="0"
                                step="0.0001"
                                placeholder="0.0000"
                            />
                            <span className="input-group-text custom-symbol">%</span>
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <label>Plazo en meses (*):</label>
                        <div className="input-group custom-input-group">
                            <input
                                className="form-control"
                                name="plazo"
                                type="number"
                                value={propuesta_solicitud.plazo}
                                onChange={handleChange}
                                min="0"
                                placeholder="0"
                            />
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <label >Canal de captación (*):</label>
                        <select 
                            className="form-control"
                            name="canal_captacion"
                            value={propuesta_solicitud.canal_captacion} 
                            onChange={handleChange}
                        >
                            <option value=''>Seleccione un canal de captación</option>
                            {canal_captacion.map((item) => (
                                    <option key={item.tipo_id} value={item.tipo_id}>
                                        {item.descripcion}
                                    </option>
                                ))}
                        </select>
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter>
                <div className="button-container">
                    <Button 
                        className="button-custom" 
                        disabled = {isSaved}
                        onClick={async () => {
                            setIsSaved(true);
                            await createPropuestaSolicitud();
                            setIsSaved(false);
                        }}
                    >
                        Registrar
                    </Button>
                </div>
            </ModalFooter>
            </div>
        </Modal>)}
        </>
    );
}

export default ModalNuevaPS;