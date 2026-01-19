import React, {useState, useContext} from "react";
import {AppContext} from '../../application/provider';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table,Form, FormGroup} from 'reactstrap';
import "./ModalBonoDescuento.css";
import UsuarioService from "../../axios_services/usuarios.service";
import ArchivoService from "../../axios_services/archivos.service";
import Loader from '../../components/Loader/Loader'; 


function ModalBonoDescuento({isOpen}) {

    const [state,setState] = useContext(AppContext);
    const [estado_ps, setEstadoPS] = useState(1);
    const [loading, setLoading] = useState(false);
    const isFirstRender = React.useRef(true);
    const [archivo_evidencia, setEvidenciaArchivo] = useState(null);
    const [usuario_asignado_id, setUsuarioAsignadoId] = useState();
    const [tipo, setTipo] = useState();
    const [monto, setMonto] = useState();
    const [descripcion, setDescripcion] = useState();
    const [personal] = useState(state.user.personal);
    

    //CATALOGOS
    const [estados_ps,setEstadosPS] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 11}));
    const [bonos_descuentos, setBonosDescuentos] = useState([]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setEvidenciaArchivo(file);
        }
    };

    const getBonosDescuentos = async () => {
        setLoading(true);
        const data = await UsuarioService.getBonosDescuentos(state.user?.perfil_id);
        setBonosDescuentos(data);
        setLoading(false);
    };
    
    const insertarBonoDescuento = async () => {
        if (!usuario_asignado_id) {
            alert("Debe seleccionar al colaborador al que se le asignará el bono o descuento.");
            return;
        }
        if (!tipo || !["bono", "descuento"].includes(tipo)) {
            alert("Debe seleccionar si desea registrar un bono o un descuento.");
            return;
        }

        if (monto === "" || isNaN(monto) || Number(monto) < 0 || Number(monto) > 999999999999.99) {
            alert("Por favor ingrese un monto válido mayor o igual a cero.");
            return;
        }
        if (descripcion && descripcion.length > 255) {
            alert("La descripción no puede superar los 255 caracteres.");
            return;
        }
        if (!archivo_evidencia) {
            alert("Debe adjuntar un archivo en formato PDF como evidencia.");
            return;
        }
        if (archivo_evidencia.type !== "application/pdf") {
            alert("Solo se permite adjuntar archivos en formato PDF.");
            return;
        }
        try {
            await UsuarioService.insertarBonoDescuento(
                state.user?.usuario_id,
                usuario_asignado_id,
                tipo,
                monto,
                descripcion,
                archivo_evidencia
            );

            alert(tipo === "bono" ? "Bono registrado con éxito." : "Descuento registrado con éxito.");
            setUsuarioAsignadoId("");
            setMonto("");
            setTipo("");
            setDescripcion("");
            setEvidenciaArchivo(null);
            await getBonosDescuentos();
        } catch (error) {
            console.error("No se pudo guardar la evidencia.", error);
            const mensajeError = error.response?.data?.message || "Ocurrió un error inesperado.";
            alert(`Error: ${mensajeError}`);
        }
    };

    const handleVerEvidencia = async (bono_descuento_id) => {
            try {
              const evidencia = await ArchivoService.getEvidenciaBonoDescuento(bono_descuento_id);
              window.open(evidencia.url_completa, "_blank", "noopener,noreferrer");
            } catch (error) {
              console.error("Error trayendo la evidencia:", error);
              alert("Este registro no tiene evidencia.");
            }
          };

    function cerrarModal () {
        setState((prevState) => ({
            ...prevState,
            modalBonoDescuento: false,
        }));
        setUsuarioAsignadoId("");
        setMonto("");
        setTipo("");
        setDescripcion("");
        setEvidenciaArchivo(null);
    }; 

    React.useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if(state.modalBonoDescuento === true){
            const fetchData = async () => {
                await Promise.all([
                    getBonosDescuentos()
                ]);
            };
            fetchData();
        }
    
    }, [state.modalBonoDescuento]);

    return (
        <Modal isOpen={state.modalBonoDescuento} className="custom-modal" backdrop={true}>
            <ModalHeader className="modal-header">
                <div class="titulo">
                <h1>BONOS Y DESCUENTOS</h1>
                <Button className="close-btn" onClick={cerrarModal}>X</Button>
                </div>
            </ModalHeader>
            <div class="modal-body-footer">
            <ModalBody className="modal-body">
                <div class="filter-colum1">
                    <FormGroup>
                        <label htmlFor="comentario">Usuario asignado:</label>
                        <select
                            name="usuario_asignado_id"
                            className="form-control"
                            value={usuario_asignado_id || ''}
                            onChange={(e) => setUsuarioAsignadoId(e.target.value)}
                        >
                            <option value="">Seleccione...</option>
                            {personal.map((item) => (
                                <option key={item.usuario_id} value={item.usuario_id}>
                                    {item.nombre_completo_usuario}
                                </option>
                            ))}
                        </select>
                        </FormGroup>
                        <FormGroup>
                            <label htmlFor="tipo">Tipo de registro:</label>
                            <select
                                className="form-control"
                                name="tipo"
                                id="tipo"
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)} 
                                required
                            >
                                <option value="">-- Seleccione si desea registrar un bono o un descuento --</option>
                                <option value="bono">Bono</option>
                                <option value="descuento">Descuento</option>
                            </select>
                        </FormGroup>
                    <FormGroup>
                        <label>Monto:</label>
                        <div className="input-group custom-input-group">
                            <span className="input-group-text custom-symbol">S/.</span>
                            <input
                                className="form-control"
                                name="monto"
                                type="number"
                                value={monto}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                onChange={(e) => {setMonto(parseFloat(e.target.value));}}
                            />
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="motivo">Motivo:</label>
                        <textarea
                            id="motivo"
                            rows="3"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="form-control"
                            placeholder="Describa brevemente el motivo del bono o descuento"
                        ></textarea>
                    </FormGroup>
                    <FormGroup>
                        <label >Evidencia (Solo se acepta formato .pdf *):</label>
                        <div>
                            <input
                                className="accordion-audio-input"
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                            />
                        </div>
                    </FormGroup>
                </div>
                <div className="fila">
                <div className="button-container">
                    <Button 
                        className="button-custom" 
                        onClick={insertarBonoDescuento}
                        disabled={loading}
                    >
                        {loading ? 'Procesando registro...' : 'Registrar bono o descuento'}
                    </Button>
                </div>
                <div className="section-content">
                <Table>
                    <thead>
                        <tr>
                            <th>Usuario Asignado</th>
                            <th>Monto</th>
                            <th className="fixed-width">Descripción</th>
                            <th>Evidencia</th>
                        </tr>
                    </thead>
                    {loading ? (
                        <Loader />
                    ) :(<tbody>
                        {bonos_descuentos.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="no-solicitudes">No se encontro bonos/descuentos en este periódo</td>
                        </tr>
                        ) : (bonos_descuentos
                        .map((bono_descuento, index) => (
                            <tr>
                                <td>{personal.find(p => Number(p.usuario_id) === Number(bono_descuento.usuario_asignado_id))?.nombre_completo_usuario || '—'}</td>
                                <td>{bono_descuento.monto}</td>
                                <td className="fixed-width">{bono_descuento.descripcion}</td>
                                <td className="text-center">
                                    <Button
                                        onClick={() => handleVerEvidencia(bono_descuento.bono_descuento_id)}
                                        type="button"
                                        className="text-blue-600 hover:text-blue-800 underline underline-offset-2 font-medium transition-colors duration-200"
                                        title="Ver evidencia"
                                    >
                                        📑 Ver Evidencia
                                    </Button>
                                </td>
                            </tr>
                        )))}
                    </tbody>)}
                    </Table>
                    </div>
                    </div>
                    <br></br>    
            </ModalBody>
            <ModalFooter>
                
            </ModalFooter>
            </div>
        </Modal>
    );
}

export default ModalBonoDescuento;