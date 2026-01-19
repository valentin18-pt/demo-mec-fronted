import React, { useState, useContext, useEffect, useRef } from "react";
import { AppContext } from '../application/provider';
import { Container, Table, Button, Input, Label } from "reactstrap";
import ViaticoSolicitudService from "../axios_services/viaticosolicitud.service";
import ArchivosService from "../axios_services/archivos.service";
import Loader from "../components/Loader/Loader";
import { ButtonInsert, ButtonDelete } from '../components/Buttons/Buttons';
import ButtonSearch from '../components/Buttons/ButtonSearch';
import ModalViaticoSolicitud from '../components/Modal/ModalViaticoSolicitud';
import ModalValidacionViaticoSolicitud from '../components/Modal/ModalValidacionViaticoSolicitud';
import ModalCorregirViaticoSolicitud from '../components/Modal/ModalCorregirViaticoSolicitud';
import { CheckCircle, FileEdit, FileText } from 'lucide-react';
import "./ViaticoSolicitud.css";

function ViaticoSolicitud() {
    const [state] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);
    const [viaticoSolicitudes, setViaticoSolicitudes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalValidacionOpen, setIsModalValidacionOpen] = useState(false);
    const [isModalCorreccionOpen, setIsModalCorreccionOpen] = useState(false);
    const [viaticoSolicitudEditar, setViaticoSolicitudEditar] = useState(null);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [mesBusqueda, setMesBusqueda] = useState('');
    const initialFetchDone = useRef(false);

    const [estadosViatico] = useState(state.catalogos?.tipos?.filter(t => t.categoria_id == 38) || []);

    useEffect(() => {
        const mesActual = new Date().toISOString().slice(0, 7);
        setMesBusqueda(mesActual);
    }, []);

    useEffect(() => {
        if (!initialFetchDone.current && mesBusqueda) {
            getViaticoSolicitudes();
            initialFetchDone.current = true;
        }
    }, [mesBusqueda]);

    const getViaticoSolicitudes = async (mes = mesBusqueda) => {
        setLoadingTable(true);
        try {
            const data = await ViaticoSolicitudService.getViaticoSolicitud(
                state.user?.usuario_id,
                mes
            );
            
            if (data.success && data.data) {
                setViaticoSolicitudes(data.data);
            } else {
                setViaticoSolicitudes([]);
            }
        } catch (error) {
            console.error('Error al obtener solicitudes de viáticos:', error);
            setViaticoSolicitudes([]);
            const errorMsg = error.response?.data?.message || 'Error al cargar las solicitudes de viáticos';
            alert(errorMsg);
        } finally {
            setLoadingTable(false);
        }
    };

    const handleBuscarPorMes = async () => {
        if (!mesBusqueda) {
            alert('Seleccione un mes para buscar');
            return;
        }
        await getViaticoSolicitudes(mesBusqueda);
    };

    const handleEliminar = async (viaticoSolicitudId, nSolicitud) => {
        const confirmDelete = window.confirm(`¿Está seguro de eliminar la solicitud n° ${nSolicitud}?`);
        if (!confirmDelete) return;

        try {
            setLoadingTable(true);
            await ViaticoSolicitudService.deleteViaticoSolicitud({
                viatico_solicitud_id: viaticoSolicitudId,
                usuario_id: state.user?.usuario_id
            });
            await getViaticoSolicitudes();
            alert('Solicitud de viático eliminada correctamente');
        } catch (error) {
            console.error('Error al eliminar solicitud de viático:', error);
            const errorMsg = error.response?.data?.message || 'Error al eliminar la solicitud de viático';
            alert(errorMsg);
        } finally {
            setLoadingTable(false);
        }
    };

    const handleNuevo = () => {
        setViaticoSolicitudEditar(null);
        setIsModalOpen(true);
    };

    const handleEditar = (viaticoSolicitud) => {
        setViaticoSolicitudEditar(viaticoSolicitud);
        setIsModalCorreccionOpen(true);
    };

    const handleValidar = (solicitud) => {
        setSolicitudSeleccionada(solicitud);
        setIsModalValidacionOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setViaticoSolicitudEditar(null);
    };

    const handleCloseValidacionModal = () => {
        setIsModalValidacionOpen(false);
        setSolicitudSeleccionada(null);
    };

    const handleCloseCorreccionModal = () => {
        setIsModalCorreccionOpen(false);
        setViaticoSolicitudEditar(null);
    };

    const handleSave = async (viaticoSolicitudData) => {
        try {
            setLoadingTable(true);
            const response = await ViaticoSolicitudService.insertViaticoSolicitud({
                ...viaticoSolicitudData,
                usuario_id: state.user?.usuario_id
            });
            
            if (response.auto_aprobado) {
                alert('Solicitud de viático creada y aprobada automáticamente (no tiene jefe inmediato asignado)');
            } else {
                alert('Solicitud de viático agregada correctamente');
            }
            
            await getViaticoSolicitudes();
            return response;
        } catch (error) {
            console.error('Error al guardar solicitud de viático:', error);
            const errorMsg = error.response?.data?.message || 'Error al guardar la solicitud de viático';
            alert(errorMsg);
            throw error;
        } finally {
            setLoadingTable(false);
        }
    };

    const handleValidacionComplete = async (accion, comentario) => {
        try {
            setLoadingTable(true);
            await ViaticoSolicitudService.validarViaticoSolicitud({
                viatico_solicitud_id: solicitudSeleccionada.viatico_solicitud_id,
                accion: accion,
                comentario: comentario,
                usuario_id: state.user?.usuario_id
            });
            
            const mensaje = accion === 'aprobar' 
                ? 'Solicitud aprobada correctamente' 
                : 'Solicitud observada correctamente';
            alert(mensaje);
            await getViaticoSolicitudes();
        } catch (error) {
            console.error('Error en validación:', error);
            const errorMsg = error.response?.data?.message || 'Error al procesar la validación';
            alert(errorMsg);
            throw error;
        } finally {
            setLoadingTable(false);
        }
    };

    const handleCorreccionComplete = async (datosCorreccion) => {
        try {
            setLoadingTable(true);
            await ViaticoSolicitudService.updateViaticoSolicitud({
                viatico_solicitud_id: viaticoSolicitudEditar.viatico_solicitud_id,
                ...datosCorreccion,
                usuario_id: state.user?.usuario_id
            });
            
            alert('Corrección enviada correctamente. La solicitud volvió a estado PENDIENTE');
            await getViaticoSolicitudes();
        } catch (error) {
            console.error('Error en corrección:', error);
            const errorMsg = error.response?.data?.message || 'Error al enviar la corrección';
            alert(errorMsg);
            throw error;
        } finally {
            setLoadingTable(false);
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getEstadoNombre = (estadoRevisionId) => {
        const estado = estadosViatico.find(e => e.tipo_id == estadoRevisionId);
        return estado ? estado.descripcion : 'Desconocido';
    };

    const getEstadoClase = (estadoRevisionId) => {
        return `estado-${estadoRevisionId}`;
    };

    const verArchivo = async (viaticoSolicitudId) => {
        try {
            const response = await ArchivosService.getArchivoViaticoSolicitud(viaticoSolicitudId);
            if (response.success && response.data) {
                window.open(response.data.url_completa, '_blank');
            } else {
                alert('No hay archivo adjunto para esta solicitud');
            }
        } catch (error) {
            console.error("Error trayendo archivo:", error);
            alert('No se pudo cargar el archivo adjunto');
        }
    };

    return (
        <>
            {loading ? (
                <Loader />
            ) : (
                <Container>
                    <div className="flex items-center justify-between mb-4">
                        <h1>SOLICITUDES DE VIÁTICOS</h1>
                        <ButtonInsert onClick={handleNuevo} disabled={loadingTable} />
                    </div>

                    <div className="filtros">
                        <div>
                            <Label>Buscar por mes:</Label>
                            <input
                                type="month"
                                value={mesBusqueda}
                                onChange={(e) => setMesBusqueda(e.target.value)}
                            />
                        </div>
                    </div>

                    {loadingTable ? (
                        <Loader />
                    ) : (
                        <>
                            <div>
                                <ButtonSearch
                                    onClick={handleBuscarPorMes}
                                    isLoading={loadingTable}
                                />
                            </div>

                            <div className="numero-propuestas">
                                <p>N° de solicitudes: {viaticoSolicitudes.length}</p>
                            </div>

                            <div className="table-container">
                                <Table id="data-viatico-solicitud">
                                    <thead>
                                        <tr>
                                            <th>N° Solicitud</th>
                                            <th>Colaborador</th>
                                            <th>Jefe Inmediato</th>
                                            <th>Fecha Solicitud</th>
                                            <th>Estado</th>
                                            <th>Comentario</th>
                                            <th>Archivo</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viaticoSolicitudes.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="sin-data">
                                                    Sin solicitudes de viáticos para el mes seleccionado
                                                </td>
                                            </tr>
                                        ) : (
                                            viaticoSolicitudes.map((solicitud) => (
                                                <tr 
                                                    key={solicitud.viatico_solicitud_id}
                                                    className={getEstadoClase(solicitud.estado_revision)}
                                                >
                                                    <td>{solicitud.n_solicitud || 'N/A'}</td>
                                                    <td>{solicitud.colaborador || 'N/A'}</td>
                                                    <td>{solicitud.jefe_inmediato || 'Sin asignar'}</td>
                                                    <td>{formatFecha(solicitud.fecha_registro)}</td>
                                                    <td className="estado-validacion-cell">
                                                        {getEstadoNombre(solicitud.estado_revision)}
                                                    </td>
                                                    <td>{solicitud.comentario || '-'}</td>
                                                    <td className="text-center">
                                                        <button
                                                            onClick={() => verArchivo(solicitud.viatico_solicitud_id)}
                                                            className="cursor-pointer bg-transparent border-0 p-0"
                                                            title="Ver archivo adjunto"
                                                            type="button"
                                                        >
                                                            <FileText size={20} color="#0066cc" />
                                                        </button>
                                                    </td>
                                                    <td>
                                                        {solicitud.puede_editar && (
                                                            <Button
                                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm font-semibold rounded-lg shadow transition mb-2"
                                                                onClick={() => handleEditar(solicitud)}
                                                            >
                                                                <FileEdit className="w-4 h-4" />
                                                                Corregir
                                                            </Button>
                                                        )}

                                                        {solicitud.puede_eliminar && (
                                                            <Button
                                                                onClick={() => handleEliminar(solicitud.viatico_solicitud_id, solicitud.n_solicitud)}
                                                            >
                                                                <ButtonDelete />
                                                            </Button>
                                                        )}

                                                        {solicitud.puede_validar && (
                                                            <Button
                                                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm font-semibold rounded-lg shadow transition mb-2"
                                                                onClick={() => handleValidar(solicitud)}
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                                Validar
                                                            </Button>
                                                        )}

                                                        {Number(solicitud.estado_revision) === 1 && (
                                                            <div className="flex justify-center items-center">
                                                                <span className="text-2xl" title="Aprobado - Bloqueado">
                                                                    🔒
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </>
                    )}

                    <ModalViaticoSolicitud
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onSave={handleSave}
                    />

                    <ModalValidacionViaticoSolicitud
                        isOpen={isModalValidacionOpen}
                        onClose={handleCloseValidacionModal}
                        solicitud={solicitudSeleccionada}
                        onValidacionComplete={handleValidacionComplete}
                        verArchivo={verArchivo}
                    />

                    <ModalCorregirViaticoSolicitud
                        isOpen={isModalCorreccionOpen}
                        onClose={handleCloseCorreccionModal}
                        solicitud={viaticoSolicitudEditar}
                        onCorreccionComplete={handleCorreccionComplete}
                    />
                </Container>
            )}
        </>
    );
}

export default ViaticoSolicitud;