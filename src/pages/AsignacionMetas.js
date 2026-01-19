import "./AsignacionMetas.css";
import React, {useState , useContext, useEffect } from "react";
import { Button} from "reactstrap";
import {AppContext} from '../application/provider';
import MetasService from "../axios_services/metas.service";
import {Accordion, AccordionBody,AccordionHeader, AccordionList} from '@tremor/react';
import ModalInsertarMeta from "../components/Modal/ModalInsertarMeta";
import Loader from '../components/Loader/Loader'; 

function AsignacionMetas() {

    const [loading, setLoading] = useState(false);
    const [periodo_fecha, setPeriodoFecha] = useState(() => {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [metasMensuales, setMetasMensuales] = useState([]);
    const [state,setState] = useContext(AppContext);

    const getPerfilJefeSupremo = (periodoFecha) => {
        const [year, month] = periodoFecha.split('-').map(Number);
        const fecha = new Date(year, month - 1);
        const enero2026 = new Date(2026, 0);
 
        return fecha >= enero2026 ? 6 : 2;
    };

    const getMetasMensuales = async () => {
        setLoading(true);
        try {
            const data = await MetasService.getMetasMensuales(state.user?.perfil_id, state.user?.usuario_id, periodo_fecha);
            console.log('Datos recibidos:', data);
            console.log('Periodo buscado:', periodo_fecha);
            console.log('Perfil a usar:', getPerfilJefeSupremo(periodo_fecha));
            setMetasMensuales(data);
        } catch (error) {
            console.error("Error al obtener las metas:", error);
        } finally {
            setLoading(false);
        }
    };

    function mostrarModalInsertarMeta(usuario_asignado_id, tipo_meta_id, asignacion_meta_id) {
        setState({
            ...state, modalInsertarMeta: true, isUpdated: false,
            usuario_asignado_id: usuario_asignado_id, tipo_meta_id: tipo_meta_id, asignacion_meta_id: asignacion_meta_id, periodo_fecha_meta: periodo_fecha
        })
    };

    useEffect(() => {
        if (state.isUpdated === true) {
            getMetasMensuales();
        }
    }, [state.isUpdated]);

    useEffect(() => {
        if (state.user?.usuario_id) {
            getMetasMensuales();
        }
    }, [state.user]);

    const perfilJefeSupremo = getPerfilJefeSupremo(periodo_fecha);

return (
    <>
        <div>
            <h1>ASIGNACIÓN DE METAS</h1>
        <div className="asignacion-metas">
            <h3>ASIGNACION MENSUAL</h3>
            <div>
                <label htmlFor="periodo_fecha">Periodo de fecha:</label>
                <input
                    id="periodo_fecha"
                    type="month"
                    value={periodo_fecha}
                    onChange={(e) => setPeriodoFecha(e.target.value)}
                />
            </div>
            <Button className="buscar" onClick={getMetasMensuales} disabled={loading}> Procesar </Button>
            {loading ? (
                <Loader />
            ) :(<AccordionList className="accordion-list">
                {Number(state.user?.perfil_id) === 3
                ? metasMensuales
                    .filter((usuario) => Number(usuario.perfil_id) === 3 && Number(usuario.usuario_id) === Number(state.user?.usuario_id))
                    .map((supervisor) => (
                        <Accordion key={supervisor.usuario_id}>
                        <AccordionHeader className="accordion-header">
                            <div className="w-full flex justify-between items-center">
                            <span>{supervisor.usuario.toUpperCase()}</span>
                            {supervisor.meta_mensual_equipo !== null && supervisor.meta_mensual_equipo !== undefined ? (
                                <span className="meta">{supervisor.meta_mensual_equipo}</span>
                            ) : (
                                <Button
                                className="button-assign"
                                onClick={() => {
                                    mostrarModalInsertarMeta(supervisor.usuario_id, 1, 2);
                                }}
                                disabled={true}
                                >
                                Asignar Meta de Equipo
                                </Button>
                            )}
                            </div>
                        </AccordionHeader>
                        <AccordionBody className="accordion-body">
                            {metasMensuales
                            .filter(
                                (gestor) =>
                                Number(gestor.usuario_id_jefe_inmediato) === Number(supervisor.usuario_id) &&
                                Number(gestor.perfil_id) === 4
                            )
                            .map((gestor) => (
                                <div key={gestor.usuario_id} className="item-row">
                                <p>{gestor.usuario.toUpperCase()}</p>
                                {gestor.meta_mensual_individual !== null && gestor.meta_mensual_individual !== undefined ? (
                                    <span className="meta">{gestor.meta_mensual_individual}</span>
                                ) : (
                                    <Button
                                    className="button-assign"
                                    onClick={() => {
                                        mostrarModalInsertarMeta(gestor.usuario_id, 1, 1);
                                    }}
                                    disabled={supervisor.meta_mensual_equipo === null}
                                    >
                                    Asignar Meta Individual
                                    </Button>
                                )}
                                </div>
                            ))}
                        </AccordionBody>
                        </Accordion>
                    ))
                :(metasMensuales
                .filter((usuario) => Number(usuario.perfil_id) === perfilJefeSupremo)
                .map((jefeSupremo) => (
                <Accordion key={jefeSupremo.usuario_id} className="accordion">
                    <AccordionHeader className="accordion-header">
                        <div className="w-full flex justify-between items-center">
                            <span>{jefeSupremo.usuario.toUpperCase()}</span>
                            {jefeSupremo.meta_mensual_equipo !== null && jefeSupremo.meta_mensual_equipo !== undefined ? (
                            <span className="meta">{jefeSupremo.meta_mensual_equipo}</span>
                            ) : (
                            <Button 
                                className="button-assign"  
                                onClick={() => {mostrarModalInsertarMeta(jefeSupremo.usuario_id, 1, 2); }}
                                disabled ={(Number(state.user?.perfil_id) === 2 || Number(state.user?.perfil_id) === 3 || Number(state.user?.perfil_id) === 4)}
                            >
                                Asignar Meta de Equipo
                            </Button>
                            )}
                        </div>
                    </AccordionHeader >
                    <AccordionBody className="accordion-body">
                    {metasMensuales
                        .filter(
                        (supervisor) =>
                            Number(supervisor.usuario_id_jefe_inmediato) === Number(jefeSupremo.usuario_id) &&
                            Number(supervisor.perfil_id) === 3
                        )
                        .map((supervisor) => (
                        <Accordion key={supervisor.usuario_id}>
                            <AccordionHeader className="accordion-header">
                                <div className="w-full flex justify-between items-center">
                                    <span>{supervisor.usuario.toUpperCase()}</span>
                                    {supervisor.meta_mensual_equipo !== null && supervisor.meta_mensual_equipo !== undefined ? (
                                    <span className="meta">{supervisor.meta_mensual_equipo}</span>
                                    ) : (
                                    <Button 
                                        className="button-assign"  
                                        onClick={() => {mostrarModalInsertarMeta(supervisor.usuario_id, 1, 2); }}
                                        disabled ={(Number(state.user?.perfil_id) === 3 || Number(state.user?.perfil_id) === 4 || jefeSupremo.meta_mensual_equipo === null || jefeSupremo.meta_mensual_equipo === undefined)}
                                    >
                                        Asignar Meta de Equipo
                                    </Button>
                                    )}
                                </div>
                            </AccordionHeader>
                            <AccordionBody className="accordion-body">
                            {metasMensuales
                                .filter(
                                    (gestor) =>
                                        Number(gestor.usuario_id_jefe_inmediato) === Number(supervisor.usuario_id) &&
                                        Number(gestor.perfil_id) === 4
                                )
                                .map((gestor) => (
                                    <div key={gestor.usuario_id} className="item-row">
                                        <p>{gestor.usuario.toUpperCase()}</p>
                                        {gestor.meta_mensual_individual !== null && supervisor.meta_mensual_individual !== undefined ? (
                                        <span className="meta">{gestor.meta_mensual_individual}</span>
                                        ) : (
                                        <Button 
                                            className="button-assign" 
                                            onClick={() => {mostrarModalInsertarMeta(gestor.usuario_id,1 , 1); }}
                                            disabled ={jefeSupremo.meta_mensual_equipo === null || supervisor.meta_mensual_equipo === null}  
                                        >
                                            Asignar Meta Individual
                                        </Button>
                                        )}
                                    </div>
                                ))}
                            </AccordionBody>
                        </Accordion>
                        ))}
                    </AccordionBody>
                </Accordion>
                )))}
            </AccordionList>)}
        </div>
        </div>
        <ModalInsertarMeta
                isOpen={state.modalInsertarMeta}
        />
    </>
    );
}

export default AsignacionMetas;