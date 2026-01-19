import React, { useState, useContext } from "react";
import { AppContext } from '../application/provider';
import "./SeguimientoDesembolsos.css";
import { Container, Table, Button } from "reactstrap";
import SeguimientoDesembolsosService from "../axios_services/seguimientodesembolsos.service";
import ModalSeguimientoDesembolsos from '../components/Modal/ModalSeguimientoDesembolsos';
import Loader from '../components/Loader/Loader';
import ButtonSearch from '../components/Buttons/ButtonSearch';
import { ButtonUpdate } from '../components/Buttons/Buttons';
import { SearchSelect, SearchSelectItem } from '@tremor/react';

function SeguimientoDesembolsos() {
    const [state, setState] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [seguimientos, setSeguimientos] = useState([]);
    const [seguimientosFiltrados, setSeguimientosFiltrados] = useState([]);
    const [loadingTable, setLoadingTable] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [seguimientoSeleccionado, setSeguimientoSeleccionado] = useState(null);
    const [estadoFiltro, setEstadoFiltro] = useState('');

    const [mesSeleccionado, setMesSeleccionado] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    });

    const [instituciones] = useState(state.catalogos.instituciones);
    const [canal_captacion] = useState(state.catalogos.tipos.filter(t => t.categoria_id == 14));
    const [tipos_desembolso] = useState(state.catalogos.tipos.filter(t => t.categoria_id == 10));
    const [estados_seguimiento_desembolso] = useState(state.catalogos.tipos.filter(t => t.categoria_id == 38));

    const aplicarFiltroEstado = (datos, filtroEstado) => {
        if (filtroEstado === '') {
            return datos;
        }

        if (filtroEstado === '0') {
            return datos.filter(s => !s.estado_id || s.estado_id === null);
        }

        return datos.filter(s => Number(s.estado_id) === Number(filtroEstado));
    };

    const getSeguimientoDesembolsos = async () => {
        setLoadingTable(true);
        try {
            const [year, month] = mesSeleccionado.split('-');
            const fecha_min = `${year}-${month}-01`;
            const ultimoDia = new Date(year, month, 0).getDate();
            const fecha_max = `${year}-${month}-${ultimoDia}`;

            const data = await SeguimientoDesembolsosService.getSeguimientoDesembolsos(
                fecha_min,
                fecha_max,
                null,
                null,
                null
            );

            setSeguimientos(data);
            setSeguimientosFiltrados(aplicarFiltroEstado(data, estadoFiltro));
        } catch (error) {
            console.error('Error al obtener seguimientos:', error);
            alert('Error al cargar los datos');
        }
        setLoadingTable(false);
    };

    const handleButtonClick = async () => {
        await getSeguimientoDesembolsos();
    };

    const formatoSSoles = (monto) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(monto);
    };

    const mostrarModalSeguimiento = (seguimiento) => {
        setSeguimientoSeleccionado(seguimiento);
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setSeguimientoSeleccionado(null);
    };

    const handleSaveSeguimiento = async (dataToSave) => {
        try {
            if (seguimientoSeleccionado?.seguimiento_desembolso_id) {
                await SeguimientoDesembolsosService.updateSeguimientoDesembolso({
                    seguimiento_desembolso_id: seguimientoSeleccionado.seguimiento_desembolso_id,
                    ...dataToSave
                });
                alert('Seguimiento actualizado correctamente');
            } else {
                await SeguimientoDesembolsosService.createSeguimientoDesembolso(dataToSave);
                alert('Seguimiento creado correctamente');
            }
            await getSeguimientoDesembolsos();
        } catch (error) {
            console.error('Error al guardar seguimiento:', error);
            throw error;
        }
    };

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await getSeguimientoDesembolsos();
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <>
            {loading
                ? (<Loader />)
                : (
                    <Container>
                        <div className="flex items-center justify-between mb-4">
                            <h1>SEGUIMIENTO DE DESEMBOLSOS</h1>
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
                            <div>
                                <label htmlFor="estado_filtro">Estado:</label>
                                <SearchSelect
                                    id="estado_filtro"
                                    name="estado_filtro"
                                    className="search_select"
                                    value={estadoFiltro}
                                    onValueChange={(value) => setEstadoFiltro(value)}
                                    placeholder="Seleccione..."
                                >
                                    <SearchSelectItem value="0" className="search_select">PENDIENTE</SearchSelectItem>
                                    {estados_seguimiento_desembolso.map((item) => (
                                        <SearchSelectItem key={item.tipo_id} value={item.tipo_id} className="search_select">
                                            {item.descripcion}
                                        </SearchSelectItem>
                                    ))}
                                </SearchSelect>
                            </div>
                        </div>

                        {loadingTable ? (
                            <Loader />
                        ) : (
                            <>
                                <div>
                                    <ButtonSearch
                                        onClick={handleButtonClick}
                                        isLoading={loadingTable}
                                    />
                                </div>

                                <div className="table-container tabla-seguimiento-desembolsos">
                                    <Table>
                                        <thead>
                                            <tr>
                                                <th>N° de solicitud</th>
                                                <th>DNI</th>
                                                <th>Apellidos y nombres</th>
                                                <th>Celular</th>
                                                <th>Canal de captación</th>
                                                <th>Convenio</th>
                                                <th>Monto bruto</th>
                                                <th>Monto neto</th>
                                                <th>Plazo</th>
                                                <th>Tasa</th>
                                                <th>Agencia</th>
                                                <th>Tipo de desembolso</th>
                                                <th>Fecha de desembolso</th>
                                                <th>Estado</th>
                                                <th>Comentario</th>
                                                <th>Fecha seguimiento</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {seguimientosFiltrados.length === 0 ? (
                                                <tr>
                                                    <td colSpan="17" className="sin-data">Sin desembolsos</td>
                                                </tr>
                                            ) : (
                                                seguimientosFiltrados.map((seguimiento, index) => (
                                                    <tr
                                                        key={index}
                                                        className={
                                                            Number(seguimiento.estado_id) === 1
                                                                ? 'estado-seguimiento-1'
                                                                : Number(seguimiento.estado_id) === 2
                                                                    ? 'estado-seguimiento-2'
                                                                    : ''
                                                        }
                                                    >
                                                        <td>{seguimiento.n_solicitud || 'N/A'}</td>
                                                        <td>{seguimiento.dni || 'N/A'}</td>
                                                        <td>{seguimiento.nombre || 'N/A'}</td>
                                                        <td>{seguimiento.celular || 'N/A'}</td>
                                                        <td>
                                                            {canal_captacion.find(item => item.tipo_id === seguimiento.canal_captacion_id)
                                                                ? canal_captacion.find(item => item.tipo_id === seguimiento.canal_captacion_id).descripcion
                                                                : 'N/A'}
                                                        </td>
                                                        <td>
                                                            {instituciones.find(item => item.institucion_id === seguimiento.razon_social_id)
                                                                ? instituciones.find(item => item.institucion_id === seguimiento.razon_social_id).razon_social
                                                                : 'N/A'}
                                                        </td>
                                                        <td>{seguimiento.monto_bruto_final ? formatoSSoles(seguimiento.monto_bruto_final) : 'N/A'}</td>
                                                        <td>{seguimiento.monto_neto_final ? formatoSSoles(seguimiento.monto_neto_final) : 'N/A'}</td>
                                                        <td>{seguimiento.plazo || 'N/A'}</td>
                                                        <td>{seguimiento.tasa || 'N/A'}</td>
                                                        <td>{seguimiento.agencia || 'N/A'}</td>
                                                        <td>
                                                            {tipos_desembolso.find(item => item.tipo_id === seguimiento.desembolso_id)
                                                                ? tipos_desembolso.find(item => item.tipo_id === seguimiento.desembolso_id).descripcion
                                                                : 'N/A'}
                                                        </td>
                                                        <td>{seguimiento.fecha_desembolso || 'N/A'}</td>
                                                        <td>
                                                            {seguimiento.estado_id
                                                                ? estados_seguimiento_desembolso.find(item => item.tipo_id === seguimiento.estado_id)?.descripcion || 'N/A'
                                                                : 'PENDIENTE'}
                                                        </td>
                                                        <td>{seguimiento.comentario}</td>
                                                        <td>{seguimiento.fecha_seguimiento}</td>
                                                        <td>
                                                            {Number(seguimiento.estado_id) === 1 ? (
                                                                <span className="text-2xl" title="Finalizado - Bloqueado">
                                                                    🔒
                                                                </span>
                                                            ) : (
                                                                <ButtonUpdate
                                                                    onClick={() => mostrarModalSeguimiento(seguimiento)}
                                                                />
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

                        <ModalSeguimientoDesembolsos
                            isOpen={modalOpen}
                            seguimiento={seguimientoSeleccionado}
                            onClose={cerrarModal}
                            onSave={handleSaveSeguimiento}
                            estadosSeguimiento={estados_seguimiento_desembolso}
                            usuarioId={state.user?.usuario_id}
                        />
                    </Container>
                )
            }
        </>
    );
}

export default SeguimientoDesembolsos;