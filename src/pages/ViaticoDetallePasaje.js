import { Table } from "reactstrap";
import { useState, useContext, useEffect, useRef } from "react";
import { AppContext } from '../application/provider';
import DetallePasajesService from "../axios_services/detallepasajes.service";
import Loader from "../components/Loader/Loader";
import { ButtonUpdate, ButtonInsert, ButtonDelete } from '../components/Buttons/Buttons';
import ModalViaticoDetallePasaje from '../components/Modal/ModalViaticoDetallePasaje';
import './CajaFlujoDatos.css';

function ViaticoDetallePasaje() {
    const [state] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [detallePasajes, setDetallePasajes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detallePasajeEditar, setDetallePasajeEditar] = useState(null);
    const initialFetchDone = useRef(false);

    useEffect(() => {
        if (!initialFetchDone.current) {
            getDetallePasajes();
            initialFetchDone.current = true;
        }
    }, []);

    const getDetallePasajes = async () => {
        setLoading(true);
        try {
            const response = await DetallePasajesService.getDetallePasajes();
            
            if (response.success && response.data) {
                setDetallePasajes(response.data);
            } else {
                setDetallePasajes([]);
            }
        } catch (error) {
            console.error('Error al obtener detalle de pasajes:', error);
            setDetallePasajes([]);
            const errorMsg = error.response?.data?.message || 'Error al cargar los detalles de pasajes';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (detallePasajeId) => {
        if (!window.confirm('¿Está seguro que desea eliminar este detalle de pasaje?')) {
            return;
        }

        try {
            setLoading(true);
            await DetallePasajesService.deleteDetallePasajes({
                detalle_pasaje_id: detallePasajeId
            });
            await getDetallePasajes();
            alert('Detalle de pasaje eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar detalle de pasaje:', error);
            const errorMsg = error.response?.data?.message || 'Error al eliminar el detalle de pasaje';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleNuevo = () => {
        setDetallePasajeEditar(null);
        setIsModalOpen(true);
    };

    const handleEditar = (detallePasaje) => {
        setDetallePasajeEditar(detallePasaje);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setDetallePasajeEditar(null);
    };

    const handleSave = async (detallePasajeData) => {
        try {
            if (detallePasajeEditar) {
                await DetallePasajesService.updateDetallePasajes({
                    ...detallePasajeData,
                    detalle_pasaje_id: detallePasajeEditar.detalle_pasaje_id
                });
                alert('Detalle de pasaje actualizado correctamente');
            } else {
                await DetallePasajesService.insertDetallePasajes(detallePasajeData);
                alert('Detalle de pasaje agregado correctamente');
            }
            
            await getDetallePasajes();
        } catch (error) {
            console.error('Error al guardar detalle de pasaje:', error);
            const errorMsg = error.response?.data?.message || 'Error al guardar el detalle de pasaje';
            alert(errorMsg);
            throw error;
        }
    };

    const mostrarAcciones = () => {
        return [8, 12, 13, 21].includes(Number(state.user?.perfil_id));
    };

    const formatMonto = (monto) => {
        if (!monto) return '-';
        return `S/ ${parseFloat(monto).toFixed(2)}`;
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h1>VIÁTICOS - DETALLE PASAJES</h1>
                {mostrarAcciones() && (
                    <ButtonInsert onClick={handleNuevo} disabled={loading} />
                )}
            </div>

            <div className="table-container">
                {loading ? (
                    <Loader />
                ) : (
                    <Table hover size="sm">
                        <thead>
                            <tr>
                                <th>Origen</th>
                                <th>Destino</th>
                                <th>Pasaje Ida - Vuelta</th>
                                <th>Hospedaje</th>
                                <th>Alimentación</th>
                                <th>Adicional Asignado</th>
                                {mostrarAcciones() && <th>Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {detallePasajes.length > 0 ? (
                                detallePasajes.map((detalle) => (
                                    <tr key={detalle.detalle_pasaje_id}>
                                        <td>{detalle.origen}</td>
                                        <td>{detalle.destino}</td>
                                        <td>{formatMonto(detalle.pasaje)}</td>
                                        <td>{formatMonto(detalle.hospedaje)}</td>
                                        <td>{formatMonto(detalle.alimentacion)}</td>
                                        <td>{formatMonto(detalle.adicional_asignado)}</td>
                                        {mostrarAcciones() && (
                                            <td>
                                                <div className="acciones-container">
                                                    <ButtonUpdate 
                                                        onClick={() => handleEditar(detalle)}
                                                    />
                                                    <ButtonDelete 
                                                        onClick={() => handleEliminar(detalle.detalle_pasaje_id)} 
                                                    />
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={mostrarAcciones() ? "7" : "6"} className="text-center">
                                        No hay detalles de pasajes disponibles
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                )}
            </div>

            <ModalViaticoDetallePasaje
                onSave={handleSave}
                onClose={handleCloseModal}
                isOpen={isModalOpen}
                detallePasajeEditar={detallePasajeEditar}
            />
        </>
    );
}

export default ViaticoDetallePasaje;