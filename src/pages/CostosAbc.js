import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../application/provider';
import DatosAbcService from '../axios_services/datosabc.service';
import Loader from '../components/Loader/Loader';
import ModalCostosAbc from '../components/Modal/ModalCostosAbc';
import { ButtonUpdate } from '../components/Buttons/Buttons';
import { Button, Table } from 'reactstrap';
import './CostosAbc.css';

const CostosAbc = () => {
    const [state, setState] = useContext(AppContext);
    const [detalles, setDetalles] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const initialFetchDone = useRef(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDetalle, setSelectedDetalle] = useState(null);
    const [periodo_consultado, setPeriodoConsultado] = useState('');

    const [periodo_fecha, setPeriodoFecha] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const ordenarPorCodigo = (array) => {
        return [...array].sort((a, b) => {
            const matchA = a.codigo.match(/^([A-Z]+)(\d+)$/);
            const matchB = b.codigo.match(/^([A-Z]+)(\d+)$/);
            
            if (!matchA || !matchB) return 0;
            
            const letraA = matchA[1];
            const letraB = matchB[1];
            const numeroA = parseInt(matchA[2]);
            const numeroB = parseInt(matchB[2]);
            
            if (letraA !== letraB) {
                return letraA.localeCompare(letraB);
            }
            
            return numeroA - numeroB;
        });
    };

    const formatoSoles = (monto) => {
        const valor = monto === null || monto === undefined || isNaN(monto) ? 0 : parseFloat(monto);
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(valor);
    };

    const getClaseMonto = (monto) => {
        const valor = monto === null || monto === undefined || isNaN(monto) ? 0 : parseFloat(monto);
        if (valor < 0) return 'monto-negativo';
        if (valor > 0) return 'monto-positivo';
        return 'saldo-neutro';
    };

    const esPeriodoActual = () => {
        const now = new Date();
        const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return periodo_consultado === mesActual;
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
            const detallesOrdenados = ordenarPorCodigo(data.data || []);
            setDetalles(detallesOrdenados);
            setPeriodoConsultado(periodo_fecha);
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            if (error.response?.status === 403) {
                alert(error.response?.data?.message || 'No tiene permisos para acceder a esta información');
            }
            setDetalles([]);
        } finally {
            setLoadingTable(false);
        }
    };

    const fetchDetalles = async () => {
        setLoadingTable(true);
        try {
            const data = await DatosAbcService.getDatosAbc(
                state.user?.perfil_id,
                state.user?.usuario_id,
                periodo_fecha
            );
            const detallesOrdenados = ordenarPorCodigo(data.data || []);
            setDetalles(detallesOrdenados);
            setPeriodoConsultado(periodo_fecha);
        } catch (error) {
            console.error('Error al obtener detalles:', error);
            if (error.response?.status === 403) {
                alert(error.response?.data?.message || 'No tiene permisos para acceder a esta información');
            }
            setDetalles([]);
        } finally {
            setLoadingTable(false);
        }
    };

    const handleCalcularClick = async () => {
        await fetchDetalles();
    };

    const handleEditarDetalle = (detalle) => {
        setSelectedDetalle(detalle);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDetalle(null);
    };

    const handleSaveDetalle = async (detalleData) => {
        try {
            setLoadingModal(true);
            setIsModalOpen(false);

            const dataConPerfil = {
                ...detalleData,
                perfil_id: state.user?.perfil_id
            };

            await DatosAbcService.updateDatosAbc(dataConPerfil);
            await fetchDetalles();
            setSelectedDetalle(null);
            alert('Detalle actualizado correctamente');
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
        <div className="detalle-responsable-container">
            <div className="flex items-center justify-between mb-4">
                <h1>📊 Costos Abc</h1>
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

            <div className="table-container">
                {loadingTable ? (
                    <Loader />
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>CÓDIGO</th>
                                <th>ACTIVIDAD</th>
                                <th>COSTO TOTAL ACTIVIDAD</th>
                                <th>INDICADOR</th>
                                <th>VOLUMEN</th>
                                <th>COSTO UNITARIO</th>
                                <th>COSTO REALIZADO</th>
                                <th>PRESUPUESTO</th>
                                <th>AVANCE</th>
                                {[8, 13].includes(Number(state.user?.perfil_id)) && esPeriodoActual() && <th>ACCIONES</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {detalles.length > 0 ? (
                                detalles.map((detalle, index) => (
                                    <tr key={index}>
                                        <td>{detalle.codigo}</td>
                                        <td className="columna-actividad">{detalle.actividad}</td>
                                        <td className={`columna-monto ${getClaseMonto(detalle.costo_total)}`}>
                                            {formatoSoles(detalle.costo_total)}
                                        </td>
                                        <td className="columna-indicador">{detalle.indicador}</td>
                                        <td>{detalle.volumen === null || detalle.volumen === undefined ? 0 : detalle.volumen}</td>
                                        <td className={`columna-monto ${getClaseMonto(detalle.costo_unitario)}`}>
                                            {formatoSoles(detalle.costo_unitario)}
                                        </td>
                                        <td className={`columna-monto ${getClaseMonto(detalle.costo_realizado)}`}>
                                            {formatoSoles(detalle.costo_realizado)}
                                        </td>
                                        <td className={`columna-monto ${getClaseMonto(detalle.presupuesto)}`}>
                                            {formatoSoles(detalle.presupuesto)}
                                        </td>
                                        <td className={`columna-monto ${getClaseMonto(detalle.pct_avance)}`}>
                                            {detalle.pct_avance !== null && detalle.pct_avance !== undefined ? `${detalle.pct_avance.toFixed(2)}%` : '0%'}
                                        </td>
                                        {[8, 13].includes(Number(state.user?.perfil_id)) && esPeriodoActual() && (
                                            <td className="actions-container">
                                                <ButtonUpdate onClick={() => handleEditarDetalle(detalle)} />
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="text-center text-gray-500 py-4">
                                        No hay datos disponibles para este período.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                )}
            </div>

            <ModalCostosAbc
                detalle={selectedDetalle}
                onSave={handleSaveDetalle}
                onClose={handleCloseModal}
                isOpen={isModalOpen}
            />
        </div>
    );
};

export default CostosAbc;