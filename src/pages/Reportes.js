import "./Reportes.css";
import React, {useState , useContext} from "react";
import {AppContext} from '../application/provider';
import {Table, Button} from "reactstrap";
import ProspectoService from "../axios_services/prospectos.service";
import BarChartTotal from '../components/BarChart/BarChartTotal';
import DonutChartTotal from '../components/DonutChart/DonutChartTotal';
import BarChartContactados from "../components/BarChart/BarChartContactados";
import DonutChartContactados from "../components/DonutChart/DonutChartContactados";
import DonutChartNoContactados from "../components/DonutChart/DonutChartNoContactados";
import BarChartNoContactados from "../components/BarChart/BarChartNoContactados";
import {SearchSelect,SearchSelectItem} from '@tremor/react';
import BarChartEvaluacion from '../components/BarChart/BarChartEvaluacion';
import Loader from '../components/Loader/Loader'; 

function Reportes() {

    const [reportes, setReportes] = useState([]);
    const [supervisor, setSupervisor] = useState(null);
    const [gestor, setGestor] = useState(null);
    const [zonal, setZonal] = useState(null);
    const [periodo_fecha, setPeriodoFecha] = useState(() => {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          });
    const [loading, setLoading] = useState(false);
    const [state,setState] = useContext(AppContext);
    const isFirstRender = React.useRef(true);
    const [paginaActualTotales, setPaginaActualTotales] = useState(1);
    const [paginaActualContactados, setPaginaActualContactados] = useState(1);
    const [paginaActualNoContactados, setPaginaActualNoContactados] = useState(1);
    const porPagina = 10;
    const [evaluacionData, setEvaluacionData] = useState([]);
    const [loadingEvaluacion, setLoadingEvaluacion] = useState(false);
    const [appliedZonalFilter, setAppliedZonalFilter] = useState(null);
    const [appliedSupervisorFilter, setAppliedSupervisorFilter] = useState(null);

    //CATALOGOS
    const [zonales] = useState(state.user.personal.filter(p => {return p.perfil_id == 2}));
    const [supervisores] = useState(state.user.personal.filter(p => {return p.perfil_id == 3}));
    const [gestores] = useState(state.user.personal.filter(p => {return p.perfil_id == 3 || p.perfil_id == 4}));

    const getReporteContactados = async () => {
        setLoading(true);
        const data = await ProspectoService.getReporteContactados(state.user?.usuario_id,state.user?.perfil_id, periodo_fecha, zonal, supervisor, gestor);
        setReportes(data);
        setLoading(false);
    };

    const getProspectosEvaluacion = async () => {
        setLoadingEvaluacion(true); 
        try {
            const response = await ProspectoService.getProspectosEvaluacionPorDia(state.user?.usuario_id,state.user?.perfil_id,periodo_fecha,zonal,supervisor,gestor);
            if (response.success) {
                setEvaluacionData(response.data);
            } else {
                console.error("Error en la respuesta de la API", response.message);
                setEvaluacionData([]); 
            }
        } catch (error) {
            console.error("Fallo al obtener datos:", error);
            setEvaluacionData([]); 
        } finally {
            setLoadingEvaluacion(false); 
        }
    };
    
    const handleProcessClick = async () => {
        setAppliedZonalFilter(zonal);
        setAppliedSupervisorFilter(supervisor);
        setLoadingEvaluacion(true);
        await new Promise(resolve => setTimeout(resolve, 500)); 
        setLoadingEvaluacion(false);
        await getReporteContactados();
    };

    React.useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            setAppliedZonalFilter(zonal);
            setAppliedSupervisorFilter(supervisor);
            const fetchData = async () => {
            await getReporteContactados();
            await getProspectosEvaluacion();
            };
            fetchData();
            return;
        }
    }, []);

return (
    <>
    <div>
            <h1>Reporte de Avance</h1>
        <div className="filtros">
            {(Number(state.user?.perfil_id)=== 1 ||Number(state.user?.perfil_id)=== 6 ||Number(state.user?.perfil_id)=== 8) && (<div>
                <label>Zonal:</label>
                <SearchSelect
                    id = "zonal"
                    name="zonal"
                    className="search_select"
                    value={zonal} 
                    onValueChange={(value) => setZonal(value)}
                    placeholder="Seleccione..."
                >
                    {zonales.map((item) => (
                        <SearchSelectItem key={item.usuario_id} value={item.usuario_id} className="search_select">
                            {item.nombre_completo_usuario.toUpperCase()}
                        </SearchSelectItem>
                    ))}
                </SearchSelect>
            </div>)}
            {Number(state.user?.perfil_id) !== 3 && Number(state.user?.perfil_id)!== 4 && (<div>
                <label>Supervisor:</label>
                <SearchSelect
                    id = "supervisor"
                    className="search_select"
                    value={supervisor} 
                    onValueChange={(value) => setSupervisor(value)}
                    placeholder="Seleccione..."
                >
                    {supervisores
                        .filter(supervisor => zonal === null || Number(supervisor.zonal_id) === Number(zonal))
                        .map((supervisor) => (
                            <SearchSelectItem key={supervisor.usuario_id} value={supervisor.usuario_id} className="search_select">
                                {supervisor.nombre_completo_usuario.toUpperCase()}
                            </SearchSelectItem>
                        ))}
                </SearchSelect>
            </div>)}
            {Number(state.user?.perfil_id)!== 4 && (<div>
                <label>Gestor:</label>
                <SearchSelect
                    id = "gestor"
                    className="search_select"
                    value={gestor} 
                    onValueChange={(value) => setGestor(value)}
                    placeholder="Seleccione..."
                >
                {gestores
                        .filter(gestor => zonal === null || gestor.zonal_id === zonal)
                        .filter(gestor => supervisor === null || gestor.supervisor_id === supervisor || gestor.usuario_id === supervisor)
                        .map((gestor) => (
                            <SearchSelectItem key={gestor.usuario_id} value={gestor.usuario_id} className="search_select">
                                {gestor.nombre_completo_usuario.toUpperCase()}
                            </SearchSelectItem>
                        ))}
                </SearchSelect>
            </div>)}
        </div>
        <Button className="buscar" onClick={handleProcessClick} disabled={loading || loadingEvaluacion}> Procesar </Button>
            {loading ? (
                <Loader />
            ) : (<div class = "tablas">
            <div className="resumen">
            <h2>PROSPECTOS EVALUACIÓN DIARIA</h2>
            {loadingEvaluacion ? (
            <div className="cargando"> Cargando gráfico... </div>
                ) : (
                <div className="barchart-container">
                    <BarChartEvaluacion evaluacionData={evaluacionData} zonalFilter={appliedZonalFilter} supervisorFilter={appliedSupervisorFilter} />
                </div>
            )}
            </div>
            <div class="resumen">
                <h2>PROSPECTOS TOTALES</h2>
                <div className="dashboard-container">
                    <div className="donnutchart-container">
                    <DonutChartTotal 
                        totalProspectosAsignados={reportes.reduce((acc, reporte) => acc + Number(reporte.total_prospectos || 0), 0)}
                        totalContactados={reportes.reduce((acc, reporte) => acc + Number(reporte.contactados || 0), 0)}
                        totalNoContactados={reportes.reduce((acc, reporte) => acc + Number(reporte.no_contactados || 0), 0)}
                    />
                    </div>
                    <div className="barchart-container">
                    <BarChartTotal 
                        reportesFiltrados={reportes}
                    />
                    </div>
                </div>
                <div className="pagination-container">
                    <button
                        onClick={() => setPaginaActualTotales(p => Math.max(p - 1, 1))}
                        disabled={paginaActualTotales === 1}
                        className={`pagination-button ${paginaActualTotales === 1 ? 'disabled' : ''}`}
                    >
                        ◁
                    </button>
                    <button
                        onClick={() => setPaginaActualTotales(1)}
                        className={`page-button ${paginaActualTotales === 1 ? 'selected' : ''}`}
                    >
                        1
                    </button>
                    {paginaActualTotales > 3 && <span className="page-ellipsis">...</span>}
                    {(paginaActualTotales > 1 && paginaActualTotales < Math.ceil(reportes.length / porPagina)) && (
                        <button className="page-button selected">
                            {paginaActualTotales}
                        </button>
                    )}
                    {paginaActualTotales < Math.ceil(reportes.length / porPagina) - 2 && <span className="page-ellipsis">...</span>}
                    {Math.ceil(reportes.length / porPagina) > 1 && (
                        <button
                            onClick={() => setPaginaActualTotales(Math.ceil(reportes.length / porPagina))}
                            className={`page-button ${paginaActualTotales === Math.ceil(reportes.length / porPagina) ? 'selected' : ''}`}
                        >
                            {Math.ceil(reportes.length / porPagina)}
                        </button>
                    )}
                    <button
                        onClick={() => setPaginaActualTotales(p => Math.min(p + 1, Math.ceil(reportes.length / porPagina)))}
                        disabled={paginaActualTotales === Math.ceil(reportes.length / porPagina)}
                        className={`pagination-button ${paginaActualTotales === Math.ceil(reportes.length / porPagina) ? 'disabled' : ''}`}
                    >
                        ▷
                    </button>
                </div>
                <div className="table-container">
                <Table classname="table reportes">
                    <thead>
                        <tr>
                            <th>GESTOR</th>
                            <th>PROSPECTOS ASIGNADOS</th>
                            <th>PROSPECTOS PENDIENTES</th>
                            <th>CONTACTADOS</th>
                            <th>NO CONTACTADOS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportes.slice((paginaActualTotales - 1) * porPagina, paginaActualTotales * porPagina)
                            .map((reporte, index) => (
                                <tr key={index}>
                                    <td>{reporte.nombre_gestor.toUpperCase()}</td>
                                    <td>{reporte.total_prospectos}</td>
                                    <td>{Number(reporte.total_prospectos) - (Number(reporte.contactados) + Number(reporte.no_contactados))}</td>
                                    <td>{reporte.contactados}</td>
                                    <td>{reporte.no_contactados}</td>
                                </tr>
                            ))}
                        <tr>
                            <td><strong>TOTAL</strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.total_prospectos || 0), 0)}</strong></td>
                            <td><strong>
                                {reportes.reduce((acc, reporte) => {
                                    return acc + (Number(reporte.total_prospectos || 0) - (Number(reporte.contactados || 0) + Number(reporte.no_contactados || 0)));
                                }, 0)}
                            </strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.contactados || 0), 0)}</strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.no_contactados || 0), 0)}</strong></td>
                        </tr>
                    </tbody>
                </Table>
                </div>
            </div>
            <div>
                <h2>PROSPECTOS CONTACTADOS</h2>
                <div className="dashboard-container">
                    <div className="donnutchart-container">
                    <DonutChartContactados 
                        reportesFiltrados={reportes}
                    />
                    </div>
                    <div className="barchart-container">
                    <BarChartContactados 
                        reportesFiltrados={reportes}
                    />
                    </div>
                </div>
                <div className="pagination-container">
                    <button
                        onClick={() => setPaginaActualContactados(p => Math.max(p - 1, 1))}
                        disabled={paginaActualContactados === 1}
                        className={`pagination-button ${paginaActualContactados === 1 ? 'disabled' : ''}`}
                    >
                        ◁
                    </button>
                    <button
                        onClick={() => setPaginaActualContactados(1)}
                        className={`page-button ${paginaActualContactados === 1 ? 'selected' : ''}`}
                    >
                        1
                    </button>
                    {paginaActualContactados > 3 && <span className="page-ellipsis">...</span>}
                    {(paginaActualContactados > 1 && paginaActualContactados < Math.ceil(reportes.length / porPagina)) && (
                        <button className="page-button selected">
                            {paginaActualContactados}
                        </button>
                    )}
                    {paginaActualContactados < Math.ceil(reportes.length / porPagina) - 2 && <span className="page-ellipsis">...</span>}
                    {Math.ceil(reportes.length / porPagina) > 1 && (
                        <button
                            onClick={() => setPaginaActualContactados(Math.ceil(reportes.length / porPagina))}
                            className={`page-button ${paginaActualContactados === Math.ceil(reportes.length / porPagina) ? 'selected' : ''}`}
                        >
                            {Math.ceil(reportes.length / porPagina)}
                        </button>
                    )}
                    <button
                        onClick={() => setPaginaActualContactados(p => Math.min(p + 1, Math.ceil(reportes.length / porPagina)))}
                        disabled={paginaActualContactados === Math.ceil(reportes.length / porPagina)}
                        className={`pagination-button ${paginaActualContactados === Math.ceil(reportes.length / porPagina) ? 'disabled' : ''}`}
                    >
                        ▷
                    </button>
                </div>
                <div className="table-container">
                <Table classname="table reportes">
                    <thead>
                        <tr>
                            <th>GESTOR</th>
                            <th>CONTACTADOS</th>
                            <th>PROSPECTO</th>
                            <th>NO DESEA</th>
                            <th>EVALUACIÓN</th>
                            <th>OPI</th>
                            <th>POSIBLE DENUNCIA</th>
                            <th>DESEMBOLSÓ</th>
                            <th>OTROS</th>
                        </tr>
                    </thead>
                    <tbody>
                    {reportes.slice((paginaActualContactados - 1) * porPagina, paginaActualContactados * porPagina)
                        .map((reporte, index) =>(<tr key={index}>
                            <td>{reporte.nombre_gestor.toUpperCase()}</td>
                            <td>{reporte.contactados} </td>
                            <td>{reporte.prospecto} </td>
                            <td>{reporte.no_desea}</td>
                            <td>{reporte.evaluacion}</td>
                            <td>{reporte.opi}</td>
                            <td>{reporte.posible_denuncia}</td>
                            <td>{reporte.desembolso}</td>
                            <td>{reporte.otros_contactado}</td>
                        </tr>))}
                        <tr>
                            <td><strong>TOTAL</strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.contactados || 0), 0)}</strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.prospecto || 0), 0)}</strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.no_desea || 0), 0)}</strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.evaluacion || 0), 0)}</strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.opi || 0), 0)}</strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.posible_denuncia || 0), 0)}</strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.desembolso || 0), 0)}</strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.otros_contactado || 0), 0)}</strong></td>
                        </tr>
                    </tbody>
                </Table>
                </div>
            </div>
            <div>
                <h2>PROSPECTOS NO CONTACTADOS</h2>
                <div className="dashboard-container">
                    <div className="donnutchart-container">
                    <DonutChartNoContactados 
                        reportesFiltrados={reportes}
                    />
                    </div>
                    <div className="barchart-container">
                    <BarChartNoContactados 
                        reportesFiltrados={reportes}
                    />
                    </div>
                </div>
                <div className="pagination-container">
                    <button
                        onClick={() => setPaginaActualNoContactados(p => Math.max(p - 1, 1))}
                        disabled={paginaActualNoContactados === 1}
                        className={`pagination-button ${paginaActualNoContactados === 1 ? 'disabled' : ''}`}
                    >
                        ◁
                    </button>
                    <button
                        onClick={() => setPaginaActualNoContactados(1)}
                        className={`page-button ${paginaActualNoContactados === 1 ? 'selected' : ''}`}
                    >
                        1
                    </button>
                    {paginaActualNoContactados > 3 && <span className="page-ellipsis">...</span>}
                    {(paginaActualNoContactados > 1 && paginaActualNoContactados < Math.ceil(reportes.length / porPagina)) && (
                        <button className="page-button selected">
                            {paginaActualNoContactados}
                        </button>
                    )}
                    {paginaActualNoContactados < Math.ceil(reportes.length / porPagina) - 2 && <span className="page-ellipsis">...</span>}
                    {Math.ceil(reportes.length / porPagina) > 1 && (
                        <button
                            onClick={() => setPaginaActualNoContactados(Math.ceil(reportes.length / porPagina))}
                            className={`page-button ${paginaActualNoContactados === Math.ceil(reportes.length / porPagina) ? 'selected' : ''}`}
                        >
                            {Math.ceil(reportes.length / porPagina)}
                        </button>
                    )}
                    <button
                        onClick={() => setPaginaActualNoContactados(p => Math.min(p + 1, Math.ceil(reportes.length / porPagina)))}
                        disabled={paginaActualNoContactados === Math.ceil(reportes.length / porPagina)}
                        className={`pagination-button ${paginaActualNoContactados === Math.ceil(reportes.length / porPagina) ? 'disabled' : ''}`}
                    >
                        ▷
                    </button>
                </div>
                <div className="table-container">
                <Table classname="table reportes">
                    <thead>
                        <tr>
                            <th>GESTOR</th>
                            <th>NO CONTACTADOS</th>
                            <th>No CALIFICA</th>
                            <th>TELOFONO ERRADO</th>
                            <th>NO CONTESTA</th>
                            <th>SIN TELEFONO</th>
                            <th>OTROS</th>
                        </tr>
                    </thead>
                    <tbody>
                    {reportes.slice((paginaActualNoContactados - 1) * porPagina, paginaActualNoContactados * porPagina)
                        .map((reporte, index) =>(<tr key={index}>
                            <td>{reporte.nombre_gestor.toUpperCase()}</td>
                            <td>{reporte.no_contactados} </td>
                            <td>{reporte.no_califica} </td>
                            <td>{reporte.telefono_errado}</td>
                            <td>{reporte.no_contesta}</td>
                            <td>{reporte.sin_telefono}</td>
                            <td>{reporte.otros_no_contactado}</td>
                        </tr>))}
                        <tr>
                            <td><strong>TOTAL</strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.no_contactados || 0), 0)}</strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.no_califica || 0), 0)}</strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.telefono_errado || 0), 0)}</strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.no_contesta || 0), 0)}</strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.sin_telefono || 0), 0)}</strong></td>
                            <td><strong>{reportes.reduce((acc, reporte) => acc + Number(reporte.otros_no_contactado || 0), 0)}</strong></td>
                        </tr>
                    </tbody>
                </Table>
                </div>
            </div>
        </div>)}
        </div>
    </>
    );
}

export default Reportes;