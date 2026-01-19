import React, { useState, useEffect, useContext } from 'react';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { FileMinus, X } from 'lucide-react';
import { AppContext } from '../../application/provider';
import PropuestaSolicitudService from "../../axios_services/solicitud.service";
import './ModalValidacionCaja.css';

const ModalValidacionCaja = ({ isOpen, onClose, propuesta, onValidacionComplete, handleVerExpedientillo}) => {
    const [state, setState] = useContext(AppContext);
    const estadoInicialErrores = {
        dni: { checked: false, comentario: '' },
        nombre: { checked: false, comentario: '' },
        montoBruto: { checked: false, comentario: '' },
        montoNeto: { checked: false, comentario: '' },
        asesor_agencia: { checked: false, comentario: '' },
        fechaDesembolso: { checked: false, comentario: '' },
        agencia: { checked: false, comentario: '' },
        expedientillo: { checked: false, comentario: '' }
    };

    const [errores, setErrores] = useState(estadoInicialErrores);
    const [isLoading, setIsLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');

    const ACCIONES = {
        CONFIRMAR: 1,
        OBSERVAR: 2
    };

    const mapeoErrores = {
        dni: 1,
        nombre: 2,
        montoBruto: 3,
        montoNeto: 4,
        asesor_agencia: 5,
        fechaDesembolso: 6,
        agencia: 7,
        expedientillo: 8
    };

    useEffect(() => {
        if (!isOpen) {
            setErrores(estadoInicialErrores);
            setMensaje('');
        }
    }, [isOpen]);

    const formatoSSoles = (monto) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(monto);
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'UTC',
        });
    };

    const handleCheckboxChange = (campo) => {
        setErrores(prev => {
            const isChecked = !prev[campo].checked;
            let nuevoComentario = '';

            if (isChecked) {
                switch (campo) {
                    case 'dni':
                        nuevoComentario = ' ';
                        break;
                    case 'nombre':
                        nuevoComentario = propuesta.nombre || '';
                        break;
                    case 'montoBruto':
                        nuevoComentario = propuesta.monto_bruto_final || '';
                        break;
                    case 'montoNeto':
                        nuevoComentario = propuesta.monto_neto_final || '';
                        break;
                    case 'asesor_agencia':
                        nuevoComentario = propuesta.asesor_agencia || '';
                        break;
                    case 'fechaDesembolso':
                        if (propuesta.fecha_desembolso) {
                            const date = new Date(propuesta.fecha_desembolso);
                            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                            const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
                            nuevoComentario = adjustedDate.toISOString().split('T')[0];
                        } else {
                            nuevoComentario = '';
                        }
                        break;
                    case 'agencia':
                        nuevoComentario = propuesta.agencia || '';
                        break;
                    case 'expedientillo':
                        nuevoComentario = ' ';
                        break;
                    default:
                        nuevoComentario = '';
                }
            }

            return {
                ...prev,
                [campo]: {
                    ...prev[campo],
                    checked: isChecked,
                    comentario: nuevoComentario
                }
            };
        });
    };

    const handleComentarioChange = (campo, valor) => {
        setErrores(prev => ({
            ...prev,
            [campo]: {
                ...prev[campo],
                comentario: valor
            }
        }));
    };

    const enviarValidacion = async (accion) => {
        setIsLoading(true);
        setMensaje('');

        try {
            const propuesta_solicitud_id = propuesta?.propuesta_solicitud_id || state.propuesta_solicitud?.propuesta_solicitud_id;
            const usuario_id = state.user?.usuario_id;
            const perfil_id = state.user?.perfil_id;

            if (!propuesta_solicitud_id || !usuario_id) {
                throw new Error('ID de propuesta o usuario no encontrado');
            }

            const datosEnvio = {
                propuesta_solicitud_id,
                usuario_id,
                perfil_id,
                accion, 
                fecha_desembolso: propuesta?.fecha_desembolso || state.propuesta_solicitud?.fecha_desembolso
            };

            if (accion === ACCIONES.OBSERVAR) {
                const erroresSeleccionados = Object.keys(errores).reduce((acc, campo) => {
                    if (errores[campo].checked) {
                        if (campo !== 'dni' && !errores[campo].comentario.trim()) {
                            throw new Error(`Debe ingresar una corrección para el campo de ${campo}`);
                        }
                        acc.push({
                            error_id: mapeoErrores[campo],
                            comentario: errores[campo].comentario.trim()
                        });
                    }
                    return acc;
                }, []);

                if (erroresSeleccionados.length === 0) {
                    throw new Error('Debe seleccionar al menos un error para observar');
                }
                datosEnvio.errores = erroresSeleccionados;
            }

            const resultado = await PropuestaSolicitudService.createValidacionCaja(datosEnvio);
            setMensaje(resultado.message || 'Operación completada exitosamente');

            alert(resultado.message);
            handleClose();
            setState(prevState => ({ ...prevState, isUpdated: true }));
            if (onValidacionComplete) {
                onValidacionComplete();
            }

        } catch (error) {
            const mensajeError = error.response?.data?.error || error.response?.data?.message || error.message || 'Error desconocido';
            setMensaje(`Error: ${mensajeError}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmarValidacion = () => {
        const tieneErrores = Object.values(errores).some(error => error.checked);
        enviarValidacion(tieneErrores ? ACCIONES.OBSERVAR : ACCIONES.CONFIRMAR);
    };

    const handleClose = () => {
        setErrores(estadoInicialErrores);
        setMensaje('');
        onClose();
    };

    if (!propuesta && !state.propuesta_solicitud) return null;

    const dataPropuesta = propuesta || state.propuesta_solicitud;

    const datosFilas = [
        { key: 'dni', descripcion: 'DNI', valor: dataPropuesta.dni || 'N/A' },
        { key: 'nombre', descripcion: 'Nombres y Apellidos', valor: dataPropuesta.nombre || 'N/A' },
        { key: 'montoBruto', descripcion: 'Monto Bruto', valor: dataPropuesta.monto_bruto_final ? formatoSSoles(dataPropuesta.monto_bruto_final) : 'N/A' },
        { key: 'montoNeto', descripcion: 'Monto Neto', valor: dataPropuesta.monto_neto_final ? formatoSSoles(dataPropuesta.monto_neto_final) : 'N/A' },
        { key: 'asesor_agencia', descripcion: 'Asesor de Negocios', valor: dataPropuesta.asesor_agencia || 'N/A' },
        { key: 'fechaDesembolso', descripcion: 'Fecha de Desembolso', valor: formatearFecha(dataPropuesta.fecha_desembolso) },
        { key: 'agencia', descripcion: 'Agencia', valor: dataPropuesta.agencia || 'N/A' },
        { key: 'expedientillo', descripcion: 'Expedientillo', valor: dataPropuesta.tiene_expedientillo || 'N/A' }
    ];

    const renderInput = (fila) => {
        if (fila.key === 'dni') {
            return null;
        }

        const commonProps = {
            className: `comentario-input ${!errores[fila.key].checked ? 'disabled' : ''}`,
            placeholder: "Ingrese corrección...",
            value: errores[fila.key].comentario,
            onChange: (e) => handleComentarioChange(fila.key, e.target.value),
            disabled: !errores[fila.key].checked,
        };

        switch (fila.key) {
            case 'montoBruto':
            case 'montoNeto':
                return <input type="number" step="0.01" {...commonProps} />;
            case 'fechaDesembolso':
                return <input type="date" {...commonProps} />;
            default:
                return <textarea rows="2" {...commonProps}></textarea>;
        }
    };

    return (
        <Modal isOpen={isOpen} className="custom-modal" backdrop={true} size="xl">
            <ModalHeader className="modal-header">
                <div className="titulo">
                    <h1>SOLICITUD N° {dataPropuesta.n_solicitud}</h1>
                    <Button className="close-btn" onClick={handleClose} disabled={isLoading}>
                        <X size={20} />
                    </Button>
                </div>
            </ModalHeader>
            <div className="modal-body-footer">
                <ModalBody className="modal-body">
                    {mensaje && (
                        <div className={`alert ${mensaje.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
                            {mensaje}
                        </div>
                    )}
                    <div className="tabla-validacion-container">
                        <table className="tabla-validacion">
                            <thead>
                                <tr>
                                    <th className="col-descripcion">Descripción</th>
                                    <th className="col-error">Error</th>
                                    <th className="col-comentario">Corrección</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datosFilas.map((fila) => (
                                    <tr key={fila.key} className="fila-datos">
                                        <td className="celda-descripcion">
                                            <div className="descripcion-contenido">
                                                <strong>{fila.descripcion}:</strong>
                                            </div>
                                            <div className="valor-contenido">
                                                {fila.key === 'expedientillo' 
                                                    ? (Number(fila.valor) === 1 
                                                        ? (<div onClick={() => handleVerExpedientillo(propuesta.propuesta_solicitud_id)} title="Ver expedientillo"><FileMinus color='green'/></div>) 
                                                        : <span title="No tiene expedientillo"><FileMinus color='red' /></span>) 
                                                    : (<span className="valor-campo">{fila.valor}</span>)}
                                            </div>
                                        </td>
                                        <td className="celda-error">
                                            <div className="checkbox-container">
                                                <input
                                                    type="checkbox"
                                                    id={`error-${fila.key}`}
                                                    checked={errores[fila.key].checked}
                                                    onChange={() => handleCheckboxChange(fila.key)}
                                                    className="checkbox-error"
                                                    disabled={isLoading}
                                                />
                                                <label htmlFor={`error-${fila.key}`} className="checkbox-label" />
                                            </div>
                                        </td>
                                        <td className="celda-comentario">
                                            {renderInput(fila)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ModalBody>
                <div className="button-container">
                    <Button
                        className="button-custom"
                        color="primary"
                        onClick={handleConfirmarValidacion}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Procesando...' : 'Confirmar Validación'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ModalValidacionCaja;