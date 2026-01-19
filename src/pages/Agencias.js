import React, { useState, useContext, useEffect, useRef } from "react";
import { AppContext } from '../application/provider';
import "./Agencias.css";
import { Table, Button } from "reactstrap";
import { ButtonUpdate, ButtonDelete, ButtonInsert, ButtonSearch } from '../components/Buttons/Buttons';
import CatalogoService from "../axios_services/catalogo.service";
import AsesorCajaService from "../axios_services/asesorCaja.service";
import ModalAsesorCaja from "../components/Modal/ModalAsesorCaja";
import Loader from '../components/Loader/Loader';

function Agencias() {
    const [state, setState] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [agencias, setAgencias] = useState([]);
    const [nombreAsesor, setNombreAsesor] = useState("");
    const [agenciaSeleccionada, setAgenciaSeleccionada] = useState("");
    const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
    const [distritoSeleccionado, setDistritoSeleccionado] = useState("");
    const [listaAgenciasContexto, setListaAgenciasContexto] = useState([]);
    const [listaProvincias, setListaProvincias] = useState([]);
    const [listaDistritos, setListaDistritos] = useState([]);

    const hasCargadoDatos = useRef(false);

    const getDirectorioAgencias = async () => {
        const data = await CatalogoService.getDirectorioAgencias();
        setAgencias(data);
        setState(prevState => ({ ...prevState, isUpdated: false }));
    };

    const getTodasLasAgencias = async () => {
        try {
            const data = await CatalogoService.getAgencias();
            return data;
        } catch (error) {
            console.error('Error al obtener agencias:', error);
            return [];
        }
    };

    const mostrarModalAsesorCaja = (agencia) => {
        const asesorData = {
            agencia_id: agencia.agencia_id || '',
            celular_responsable: agencia.celular_responsable || '',
            codigo_asesor: agencia.codigo_asesor || '',
            correo_responsable: agencia.correo_responsable || '',
            nombre_responsable: agencia.nombre_responsable || '',
            responsable_agencia_id: agencia.responsable_agencia_id || null
        };

        setState({
            ...state,
            mostrarModalAsesorCaja: true,
            asesor_caja: asesorData,
            agencias: listaAgenciasContexto
        });
    };

    const deleteAsesorAgencia = async (responsable_agencia_id) => {
        if (!responsable_agencia_id) {
            alert("No se puede eliminar. No hay asesor asignado a esta agencia.");
            return;
        }

        const confirmacion = window.confirm("¿Estás seguro de que deseas dar de baja al asesor? Esta acción no se puede deshacer.");
        if (!confirmacion) return;

        setLoading(true);
        try {
            await AsesorCajaService.deleteAsesorAgencia(responsable_agencia_id);
            await getDirectorioAgencias();
            alert("El asesor ha sido dado de baja correctamente.");
        } catch (error) {
            console.error('Error al eliminar asesor:', error);
            alert("No se pudo eliminar al asesor. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const cargarAgenciasContexto = async () => {
        try {
            const agenciasFromAPI = await getTodasLasAgencias();
            if (Array.isArray(agenciasFromAPI) && agenciasFromAPI.length > 0) {
                const sortedAgencias = [...agenciasFromAPI].sort((a, b) => {
                    if (a.descripcion && b.descripcion) {
                        return a.descripcion.localeCompare(b.descripcion);
                    }
                    return 0;
                });
                setListaAgenciasContexto(sortedAgencias);
                localStorage.setItem("agencias", JSON.stringify(sortedAgencias));
            } else {
                setListaAgenciasContexto([]);
            }
        } catch (error) {
            console.error('Error al cargar agencias:', error);
            setListaAgenciasContexto([]);
        }
    };

    useEffect(() => {
        if (hasCargadoDatos.current) {
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            hasCargadoDatos.current = true;

            try {
                await Promise.all([
                    cargarAgenciasContexto(),
                    getDirectorioAgencias()
                ]);
            } catch (error) {
                console.error('Error al cargar datos iniciales:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (agencias.length > 0) {
            const provinciasUnicas = [...new Set(agencias.map(agencia => agencia.provincia).filter(Boolean))];
            setListaProvincias(provinciasUnicas.sort());
        }
    }, [agencias]);

    useEffect(() => {
        if (provinciaSeleccionada) {
            const distritosDeProvincia = agencias
                .filter(agencia => agencia.provincia === provinciaSeleccionada)
                .map(agencia => agencia.distrito)
                .filter(Boolean);
            const distritosUnicos = [...new Set(distritosDeProvincia)];
            setListaDistritos(distritosUnicos.sort());
        } else {
            setListaDistritos([]);
        }
        setDistritoSeleccionado("");
    }, [provinciaSeleccionada, agencias]);

    const agenciasFiltradas = agencias.filter(agencia => {
        const matchAsesor = !nombreAsesor ||
            (agencia.nombre_responsable &&
                agencia.nombre_responsable.toLowerCase().includes(nombreAsesor.toLowerCase()));

        const matchAgencia = !agenciaSeleccionada ||
            String(agencia.agencia_id) === String(agenciaSeleccionada);

        const matchProvincia = !provinciaSeleccionada ||
            agencia.provincia === provinciaSeleccionada;

        const matchDistrito = !distritoSeleccionado ||
            agencia.distrito === distritoSeleccionado;

        return matchAsesor && matchAgencia && matchProvincia && matchDistrito;
    });

    const handleNuevoAsesor = () => {
        const nuevoAsesor = {
            agencia_id: '',
            celular_responsable: '',
            codigo_asesor: '',
            correo_responsable: '',
            nombre_responsable: '',
            responsable_agencia_id: null
        };
        mostrarModalAsesorCaja(nuevoAsesor);
    };

    const actualizarDirectorioAgencias = async () => {
        setLoading(true);
        try {
            await Promise.all([
                cargarAgenciasContexto(),
                getDirectorioAgencias()
            ]);
        } catch (error) {
            console.error('Error al actualizar directorio:', error);
        } finally {
            setLoading(false);
        }
    };

    const limpiarFiltros = () => {
        setNombreAsesor("");
        setAgenciaSeleccionada("");
        setProvinciaSeleccionada("");
        setDistritoSeleccionado("");
    };

    return (
        <div className="caja-flujo-container agencias-scope">
            {loading ? (
                <Loader />
            ) : (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <h1>DIRECTORIO DE CAJA HUANCAYO</h1>
                    </div>

                    <div className="filtros">
                        <div className="campo-fecha">
                            <label htmlFor="nombreAsesor">Nombre del Asesor:</label>
                            <input
                                className="form-control"
                                type="text"
                                id="nombreAsesor"
                                value={nombreAsesor}
                                placeholder="Buscar por asesor..."
                                onChange={(e) => setNombreAsesor(e.target.value)}
                            />
                        </div>
                        <div className="campo-fecha">
                            <label htmlFor="agencia">Agencia:</label>
                            <select
                                className="form-control"
                                id="agencia"
                                value={agenciaSeleccionada}
                                onChange={(e) => setAgenciaSeleccionada(e.target.value)}
                            >
                                <option value="">Todas las agencias</option>
                                {listaAgenciasContexto.map((agencia) => (
                                    <option key={agencia.agencia_id} value={agencia.agencia_id}>
                                        {agencia.descripcion}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="campo-fecha">
                            <label htmlFor="provincia">Provincia:</label>
                            <select
                                className="form-control"
                                id="provincia"
                                value={provinciaSeleccionada}
                                onChange={(e) => setProvinciaSeleccionada(e.target.value)}
                            >
                                <option value="">Todas las provincias</option>
                                {listaProvincias.map((provincia) => (
                                    <option key={provincia} value={provincia}>
                                        {provincia.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="campo-fecha">
                            <label htmlFor="distrito">Distrito:</label>
                            <select
                                className="form-control"
                                id="distrito"
                                value={distritoSeleccionado}
                                onChange={(e) => setDistritoSeleccionado(e.target.value)}
                                disabled={!provinciaSeleccionada}
                            >
                                <option value="">Todos los distritos</option>
                                {listaDistritos.map((distrito) => (
                                    <option key={distrito} value={distrito}>
                                        {distrito.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <ButtonSearch
                        onClick={() => { }}
                    />

                    <div className="nuevo-movimiento-section">
                        {[1, 2, 6, 8].includes(Number(state.user?.perfil_id)) && (
                            <ButtonInsert onClick={handleNuevoAsesor} />
                        )}
                    </div>

                    <div className="table-container">
                        <Table responsive striped>
                            <thead>
                                <tr>
                                    <th>AGENCIA</th>
                                    <th className="col-zona">ZONA</th>
                                    <th className="col-asesor">ASESOR</th>
                                    <th>CELULAR</th>
                                    <th>CORREO</th>
                                    <th>DEPARTAMENTO</th>
                                    <th>PROVINCIA</th>
                                    <th className="col-zona">DISTRITO</th>
                                    <th className="col-direccion">DIRECCIÓN DE LA OFICINA</th>
                                    <th>ADMINISTRADOR</th>
                                    <th>CELULAR ADM.</th>
                                    <th>CORREO ADM.</th>
                                    {[1, 2, 6, 8].includes(Number(state.user?.perfil_id)) && <th>ACCIONES</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {agenciasFiltradas.length > 0 ? (
                                    agenciasFiltradas.map((agencia, index) => (
                                        <tr key={`agencia-${agencia.agencia_id}-${index}`}>
                                            <td>{agencia.descripcion || '-'}</td>
                                            <td className="col-zona">{agencia.zona || '-'}</td>
                                            <td className="col-asesor">
                                                {agencia.nombre_responsable ||
                                                    <span style={{ color: '#999', fontStyle: 'italic' }}>Sin asignar</span>
                                                }
                                            </td>
                                            <td>{agencia.celular_responsable || '-'}</td>
                                            <td>{agencia.correo_responsable || '-'}</td>
                                            <td>{agencia.departamento ? agencia.departamento.toUpperCase() : '-'}</td>
                                            <td>{agencia.provincia ? agencia.provincia.toUpperCase() : '-'}</td>
                                            <td className="col-zona">{agencia.distrito ? agencia.distrito.toUpperCase() : '-'}</td>
                                            <td className="col-direccion">{agencia.direccion || '-'}</td>
                                            <td>{agencia.nombre_administrador || '-'}</td>
                                            <td>{agencia.celular_administrador || '-'}</td>
                                            <td>{agencia.correo_administrador || '-'}</td>
                                            {[1, 2, 6, 8].includes(Number(state.user?.perfil_id)) && (
                                                <td>
                                                    <div className="acciones-container">
                                                        <ButtonUpdate
                                                            onClick={() => mostrarModalAsesorCaja(agencia)}
                                                        />
                                                        {agencia.responsable_agencia_id && (
                                                            <ButtonDelete
                                                                onClick={() => deleteAsesorAgencia(agencia.responsable_agencia_id)}
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={[1, 2, 6, 8].includes(Number(state.user?.perfil_id)) ? "13" : "12"} className="text-center">
                                            {nombreAsesor || agenciaSeleccionada || provinciaSeleccionada || distritoSeleccionado
                                                ? 'No se encontraron agencias que coincidan con los filtros aplicados.'
                                                : 'No hay agencias registradas en el sistema.'
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>

                    <ModalAsesorCaja
                        isOpen={state.mostrarModalAsesorCaja}
                        onRefresh={actualizarDirectorioAgencias}
                    />
                </>
            )}
        </div>
    );
}

export default Agencias;