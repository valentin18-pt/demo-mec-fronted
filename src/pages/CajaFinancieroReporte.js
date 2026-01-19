import React, { useState, useContext, useEffect, useRef } from 'react';
import { Table } from "reactstrap";
import { AppContext } from '../application/provider';
import CajaFinancieroReporteService from "../axios_services/cajafinancieroreporte.service";
import ButtonSearch from '../components/Buttons/ButtonSearch';
import Loader from "../components/Loader/Loader";
import './CajaFinancieroReporte.css';

function CajaFinancieroReporte() {
    const [state] = useContext(AppContext);
    const [reporteData, setReporteData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const initialFetchDone = useRef(false);
    
    const [periodo_fecha, setPeriodoFecha] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    
    const [periodo_consultado, setPeriodoConsultado] = useState(() => {
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

    const formatoPorcentaje = (porcentaje) => {
        return `${parseFloat(porcentaje).toFixed(2)}%`;
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
            const response = await CajaFinancieroReporteService.getCajaFinancieroReporte(
                perfil_id,
                usuario_id,
                periodo_fecha
            );
            
            setReporteData(response.data || null);
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            if (error.response?.status === 403) {
                alert(error.response?.data?.message || 'No tiene permisos para acceder a esta información');
            }
            setReporteData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchReporte = async () => {
        setIsLoading(true);
        try {
            const response = await CajaFinancieroReporteService.getCajaFinancieroReporte(
                state.user?.perfil_id,
                state.user?.usuario_id,
                periodo_fecha
            );
            
            setReporteData(response.data || null);
            setPeriodoConsultado(periodo_fecha);
        } catch (error) {
            console.error('Error al obtener reporte:', error);
            if (error.response?.status === 403) {
                alert(error.response?.data?.message || 'No tiene permisos para acceder a esta información');
            }
            setReporteData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCalcularClick = async () => {
        await fetchReporte();
    };

    const hayDatosDisponibles = () => {
        if (!reporteData) return false;
        
        const tieneIngresos = reporteData.detalle?.ingresos?.categorias?.length > 0;
        const tieneEgresos = reporteData.detalle?.egresos?.categorias?.length > 0;
        
        return tieneIngresos || tieneEgresos;
    };

    const renderSeccionReporte = (titulo, datos, tipoClase) => {
        if (!datos || !datos.categorias || datos.categorias.length === 0) {
            return null;
        }

        return (
            <>
                <tr className={`tipo-row ${tipoClase}`}>
                    <td><strong>{titulo}</strong></td>
                    <td><strong>{formatoSoles(datos.total)}</strong></td>
                    <td><strong>{formatoPorcentaje(datos.participacion_total)}</strong></td>
                </tr>
                {datos.categorias.map((categoria, catIndex) => (
                    <React.Fragment key={`cat-${categoria.caja_categoria_id}-${catIndex}`}>
                        <tr className={`categoria-row ${tipoClase}`}>
                            <td><strong>{categoria.nombre_categoria}</strong></td>
                            <td><strong>{formatoSoles(categoria.total_categoria)}</strong></td>
                            <td><strong>{formatoPorcentaje(categoria.participacion_categoria)}</strong></td>
                        </tr>
                        {categoria.conceptos && categoria.conceptos.map((concepto, conIndex) => (
                            <tr key={`con-${concepto.caja_concepto_id}-${conIndex}`} className={`concepto-row ${tipoClase}`}>
                                <td className="pl-4">{concepto.nombre_concepto}</td>
                                <td>{formatoSoles(concepto.monto)}</td>
                                <td>{formatoPorcentaje(concepto.participacion)}</td>
                            </tr>
                        ))}
                    </React.Fragment>
                ))}
            </>
        );
    };

    const renderSeccionUtilidades = () => {
        if (!reporteData?.resumen) return null;

        const { resumen } = reporteData;
        const utilidadesFinalesClase = resumen.total_utilidades_con_impuesto >= 0 ? 'positivo' : 'negativo';

        return (
            <>
                <tr className="utilidades-row utilidades-antes-impuestos">
                    <td><strong>UTILIDADES ANTES DE IMPUESTOS</strong></td>
                    <td><strong>{formatoSoles(resumen.total_utilidades)}</strong></td>
                    <td><strong>{formatoPorcentaje(resumen.participacion_utilidades)}</strong></td>
                </tr>

                {resumen.impuestos ? (
                    <>
                        <tr className="impuestos-header-row categoria-row egreso">
                            <td><strong>PAGO DE IMPUESTOS OBLIGADOS</strong></td>
                            <td><strong>{formatoSoles(resumen.impuestos.pago_impuestos_obligados)}</strong></td>
                            <td><strong>{formatoPorcentaje(resumen.impuestos.participacion_pago_impuestos_obligados)}</strong></td>
                        </tr>
                        <tr className="impuestos-detalle-row">
                            <td className="pl-4">PAGO DE IGV</td>
                            <td>{formatoSoles(resumen.impuestos.pago_igv)}</td>
                            <td>{formatoPorcentaje(resumen.impuestos.participacion_pago_igv)}</td>
                        </tr>
                        <tr className="impuestos-detalle-row">
                            <td className="pl-4">PAGO DE IMPUESTO A LA RENTA</td>
                            <td>{formatoSoles(resumen.impuestos.pago_impuestos_renta)}</td>
                            <td>{formatoPorcentaje(resumen.impuestos.participacion_pago_impuestos_renta)}</td>
                        </tr>
                        <tr className={`utilidades-final-row ${utilidadesFinalesClase}`}>
                            <td><strong>UTILIDADES DESPUÉS DE IMPUESTOS</strong></td>
                            <td><strong>{formatoSoles(resumen.total_utilidades_con_impuesto)}</strong></td>
                            <td><strong>{formatoPorcentaje(resumen.participacion_total_utilidades_con_impuesto)}</strong></td>
                        </tr>
                    </>
                ) : (
                    <tr className="sin-impuestos-row">
                        <td colSpan="3" className="text-center text-warning py-2">
                            <em>No se puede calcular impuestos: debe existir una categoría 'GESTIÓN OPERATIVA'</em>
                        </td>
                    </tr>
                )}
            </>
        );
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="caja-flujo-container">
            <div className="flex items-center justify-between mb-4">
                <h1>FLUJO DE CAJA - RESUMEN</h1>
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

            <ButtonSearch
                onClick={handleCalcularClick}
                isLoading={isLoading}
            />

            <div className="reporte-container mt-4">
                <div className="table-container">
                    <Table bordered className="reporte-table">
                        <thead>
                            <tr>
                                <th>DETALLE SEGÚN RUBRO</th>
                                <th>MONTO</th>
                                <th>PARTICIPACIÓN %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hayDatosDisponibles() ? (
                                <>
                                    {renderSeccionReporte('INGRESO', reporteData.detalle?.ingresos, 'ingreso')}
                                    {renderSeccionReporte('EGRESO', reporteData.detalle?.egresos, 'egreso')}
                                    {renderSeccionUtilidades()}
                                </>
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center text-gray-500 py-4">
                                        No hay datos disponibles para este período.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

export default CajaFinancieroReporte;