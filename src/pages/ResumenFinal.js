import { Table, Button } from "reactstrap";
import { useState, useContext, useEffect, useRef } from "react";
import { AppContext } from '../application/provider';
import ResumenFinalService from "../axios_services/resumenfinal.service";
import Loader from "../components/Loader/Loader";
import BarChartResumenFinal from "../components/BarChart/BarChartResumenFinal";
import "./ResumenFinal.css";

function ResumenFinal() {
    const [state] = useContext(AppContext);
    const [periodo_fecha, setPeriodoFecha] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [tipoDesembolso, setTipoDesembolso] = useState(0);
    const [resumen, setResumen] = useState([]);
    const [totalDesembolsos, setTotalDesembolsos] = useState(0);
    const [sumaCostosDirectos, setSumaCostosDirectos] = useState(0);
    const [sumaCostosIndirectos, setSumaCostosIndirectos] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);

    const [modalidad_colaboradores] = useState(state.catalogos.tipos.filter(t => t.categoria_id == 34));
    const [tipo_credito] = useState(state.catalogos.tipos.filter(t => t.categoria_id == 35));
    const [entidad_cliente] = useState(state.catalogos.tipos.filter(t => t.categoria_id == 36));

    const initialFetchDone = useRef(false);

    useEffect(() => {
        if (!initialFetchDone.current) {
            getResumenFinal();
            initialFetchDone.current = true;
        }
    }, []);

    const getResumenFinal = async () => {
        setLoading(true);
        try {
            const response = await ResumenFinalService.getResumenFinal(
                state.user?.perfil_id,
                state.user?.usuario_id,
                periodo_fecha,
                tipoDesembolso
            );
            
            if (response.resumen && response.resumen.length > 0) {
                setResumen(response.resumen);
                setTotalDesembolsos(response.total_desembolsos);
                setSumaCostosDirectos(response.suma_costos_directos);
                setSumaCostosIndirectos(response.suma_costos_indirectos);
            } else {
                setResumen([]);
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
            setResumen([]);
        } finally {
            setLoading(false);
        }
    };

    const formatoSoles = (monto) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(monto);
    };

    const getDescripcionCanal = (canalId) => {
        const canal = modalidad_colaboradores.find(m => m.tipo_id == canalId);
        return canal ? canal.descripcion : canalId;
    };

    const getDescripcionCliente = (clienteId) => {
        const cliente = entidad_cliente.find(e => e.tipo_id == clienteId);
        return cliente ? cliente.descripcion : clienteId;
    };

    const getDescripcionTipoCredito = (tipoCreditoId) => {
        const credito = tipo_credito.find(t => t.tipo_id == tipoCreditoId);
        return credito ? credito.descripcion : tipoCreditoId;
    };

    const chartData = resumen.map((item) => ({
        name: `${getDescripcionTipoCredito(item.tipo_credito)}\n${getDescripcionCliente(item.cliente)}\n${getDescripcionCanal(item.canal)}`,
        "Costos Directos": item.costo_directos_total,
        "Costos Indirectos": item.costo_indirecto_total,
        "Costo Total": item.costo_total
    }));

    if (loadingModal) {
        return <Loader />;
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <h1>✅ Resumen Final</h1>
            </div>

            <div className="filtros">
                <div>
                    <label htmlFor="periodo_fecha">Periodo de pago:</label>
                    <input
                        id="periodo_fecha"
                        type="month"
                        value={periodo_fecha}
                        onChange={(e) => setPeriodoFecha(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="tipo_desembolso">Tipo de desembolso:</label>
                    <select
                        id="tipo_desembolso"
                        value={tipoDesembolso}
                        onChange={(e) => setTipoDesembolso(Number(e.target.value))}
                    >
                        <option value={0}>Desembolsos Registrados</option>
                        <option value={1}>Desembolsos Validados</option>
                    </select>
                </div>
            </div>

            <Button className="buscar" onClick={getResumenFinal} disabled={loading}>
                {loading ? 'Calculando...' : 'Calcular'}
            </Button>

            <div className="table-container">
                {loading ? (
                    <Loader />
                ) : (
                    <>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Canal</th>
                                    <th>CMAC</th>
                                    <th>Tipo Crédito</th>
                                    <th>Porcentaje</th>
                                    <th>Volumen</th>
                                    <th>Costo Directo Total</th>
                                    <th>Costo Indirecto Total</th>
                                    <th>Costo Total</th>
                                    <th>Costo Unitario</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resumen.length > 0 ? (
                                    resumen.map((item, index) => (
                                        <tr key={index}>
                                            <td>{getDescripcionCanal(item.canal)}</td>
                                            <td>{getDescripcionCliente(item.cliente)}</td>
                                            <td>{getDescripcionTipoCredito(item.tipo_credito)}</td>
                                            <td>{item.porcentaje}%</td>
                                            <td>{item.volumen}</td>
                                            <td>{formatoSoles(item.costo_directos_total)}</td>
                                            <td>{formatoSoles(item.costo_indirecto_total)}</td>
                                            <td>{formatoSoles(item.costo_total)}</td>
                                            <td>{formatoSoles(item.costo_unitario)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center text-gray-500 py-4">
                                            No hay datos disponibles para este período.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>

                        {resumen.length > 0 && (
                            <div className="grafico-resumen-final">
                                <BarChartResumenFinal data={chartData} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

export default ResumenFinal;