import React, {useState, useContext} from "react";
import {AppContext} from '../../application/provider';
import { Modal, ModalHeader, ModalBody,Button, Table} from 'reactstrap';
import "./ModalPropuestaSolicitud.css";
import ProspectoService from "../../axios_services/prospectos.service";
import ModalNuevaPS from "./ModalNuevaPS";
import ModalEditPS from "./ModalEditPS";
import Loader from '../../components/Loader/Loader'; 


function ModalPropuestaSolicitud({isOpen}) {
    const [state,setState] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [propuestas_solicitud, setPropuestasSolicitud] = useState([]);
    const isFirstRender = React.useRef(true);
    const [estados,setEstados] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 11}));

    const getPropuestasSolicitud = async (prospecto_id) => {
        const data = await ProspectoService.getPropuestasSolicitud(prospecto_id);
        setPropuestasSolicitud(data);
    };

    function mostrarModalNuevaPS (gestor_id, prospecto_id, agencias) {
        setState({ ...state, 
            modalNuevaPS:true,
            prospecto_id:prospecto_id,
            agencias:agencias,
            nuevaPropuesta:false,
            modalEditPS:false,
            gestor_id: gestor_id
        })
    };

    function mostrarModalEditPS (prospecto_id, solicitud) {
        setState({ ...state, 
            modalEditPS:true,
            prospecto_id:prospecto_id,
            propuesta_solicitud: solicitud,
            propuestaActualizada: false,
        })
    };

    const formatoSSoles = (monto) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(monto);
    };

    function cerrarModal () {
        setState((prevState) => ({
            ...prevState,
            modalSolicitud: false,
            prospecto_id: null,
            gestor_id: null,
            prospecto_nombre: null,
            prospecto_dni: null,
            estado_id : null
        }));
    }; 

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            if(state.modalSolicitud === true){
                await getPropuestasSolicitud(state.prospecto_id)
            }
            setLoading(false);
        }
        fetchData();
    }, [state.prospecto_id]);

    React.useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (state.modalSolicitud === true){
            if(state.nuevaPropuesta === true || state.propuestaActualizada === true){
                getPropuestasSolicitud(state.prospecto_id)}}
    }, [state.nuevaPropuesta, state.propuestaActualizada]);

    return (
        <Modal isOpen={state.modalSolicitud} className="custom-modal" backdrop={true}>
            <ModalHeader className="modal-header">
                <div class="titulo">
                <h1>{state.prospecto_nombre}</h1>
                <Button className="close-btn" onClick={cerrarModal}>X</Button>
                </div>
            </ModalHeader>
            <ModalBody>
            <div class="modal-body-footer">
                {loading 
                ? (<Loader />) 
                : (<div> 
                    <h3 className="seccion-modal">Propuestas de solicitud</h3>
                    <div className="container-button-estado">
                        <div>
                        </div>
                        <Button 
                            className="create-user-button" 
                            onClick={() => {mostrarModalNuevaPS(state.gestor_id, state.prospecto_id, state.agencias)}}
                            disabled={Number(state.estado_id) === 11}
                        >
                            Nueva solicitud
                        </Button>
                    </div>
                            <div className="table-container">
                                
                                <Table>
                                    <thead>
                                        <tr>
                                            <th>N° de solicitud</th>
                                            <th>Gestor de ventas</th>
                                            <th>Supervisor</th>
                                            <th>Jefe zonal</th>
                                            <th>Usuario solicitante</th>
                                            <th>Monto neto propuesto</th>
                                            <th>Fecha de envio</th>
                                            <th>Agencia</th>
                                            <th>Monto neto final</th>
                                            <th>Estado</th>
                                            <th> </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {propuestas_solicitud.length === 0 ? (
                                            <tr>
                                                <td colSpan="11" className="no-solicitudes">No se encontraron solicitudes registradas</td>
                                            </tr>
                                        ) : (
                                            propuestas_solicitud.map((solicitud, index) => (
                                                <tr key={index}>
                                                    <td>{solicitud.n_solicitud}</td>
                                                    <td>{solicitud.gestor_ventas}</td>
                                                    <td>{solicitud.supervisor_ventas}</td>
                                                    <td>{solicitud.zonal_ventas}</td>
                                                    <td>{solicitud.usuario_solicitante}</td>
                                                    <td>{formatoSSoles(solicitud.monto_neto_propuesto)}</td>
                                                    <td>{new Date(solicitud.fecha_envio).toLocaleDateString()}</td>
                                                    <td>
                                                        {state.catalogos.agencias.find(item => Number(item.agencia_id) === Number(solicitud.agencia_id))
                                                            ? state.catalogos.agencias.find(item => Number(item.agencia_id) === Number(solicitud.agencia_id)).descripcion
                                                            : 'N/A'}
                                                    </td>
                                                    <td>{formatoSSoles(solicitud.monto_neto_final)}</td>
                                                    <td>
                                                        {estados.find(item => item.tipo_id === solicitud.estado_id)
                                                            ? estados.find(item => item.tipo_id === solicitud.estado_id).descripcion
                                                            : 'N/A'}
                                                    </td>
                                                    <td>
                                                    <Button 
                                                        className="button-edit seg" 
                                                        onClick={() => {mostrarModalEditPS(state.prospecto_id, solicitud)}}
                                                        disabled={Number(state.estado_id) === 11}
                                                    >
                                                        Ver más
                                                    </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        
                </div>)}
            </div>
            </ModalBody>
            {state.modalNuevaPS && (
                <ModalNuevaPS
                isOpen={state.modalNuevaPS}
                />
            )}
            {state.modalEditPS && (
                <ModalEditPS
                isOpen={state.modalEditPS}
                />
            )}        
        </Modal>
    );
}

export default ModalPropuestaSolicitud;