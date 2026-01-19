import "./Avances.css";
import React, { useState, useContext, useMemo, useCallback, useEffect } from "react";
import { AppContext } from '../application/provider';
import { Table, Button } from "reactstrap";
import MetasService from "../axios_services/metas.service";
import DonutChartAvances from '../components/DonutChart/DonutChartAvances';
import Loader from '../components/Loader/Loader'; 

function Avances() {
    const [allReporteGestores, setAllReporteGestores] = useState([]);
    const [allReporteSupervisores, setAllReporteSupervisores] = useState([]);
    const [allReporteZonales, setAllReporteZonales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [state] = useContext(AppContext);
    const [paginaActualZonales, setPaginaActualZonales] = useState(1);
    const [paginaActualSupervisores, setPaginaActualSupervisores] = useState(1);
    const [paginaActualGestores, setPaginaActualGestores] = useState(1);
    const porPagina = 10;
    const [supervisoresDropdown, setSupervisoresDropdown] = useState([]);
    const [supervisorSeleccionado, setSupervisorSeleccionado] = useState('');
    const [filtroProduccion, setFiltroProduccion] = useState('todos');
    const [periodoFechaAplicado, setPeriodoFechaAplicado] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [supervisorSeleccionadoTemp, setSupervisorSeleccionadoTemp] = useState('');
    const [filtroProduccionTemp, setFiltroProduccionTemp] = useState('todos');
    const [periodoFechaTemp, setPeriodoFechaTemp] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const normalizeNameForComparison = useCallback((text) => {
        if (!text) return '';
        let normalized = text.toString().toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[,.]/g, '')
            .trim();
        normalized = normalized.replace(/\s+/g, ' ');
        const words = normalized.split(/\s+/).filter(Boolean).sort().join(' ');
        return words;
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setPaginaActualZonales(1);
        setPaginaActualSupervisores(1);
        setPaginaActualGestores(1);

        try {
            const gestoresData = await MetasService.getAvanceMetasPorGestor(state.user?.perfil_id, state.user?.usuario_id, periodoFechaAplicado, '');
            setAllReporteGestores(gestoresData || []);

            if (Number(state.user?.perfil_id) !== 4) {
                const supervisorZonalData = await MetasService.getAvanceMetasPorSupervisor(state.user?.perfil_id, state.user?.usuario_id, periodoFechaAplicado, '');

                if (supervisorZonalData && typeof supervisorZonalData === 'object') {
                    const { por_zonal = [], por_supervisor = [] } = supervisorZonalData;
                    setAllReporteSupervisores(por_supervisor);
                    setAllReporteZonales(por_zonal);

                    const supervisoresUnicos = por_supervisor.map((item, index) => ({
                        id: item.supervisor_id || item.supervisor || `supervisor_${index}`,
                        nombre: item.supervisor || `Supervisor ${index + 1}`
                    }));
                    setSupervisoresDropdown(supervisoresUnicos);
                } else {
                    setAllReporteSupervisores([]);
                    setAllReporteZonales([]);
                    setSupervisoresDropdown([]);
                }
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
            setAllReporteGestores([]);
            setAllReporteSupervisores([]);
            setAllReporteZonales([]);
            setSupervisoresDropdown([]);
        } finally {
            setLoading(false);
        }
    }, [periodoFechaAplicado, state.user?.perfil_id, state.user?.usuario_id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleButtonClick = () => {
        setLoading(true);
        setTimeout(() => {
            setSupervisorSeleccionado(supervisorSeleccionadoTemp);
            setFiltroProduccion(filtroProduccionTemp);
            setPeriodoFechaAplicado(periodoFechaTemp);
            setLoading(false);
        }, 500);
    };

    const formatCurrencyPEN = (amount) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const handleSupervisorChange = (e) => setSupervisorSeleccionadoTemp(e.target.value);
    const handleFiltroProduccionChange = (e) => setFiltroProduccionTemp(e.target.value);
    const handlePeriodoFechaChange = (e) => setPeriodoFechaTemp(e.target.value);

    const gestoresFiltrados = useMemo(() => {
        let gestoresResult = [...allReporteGestores];
        if (supervisorSeleccionado) {
            gestoresResult = gestoresResult.filter(gestor =>
                gestor.supervisor_id === supervisorSeleccionado ||
                (gestor.id_jefe_inmediato && gestor.id_jefe_inmediato.toString() === supervisorSeleccionado)
            );
        }
        if (filtroProduccion === 'con_produccion') {
            gestoresResult = gestoresResult.filter(gestor => Number(gestor.total_operaciones || 0) >= 1);
        } else if (filtroProduccion === 'sin_produccion') {
            gestoresResult = gestoresResult.filter(gestor => Number(gestor.total_operaciones || 0) === 0);
        }
        return gestoresResult;
    }, [allReporteGestores, filtroProduccion, supervisorSeleccionado]);

    const supervisoresFiltrados = useMemo(() => {
        let result = [...allReporteSupervisores];
        if (supervisorSeleccionado) {
            result = result.filter(sup =>
                (sup.supervisor_id && sup.supervisor_id.toString() === supervisorSeleccionado) ||
                (sup.supervisor && normalizeNameForComparison(sup.supervisor) === normalizeNameForComparison(supervisoresDropdown.find(s => s.id === supervisorSeleccionado)?.nombre))
            );
        }
        return result;
    }, [allReporteSupervisores, supervisorSeleccionado, normalizeNameForComparison, supervisoresDropdown]);

    const zonalesFiltrados = useMemo(() => allReporteZonales, [allReporteZonales]);

    const gestoresDonutData = useMemo(() => gestoresFiltrados.map(r => ({ nombre: r.asesor?.toUpperCase(), operaciones: Number(r.total_operaciones || 0) })), [gestoresFiltrados]);
    const supervisoresDonutData = useMemo(() => supervisoresFiltrados.map(r => ({ nombre: r.supervisor?.toUpperCase(), operaciones: Number(r.total_operaciones || 0) })), [supervisoresFiltrados]);
    const zonalesDonutData = useMemo(() => zonalesFiltrados.map(r => ({ nombre: r.zonal?.toUpperCase(), operaciones: Number(r.total_operaciones || 0) })), [zonalesFiltrados]);

    const calcularPagina = (arr, paginaActual) => arr.slice((paginaActual - 1) * porPagina, ((paginaActual - 1) * porPagina) + porPagina);
    const zonalesPaginados = useMemo(() => calcularPagina(zonalesFiltrados, paginaActualZonales), [zonalesFiltrados, paginaActualZonales]);
    const supervisoresPaginados = useMemo(() => calcularPagina(supervisoresFiltrados, paginaActualSupervisores), [supervisoresFiltrados, paginaActualSupervisores]);
    const gestoresPaginados = useMemo(() => calcularPagina(gestoresFiltrados, paginaActualGestores), [gestoresFiltrados, paginaActualGestores]);

    const calcularTotalOperaciones = (arr) => arr.reduce((acc, item) => acc + (Number(item.total_operaciones) || 0), 0);
    const totalOperacionesGestores = useMemo(() => calcularTotalOperaciones(gestoresFiltrados), [gestoresFiltrados]);
    const totalOperacionesSupervisores = useMemo(() => calcularTotalOperaciones(supervisoresFiltrados), [supervisoresFiltrados]);
    const totalOperacionesZonales = useMemo(() => calcularTotalOperaciones(zonalesFiltrados), [zonalesFiltrados]);

    const getMaxValues = useCallback((data) => {
        let maxGCP = 0;
        let maxGSP = 0;
        data.forEach(item => {
            maxGCP = Math.max(maxGCP, Number(item.gestores_con_produccion || 0));
            maxGSP = Math.max(maxGSP, Number(item.gestores_sin_produccion || 0));
        });
        return { maxGCP, maxGSP };
    }, []);

    const { maxGCP: maxGCPZonal, maxGSP: maxGSPZonal } = useMemo(() => getMaxValues(zonalesFiltrados), [zonalesFiltrados, getMaxValues]);
    const { maxGCP: maxGCPSupervisor, maxGSP: maxGSPSupervisor } = useMemo(() => getMaxValues(supervisoresFiltrados), [supervisoresFiltrados, getMaxValues]);
    const { maxGCP: maxGCPGestor, maxGSP: maxGSPGestor } = useMemo(() => getMaxValues(gestoresFiltrados), [gestoresFiltrados, getMaxValues]);

    const PaginationComponent = ({ reportes, paginaActual, setPaginaActual, nombreSeccion }) => {
        if (!reportes || reportes.length === 0) return null;
        const totalPaginas = Math.ceil(reportes.length / porPagina);
        if (totalPaginas <= 1) return null;

        const paginasAMostrar = [];
        const maxBotonesVisibles = 5;
        if (totalPaginas <= maxBotonesVisibles) {
            for (let i = 1; i <= totalPaginas; i++) paginasAMostrar.push(i);
        } else {
            paginasAMostrar.push(1);
            let inicioBloqueMedio = Math.max(2, paginaActual - Math.floor((maxBotonesVisibles - 2) / 2));
            let finBloqueMedio = Math.min(totalPaginas - 1, paginaActual + Math.floor((maxBotonesVisibles - 2) / 2));
            if (paginaActual < 3) {
                inicioBloqueMedio = 2;
                finBloqueMedio = Math.min(totalPaginas - 1, maxBotonesVisibles - 1);
            } else if (paginaActual > totalPaginas - (maxBotonesVisibles - 2)) {
                inicioBloqueMedio = Math.max(2, totalPaginas - (maxBotonesVisibles - 2));
                finBloqueMedio = totalPaginas - 1;
            }
            if (inicioBloqueMedio > 2) paginasAMostrar.push('...');
            for (let i = inicioBloqueMedio; i <= finBloqueMedio; i++) paginasAMostrar.push(i);
            if (finBloqueMedio < totalPaginas - 1) paginasAMostrar.push('...');
            paginasAMostrar.push(totalPaginas);
        }

        return (
            <div className="pagination-container">
                <button onClick={() => setPaginaActual(p => Math.max(p - 1, 1))} disabled={paginaActual === 1} className={`pagination-button ${paginaActual === 1 ? 'disabled' : ''}`} aria-label={`Página anterior de ${nombreSeccion}`}>◁</button>
                {paginasAMostrar.map((numPag, idx) => numPag === '...' ? (<span key={`${nombreSeccion}_ellipsis_${idx}`} className="page-ellipsis">...</span>) : (<button key={`${nombreSeccion}_page_${numPag}`} onClick={() => setPaginaActual(numPag)} className={`page-button ${paginaActual === numPag ? 'selected' : ''}`}>{numPag}</button>))}
                <button onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))} disabled={paginaActual === totalPaginas} className={`pagination-button ${paginaActual === totalPaginas ? 'disabled' : ''}`} aria-label={`Siguiente página de ${nombreSeccion}`}>▷</button>
            </div>
        );
    };

    return (
        <>
            <div>
                <h1>REPORTE DE AVANCES:</h1>
                <div className="filtros">
                    <div className="campo-fecha">
                        <label htmlFor="periodo_fecha">Periodo de fecha:</label>
                        <input id="periodo_fecha" type="month" value={periodoFechaTemp} onChange={handlePeriodoFechaChange} />
                    </div>
                    {Number(state.user?.perfil_id) !== 4 && (
                        <div className="campo-supervisor">
                            <label htmlFor="supervisor_filtro">Supervisor:</label>
                            <select id="supervisor_filtro" value={supervisorSeleccionadoTemp} onChange={handleSupervisorChange}>
                                <option value="">Todos los supervisores</option>
                                {supervisoresDropdown.map((supervisor) => (
                                    <option key={supervisor.id} value={supervisor.id}>{supervisor.nombre?.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="campo-produccion">
                        <label htmlFor="produccion_filtro">Producción (Gestores):</label>
                        <select id="produccion_filtro" value={filtroProduccionTemp} onChange={handleFiltroProduccionChange}>
                            <option value="todos">Todos</option>
                            <option value="con_produccion">Con Producción </option>
                            <option value="sin_produccion">Sin Producción </option>
                        </select>
                    </div>
                </div>
                <Button className="buscar" onClick={handleButtonClick} disabled={loading}>Procesar</Button>

                {loading ? (<Loader />) : (
                    <div className="tablas">
                        {Number(state.user?.perfil_id) !== 4 && Number(state.user?.perfil_id) !== 3 && (
                            <div className="seccion-reporte">
                                <h2>AVANCE POR ZONAL</h2>
                                {zonalesFiltrados.length === 0 ? (
                                    <div className="mensaje-vacio">
                                        <p>No hay datos de zonales para mostrar.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="chart-container"><DonutChartAvances data={zonalesDonutData} total={totalOperacionesZonales} /></div>
                                        <PaginationComponent reportes={zonalesFiltrados} paginaActual={paginaActualZonales} setPaginaActual={setPaginaActualZonales} nombreSeccion="Zonales" />
                                        <div className="table-container">
                                            <Table responsive className="table reportes">
                                                <thead><tr><th>ZONAL</th><th>META</th><th>MONTO NETO</th><th>% DE AVANCE</th><th>OPERACIONES</th><th>G.C.P.</th><th>G.S.P.</th><th>PRODUCCION</th><th>% SUPERVISORES</th></tr></thead>
                                                <tbody>
                                                    {zonalesPaginados.map((reporte, index) => (
                                                        <tr key={`zonal_row_${reporte.jefe_zonal_id || index}`}>
                                                            <td>{reporte.zonal?.toUpperCase()}</td>
                                                            <td>{formatCurrencyPEN(Number(reporte.meta_mensual || 0))}</td>
                                                            <td>{formatCurrencyPEN(Number(reporte.suma_monto_neto_final || 0))}</td>
                                                            <td style={{ backgroundColor: (reporte.meta_mensual && reporte.meta_mensual != 0) ? ((Number(reporte.suma_monto_neto_final || 0) / Number(reporte.meta_mensual)) * 100) < 50 ? '#FFCCCC' : ((Number(reporte.suma_monto_neto_final || 0) / Number(reporte.meta_mensual)) * 100) >= 50 && ((Number(reporte.suma_monto_neto_final || 0) / Number(reporte.meta_mensual)) * 100) < 80 ? '#FFFF99' : '#B3FF99' : '#D3D3D3' }}>
                                                                {reporte.meta_mensual && reporte.meta_mensual != 0 ? `${((Number(reporte.suma_monto_neto_final || 0) / Number(reporte.meta_mensual)) * 100).toFixed(1)}%` : '0%'}
                                                            </td>
                                                            <td>{reporte.total_operaciones}</td>
                                                            <td className={`progress-cell progress-cell-base-green`}>
                                                                <div className="progress-bar-background progress-bar-green" style={{ width: `${maxGCPZonal > 0 ? (Number(reporte.gestores_con_produccion || 0) / maxGCPZonal) * 100 : 0}%` }}></div>
                                                                <span className="progress-content">{reporte.gestores_con_produccion}</span>
                                                            </td>
                                                            <td className={`progress-cell progress-cell-base-orange`}>
                                                                <div className="progress-bar-background progress-bar-orange" style={{ width: `${maxGSPZonal > 0 ? (Number(reporte.gestores_sin_produccion || 0) / maxGSPZonal) * 100 : 0}%` }}></div>
                                                                <span className="progress-content">{reporte.gestores_sin_produccion}</span>
                                                            </td>
                                                            <td>{(Number(reporte.total_operaciones || 0) / (Number(reporte.gestores_con_produccion || 0) + Number(reporte.gestores_sin_produccion || 0)) || 0).toFixed(2)}</td>
                                                            <td>
                                                                <div>
                                                                    {(() => {
                                                                        const totalGestores = (Number(reporte.gestores_con_produccion || 0) + Number(reporte.gestores_sin_produccion || 0));
                                                                        if (totalGestores === 0) return 'N/A';
                                                                        const gcp = (Number(reporte.gestores_con_produccion || 0) / totalGestores) * 100;
                                                                        const icono = gcp < 80 ? '❌' : gcp < 100 ? '⚠️' : '✅';
                                                                        return (<><span>{icono}</span> <span>{gcp.toFixed(2)}%</span></>);
                                                                    })()}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {zonalesFiltrados.length > 0 && (
                                                        <tr>
                                                            <td><strong>TOTAL</strong></td>
                                                            <td><strong>{formatCurrencyPEN(zonalesFiltrados.reduce((acc, item) => acc + (Number(item.meta_mensual) || 0), 0))}</strong></td>
                                                            <td><strong>{formatCurrencyPEN(zonalesFiltrados.reduce((acc, item) => acc + (Number(item.suma_monto_neto_final) || 0), 0))}</strong></td>
                                                            <td>{(() => { const totalMeta = zonalesFiltrados.reduce((acc, item) => acc + (Number(item.meta_mensual) || 0), 0); const totalMonto = zonalesFiltrados.reduce((acc, item) => acc + (Number(item.suma_monto_neto_final) || 0), 0); return totalMeta !== 0 ? `${((totalMonto / totalMeta) * 100).toFixed(1)}%` : '0%'; })()}</td>
                                                            <td><strong>{zonalesFiltrados.reduce((acc, item) => acc + (Number(item.total_operaciones) || 0), 0)}</strong></td>
                                                            <td><strong>{zonalesFiltrados.reduce((acc, item) => acc + (Number(item.gestores_con_produccion) || 0), 0)}</strong></td>
                                                            <td><strong>{zonalesFiltrados.reduce((acc, item) => acc + (Number(item.gestores_sin_produccion) || 0), 0)}</strong></td>
                                                            <td><strong>{(() => { const totalOperaciones = zonalesFiltrados.reduce((acc, item) => acc + (Number(item.total_operaciones) || 0), 0); const totalGestoresConProduccion = zonalesFiltrados.reduce((acc, item) => acc + (Number(item.gestores_con_produccion) || 0), 0); const totalGestoresSinProduccion = zonalesFiltrados.reduce((acc, item) => acc + (Number(item.gestores_sin_produccion) || 0), 0); const totalGestoresGlobal = totalGestoresConProduccion + totalGestoresSinProduccion; return totalGestoresGlobal === 0 ? '0.00' : (totalOperaciones / totalGestoresGlobal).toFixed(2); })()}</strong></td>
                                                            <td style={{ textAlign: 'center' }}><strong>{(() => { const totalGestoresConProduccion = zonalesFiltrados.reduce((acc, item) => acc + (Number(item.gestores_con_produccion) || 0), 0); const totalGestoresSinProduccion = zonalesFiltrados.reduce((acc, item) => acc + (Number(item.gestores_sin_produccion) || 0), 0); const totalGestoresGlobal = totalGestoresConProduccion + totalGestoresSinProduccion; if (totalGestoresGlobal === 0) return 'N/A'; const gcp = (totalGestoresConProduccion / totalGestoresGlobal) * 100; return `${gcp.toFixed(2)}%`; })()}</strong></td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        {Number(state.user?.perfil_id) !== 4 && (
                            <div className="seccion-reporte">
                                <h2>AVANCE POR SUPERVISOR</h2>
                                {supervisoresFiltrados.length === 0 ? (
                                    <div className="mensaje-vacio">
                                        <p>{supervisorSeleccionado ? 'No se encontraron datos para el supervisor seleccionado.' : 'No hay datos de supervisores para mostrar.'}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="chart-container"><DonutChartAvances data={supervisoresDonutData} total={totalOperacionesSupervisores} /></div>
                                        <PaginationComponent reportes={supervisoresFiltrados} paginaActual={paginaActualSupervisores} setPaginaActual={setPaginaActualSupervisores} nombreSeccion="Supervisores" />
                                        <div className="table-container">
                                            <Table responsive className="table reportes">
                                                <thead><tr><th>SUPERVISOR</th><th>META</th><th>MONTO NETO</th><th>% DE AVANCE</th><th>OPERACIONES</th><th>G.C.P.</th><th>G.S.P.</th><th>PRODUCCION</th><th>% GESTORES</th></tr></thead>
                                                <tbody>
                                                    {supervisoresPaginados.map((reporte, index) => (
                                                        <tr key={`supervisor_row_${reporte.supervisor_id || index}`}>
                                                            <td>{reporte.supervisor?.toUpperCase()}</td>
                                                            <td>{formatCurrencyPEN(Number(reporte.meta_mensual || 0))}</td>
                                                            <td>{formatCurrencyPEN(Number(reporte.suma_monto_neto_final || 0))}</td>
                                                            <td style={{ backgroundColor: (reporte.meta_mensual && reporte.meta_mensual != 0) ? ((Number(reporte.suma_monto_neto_final || 0) / Number(reporte.meta_mensual)) * 100) < 50 ? '#FFCCCC' : ((Number(reporte.suma_monto_neto_final || 0) / Number(reporte.meta_mensual)) * 100) >= 50 && ((Number(reporte.suma_monto_neto_final || 0) / Number(reporte.meta_mensual)) * 100) < 80 ? '#FFFF99' : '#B3FF99' : '#D3D3D3' }}>
                                                                {reporte.meta_mensual && reporte.meta_mensual != 0 ? `${((Number(reporte.suma_monto_neto_final || 0) / Number(reporte.meta_mensual)) * 100).toFixed(1)}%` : '0%'}
                                                            </td>
                                                            <td>{reporte.total_operaciones}</td>
                                                            <td className={`progress-cell progress-cell-base-green`}>
                                                                <div className="progress-bar-background progress-bar-green" style={{ width: `${maxGCPSupervisor > 0 ? (Number(reporte.gestores_con_produccion || 0) / maxGCPSupervisor) * 100 : 0}%` }}></div>
                                                                <span className="progress-content">{reporte.gestores_con_produccion}</span>
                                                            </td>
                                                            <td className={`progress-cell progress-cell-base-orange`}>
                                                                <div className="progress-bar-background progress-bar-orange" style={{ width: `${maxGSPSupervisor > 0 ? (Number(reporte.gestores_sin_produccion || 0) / maxGSPSupervisor) * 100 : 0}%` }}></div>
                                                                <span className="progress-content">{reporte.gestores_sin_produccion}</span>
                                                            </td>
                                                            <td>{(Number(reporte.total_operaciones || 0) / (Number(reporte.gestores_con_produccion || 0) + Number(reporte.gestores_sin_produccion || 0)) || 0).toFixed(2)}</td>
                                                            <td>
                                                                <div>
                                                                    {(() => {
                                                                        const totalGestores = (Number(reporte.gestores_con_produccion || 0) + Number(reporte.gestores_sin_produccion || 0));
                                                                        if (totalGestores === 0) return 'N/A';
                                                                        const gcp = (Number(reporte.gestores_con_produccion || 0) / totalGestores) * 100;
                                                                        const icono = gcp < 80 ? '❌' : gcp < 100 ? '⚠️' : '✅';
                                                                        return (<><span>{icono}</span> <span>{gcp.toFixed(2)}%</span></>);
                                                                    })()}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {supervisoresFiltrados.length > 0 && (
                                                        <tr>
                                                            <td><strong>TOTAL</strong></td>
                                                            <td><strong>{formatCurrencyPEN(supervisoresFiltrados.reduce((acc, item) => acc + (Number(item.meta_mensual) || 0), 0))}</strong></td>
                                                            <td><strong>{formatCurrencyPEN(supervisoresFiltrados.reduce((acc, item) => acc + (Number(item.suma_monto_neto_final) || 0), 0))}</strong></td>
                                                            <td>{(() => { const totalMeta = supervisoresFiltrados.reduce((acc, item) => acc + (Number(item.meta_mensual) || 0), 0); const totalMonto = supervisoresFiltrados.reduce((acc, item) => acc + (Number(item.suma_monto_neto_final) || 0), 0); return totalMeta !== 0 ? `${((totalMonto / totalMeta) * 100).toFixed(1)}%` : '0%'; })()}</td>
                                                            <td><strong>{supervisoresFiltrados.reduce((acc, item) => acc + (Number(item.total_operaciones) || 0), 0)}</strong></td>
                                                            <td><strong>{supervisoresFiltrados.reduce((acc, item) => acc + (Number(item.gestores_con_produccion) || 0), 0)}</strong></td>
                                                            <td><strong>{supervisoresFiltrados.reduce((acc, item) => acc + (Number(item.gestores_sin_produccion) || 0), 0)}</strong></td>
                                                            <td><strong>{(() => { const totalOperaciones = supervisoresFiltrados.reduce((acc, item) => acc + (Number(item.total_operaciones) || 0), 0); const totalGestoresConProduccion = supervisoresFiltrados.reduce((acc, item) => acc + (Number(item.gestores_con_produccion) || 0), 0); const totalGestoresSinProduccion = supervisoresFiltrados.reduce((acc, item) => acc + (Number(item.gestores_sin_produccion) || 0), 0); const totalGestoresGlobal = totalGestoresConProduccion + totalGestoresSinProduccion; return totalGestoresGlobal === 0 ? '0.00' : (totalOperaciones / totalGestoresGlobal).toFixed(2); })()}</strong></td>
                                                            <td style={{ textAlign: 'center' }}><strong>{(() => { const totalGestoresConProduccion = supervisoresFiltrados.reduce((acc, item) => acc + (Number(item.gestores_con_produccion) || 0), 0); const totalGestoresSinProduccion = supervisoresFiltrados.reduce((acc, item) => acc + (Number(item.gestores_sin_produccion) || 0), 0); const totalGestoresGlobal = totalGestoresConProduccion + totalGestoresSinProduccion; if (totalGestoresGlobal === 0) return 'N/A'; const gcp = (totalGestoresConProduccion / totalGestoresGlobal) * 100; return `${gcp.toFixed(2)}%`; })()}</strong></td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        <div className="seccion-reporte">
                            <h2>AVANCE POR GESTOR</h2>
                            {gestoresFiltrados.length === 0 ? (
                                <div className="mensaje-vacio">
                                    <p>{supervisorSeleccionado || filtroProduccion !== 'todos' ? 'No se encontraron gestores con los filtros seleccionados.' : 'No hay datos de gestores para mostrar.'}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="chart-container"><DonutChartAvances data={gestoresDonutData} total={totalOperacionesGestores} /></div>
                                    <PaginationComponent reportes={gestoresFiltrados} paginaActual={paginaActualGestores} setPaginaActual={setPaginaActualGestores} nombreSeccion="Gestores" />
                                    <div className="table-container">
                                        <Table responsive className="table reportes">
                                            <thead><tr><th>GESTOR</th><th>META</th><th>MONTO NETO</th><th>% DE AVANCE</th><th>OPERACIONES</th></tr></thead>
                                            <tbody>
                                                {gestoresPaginados.map((reporte, index) => (
                                                    <tr key={`gestor_row_${reporte.usuario_id || index}`}>
                                                        <td>{reporte.asesor?.toUpperCase()}</td>
                                                        <td>{formatCurrencyPEN(Number(reporte.meta_mensual || 0))}</td>
                                                        <td>{formatCurrencyPEN(Number(reporte.suma_monto_neto_final || 0))}</td>
                                                        <td style={{ backgroundColor: (reporte.meta_mensual && reporte.meta_mensual != 0) ? ((Number(reporte.suma_monto_neto_final || 0) / Number(reporte.meta_mensual)) * 100) < 50 ? '#FFCCCC' : ((Number(reporte.suma_monto_neto_final || 0) / Number(reporte.meta_mensual)) * 100) >= 50 && ((Number(reporte.suma_monto_neto_final || 0) / Number(reporte.meta_mensual)) * 100) < 80 ? '#FFFF99' : '#B3FF99' : '#D3D3D3' }}>
                                                            {reporte.meta_mensual && reporte.meta_mensual != 0 ? `${((Number(reporte.suma_monto_neto_final || 0) / Number(reporte.meta_mensual)) * 100).toFixed(1)}%` : '0%'}
                                                        </td>
                                                        <td>{reporte.total_operaciones}</td>
                                                    </tr>
                                                ))}
                                                {gestoresFiltrados.length > 0 && (
                                                    <tr>
                                                        <td><strong>TOTAL</strong></td>
                                                        <td><strong>{formatCurrencyPEN(gestoresFiltrados.reduce((acc, item) => acc + (Number(item.meta_mensual) || 0), 0))}</strong></td>
                                                        <td><strong>{formatCurrencyPEN(gestoresFiltrados.reduce((acc, item) => acc + (Number(item.suma_monto_neto_final) || 0), 0))}</strong></td>
                                                        <td>{(() => { const totalMeta = gestoresFiltrados.reduce((acc, item) => acc + (Number(item.meta_mensual) || 0), 0); const totalMonto = gestoresFiltrados.reduce((acc, item) => acc + (Number(item.suma_monto_neto_final) || 0), 0); return totalMeta !== 0 ? `${((totalMonto / totalMeta) * 100).toFixed(1)}%` : '0%'; })()}</td>
                                                        <td><strong>{gestoresFiltrados.reduce((acc, item) => acc + (Number(item.total_operaciones) || 0), 0)}</strong></td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Avances;