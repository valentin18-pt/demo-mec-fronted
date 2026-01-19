import { Table, Button } from "reactstrap";
import { useState, useContext, useEffect, useMemo, useRef } from "react";
import { AppContext } from '../application/provider';
import CostosDirectosService from "../axios_services/costosdirectos.service";
import Loader from "../components/Loader/Loader";
import ModalCostosDirectos from "./../components/Modal/ModalCostosDirectos";
import "./CostosDirectos.css";

function CostosDirectos() {
    const [periodo_fecha, setPeriodoFecha] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [tipoDesembolso, setTipoDesembolso] = useState(0);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [state] = useContext(AppContext);

    const [canal_captacion] = useState(state.catalogos.tipos.filter(t => t.categoria_id == 14));
    const [instituciones] = useState(state.catalogos.instituciones);
    const [entidad_cliente] = useState(state.catalogos.tipos.filter(t => t.categoria_id == 36));
    const [modalidad_colaboradores] = useState(state.catalogos.tipos.filter(t => t.categoria_id == 34));
    const [tipo_credito] = useState(state.catalogos.tipos.filter(t => t.categoria_id == 35));

    const [modalOpen, setModalOpen] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [tipoUsuarioSeleccionado, setTipoUsuarioSeleccionado] = useState("");
    const [highlightedIds, setHighlightedIds] = useState({ self: null, parent: null });
    const [highlightedRowKey, setHighlightedRowKey] = useState(null);

    const initialFetchDone = useRef(false);

    const getCostosDirectos = async () => {
        setLoading(true);
        try {
            const response = await CostosDirectosService.getCostosDirectos(
                state.user?.perfil_id,
                state.user?.usuario_id,
                periodo_fecha,
                tipoDesembolso
            );
            setUsuarios(response.datos.usuarios_comercial);
        } catch (error) {
            console.error('Error al obtener datos:', error);
            setUsuarios([]);
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

    const formatoCategoria = (categoria) => {
        const categorias = {
            1: 'S/0.00 a S/30,000.00 desembolsados',
            2: 'S/30,000.00 a S/60,000.00 desembolsados',
            3: 'S/60,000.00 a S/90,000.00 desembolsados',
            4: 'S/90,000.00 a S/120,000.00 desembolsados',
            5: 'S/120,000.00 a S/150,000.00 desembolsados'
        };
        return categorias[categoria] || 'Sin categoría';
    };

    const getNombre = (id, catalogo, key = 'tipo_id', nameKey = 'descripcion') => {
        const item = catalogo.find(c => c[key] == id);
        return item ? item[nameKey] : 'N/A';
    };

    const handleVerDetalle = (usuario, tipoUsuario) => {
        setUsuarioSeleccionado(usuario);
        setTipoUsuarioSeleccionado(tipoUsuario);
        setModalOpen(true);
    };

    const toggleModal = () => {
        setModalOpen(!modalOpen);
        if (modalOpen) {
            setUsuarioSeleccionado(null);
            setTipoUsuarioSeleccionado("");
        }
    };

    const getUserById = (id) => {
        return usuarios.find(u => u.usuario_id === String(id));
    };

    const handleMouseLeave = () => {
        setHighlightedIds({ self: null, parent: null });
        setHighlightedRowKey(null);
    };

    const getJerarquiaEstructurada = () => {
        const gestores = usuarios.filter(u => Number(u.perfil_id) === 4);
        const subgerenteMap = new Map();

        gestores.forEach(gestor => {
            const supervisor = getUserById(gestor.usuario_id_jefe_inmediato);
            if (!supervisor) return;

            const zonal = getUserById(supervisor.usuario_id_jefe_inmediato);
            if (!zonal) return;

            const subgerente = getUserById(zonal.usuario_id_jefe_inmediato);
            if (!subgerente) return;

            const subgerenteId = subgerente.usuario_id;
            const zonalId = zonal.usuario_id;
            const supervisorId = supervisor.usuario_id;

            if (!subgerenteMap.has(subgerenteId)) {
                subgerenteMap.set(subgerenteId, { subgerente, zonales: new Map() });
            }

            const subgerenteData = subgerenteMap.get(subgerenteId);

            if (!subgerenteData.zonales.has(zonalId)) {
                subgerenteData.zonales.set(zonalId, { zonal, supervisores: new Map() });
            }

            const zonalData = subgerenteData.zonales.get(zonalId);

            if (!zonalData.supervisores.has(supervisorId)) {
                zonalData.supervisores.set(supervisorId, { supervisor, gestores: [] });
            }

            zonalData.supervisores.get(supervisorId).gestores.push(gestor);
        });

        return subgerenteMap;
    };

    useEffect(() => {
        if (!initialFetchDone.current) {
            getCostosDirectos();
            initialFetchDone.current = true;
        }
    }, []);

    const jerarquiaData = getJerarquiaEstructurada();

    const { totalGestor, totalSupervisor, totalZonal, totalSubgerente, totalGeneral } = useMemo(() => {
        let totalGestor = 0;
        let totalSupervisor = 0;
        let totalZonal = 0;
        let totalSubgerente = 0;

        usuarios.forEach(usuario => {
            const totalPagar = parseFloat(usuario.total_pagar) || 0;
            switch (Number(usuario.perfil_id)) {
                case 4:
                    totalGestor += totalPagar;
                    break;
                case 3:
                    totalSupervisor += totalPagar;
                    break;
                case 2:
                    totalZonal += totalPagar;
                    break;
                case 6:
                    totalSubgerente += totalPagar;
                    break;
                default:
                    break;
            }
        });

        const totalGeneral = totalGestor + totalSupervisor + totalZonal + totalSubgerente;

        return { totalGestor, totalSupervisor, totalZonal, totalSubgerente, totalGeneral };
    }, [usuarios]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <div className="flex items-center justify-between">
                <h1>💰 Costos Directos</h1>
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
            <Button className="buscar" onClick={getCostosDirectos} disabled={loading}>
                {loading ? 'Calculando...' : 'Calcular'}
            </Button>

            <div className="totales-container">
                <div className="total-box">
                    <h5>Total Gestor</h5>
                    <p>{formatoSoles(totalGestor)}</p>
                </div>
                <div className="total-box">
                    <h5>Total Supervisor</h5>
                    <p>{formatoSoles(totalSupervisor)}</p>
                </div>
                <div className="total-box">
                    <h5>Total Zonal</h5>
                    <p>{formatoSoles(totalZonal)}</p>
                </div>
                <div className="total-box">
                    <h5>Total Subgerente</h5>
                    <p>{formatoSoles(totalSubgerente)}</p>
                </div>
                <div className="total-box total-general">
                    <h5>Total General</h5>
                    <p>{formatoSoles(totalGeneral)}</p>
                </div>
            </div>
            
            <ModalCostosDirectos
                isOpen={modalOpen}
                toggle={toggleModal}
                usuario={usuarioSeleccionado}
                tipoUsuario={tipoUsuarioSeleccionado}
            />

            <div className="table-costos-directos">
                <Table bordered hover size="sm">
                    <thead className="sticky-top">
                        <tr>
                            <th rowSpan="2" className="align-middle">N° Solicitud</th>
                            <th rowSpan="2" className="align-middle">DNI</th>
                            <th rowSpan="2" className="align-middle">Canal Captación</th>
                            <th rowSpan="2" className="align-middle">Convenio</th>
                            <th rowSpan="2" className="align-middle">Monto Bruto</th>
                            <th rowSpan="2" className="align-middle">Monto Neto</th>
                            <th rowSpan="2" className="align-middle">Plazo</th>
                            <th rowSpan="2" className="align-middle">Tasa</th>
                            <th rowSpan="2" className="align-middle">Agencia</th>
                            <th rowSpan="2" className="align-middle">Distrito</th>
                            <th rowSpan="2" className="align-middle">Provincia</th>
                            <th rowSpan="2" className="align-middle">Departamento</th>
                            <th rowSpan="2" className="align-middle">Zona</th>
                            <th rowSpan="2" className="align-middle">Fecha Desembolso</th>
                            <th rowSpan="2" className="align-middle">Cliente</th>
                            <th rowSpan="2" className="align-middle">Canal</th>
                            <th rowSpan="2" className="align-middle">Tipo Crédito</th>
                            <th rowSpan="2" className="align-middle">Categoría</th>
                            <th rowSpan="2" className="align-middle">Comisión</th>
                            <th rowSpan="2" className="text-center align-middle">Gestor</th>
                            <th rowSpan="2" className="text-center align-middle">Supervisor</th>
                            <th rowSpan="2" className="text-center align-middle">Zonal</th>
                            <th rowSpan="2" className="text-center align-middle">Subgerente</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jerarquiaData.size > 0 ? (
                            Array.from(jerarquiaData.values()).map((subgerenteData) => {
                                const { subgerente, zonales } = subgerenteData;
                                let totalDesembolsosSubgerente = 0;
                                zonales.forEach(zonalData => zonalData.supervisores.forEach(supervisorData => supervisorData.gestores.forEach(gestor => {
                                    totalDesembolsosSubgerente += gestor.detalle_desembolsos?.length || 0;
                                })));
                                let rowCounterSubgerente = 0;
                                return Array.from(zonales.values()).map((zonalData) => {
                                    const { zonal, supervisores } = zonalData;
                                    let totalDesembolsosZonal = 0;
                                    supervisores.forEach(supervisorData => supervisorData.gestores.forEach(gestor => {
                                        totalDesembolsosZonal += gestor.detalle_desembolsos?.length || 0;
                                    }));
                                    let rowCounterZonal = 0;
                                    return Array.from(supervisores.values()).map((supervisorData) => {
                                        const { supervisor, gestores } = supervisorData;
                                        let totalDesembolsosSupervisor = 0;
                                        gestores.forEach(gestor => {
                                            totalDesembolsosSupervisor += gestor.detalle_desembolsos?.length || 0;
                                        });
                                        let rowCounterSupervisor = 0;
                                        return gestores.map((gestor) => {
                                            const desembolsos = gestor.detalle_desembolsos || [];
                                            const gestorDesembolsosCount = desembolsos.length;
                                            return desembolsos.map((detalle, detalleIdx) => {
                                                const rowKey = `${gestor.usuario_id}-${detalle.n_solicitud}`;
                                                const isFirstSubgerenteRow = rowCounterSubgerente === 0;
                                                const isFirstZonalRow = rowCounterZonal === 0;
                                                const isFirstSupervisorRow = rowCounterSupervisor === 0;
                                                const isFirstGestorRow = detalleIdx === 0;
                                                rowCounterSubgerente++;
                                                rowCounterZonal++;
                                                rowCounterSupervisor++;

                                                const isRowHighlighted = highlightedRowKey === rowKey;
                                                const isGestorHighlighted = highlightedIds.self === gestor.usuario_id;

                                                return (
                                                    <tr key={rowKey}>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {detalle.n_solicitud}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {detalle.dni}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {getNombre(detalle.canal_captacion_id, canal_captacion)}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {getNombre(detalle.convenio, instituciones, 'institucion_id', 'razon_social')}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {formatoSoles(detalle.monto_bruto || 0)}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {formatoSoles(detalle.monto_neto || 0)}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {detalle.plazo}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {detalle.tasa}%
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {detalle.agencia}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {detalle.distrito}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {detalle.provincia}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {detalle.departamento}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {detalle.zona}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {detalle.fecha_desembolso}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {getNombre(detalle.cliente, entidad_cliente)}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {getNombre(detalle.canal, modalidad_colaboradores)}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {getNombre(detalle.tipo_credito, tipo_credito)}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {formatoCategoria(detalle.categoria)}
                                                        </td>
                                                        <td className={isRowHighlighted ? 'highlighted' : ''} onMouseEnter={() => { setHighlightedRowKey(rowKey); setHighlightedIds({ self: gestor.usuario_id, parent: null }); }} onMouseLeave={handleMouseLeave}>
                                                            {formatoSoles(detalle.comision || 0)}
                                                        </td>

                                                        {isFirstGestorRow && (
                                                            <td
                                                                rowSpan={gestorDesembolsosCount}
                                                                className={`text-center align-middle ${(isGestorHighlighted || highlightedIds.parent === gestor.usuario_id) ? 'highlighted' : ''}`}
                                                                onMouseEnter={() => setHighlightedIds({ self: gestor.usuario_id, parent: supervisor?.usuario_id })}
                                                                onMouseLeave={handleMouseLeave}
                                                            >
                                                                <div className="font-semibold">{`${gestor.apellidos}, ${gestor.nombre}`.toUpperCase()}</div>
                                                                <div className="font-bold mt-1">{formatoSoles(gestor.total_pagar)}</div>
                                                                <button onClick={() => handleVerDetalle(gestor, 'Gestor')} className="text-blue-600 text-xs underline mt-2" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Ver detalle</button>
                                                            </td>
                                                        )}

                                                        {isFirstSupervisorRow && (
                                                            <td
                                                                rowSpan={totalDesembolsosSupervisor}
                                                                className={`text-center align-middle ${(highlightedIds.self === supervisor?.usuario_id || highlightedIds.parent === supervisor?.usuario_id) ? 'highlighted' : ''}`}
                                                                onMouseEnter={() => setHighlightedIds({ self: supervisor.usuario_id, parent: zonal?.usuario_id })}
                                                                onMouseLeave={handleMouseLeave}
                                                            >
                                                                {supervisor ? (
                                                                    <>
                                                                        <div className="font-semibold">{`${supervisor.apellidos}, ${supervisor.nombre}`.toUpperCase()}</div>
                                                                        <div className="font-bold mt-1">{formatoSoles(supervisor.total_pagar)}</div>
                                                                        <button onClick={() => handleVerDetalle(supervisor, 'Supervisor')} className="text-blue-600 text-xs underline mt-2" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Ver detalle</button>
                                                                    </>
                                                                ) : '-'}
                                                            </td>
                                                        )}
                                                        {isFirstZonalRow && (
                                                            <td
                                                                rowSpan={totalDesembolsosZonal}
                                                                className={`text-center align-middle ${(highlightedIds.self === zonal?.usuario_id || highlightedIds.parent === zonal?.usuario_id) ? 'highlighted' : ''}`}
                                                                onMouseEnter={() => setHighlightedIds({ self: zonal.usuario_id, parent: subgerente?.usuario_id })}
                                                                onMouseLeave={handleMouseLeave}
                                                            >
                                                                {zonal ? (
                                                                    <>
                                                                        <div className="font-semibold">{`${zonal.apellidos}, ${zonal.nombre}`.toUpperCase()}</div>
                                                                        <div className="font-bold mt-1">{formatoSoles(zonal.total_pagar)}</div>
                                                                        <button onClick={() => handleVerDetalle(zonal, 'Zonal')} className="text-blue-600 text-xs underline mt-2" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Ver detalle</button>
                                                                    </>
                                                                ) : '-'}
                                                            </td>
                                                        )}

                                                        {isFirstSubgerenteRow && (
                                                            <td
                                                                rowSpan={totalDesembolsosSubgerente}
                                                                className={`text-center align-middle ${(highlightedIds.self === subgerente?.usuario_id || highlightedIds.parent === subgerente?.usuario_id) ? 'highlighted' : ''}`}
                                                                onMouseEnter={() => setHighlightedIds({ self: subgerente.usuario_id, parent: null })}
                                                                onMouseLeave={handleMouseLeave}
                                                            >
                                                                {subgerente ? (
                                                                    <>
                                                                        <div className="font-semibold">{`${subgerente.apellidos}, ${subgerente.nombre}`.toUpperCase()}</div>
                                                                        <div className="font-bold mt-1">{formatoSoles(subgerente.total_pagar)}</div>
                                                                        <button onClick={() => handleVerDetalle(subgerente, 'Subgerente')} className="text-blue-600 text-xs underline mt-2" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Ver detalle</button>
                                                                    </>
                                                                ) : '-'}
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            });
                                        });
                                    });
                                });
                            })
                        ) : (
                            <tr>
                                <td colSpan="23" className="text-center text-gray-500 py-4">
                                    No hay datos disponibles para este período.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </>
    );
}

export default CostosDirectos;