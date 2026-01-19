import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../application/provider';
import GastosTotalesService from '../axios_services/gastostotales.service';
import GastosConceptoService from '../axios_services/gastosconcepto.service';
import SaldoGastosService from '../axios_services/saldogastos.service';
import Loader from '../components/Loader/Loader';
import ModalGastosTotales from '../components/Modal/ModalGastosTotales';
import { ButtonUpdate, ButtonInsert, ButtonDelete, ButtonCancel, ButtonSave } from '../components/Buttons/Buttons';
import { Button, Table } from 'reactstrap';
import './GastosTotales.css'; 

const GastosTotales = () => {
    const [state, setState] = useContext(AppContext);
    const [gastos, setGastos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const initialFetchDone = useRef(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGasto, setSelectedGasto] = useState(null);
    const [datosAbc, setDatosAbc] = useState([]);
    const [gastosConceptos, setGastosConceptos] = useState([]);
    const [saldoInicial, setSaldoInicial] = useState(null);
    const [saldoGastosId, setSaldoGastosId] = useState(null);
    const [nuevoSaldo, setNuevoSaldo] = useState('');
    const [editandoSaldo, setEditandoSaldo] = useState(false);
    const [tipos_gasto] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 27 }));
    const [detalle_gasto] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 31 }));
    const [tipos_comprobante] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 28 }));
    const [responsables_gasto] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 29 }));
    const [periodo_consultado, setPeriodoConsultado] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    
    const [periodo_fecha, setPeriodoFecha] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

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

    const getClaseSaldo = (saldo) => {
        const valor = parseFloat(saldo);
        if (valor < 0) return 'saldo-negativo';
        if (valor > 0) return 'saldo-positivo';
        return 'saldo-neutro';
    };

    const esMontoValido = (monto) => {
        return !isNaN(monto) && monto !== '';
    };

    const puedeInsertarSaldo = () => {
        const now = new Date();
        const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return periodo_consultado === mesActual && saldoInicial === null;
    };

    const puedeActualizarSaldo = () => {
        const now = new Date();
        const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const diaActual = now.getDate();
        return periodo_consultado === mesActual && diaActual <= 7 && saldoInicial !== null;
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
        setIsLoading(true);
        const perfil_id = state.user?.perfil_id;
        const usuario_id = state.user?.usuario_id;
        try {
            const [conceptosResponse, gastosResponse] = await Promise.all([
                GastosConceptoService.getGastosConcepto(perfil_id, usuario_id),
                GastosTotalesService.getGastosTotales(perfil_id, usuario_id, periodo_fecha)
            ]);
            
            setGastosConceptos(conceptosResponse.data || []);
            setGastos(gastosResponse.data?.gastos_totales || []);
            setDatosAbc(gastosResponse.data?.actividades || []);
            setSaldoInicial(gastosResponse.data?.saldo_gastos?.[0]?.saldo_inicial || null);
            setSaldoGastosId(gastosResponse.data?.saldo_gastos?.[0]?.saldo_gastos_id || null);

        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            if (error.response?.status === 403) {
                alert(error.response?.data?.message || 'No tiene permisos para acceder a esta información');
            }
            setGastos([]);
            setDatosAbc([]);
            setGastosConceptos([]);
            setSaldoInicial(null);
            setSaldoGastosId(null);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchGastos = async () => {
        setIsLoading(true);
        try {
            const response = await GastosTotalesService.getGastosTotales(
                state.user?.perfil_id,
                state.user?.usuario_id,
                periodo_fecha
            );
            
            setGastos(response.data?.gastos_totales || []);
            setDatosAbc(response.data?.actividades || []);
            setSaldoInicial(response.data?.saldo_gastos?.[0]?.saldo_inicial || null);
            setSaldoGastosId(response.data?.saldo_gastos?.[0]?.saldo_gastos_id || null);
        } catch (error) {
            console.error('Error al obtener gastos:', error);
            if (error.response?.status === 403) {
                alert(error.response?.data?.message || 'No tiene permisos para acceder a esta información');
            }
            setGastos([]);
            setDatosAbc([]);
            setSaldoInicial(null);
            setSaldoGastosId(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCalcularClick = async () => {
        setPeriodoConsultado(periodo_fecha);
        await fetchGastos();
    };

    const handleInsertarSaldo = async () => {
        if (!esMontoValido(nuevoSaldo)) {
            alert('Por favor ingrese un monto válido');
            return;
        }

        try {
            setIsLoading(true);
            await SaldoGastosService.insertSaldoGastos(
                state.user?.perfil_id,
                parseFloat(nuevoSaldo)
            );
            await fetchGastos();
            setNuevoSaldo('');
            setEditandoSaldo(false);
            alert('Saldo inicial insertado correctamente');
        } catch (error) {
            console.error('Error al insertar saldo:', error);
            alert(error.response?.data?.message || 'Error al insertar saldo inicial');
        } finally {
            setIsLoading(false);
        }
    };

    const handleActualizarSaldo = async () => {
        if (!esMontoValido(nuevoSaldo)) {
            alert('Por favor ingrese un monto válido');
            return;
        }

        try {
            setIsLoading(true);
            
            if (!saldoGastosId) {
                alert('No se encontró el registro de saldo para actualizar');
                setIsLoading(false);
                return;
            }

            await SaldoGastosService.updateSaldoGastos(
                state.user?.perfil_id,
                saldoGastosId,
                parseFloat(nuevoSaldo)
            );
            await fetchGastos();
            setNuevoSaldo('');
            setEditandoSaldo(false);
            alert('Saldo inicial actualizado correctamente');
        } catch (error) {
            console.error('Error al actualizar saldo:', error);
            alert(error.response?.data?.message || 'Error al actualizar saldo inicial');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelarEdicion = () => {
        setEditandoSaldo(false);
        setNuevoSaldo('');
    };

    const getActividadNombre = (actividadId) => {
        const id = parseInt(actividadId);
        const responsable = datosAbc.find(item => item.datos_abc_id === id);
        return responsable ? responsable.actividad : 'N/A';
    };

    const getConceptoNombre = (conceptoId) => {
        const id = parseInt(conceptoId);
        const concepto = gastosConceptos.find(item => item.gasto_concepto_id === id);
        return concepto ? concepto.concepto : 'N/A';
    };

    const handleNuevoGasto = () => {
        setSelectedGasto(null);
        setIsModalOpen(true);
    };

    const handleEditarGasto = (gasto) => {
        setSelectedGasto(gasto);
        setIsModalOpen(true);
    };

    const handleEliminarGasto = async (gastoId) => {
        if (!window.confirm('¿Está seguro que desea eliminar este gasto?')) {
            return; 
        }

        try {
            setIsLoading(true);
            await GastosTotalesService.deleteGastosTotales({ 
                gastos_totales_id: gastoId,
                perfil_id: state.user?.perfil_id
            });
            await fetchGastos();
            alert('Gasto eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar gasto:', error);
            const errorMsg = error.response?.data?.message || 'Error al eliminar el gasto';
            alert(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedGasto(null);
    };

    const handleSaveGasto = async (gastoData) => {
        try {
            setLoadingModal(true);
            setIsModalOpen(false);
            
            const dataConPerfil = {
                ...gastoData,
                perfil_id: state.user?.perfil_id
            };
            
            if (selectedGasto) {
                await GastosTotalesService.updateGastosTotales(dataConPerfil);
            } else {
                await GastosTotalesService.insertGastosTotales(dataConPerfil);
            }
            await fetchGastos();
            setSelectedGasto(null);
        } catch (error) {
            console.error('Error al guardar gasto:', error);
            alert(error.response?.data?.message || 'Ocurrió un error al guardar.');
        } finally {
            setLoadingModal(false);
        }
    };

    if (isLoading || loadingModal) {
        return <Loader />;
    }

    return (
        <div className="gastos-totales-container">
            <div className="flex items-center justify-between mb-4"> 
                <h1>
                    🧾 Gastos Totales
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
                disabled={isLoading || (periodo_fecha === periodo_consultado && gastos.length > 0)}
            >
                {isLoading ? 'Buscando...' : 'Buscar'}
            </Button>

            <div className="controls-container">
                <div className="saldo-inicial-section">
                    <div className="saldo-container">
                        <span className="saldo-label">Saldo Inicial:</span>
                        {!editandoSaldo && (
                            <span className={
                                saldoInicial !== null 
                                    ? getClaseSaldo(saldoInicial) 
                                    : "saldo-sin-registro"
                            }>
                                {saldoInicial !== null ? formatoSoles(saldoInicial) : 'Sin registro'}
                            </span>
                        )}

                        {[8,13].includes(Number(state.user?.perfil_id)) && (puedeInsertarSaldo() || puedeActualizarSaldo()) && (
                            <>
                            {!editandoSaldo ? (
                                <div className="saldo-actions">
                                    {saldoInicial === null ? (
                                        <ButtonInsert onClick={() => setEditandoSaldo(true)} title="Insertar Saldo" />
                                    ) : (
                                        <ButtonUpdate onClick={() => setEditandoSaldo(true)} title="Actualizar Saldo" />
                                    )}
                                </div>
                            ) : (
                                <div className="saldo-edit">
                                    <input
                                        type="number"
                                        value={nuevoSaldo}
                                        onChange={(e) => setNuevoSaldo(e.target.value)}
                                        placeholder="Ingrese monto"
                                        className="saldo-input"
                                        autoFocus
                                        step="any"
                                    />

                                    <ButtonSave 
                                        onClick={saldoInicial === null ? handleInsertarSaldo : handleActualizarSaldo} 
                                    />
                                    <ButtonCancel 
                                        onClick={handleCancelarEdicion} 
                                    />
                                </div>
                            )}
                            </>
                        )}
                    </div>
                </div>

                <div className="nuevo-gasto-section">
                    {[8,13].includes(Number(state.user?.perfil_id)) && esPeriodoActual() && (
                        <ButtonInsert onClick={handleNuevoGasto} />
                    )}
                </div>
            </div>

            <div className="table-container">
                <Table>
                    <thead>
                        <tr>
                            <th>FECHA MOVIMIENTO</th>
                            <th>FECHA COMPROBANTE</th>
                            <th>TIPO COMPROBANTE</th>
                            <th>SERIE</th>
                            <th>NÚMERO</th>
                            <th>RUC PROVEEDOR</th>
                            <th className="col-proveedor">NOMBRE PROVEEDOR</th>
                            <th className="col-descripcion">DESCRIPCIÓN</th>
                            <th>TIPO GASTO</th>
                            <th>DETALLE GASTO</th>
                            <th>CONCEPTO</th>
                            <th className="col-monto">MONTO</th>
                            <th>RESPONSABLE</th>
                            <th className="col-actividad">ACTIVIDAD</th>
                            <th className="col-saldo">SALDO</th>
                            {[8,13].includes(Number(state.user?.perfil_id)) && esPeriodoActual() && (<th>ACCIONES</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {gastos.length > 0 ? (
                            gastos.map((gasto, index) => (
                                <tr key={gasto.gastos_totales_id || index}>
                                    <td>{gasto.fecha_movimiento}</td>
                                    <td>{gasto.fecha_comprobante}</td>
                                    <td>
                                        {tipos_comprobante.find(item => item.tipo_id === gasto.tipo_comprobante)
                                            ? tipos_comprobante.find(item => item.tipo_id === gasto.tipo_comprobante).descripcion
                                            : 'N/A'}
                                    </td>
                                    <td>{gasto.serie}</td>
                                    <td>{gasto.numero}</td>
                                    <td>{gasto.ruc_proveedor}</td>
                                    <td className="col-proveedor">{gasto.nombre_proveedor.toUpperCase()}</td>
                                    <td className="col-descripcion">{gasto.descripcion.toUpperCase()}</td>
                                    <td>
                                        {tipos_gasto.find(item => item.tipo_id === gasto.tipo_gasto_id)
                                            ? tipos_gasto.find(item => item.tipo_id === gasto.tipo_gasto_id).descripcion
                                            : 'N/A'}
                                    </td>
                                    <td>
                                        {detalle_gasto.find(item => item.tipo_id === gasto.detalle_gasto_id)
                                            ? detalle_gasto.find(item => item.tipo_id === gasto.detalle_gasto_id).descripcion
                                            : 'N/A'}
                                    </td>
                                    <td>{getConceptoNombre(gasto.concepto_gasto_id)}</td>
                                    <td className={`col-monto ${getClaseMonto(gasto.monto)}`}>
                                        {formatoSoles(gasto.monto)}
                                    </td>
                                    <td>
                                        {responsables_gasto.find(item => item.tipo_id === gasto.responsable_gasto_id)
                                            ? responsables_gasto.find(item => item.tipo_id === gasto.responsable_gasto_id).descripcion
                                            : 'N/A'}
                                    </td>
                                    <td className="col-actividad">{getActividadNombre(gasto.actividad_gasto_id).toUpperCase()}</td>
                                    <td className={`col-saldo ${getClaseSaldo(gasto.saldo)}`}>
                                        {formatoSoles(gasto.saldo)}
                                    </td>
                                    {[8,13].includes(Number(state.user?.perfil_id)) && esPeriodoActual() && (<td className="actions-container">
                                        <ButtonUpdate onClick={() => handleEditarGasto(gasto)} />
                                        <ButtonDelete onClick={() => handleEliminarGasto(gasto.gastos_totales_id)} />
                                    </td>)}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={[8,13].includes(Number(state.user?.perfil_id)) && esPeriodoActual() ? 16 : 15} className="text-center text-gray-500 py-4">
                                    No hay datos disponibles para este período.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
                
            <ModalGastosTotales
                gasto={selectedGasto}
                onSave={handleSaveGasto}
                onClose={handleCloseModal}
                isOpen={isModalOpen}
                datosAbc={datosAbc}
                gastosConceptos={gastosConceptos}
                tiposGasto={tipos_gasto}
                detallesGasto={detalle_gasto}
                tiposComprobante={tipos_comprobante}
                responsablesGasto={responsables_gasto}
            />
        </div>
    );
};

export default GastosTotales;