import React, { useState, useEffect, useRef, useMemo } from 'react';
import services from '../axios_services/graficosColocaciones';
import './GraficoColocaciones.css';
import Loader from '../components/Loader/Loader';

const formatCurrency = (value) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

const getFullMonthName = (shortName) => {
    const monthMap = {
        'Ene': 'Enero', 'Feb': 'Febrero', 'Mar': 'Marzo', 'Abr': 'Abril',
        'May': 'Mayo', 'Jun': 'Junio', 'Jul': 'Julio', 'Ago': 'Agosto',
        'Sep': 'Septiembre', 'Oct': 'Octubre', 'Nov': 'Noviembre', 'Dic': 'Diciembre',
    };
    return monthMap[shortName] || shortName;
};

const useTooltip = () => {
    const [hoveredItem, setHoveredItem] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const tooltipHandlers = (item) => ({
        onMouseMove: (e) => {
            setHoveredItem(item);
            setMousePosition({ x: e.clientX, y: e.clientY });
        },
        onMouseLeave: () => {
            setHoveredItem(null);
        },
    });

    return { hoveredItem, mousePosition, tooltipHandlers };
};

const COLORES_MESES = ['#FE9A9A', '#FECC9A', '#DBFE9A', '#9ADCFE', '#A49AFE', '#EA9AFE'];

const GraficoMeta = ({ data }) => {
    const { hoveredItem, mousePosition, tooltipHandlers } = useTooltip();

    return (
        <div className="grafico-container">
            <h3 className="grafico-titulo">META</h3>
            <div className="barras-container">
                {data.map((meta, index) => (
                    <div
                        key={`meta-${meta.mes}`}
                        className="barra-item"
                        style={{ backgroundColor: COLORES_MESES[index % COLORES_MESES.length] }}
                        {...tooltipHandlers(meta)}
                    >
                        <div className="barra-texto">{getFullMonthName(meta.mes)}</div>
                    </div>
                ))}
            </div>
            <div className="barra-actual-info">
                {data.map((meta, index) => (
                    <div
                        key={`meta-texto-${meta.mes}`}
                        className="barra-actual-texto"
                        style={{
                            left: `${(index + 0.5) * (100 / data.length)}%`
                        }}
                    >
                        {formatCurrency(meta.monto)}
                    </div>
                ))}
            </div>
            {hoveredItem && (
                <div className="tooltip" style={{ left: mousePosition.x + 10, top: mousePosition.y - 10 }}>
                    <div>{getFullMonthName(hoveredItem.mes)}</div>
                    <div>{formatCurrency(hoveredItem.monto)}</div>
                </div>
            )}
        </div>
    );
};

const GraficoAlcanceMensual = ({ metasData, avancesData }) => {
    const { hoveredItem, mousePosition, tooltipHandlers } = useTooltip();

    const dataCombinada = useMemo(() => {
        return metasData.map((meta, index) => {
            const avance = avancesData.find(a => a.mes === meta.mes);
            const porcentajeAvance = meta.monto > 0 ? (avance?.monto || 0) / meta.monto : 0;
            return {
                mes: meta.mes,
                meta: meta.monto,
                avance: avance?.monto || 0,
                porcentajeAvance: Math.min(porcentajeAvance, 1),
                porcentajeTexto: (porcentajeAvance * 100).toFixed(2),
                color: COLORES_MESES[index % COLORES_MESES.length]
            };
        });
    }, [metasData, avancesData]);

    return (
        <div className="grafico-container">
            <h3 className="grafico-titulo">ALCANCE MENSUAL</h3>
            <div className="barras-container">
                {dataCombinada.map((item) => (
                    <div
                        key={`alcance-${item.mes}`}
                        className="barra-item barra-alcance"
                        {...tooltipHandlers(item)}
                    >
                        <div className="barra-progreso" style={{ width: `${item.porcentajeAvance * 100}%`, backgroundColor: item.color }}></div>
                        <div className="barra-texto">{getFullMonthName(item.mes)}</div>
                    </div>
                ))}
            </div>
            <div className="barra-actual-info">
                {dataCombinada.map((item, index) => (
                    <div
                        key={`avance-texto-${item.mes}`}
                        className="barra-actual-texto"
                        style={{
                            left: `${(index + 0.5) * (100 / dataCombinada.length)}%`
                        }}
                    >
                        {formatCurrency(item.avance)}
                    </div>
                ))}
            </div>
            {hoveredItem && (
                <div className="tooltip" style={{ left: mousePosition.x + 10, top: mousePosition.y - 10 }}>
                    <div>{getFullMonthName(hoveredItem.mes)}</div>
                    <div>Avance: {formatCurrency(hoveredItem.avance)}</div>
                    <div>Meta: {formatCurrency(hoveredItem.meta)}</div>
                    <div>Porcentaje: {hoveredItem.porcentajeTexto}%</div>
                </div>
            )}
        </div>
    );
};

const GraficoAlcanceGeneral = ({ title, totalMeta, detalles, tipo, totalAvance = 0 }) => {
    const { hoveredItem, mousePosition, tooltipHandlers } = useTooltip();
    const colores = {
        zonal: ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
        supervisor: ['#eab308', '#f97316', '#a855f7', '#10b981', '#06b6d4']
    };

    if (tipo === 'actual') {
        const porcentajeTotal = totalMeta > 0 ? (totalAvance / totalMeta) : 0;
        const porcentajeAvance = Math.min(porcentajeTotal * 100, 100);

        return (
            <div className="grafico-container">
                <h3 className="grafico-titulo">{title}</h3>
                <div className="barra-actual-container">
                    <div className="barra-actual"
                        {...tooltipHandlers({
                            avance: totalAvance,
                            meta: totalMeta,
                            porcentaje: (porcentajeTotal * 100).toFixed(2)
                        })}
                    >
                        <div className="barra-actual-progreso" style={{ width: `${porcentajeAvance}%` }}></div>
                        <div className="barra-actual-meta">{formatCurrency(totalMeta)}</div>
                    </div>
                    <div className="barra-actual-info">
                        <div
                            className="barra-actual-texto"
                            style={{
                                left: totalAvance > totalMeta ? '100%' : `${porcentajeAvance}%`
                            }}
                        >
                            {formatCurrency(totalAvance)}
                        </div>
                    </div>
                </div>
                {hoveredItem && (
                    <div className="tooltip" style={{ left: mousePosition.x + 10, top: mousePosition.y - 10 }}>
                        <div>Avance: {formatCurrency(hoveredItem.avance)}</div>
                        <div>Meta: {formatCurrency(hoveredItem.meta)}</div>
                        <div>Porcentaje: {hoveredItem.porcentaje}%</div>
                    </div>
                )}
            </div>
        );
    }

    const totalAvanceDetalles = detalles.reduce((sum, item) => sum + item.total, 0);
    const porcentajeAvance = Math.min(totalMeta > 0 ? (totalAvanceDetalles / totalMeta) * 100 : 0, 100);
    const coloresActuales = colores[tipo];

    return (
        <div className="grafico-container">
            <h3 className="grafico-titulo">{title}</h3>
            <div className="barra-actual-container">
                <div className="barra-actual">
                    <div className="barra-actual-progreso" style={{ width: `${porcentajeAvance}%` }}>
                        {detalles.map((item, index) => {
                            const porcentajeDelTotal = totalAvanceDetalles > 0 ? (item.total / totalAvanceDetalles) * 100 : 0;
                            return (
                                <div
                                    key={item[`${tipo}_id`]}
                                    className="segmento"
                                    style={{
                                        width: `${porcentajeDelTotal}%`,
                                        backgroundColor: coloresActuales[index % coloresActuales.length]
                                    }}
                                    {...tooltipHandlers({
                                        ...item,
                                        porcentaje: totalMeta > 0 ? ((item.total / totalMeta) * 100).toFixed(2) : '0.00'
                                    })}
                                />
                            );
                        })}
                    </div>
                    <div className="barra-actual-meta">{formatCurrency(totalMeta)}</div>
                </div>
                <div className="barra-actual-info">
                    <div
                        className="barra-actual-texto"
                        style={{
                            left: totalAvanceDetalles > totalMeta ? '100%' : `${porcentajeAvance}%`
                        }}
                    >
                        {formatCurrency(totalAvanceDetalles)}
                    </div>
                </div>
            </div>
            {hoveredItem && (
                <div className="tooltip" style={{ left: mousePosition.x + 10, top: mousePosition.y - 10 }}>
                    <div>{hoveredItem.nombre}</div>
                    <div>Avance: {formatCurrency(hoveredItem.total)}</div>
                    <div>Meta Total: {formatCurrency(totalMeta)}</div>
                    <div>Porcentaje: {hoveredItem.porcentaje}%</div>
                </div>
            )}
        </div>
    );
};

const GraficosColocaciones = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await services.getDatosColocaciones();
                if (response.success) {
                    setData(response.data);
                } else {
                    setError(response.message || 'Error al cargar datos de colocaciones');
                }
            } catch (err) {
                console.error('Error al obtener datos:', err);
                setError('Error al cargar datos de colocaciones');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return <div className="error-container"><p>{error}</p></div>;
    }

    if (!data) {
        return <div className="error-container"><p>No hay datos disponibles</p></div>;
    }

    const metaTotal = data.alcance_actual?.meta_total || 0;
    const avanceTotal = data.alcance_actual?.total || 0;

    return (
        <div className="graficos-colocaciones">
            <h1 className="titulo-principal">AVANCE DE COLOCACIONES DE ESTE SEMESTRE</h1>
            <GraficoMeta data={data.metas || []} />
            <GraficoAlcanceMensual
                metasData={data.metas || []}
                avancesData={data.avances_mensuales || []}
            />
            <GraficoAlcanceGeneral
                title="Alcance Actual"
                totalMeta={metaTotal}
                totalAvance={avanceTotal}
                tipo="actual"
            />
            <GraficoAlcanceGeneral
                title="Alcance Zonal"
                totalMeta={metaTotal}
                detalles={data.alcance_zonal || []}
                tipo="zonal"
            />
            <GraficoAlcanceGeneral
                title="Alcance Supervisor"
                totalMeta={metaTotal}
                detalles={data.alcance_supervisor || []}
                tipo="supervisor"
            />
        </div>
    );
};

export default GraficosColocaciones;