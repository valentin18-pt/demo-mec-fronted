import React, {useState, useContext} from "react";
import {AppContext} from '../../application/provider';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table,Form, FormGroup} from 'reactstrap';
import "./ModalEditPS.css";
import ProspectoService from "../../axios_services/prospectos.service";
import CatalogoService from "../../axios_services/catalogo.service";
import ArchivoService from "../../axios_services/archivos.service";
import Loader from '../../components/Loader/Loader'; 


function ModalEditPS({isOpen}) {

    const [state,setState] = useContext(AppContext);
    const [tasa, setTasa] = useState(state.propuesta_solicitud.tasa);
    const [plazo, setPlazo] = useState(state.propuesta_solicitud.plazo);
    const [monto_neto_final, setMontoNetoFinal] = useState(state.propuesta_solicitud.monto_neto_final);
    const [monto_bruto_final, setMontoBrutoFinal] = useState(state.propuesta_solicitud.monto_bruto_final);
    const [seguimiento_solicitudes, setSeguimientoSolicitudes] = useState([]);
    const [descripcion, setDescripcion] = useState('');
    const [fecha_desembolso, setFechaDesembolso] = useState("");
    const [estado_ps, setEstadoPS] = useState(1);
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const isFirstRender = React.useRef(true);
    const [expedientillo_file, setExpedientilloFile] = useState(null);
    

    //CATALOGOS
    const [estados_ps,setEstadosPS] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 11}));
    const [responsables_agencias, setResponsablesAgencias] = useState([]);

    const getSeguimientoSolicitud = async () => {
            const data = await ProspectoService.getSeguimientoSolicitud(
                state.propuesta_solicitud.propuesta_solicitud_id, 
            );
            setSeguimientoSolicitudes(data);
            if(data.length > 0){
                setFechaDesembolso(data[data.length - 1].fecha_desembolso);
            }
    };

    const getResponsablesPorAgencia = async () => {
            const data = await CatalogoService.getResponsablesPorAgencia(state.propuesta_solicitud.agencia_id, );
            setResponsablesAgencias(data);
        };

    const createComentarioSolicitud = async () => {
        setIsSaved(true);
        try {
            setIsSaved(true)
            if (!descripcion || descripcion.trim() === '') {
                alert("Por favor, ingrese un comentario válido.");
                return;
            }
            if (!estado_ps || estado_ps === "") {
                alert("Por favor, ingrese un estado de propuesta de solicitud válido.");
                return;
            }
            if (Number(estado_ps) === 5 && Number(monto_neto_final) === 0) {
                alert("Si el estado es 'Desembolsado', el monto neto final debe ser mayor a S/0.00. Por favor, ingrese un valor válido");
                return;
            }
            if (Number(state.propuesta_solicitud.desembolso_id) === 2 && Number(estado_ps) === 5 && Number(monto_bruto_final) === 0) {
                alert("Si el estado es 'Desembolsado', el monto bruto final debe ser mayor a S/0.00. Por favor, ingrese un valor válido");
                return;
            }
            if (Number(estado_ps) === 5 && (fecha_desembolso === "" || fecha_desembolso === null)) {
                alert("Ingrese una fecha de desembolso válida");
                return;
            }
            if (Number(estado_ps) === 5 && (new Date(fecha_desembolso) > new Date() || new Date(fecha_desembolso) < new Date(new Date().setDate(new Date().getDate() - 30)))) {
                alert("Por favor, ingrese una fecha de desembolso válida dentro de los últimos 30 días.");
                return;
            }
            if (Number(estado_ps) === 5 && (expedientillo_file === "" || expedientillo_file === null)) {
                alert("Debe adjuntar el archivo del expedientillo en formato PDF antes de continuar.");
                return;
            }        
            if (new Date(fecha_desembolso) > new Date()) {
                alert("La fecha de desembolso no puede ser mayor a la fecha actual");
                return;
            }

            if (Number(estado_ps) === 5){
                const resp = await ArchivoService.guardarExpedientillo(
                    state.propuesta_solicitud.propuesta_solicitud_id,
                    state.user?.usuario_id,
                    expedientillo_file
                  );
                  if (!resp || !resp.path) {
                    alert("No se pudo guardar el archivo del expedientillo. Intente nuevamente.");
                    return;
                  }
            }
        
            const data = await ProspectoService.createComentarioSolicitud(
                state.propuesta_solicitud.propuesta_solicitud_id, 
                state.user?.usuario_id,
                descripcion,
                estado_ps,
                monto_neto_final,
                (Number(state.propuesta_solicitud.desembolso_id) === 1) ? monto_neto_final : monto_bruto_final,
                tasa,
                plazo,
                fecha_desembolso,
                state.propuesta_solicitud.responsable_agencia_id, 
                state.prospecto_dni,
                state.prospecto_nombre,
                state.prospecto_id,
            );
        
            setState((prevState) => ({
                ...prevState,
                propuestaActualizada: true
            }));
            setExpedientilloFile(null);
        
            alert("Seguimiento de la solicitud registrado y monto final actualizado");
            getSeguimientoSolicitud();
            setDescripcion('');
                
        } catch (error) {
            console.error("Error al registrar el seguimiento de la solicitud:", error);
            alert("Ocurrió un error al registrar el seguimiento. Por favor, inténtelo de nuevo.");
        } finally {
            setIsSaved(false);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setExpedientilloFile(file);
        }
    };
        

    function cerrarModal () {
        setState((prevState) => ({
            ...prevState,
            modalEditPS: false,
        }));
        setMontoNetoFinal("");
        setMontoBrutoFinal("");
        setTasa("");
        setPlazo("");
    }; 

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            if (state.modalEditPS === true) {
                await getSeguimientoSolicitud(); 
                await getResponsablesPorAgencia();
            }
            setLoading(false);
        };
        fetchData();
    }, [state.modalEditPS]);

    React.useEffect(() => {
        if (seguimiento_solicitudes.length === 0) {
            setEstadoPS(1);
        } else {
            setEstadoPS(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id);
        }
    }, [seguimiento_solicitudes]);

    return (
        <Modal isOpen={state.modalEditPS} className="custom-modal" backdrop={true}>
            <ModalHeader className="modal-header">
                <div class="titulo">
                <h1>SOLICITUD N° {state.propuesta_solicitud.n_solicitud}</h1>
                <Button className="close-btn" onClick={cerrarModal}>X</Button>
                </div>
            </ModalHeader>
            <div class="modal-body-footer">
            {loading ? (
                <Loader />
            ) :(<ModalBody className="modal-body">
                <Form className="fila">
                    <h2 
                        className="accordion-header"
                    >
                        EDITAR Y AÑADIR COMENTARIO
                    </h2>
                    <br></br>
                    {Number(state.propuesta_solicitud.desembolso_id) === 2 && (<FormGroup>
                        <label>Monto bruto final:</label>
                        <div className="input-group custom-input-group">
                            <span className="input-group-text custom-symbol">S/.</span>
                            <input
                                className="form-control"
                                name="monto_bruto_final"
                                type="number"
                                value={monto_bruto_final}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                onChange={(e) => {
                                    setMontoBrutoFinal(parseFloat(e.target.value));
                                }}
                                readOnly={Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 5 || Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 2}
                            />
                        </div>
                    </FormGroup>)}
                    <FormGroup>
                        <label>Monto neto final:</label>
                        <div className="input-group custom-input-group">
                            <span className="input-group-text custom-symbol">S/.</span>
                            <input
                                className="form-control"
                                name="monto_neto_final"
                                type="number"
                                value={monto_neto_final}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                onChange={(e) => {
                                    setMontoNetoFinal(parseFloat(e.target.value));
                                }}
                                readOnly={Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 5 || Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 2}
                            />
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <label>Tasa:</label>
                        <div className="input-group custom-input-group">
                            <input
                                className="form-control"
                                name="tasa"
                                type="number"
                                value={tasa}
                                min="0"
                                step="0.0001"
                                placeholder="0.0000"
                                onChange={(e) => {
                                    setTasa(e.target.value);
                                }}
                                readOnly={Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 5 || Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 2}
                            />
                            <span className="input-group-text custom-symbol">%</span>
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <label>Plazo en meses:</label>
                        <div className="input-group custom-input-group">
                            <input
                                className="form-control"
                                name="plazo"
                                type="number"
                                value={plazo}
                                min="0"
                                placeholder="0"
                                onChange={(e) => {
                                    setPlazo(e.target.value);
                                }}
                                readOnly={Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 5 || Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 2}
                            />
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <label>Asesor de agencia:</label>
                            <select
                                className="form-control"
                                name="responsable_agencia_id"
                                value={state.propuesta_solicitud.responsable_agencia_id}
                                onChange={(e) => setState({
                                    ...state,
                                    propuesta_solicitud: {
                                        ...state.propuesta_solicitud,
                                        responsable_agencia_id: e.target.value
                                    }
                                })}
                                disabled={Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 5 || Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 2}
                            >
                                {responsables_agencias
                                    .filter((responsable_agencia) =>
                                        state.propuesta_solicitud.agencia_id ? Number(responsable_agencia.agencia_id) === Number(state.propuesta_solicitud.agencia_id) : true
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
                        <label htmlFor="comentario">Estado:</label>
                        <select
                            className="form-control"
                            name="estado"
                            value={estado_ps}
                            onChange={(e) => setEstadoPS(e.target.value)} 
                            disabled={Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 5 || Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 2}
                        >
                            <option value="">Seleccione un estado</option>
                            {estados_ps
                                .map((item) => (
                                <option key={item.tipo_id} value={item.tipo_id}>
                                {item.descripcion}
                                </option>
                            ))}
                        </select>
                        </FormGroup>
                        {Number(estado_ps) === 5 && (<FormGroup>
                            <label >Fecha de desembolso (*):</label>
                            <input 
                                className="form-control"
                                name="fecha_desembolso"
                                type="date" 
                                value={fecha_desembolso} 
                                onChange={(e) => setFechaDesembolso(e.target.value)} 
                                max={new Date(new Date().setHours(0, 0, 0, 0)).toISOString().split('T')[0]}
                                min={new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]}
                                readOnly={Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 5 || Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 2}
                            />
                        </FormGroup>)}
                        {Number(estado_ps) === 5 && (<FormGroup>
                            <label >Expedientillo (Solo se acepta formato .pdf *):</label>
                            <div>
                                <input
                                    className="accordion-audio-input"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    disabled={Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 5 || Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 2}
                                />
                            </div>
                        </FormGroup>)}
                        <FormGroup>
                        <label htmlFor="comentario">Comentario nuevo:</label>
                        <input 
                            type="text" 
                            value={descripcion} 
                            onChange={(e) => setDescripcion(e.target.value)} 
                            className="form-control"
                            readOnly={Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 5 || Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 2}
                        />
                    </FormGroup>
                </Form>
                <div className="fila">
                <div className="button-container">
                    <Button 
                        className="button-custom" 
                        disabled={isSaved || Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 5 || Number(seguimiento_solicitudes[seguimiento_solicitudes.length - 1]?.estado_id) === 2}
                        onClick={createComentarioSolicitud}
                    >
                        Actualizar monto y registrar comentario
                    </Button>
                </div>
                <div className="table-container">
                <Table>
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th class="fixed-width">Comentario</th>
                            <th>Estado</th>
                            <th>Cliente</th>
                            <th>DNI</th>
                            <th>Monto neto final</th>
                            <th>Monto bruto final</th>
                            <th>Tasa</th>
                            <th>Plazo</th>
                            <th>Asesor de negocios</th>
                            <th>Fecha de desembolso</th>
                            <th>Fecha de creación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {seguimiento_solicitudes.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="no-solicitudes">No se encontraron comentarios registrados</td>
                        </tr>
                        ) : (seguimiento_solicitudes
                        .map((seguimiento, index) => (
                            <tr>
                                <td>{seguimiento.usuario}</td>
                                <td class="fixed-width">{seguimiento.comentario}</td>
                                <td>{seguimiento.estado_ps}</td>
                                <td>{seguimiento.nombre}</td>
                                <td>{seguimiento.dni}</td>
                                <td>{seguimiento.monto_neto_final}</td>
                                <td>{seguimiento.monto_bruto_final}</td>
                                <td>{seguimiento.tasa}</td>
                                <td>{seguimiento.plazo}</td>
                                <td>{seguimiento.responsable_agencia}</td>
                                <td>{seguimiento.fecha_desembolso ? seguimiento.fecha_desembolso : 'N/A'}</td>
                                <td>{seguimiento.created_at}</td>
                            </tr>
                        )))}
                    </tbody>
                    </Table>
                    </div>
                    </div>
                    <br></br>
                    <Form className="fila">
                    <h2 
                        className="accordion-header"
                    >
                        INFORMACION ADICIONAL
                    </h2>
                    <br></br>
                    <FormGroup>
                        <label>Monto neto propuesto:</label>
                        <div className="input-group custom-input-group">
                            <span className="input-group-text custom-symbol">S/.</span>
                            <input
                                className="form-control"
                                name="monto_propuesto"
                                type="text"
                                value={state.propuesta_solicitud.monto_neto_propuesto}
                                readOnly
                            />
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <label >Fecha de envio:</label>
                        <input 
                            className="form-control"
                            name="fecha_envio"
                            type="text" 
                            value={new Date(state.propuesta_solicitud.fecha_envio).toLocaleDateString('es-PE')}
                            readOnly
                        />
                    </FormGroup>
                    <FormGroup>
                        <label >Agencia:</label>
                        <input 
                            className="form-control"
                            name="agencia"
                            type="text" 
                            value={state.propuesta_solicitud.agencia}
                            readOnly
                        />
                    </FormGroup>
                    <FormGroup>
                        <label >Distrito:</label>
                        <input 
                            className="form-control"
                            name="distrito"
                            type="text" 
                            value={state.propuesta_solicitud.distrito}
                            readOnly
                        />
                    </FormGroup>
                    <FormGroup>
                        <label >Provincia:</label>
                        <input 
                            className="form-control"
                            name="provincia"
                            type="text" 
                            value={state.propuesta_solicitud.provincia}
                            readOnly
                        />
                    </FormGroup>
                    <FormGroup>
                        <label >Departamento:</label>
                        <input 
                            className="form-control"
                            name="departamento"
                            type="text" 
                            value={state.propuesta_solicitud.departamento}
                            readOnly
                        />
                    </FormGroup>
                    <FormGroup>
                        <label >Asesor de agencia:</label>
                        <input 
                            className="form-control"
                            name="responsable_agencia"
                            type="text" 
                            value={state.propuesta_solicitud.responsable_agencia}
                            readOnly
                        />
                    </FormGroup>
                    <FormGroup>
                        <label >Tipo de desembolso:</label>
                        <input 
                            className="form-control"
                            name="desembolso"
                            type="text" 
                            value={state.propuesta_solicitud.desembolso}
                            readOnly
                        />
                    </FormGroup>
                    <FormGroup>
                        <label >Tasa:</label>
                        <input 
                            className="form-control"
                            name="tasa"
                            type="text" 
                            value={state.propuesta_solicitud.tasa}
                            readOnly
                        />
                    </FormGroup>
                    <FormGroup>
                        <label >Plazo:</label>
                        <input 
                            className="form-control"
                            name="plazo"
                            type="text" 
                            value={state.propuesta_solicitud.plazo}
                            readOnly
                        />
                    </FormGroup>
                    </Form>
                    
            </ModalBody>)}
            <ModalFooter>
                
            </ModalFooter>
            </div>
        </Modal>
    );
}

export default ModalEditPS;