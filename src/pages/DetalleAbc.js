import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../application/provider';
import DatosAbcService from '../axios_services/datosabc.service';
import Loader from '../components/Loader/Loader';
import ModalDetalleAbc from '../components/Modal/ModalDetalleAbc';
import { ButtonUpdate, ButtonInsert, ButtonDelete } from '../components/Buttons/Buttons';
import { Button, Table } from 'reactstrap';
import './DetalleAbc.css';

const DetalleAbc = () => {
    const [state, setState] = useContext(AppContext);
    const [detalles, setGastos] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [loadingAgregarActividades, setLoadingAgregarActividades] = useState(false);
    const initialFetchDone = useRef(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGasto, setSelectedGasto] = useState(null);
    const [areas] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 29 }));
    const [prioridad_actividad] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 33 }));
    const [periodo_consultado, setPeriodoConsultado] = useState('');
    const [filtrosInfo, setFiltrosInfo] = useState(null);

    const [periodo_fecha, setPeriodoFecha] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const ordenarPorCodigo = (datos) => {
        return [...datos].sort((a, b) => {
            const letraA = a.codigo.charAt(0);
            const letraB = b.codigo.charAt(0);
            const numeroA = parseInt(a.codigo.substring(1)) || 0;
            const numeroB = parseInt(b.codigo.substring(1)) || 0;
            if (letraA !== letraB) {
                return letraA.localeCompare(letraB);
            }
            return numeroA - numeroB;
        });
    };

    const formatoSoles = (monto) => {
        const valor = new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(monto);
        return valor;
    };

    const getClaseMonto = (monto) => {
        const valor = parseFloat(monto);
        if (valor < 0) return 'monto-negativo';
        if (valor > 0) return 'monto-positivo';
        return 'saldo-neutro';
    };

    const getClasePrioridad = (prioridad) => {
        if (prioridad == 1) return 'detalle-abc-prioridad-1';
        if (prioridad == 2) return 'detalle-abc-prioridad-2';
        return '';
    };

    const esPeriodoActual = () => {
        const now = new Date();
        const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return periodo_consultado === mesActual;
    };

    const mostrarBotonAgregarActividades = () => {
        return esPeriodoActual() && 
               detalles.length === 0 && 
               periodo_consultado && 
               [8,12,13].includes(Number(state.user?.perfil_id));
    };

    useEffect(() => {
        if (!initialFetchDone.current) {
            loadInitialPageData();
            initialFetchDone.current = true;
        }
    }, []);

    const loadInitialPageData = async () => {
        setLoadingTable(true);
        try {
            const data = await DatosAbcService.getDatosAbc(
                state.user?.perfil_id,
                state.user?.usuario_id,
                periodo_fecha
            );
            const datosOrdenados = ordenarPorCodigo(data.data || data);
            setGastos(datosOrdenados);
            setFiltrosInfo(data.filtros_aplicados);
            setPeriodoConsultado(periodo_fecha);

        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            if (error.response?.status === 403) {
                alert(error.response?.data?.message || 'No tiene permisos para acceder a esta información');
            }
            setGastos([]);
        } finally {
            setLoadingTable(false);
        }
    };

   const fetchGastos = async () => {
        setLoadingTable(true);
        try {
            const data = await DatosAbcService.getDatosAbc(
                state.user?.perfil_id,
                state.user?.usuario_id,
                periodo_fecha
            );
            const datosOrdenados = ordenarPorCodigo(data.data || data);
            setGastos(datosOrdenados);
            setFiltrosInfo(data.filtros_aplicados);
            setPeriodoConsultado(periodo_fecha);
            
        } catch (error) {
            console.error('Error al obtener detalles:', error);
            if (error.response?.status === 403) {
                alert(error.response?.data?.message || 'No tiene permisos para acceder a esta información');
            }
            setGastos([]);
        } finally {
            setLoadingTable(false);
        }
    };

    const handleCalcularClick = async () => {
        await fetchGastos();
    };

    const handleAgregarActividades = async () => {
        if (!window.confirm('¿Agregar el "DETALLE ABC" del mes anterior al mes actual?')) {
            return;
        }

        try {
            setLoadingAgregarActividades(true);
            
            const result = await DatosAbcService.registerDatosAbc({
                perfil_id: state.user?.perfil_id
            });
            
            await fetchGastos();
            
            alert(`Actividades agregadas correctamente. Se copiaron ${result.registros_copiados} registros.`);
            
        } catch (error) {
            console.error('Error al agregar detalles-abc:', error);
            const errorMsg = error.response?.data?.mensaje || error.response?.data?.message || 'Error al agregar las detalles-abc';
            alert(errorMsg);
        } finally {
            setLoadingAgregarActividades(false);
        }
    };

    const handleNuevoGasto = () => {
        setSelectedGasto(null);
        setIsModalOpen(true);
    };

    const handleEditarGasto = (detalle) => {
        setSelectedGasto(detalle);
        setIsModalOpen(true);
    };

    const handleEliminarGasto = async (detalleId) => {
        if (!window.confirm('¿Está seguro que desea eliminar este detalle responsable?')) {
            return; 
        }

        try {
            setLoadingTable(true);
            await DatosAbcService.deleteDatosAbc({ 
                gasto_responsable_id: detalleId,
                perfil_id: state.user?.perfil_id
            });
            await fetchGastos();
            alert('Gasto responsable eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar detalle:', error);
            const errorMsg = error.response?.data?.message || 'Error al eliminar el detalle responsable';
            alert(errorMsg);
        } finally {
            setLoadingTable(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedGasto(null);
    };

    const handleSaveGasto = async (detalleData) => {
        try {
            setLoadingModal(true);
            setIsModalOpen(false);
            
            const dataConPerfil = {
                ...detalleData,
                perfil_id: state.user?.perfil_id
            };
            
            if (selectedGasto) {
                await DatosAbcService.updateDatosAbc(dataConPerfil);
            } else {
                await DatosAbcService.insertDatosAbc(dataConPerfil);
            }
            await fetchGastos();
            setSelectedGasto(null);
        } catch (error) {
            console.error('Error al guardar detalle:', error);
            alert(error.response?.data?.message || 'Ocurrió un error al guardar.');
        } finally {
            setLoadingModal(false);
        }
    };

    if (loadingModal) {
        return <Loader />;
    }

    return (
        <div className="detalle-abc-container">
            <div className="flex items-center justify-between mb-4"> 
                <h1>
                    📊 Detalle Abc
                </h1>
            </div>
            
            <div className="filter-colum3">
                <div className="campo-fecha">
                    <label htmlFor="periodo_fecha">Periodo:</label>
                    <input
                        id="periodo_fecha"
                        type="month"
                        value={periodo_fecha}
                        onChange={(e) => setPeriodoFecha(e.target.value)}
                    />
                </div>
            </div>

            <Button
                className="buscar"
                onClick={handleCalcularClick}
                disabled={loadingTable || periodo_fecha === periodo_consultado}
            >
                {loadingTable ? 'Buscando...' : 'Buscar'}
            </Button>

            <div className="insert-detalle-abc">
                {mostrarBotonAgregarActividades() && (
                    <Button 
                        className="registrar-detalleabc-pasado"
                        onClick={handleAgregarActividades}
                        disabled={loadingAgregarActividades}
                    >
                        {loadingAgregarActividades ? 'Agregando...' : 'Registrar Detalle ABC igual al mes anterior'}
                    </Button>
                )}
                {[8,13].includes(Number(state.user?.perfil_id)) && esPeriodoActual() && (
                    <ButtonInsert onClick={handleNuevoGasto} />
                )}
            </div>

            <div className="table-container">
                {loadingTable ? (
                    <Loader />
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>CÓDIGO</th>
                                <th>ÁREA</th>
                                <th>ACTIVIDAD</th>
                                <th>SUELDO</th>
                                <th>BIENES Y SERVICIOS</th>
                                <th>OTRO COSTO</th>
                                <th>COSTO TOTAL</th>
                                {[8,13].includes(Number(state.user?.perfil_id)) && esPeriodoActual() && (<th>ACCIONES</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {detalles.length > 0 ? (
                                detalles.map((detalle, index) => (
                                    <tr key={detalle.detalle_responsable_id || index} className={getClasePrioridad(detalle.prioridad)}>
                                        <td>{detalle.codigo}</td>
                                        <td>
                                            {areas.find(item => item.tipo_id === detalle.area_id)
                                                ? areas.find(item => item.tipo_id === detalle.area_id).descripcion
                                                : 'N/A'}
                                        </td>
                                        <td>{detalle.actividad.toUpperCase()}</td>
                                        <td className={`col-sueldo ${getClaseMonto(detalle.sueldo)}`}>
                                            {formatoSoles(detalle.sueldo)}
                                        </td>
                                        <td className={`col-bienes-servicios ${getClaseMonto(detalle.bienes_servicios)}`}>
                                            {formatoSoles(detalle.bienes_servicios)}
                                        </td>
                                        <td className={`col-otro-costo ${getClaseMonto(detalle.otro_costo)}`}>
                                            {formatoSoles(detalle.otro_costo)}
                                        </td>
                                        <td className={`col-costo-total ${getClaseMonto(detalle.costo_total)}`}>
                                            {formatoSoles(detalle.costo_total)}
                                        </td>
                                        {[8,13].includes(Number(state.user?.perfil_id)) && esPeriodoActual() && (
                                            <td className="actions-container">
                                                <ButtonUpdate onClick={() => handleEditarGasto(detalle)} />
                                                <ButtonDelete onClick={() => handleEliminarGasto(detalle.gasto_responsable_id)} />
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center text-gray-500 py-4">
                                        No hay datos disponibles para este período.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                )}
            </div>

            <ModalDetalleAbc
                detalle={selectedGasto}
                onSave={handleSaveGasto}
                onClose={handleCloseModal}
                isOpen={isModalOpen}
                areas={areas}
                prioridadActividad={prioridad_actividad}
            />
        </div>
    );
};

export default DetalleAbc;