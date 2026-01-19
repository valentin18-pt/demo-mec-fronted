import React, { useState, useContext } from "react";
import { AppContext } from '../application/provider';
import { Container, Table, Badge } from "reactstrap";
import ComisionDesembolsosService from "../axios_services/comisiondesembolsos.service";
import Loader from '../components/Loader/Loader';
import ButtonSearch from '../components/Buttons/ButtonSearch';
import ModalDetalleComisiones from '../components/Modal/ModalDetalleComisiones';
import './ComisionDesembolsos.css';

function ComisionDesembolsos() {
    const [state] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [comisiones, setComisiones] = useState([]);
    const [resumenGestores, setResumenGestores] = useState([]);
    const [resumenSupervisores, setResumenSupervisores] = useState([]);
    const [resumenZonales, setResumenZonales] = useState([]);
    const [errores, setErrores] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [tipoUsuarioSeleccionado, setTipoUsuarioSeleccionado] = useState(null);
    
    const [mesSeleccionado, setMesSeleccionado] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    });

    const getComisionDesembolsos = async () => {
        setLoadingTable(true);
        try {
            const [year, month] = mesSeleccionado.split('-');
            const fecha_min = `${year}-${month}-01`;
            const ultimoDia = new Date(year, month, 0).getDate();
            const fecha_max = `${year}-${month}-${ultimoDia}`;
            
            const response = await ComisionDesembolsosService.getComisionDesembolsos(
                fecha_min, 
                fecha_max
            );
            
            if (response.success) {
                setComisiones(response.data || []);
                setResumenGestores(response.resumen?.gestores || []);
                setResumenSupervisores(response.resumen?.supervisores || []);
                setResumenZonales(response.resumen?.zonales || []);
                setErrores(response.errores || []);
            } else {
                alert('Error al cargar los datos: ' + response.message);
                setComisiones([]);
                setResumenGestores([]);
                setResumenSupervisores([]);
                setResumenZonales([]);
                setErrores([]);
            }
        } catch (error) {
            console.error('Error al obtener comisiones:', error);
            alert('Error al cargar los datos');
            setComisiones([]);
            setResumenGestores([]);
            setResumenSupervisores([]);
            setResumenZonales([]);
            setErrores([]);
        }
        setLoadingTable(false);
    };

    const handleButtonClick = async () => {
        await getComisionDesembolsos();
    };

    const formatoSSoles = (monto) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(monto);
    };

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await getComisionDesembolsos();
            setLoading(false);
        };
        fetchData();
    }, []);

    const getJerarquiaEstructurada = () => {
        const zonalMap = new Map();

        comisiones.forEach(comision => {
            const zonalId = comision.zonal?.usuario_id;
            const supervisorId = comision.supervisor?.usuario_id;
            const gestorId = comision.gestor?.usuario_id;

            if (!zonalId || !supervisorId || !gestorId) return;

            if (!zonalMap.has(zonalId)) {
                zonalMap.set(zonalId, {
                    zonal: comision.zonal,
                    supervisores: new Map()
                });
            }

            const zonalData = zonalMap.get(zonalId);

            if (!zonalData.supervisores.has(supervisorId)) {
                zonalData.supervisores.set(supervisorId, {
                    supervisor: comision.supervisor,
                    gestores: new Map()
                });
            }

            const supervisorData = zonalData.supervisores.get(supervisorId);

            if (!supervisorData.gestores.has(gestorId)) {
                supervisorData.gestores.set(gestorId, {
                    gestor: comision.gestor,
                    desembolsos: []
                });
            }

            supervisorData.gestores.get(gestorId).desembolsos.push(comision);
        });

        return zonalMap;
    };

    const calcularMontoTotal = (desembolsos) => {
        return desembolsos.reduce((sum, d) => sum + (parseFloat(d.monto_neto) || 0), 0);
    };

    const obtenerResumenUsuario = (usuarioId, tipo) => {
        let resumen = null;
        
        switch(tipo) {
            case 'gestor':
                resumen = resumenGestores.find(g => g.usuario_id === usuarioId);
                break;
            case 'supervisor':
                resumen = resumenSupervisores.find(s => s.usuario_id === usuarioId);
                break;
            case 'zonal':
                resumen = resumenZonales.find(z => z.usuario_id === usuarioId);
                break;
        }
        
        return resumen;
    };

    const obtenerComisionUsuario = (usuarioId, tipo) => {
        const resumen = obtenerResumenUsuario(usuarioId, tipo);
        return resumen ? resumen.comision_total : 0;
    };

    const abrirModalDetalle = (usuarioId, tipo) => {
        const detalle = obtenerResumenUsuario(usuarioId, tipo);
        if (detalle) {
            setUsuarioSeleccionado(detalle);
            setTipoUsuarioSeleccionado(tipo);
            setModalOpen(true);
        }
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setUsuarioSeleccionado(null);
        setTipoUsuarioSeleccionado(null);
    };

    const tieneComisionesCalculadas = (usuarioId, tipo) => {
        const resumen = obtenerResumenUsuario(usuarioId, tipo);
        return resumen && resumen.detalles_comision && resumen.detalles_comision.length > 0;
    };

    const renderTablaJerarquica = () => {
        const jerarquia = getJerarquiaEstructurada();

        const rows = [];
        let numeroOrden = 1;
        
        jerarquia.forEach((zonalData) => {
            const { zonal, supervisores } = zonalData;
            
            let totalDesembolsosZonal = 0;
            supervisores.forEach(supervisorData => {
                supervisorData.gestores.forEach(gestorData => {
                    totalDesembolsosZonal += gestorData.desembolsos.length;
                });
            });

            let rowCounterZonal = 0;

            supervisores.forEach((supervisorData) => {
                const { supervisor, gestores } = supervisorData;
                
                let totalDesembolsosSupervisor = 0;
                gestores.forEach(gestorData => {
                    totalDesembolsosSupervisor += gestorData.desembolsos.length;
                });

                let rowCounterSupervisor = 0;

                gestores.forEach((gestorData) => {
                    const { gestor, desembolsos } = gestorData;
                    const comisionTotalGestor = obtenerComisionUsuario(gestor.usuario_id, 'gestor');
                    const tieneDetalleGestor = tieneComisionesCalculadas(gestor.usuario_id, 'gestor');

                    desembolsos.forEach((desembolso, idx) => {
                        const isFirstZonalRow = rowCounterZonal === 0;
                        const isFirstSupervisorRow = rowCounterSupervisor === 0;
                        const isFirstGestorRow = idx === 0;

                        const comisionTotalSupervisor = obtenerComisionUsuario(supervisor.usuario_id, 'supervisor');
                        const tieneDetalleSupervisor = tieneComisionesCalculadas(supervisor.usuario_id, 'supervisor');

                        const comisionTotalZonal = obtenerComisionUsuario(zonal.usuario_id, 'zonal');
                        const tieneDetalleZonal = tieneComisionesCalculadas(zonal.usuario_id, 'zonal');

                        rows.push(
                            <tr key={`${desembolso.n_solicitud}-${gestor.usuario_id}`}>
                                <td className="text-center">{numeroOrden}</td>
                                <td>{desembolso.n_solicitud || 'N/A'}</td>
                                <td>{desembolso.dni || 'N/A'}</td>
                                <td>{desembolso.fecha_desembolso || 'N/A'}</td>
                                <td className="text-right">{formatoSSoles(desembolso.monto_neto || 0)}</td>

                                {isFirstGestorRow && (
                                    <td rowSpan={desembolsos.length} className="text-center align-middle">
                                        <div className="font-weight-bold" style={{ marginBottom: '6px' }}>
                                            {(gestor.nombre_completo || 'N/A').toUpperCase()}
                                        </div>
                                        <div className="font-weight-bold text-success" style={{ fontSize: '12px' }}>
                                            {formatoSSoles(comisionTotalGestor)}
                                        </div>
                                        {tieneDetalleGestor ? (
                                            <button 
                                                className="btn btn-sm btn-info mt-2"
                                                style={{ textDecoration: 'underline' }}
                                                onClick={() => abrirModalDetalle(gestor.usuario_id, 'gestor')}
                                            >
                                                Ver detalles
                                            </button>
                                        ) : (
                                            <Badge color="warning" className="mt-2">Sin comisiones</Badge>
                                        )}
                                    </td>
                                )}

                                {isFirstSupervisorRow && (
                                    <td rowSpan={totalDesembolsosSupervisor} className="text-center align-middle">
                                        <div className="font-weight-bold" style={{ marginBottom: '6px' }}>
                                            {(supervisor.nombre_completo || 'N/A').toUpperCase()}
                                        </div>
                                        <div className="font-weight-bold text-success" style={{ fontSize: '12px' }}>
                                            {formatoSSoles(comisionTotalSupervisor)}
                                        </div>
                                        {tieneDetalleSupervisor ? (
                                            <button 
                                                className="btn btn-sm btn-info mt-2"
                                                style={{ textDecoration: 'underline' }}
                                                onClick={() => abrirModalDetalle(supervisor.usuario_id, 'supervisor')}
                                            >
                                                Ver detalles
                                            </button>
                                        ) : (
                                            <Badge color="warning" className="mt-2">Sin comisiones</Badge>
                                        )}
                                    </td>
                                )}

                                {isFirstZonalRow && (
                                    <td rowSpan={totalDesembolsosZonal} className="text-center align-middle">
                                        <div className="font-weight-bold" style={{ marginBottom: '6px' }}>
                                            {(zonal.nombre_completo || 'N/A').toUpperCase()}
                                        </div>
                                        <div className="font-weight-bold text-success" style={{ fontSize: '12px' }}>
                                            {formatoSSoles(comisionTotalZonal)}
                                        </div>
                                        {tieneDetalleZonal ? (
                                            <button 
                                                className="btn btn-sm btn-info mt-2"
                                                style={{ textDecoration: 'underline' }}
                                                onClick={() => abrirModalDetalle(zonal.usuario_id, 'zonal')}
                                            >
                                                Ver detalles
                                            </button>
                                        ) : (
                                            <Badge color="warning" className="mt-2">Sin comisiones</Badge>
                                        )}
                                    </td>
                                )}
                            </tr>
                        );

                        numeroOrden++;
                        rowCounterZonal++;
                        rowCounterSupervisor++;
                    });
                });
            });
        });

        return rows;
    };

    return (
        <>
            {loading 
                ? (<Loader />) 
                : (
                    <Container>
                        <div className="flex items-center justify-between">
                            <h1>COMISIONES DE DESEMBOLSOS</h1>
                        </div>

                        <div className="filtros">
                            <div>
                                <label htmlFor="mes_busqueda">Buscar por mes:</label>
                                <input 
                                    id="mes_busqueda" 
                                    type="month" 
                                    value={mesSeleccionado} 
                                    onChange={(e) => setMesSeleccionado(e.target.value)} 
                                />
                            </div>
                        </div>

                        <div>
                            <ButtonSearch
                                onClick={handleButtonClick}
                                isLoading={loadingTable}
                            />
                        </div>

                        {loadingTable ? (
                            <Loader />
                        ) : (
                            <>
                                <div className="table-container tabla-comision-desembolsos">
                                    <Table bordered hover size="sm">
                                        <thead>
                                            <tr>
                                                <th className="text-center">N°</th>
                                                <th>N° Solicitud</th>
                                                <th>DNI</th>
                                                <th>Fecha Desembolso</th>
                                                <th className="text-center">Monto Neto</th>
                                                <th className="text-center" style={{ minWidth: '180px' }}>
                                                    Gestor
                                                </th>
                                                <th className="text-center" style={{ minWidth: '180px' }}>
                                                    Supervisor
                                                </th>
                                                <th className="text-center" style={{ minWidth: '180px' }}>
                                                    Zonal
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comisiones.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="sin-data">Sin datos</td>
                                                </tr>
                                            ) : (
                                                renderTablaJerarquica()
                                            )}
                                        </tbody>
                                    </Table>
                                </div>

                                {errores.length > 0 && (
                                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                                        <h4 style={{ color: '#856404' }}>Errores encontrados ({errores.length}):</h4>
                                        <ul style={{ color: '#856404', marginTop: '10px' }}>
                                            {errores.map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}

                        <ModalDetalleComisiones
                            isOpen={modalOpen}
                            onClose={cerrarModal}
                            gestorDetalle={usuarioSeleccionado}
                        />
                    </Container>
                )
            }
        </>
    );
}

export default ComisionDesembolsos;