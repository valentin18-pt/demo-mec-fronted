import React, { useState, useContext, useEffect } from "react";
import { AppContext } from '../../application/provider';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup } from 'reactstrap';
import "./ModalSeguimientoER.css";
import PropuestaSolicitudService from "../../axios_services/solicitud.service";
import CatalogoService from "../../axios_services/catalogo.service";
import Loader from '../../components/Loader/Loader'; 
import { FileMinus } from "lucide-react";
import ArchivoService from "../../axios_services/archivos.service";

function ModalSeguimientoER() {
    const [state, setState] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [responsablesAgencias, setResponsablesAgencias] = useState([]);
    const [agencias] = useState(state.catalogos.agencias);

    const [formData, setFormData] = useState({
        dni: '',
        nombre: '',
        monto_bruto_final: 0,
        monto_neto_final: 0,
        tasa: 0,
        plazo: 0,
        agencia_id: '',
        responsable_agencia_id: '',
        fecha_desembolso: '',
        tiene_expedientillo: ''
    });

    useEffect(() => {
        if (!state.modalSeguimientoER || !state.propuesta_solicitud) {
            return;
        }

        const loadInitialData = async () => {
            setLoading(true);
            try {
                const { propuesta_solicitud } = state;
                const initialAgenciaId = String(propuesta_solicitud.agencia_id || '');
                
                let loadedResponsables = [];
                if (initialAgenciaId && Number(state.user?.perfil_id) !== 7) {
                    loadedResponsables = await CatalogoService.getResponsablesPorAgencia(initialAgenciaId);
                    setResponsablesAgencias(loadedResponsables);
                }

                const initialAsesorNombre = String(propuesta_solicitud.asesor_agencia || '').trim().toLowerCase();
                let foundResponsableId = '';

                if (initialAsesorNombre && loadedResponsables.length > 0) {
                    const foundAsesor = loadedResponsables.find(
                        resp => String(resp.nombres || '').trim().toLowerCase() === initialAsesorNombre
                    );
                    if (foundAsesor) {
                        foundResponsableId = String(foundAsesor.responsable_agencia_id);
                    }
                }
                
                setFormData({
                    dni: propuesta_solicitud.dni || '',
                    nombre: propuesta_solicitud.nombre || '',
                    monto_bruto_final: propuesta_solicitud.monto_bruto_final || 0,
                    monto_neto_final: propuesta_solicitud.monto_neto_final || 0,
                    tasa: propuesta_solicitud.tasa || 0,
                    plazo: propuesta_solicitud.plazo || 0,
                    agencia_id: initialAgenciaId,
                    responsable_agencia_id: foundResponsableId,
                    fecha_desembolso: propuesta_solicitud.fecha_desembolso || '',
                    tiene_expedientillo: propuesta_solicitud.tiene_expedientillo || ''
                })

            } catch (error) {
                console.error("Error al inicializar datos del modal:", error);
                alert("Hubo un error al cargar los datos del modal.");
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();

    }, [state.modalSeguimientoER, state.propuesta_solicitud, state.user?.perfil_id]);

    useEffect(() => {
        if (!formData.agencia_id) {
            setResponsablesAgencias([]);
            return;
        }
        
        const fetchResponsables = async () => {
            try {
                const data = await CatalogoService.getResponsablesPorAgencia(formData.agencia_id);
                setResponsablesAgencias(data);
            } catch (error) {
                console.error('Error al obtener responsables por agencia:', error);
                setResponsablesAgencias([]);
            }
        };

        fetchResponsables();

    }, [formData.agencia_id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        
        setFormData((prev) => {
            const newState = { ...prev, [name]: value };
            if (name === 'agencia_id') {
                newState.responsable_agencia_id = '';
            }
            return newState;
        });
    };

    const cerrarModal = () => {
        setState((prevState) => ({
            ...prevState,
            modalSeguimientoER: false,
            propuesta_solicitud: null,
        }));
        setResponsablesAgencias([]);
        setFormData({
            dni: '', nombre: '', monto_bruto_final: 0, monto_neto_final: 0,
            tasa: 0, plazo: 0, agencia_id: '', responsable_agencia_id: '',
            fecha_desembolso: '', tiene_expedientillo: ''
        });
    };

    const actualizarSeguimiento = () => {
        setState((prevState) => ({
            ...prevState,
            isUpdated: true
        }));
    };

    const handleVerExpedientillo = async () => {
            try {
              const expedientillo = await ArchivoService.getExpedientillo(state.propuesta_solicitud.propuesta_solicitud_id);
              window.open(expedientillo.url_completa, "_blank", "noopener,noreferrer");
            } catch (error) {
              console.error("Error trayendo expedientillo:", error);
              alert("Este desembolso no tiene expedientillo.");
            }
    };

    const actualizarDesembolsos = async () => {
        try {
            if (formData.dni.trim().length !== 8) {
                alert("El DNI debe contener 8 dígitos. Por favor, verifique e intente nuevamente.");
                return;
            }
            setLoading(true);
            const data = await PropuestaSolicitudService.updateDesembolsos(
                state.user?.usuario_id,
                state.propuesta_solicitud.prospecto_id,
                state.propuesta_solicitud.propuesta_solicitud_id,
                formData.dni,
                formData.nombre,
                Number(state.desembolso_id) === 1 ? formData.monto_neto_final : formData.monto_bruto_final,
                formData.monto_neto_final,
                formData.responsable_agencia_id,
                formData.fecha_desembolso,
                formData.tasa,
                formData.plazo,
                formData.archivo_expedientillo 
            );
            cerrarModal();
            alert('Desembolso actualizado satisfactoriamente');
            actualizarSeguimiento();
            return data;
        } catch (error) {
            console.error('Error al actualizar el desembolso:', error);
            alert('Hubo un error al actualizar el desembolso');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        state.modalSeguimientoER === true && (
            <Modal isOpen={state.modalSeguimientoER === true} className="custom-modal" backdrop={true}>
                <ModalHeader className="modal-header">
                    <div className="titulo">
                        <h1>SOLICITUD N° {state.propuesta_solicitud.n_solicitud}</h1>
                        <Button className="close-btn" onClick={cerrarModal}>X</Button>
                    </div>
                </ModalHeader>
                <div className="modal-body-footer">
                    {loading ? (
                        <Loader />
                    ) : (
                        <>
                            <Form className="fila">
                                <FormGroup>
                                    <label>DNI:</label>
                                    <input
                                        className="form-control"
                                        name="dni" type="text"
                                        value={formData.dni}
                                        onChange={handleChange}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <label>Apellidos y nombres:</label>
                                    <input
                                        className="form-control"
                                        name="nombre" type="text"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <label>Monto bruto final:</label>
                                    <div className="input-group custom-input-group">
                                        <span className="input-group-text custom-symbol">S/.</span>
                                        <input
                                            className="form-control"
                                            name="monto_bruto_final" type="number"
                                            value={formData.monto_bruto_final}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </FormGroup>
                                <FormGroup>
                                    <label>Monto neto final:</label>
                                    <div className="input-group custom-input-group">
                                        <span className="input-group-text custom-symbol">S/.</span>
                                        <input
                                            className="form-control"
                                            name="monto_neto_final" type="number"
                                            value={formData.monto_neto_final}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </FormGroup>
                                <FormGroup>
                                    <label>Tasa:</label>
                                    <div className="input-group custom-input-group">
                                        <input
                                            className="form-control"
                                            name="tasa" type="number"
                                            value={formData.tasa}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </FormGroup>
                                <FormGroup>
                                    <label>Plazo (meses):</label>
                                    <div className="input-group custom-input-group">
                                        <input
                                            className="form-control"
                                            name="plazo" type="number"
                                            value={formData.plazo}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </FormGroup>
                                <FormGroup>
                                    <label>Agencia:</label>
                                    <select
                                        className="form-control"
                                        name="agencia_id"
                                        value={formData.agencia_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione agencia</option>
                                        {agencias.map((item) => (
                                            <option key={item.agencia_id} value={String(item.agencia_id)}>
                                                {item.descripcion}
                                            </option>
                                        ))}
                                    </select>
                                </FormGroup>
                                <FormGroup>
                                    <label>Asesor de agencia:</label>
                                    <select
                                        className="form-control"
                                        name="responsable_agencia_id"
                                        value={formData.responsable_agencia_id}
                                        onChange={handleChange}
                                        disabled={!formData.agencia_id || responsablesAgencias.length === 0}
                                    >
                                        <option value="">
                                            {formData.agencia_id ? "Seleccione asesor" : "Seleccione una agencia primero"}
                                        </option>
                                        {responsablesAgencias.map((item) => (
                                            <option key={item.responsable_agencia_id} value={String(item.responsable_agencia_id)}>
                                                {item.nombres.trim()}
                                            </option>
                                        ))}
                                    </select>
                                </FormGroup>
                                <FormGroup>
                                    <label>Fecha de desembolso:</label>
                                    <input
                                        className="form-control"
                                        name="fecha_desembolso" type="date"
                                        value={formData.fecha_desembolso}
                                        onChange={handleChange}
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                </FormGroup>
                                <FormGroup className="form-group">
                                    {(Number(formData.tiene_expedientillo) === 1 
                                        ? (<div onClick={() => handleVerExpedientillo()} title="Ver expedientillo"><FileMinus color='green'/></div>) 
                                        : <span title="No tiene expedientillo"><FileMinus color='red' /></span>) }
                                    <label htmlFor="expedientillo">Expedientillo:</label>
                                    <input
                                        className="form-control small-input"
                                        type="file"
                                        id="archivo_expedientillo"
                                        name="archivo_expedientillo"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file && file.size > (5 * 1024 * 1024)) {
                                                alert("El archivo Ficha no debe superar los 5MB");
                                                e.target.value = null;
                                                return;
                                            }
                                            setFormData(prevState => ({
                                                ...prevState,
                                                archivo_expedientillo: file
                                            }));
                                        }}
                                    />
                                </FormGroup>
                            </Form>
                            <div className="fila">
                                <div className="button-container">
                                    <Button
                                        className="button-custom"
                                        onClick={async () => {
                                            const userConfirmed = window.confirm(`Esta acción actualizará los campos de la solicitud N°${state.propuesta_solicitud.n_solicitud}. ¿Está seguro?`);
                                            if (userConfirmed) {
                                                await actualizarDesembolsos();
                                            }
                                        }}
                                    >
                                        Registrar revisión
                                    </Button>
                                </div>
                            </div>
                        </>
                     )}
                </div>
            </Modal>
        )
    );
}

export default ModalSeguimientoER;