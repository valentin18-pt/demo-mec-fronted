import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { MapPin, RotateCcw, ArrowLeft } from 'lucide-react';
import { ButtonSearch } from '../Buttons/Buttons';
import TabsWithTable from '../Tabs/TabsWithTable';
import BarChartDetallesMapaDesembolsos from '../BarChart/BarChartDetallesMapaDesembolsos';
import Loader from '../Loader/Loader';
import './GraficoMapaDesembolsos.css';

const DEPARTMENTS_CONFIG = {
    'AMAZONAS': { center: [-78.1, -4.9], scale: 12000 },
    'ANCASH': { center: [-77.7, -9.4], scale: 12000 },
    'APURIMAC': { center: [-73.1, -14.1], scale: 13500 },
    'AREQUIPA': { center: [-72.9, -15.8], scale: 9000 },
    'AYACUCHO': { center: [-74.2, -14.1], scale: 7000 },
    'CAJAMARCA': { center: [-78.6, -6.5], scale: 12000 },
    'CALLAO': { center: [-77.1, -12.0], scale: 120000 },
    'CUSCO': { center: [-72.4, -13.5], scale: 10500 },
    'HUANCAVELICA': { center: [-75.0, -12.9], scale: 11000 },
    'HUANUCO': { center: [-76.2, -9.3], scale: 6500 },
    'ICA': { center: [-75.6, -14.2], scale: 12000 },
    'JUNIN': { center: [-75.0, -11.5], scale: 7000 },
    'LA LIBERTAD': { center: [-78.2, -7.9], scale: 10500 },
    'LAMBAYEQUE': { center: [-79.8, -6.5], scale: 16500 },
    'LIMA': { center: [-76.5, -11.6], scale: 12000 },
    'LORETO': { center: [-74.8, -4.5], scale: 6000 },
    'MADRE DE DIOS': { center: [-70.5, -11.7], scale: 9000 },
    'MOQUEGUA': { center: [-70.8, -16.8], scale: 12000 },
    'PASCO': { center: [-75.5, -10.5], scale: 8000 },
    'PIURA': { center: [-80.5, -5.3], scale: 12000 },
    'PUNO': { center: [-69.8, -15.2], scale: 9750 },
    'SAN MARTIN': { center: [-76.8, -7.4], scale: 9750 },
    'TACNA': { center: [-70.3, -17.7], scale: 15000 },
    'TUMBES': { center: [-80.5, -3.8], scale: 22500 },
    'UCAYALI': { center: [-73.5, -9.0], scale: 7500 }
};

const INITIAL_MAP_CONFIG = { scale: 1500, center: [-75, -9.5] };

const COLOR_PALETTE = [
    '#60A5FA', '#34D399', '#FCD34D', '#A78BFA', '#F87171',
    '#4ADE80', '#FB923C', '#C084FC', '#2DD4BF', '#F472B6',
    '#FBBF24', '#818CF8', '#E879F9', '#5EEAD4', '#BEF264',
    '#86EFAC', '#67E8F9', '#93C5FD', '#C4B5FD', '#FCA5A5',
];

const EmptyState = ({ icon: Icon, text }) => (
    <div className="empty-state-container">
        <Icon className="empty-state-icon" />
        <p className="empty-state-text">{text}</p>
    </div>
);

const formatoSoles = (monto) => {
    const valor = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(monto);
    return valor;
};

const normalizeGeoName = (name) => name ? name.normalize("NFD").replace(/[\u0300-\u030f]/g, "").toUpperCase().trim() : '';

const GraficoMapaDesembolsos = ({ initialData, geojson, onFetchData, activeDataType, isExpanded, onClose }) => {
    const [pendingYear, setPendingYear] = useState('all');
    const [pendingMonth, setPendingMonth] = useState('all');
    const [pendingRegion, setPendingRegion] = useState('all');
    const [pendingZone, setPendingZone] = useState('all');
    const [pendingContrato, setPendingContrato] = useState('all');
    const [pendingSummaryType, setPendingSummaryType] = useState(activeDataType || 'validated');
    
    const [activeYear, setActiveYear] = useState('all');
    const [activeMonth, setActiveMonth] = useState('all');
    const [activeRegion, setActiveRegion] = useState('all');
    const [activeZone, setActiveZone] = useState('all');
    const [activeContrato, setActiveContrato] = useState('all');
    const [activeSummaryType, setActiveSummaryType] = useState(activeDataType || 'validated');
    
    const [currentAllData, setCurrentAllData] = useState(initialData || []);
    const [filteredData, setFilteredData] = useState(initialData || []);
    const [currentMapConfig, setCurrentMapConfig] = useState(INITIAL_MAP_CONFIG);
    const [currentSelectedRegion, setCurrentSelectedRegion] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredRegion, setHoveredRegion] = useState(null);
    const [activeTab, setActiveTab] = useState('regiones');
    const isInitialLoad = useRef(true);

    const applyFiltersAndZoom = useCallback((data, year, month, region, zone, contrato) => {
        let filtered = data;
        if (year !== 'all') filtered = filtered.filter(item => item.year.toString() === year);
        if (month !== 'all') filtered = filtered.filter(item => item.month.toString() === month);
        if (contrato !== 'all') filtered = filtered.filter(item => item.contrato_id.toString() === contrato);

        if (region !== 'all') {
            filtered = filtered.filter(item => item.region === region);
            setCurrentMapConfig(DEPARTMENTS_CONFIG[normalizeGeoName(region)] || INITIAL_MAP_CONFIG);
        } else if (zone !== 'all') {
            filtered = filtered.filter(item => item.zona === zone);
            const regionsInZone = [...new Set(filtered.map(item => normalizeGeoName(item.region)))];
            if (regionsInZone.length === 1) {
                setCurrentMapConfig(DEPARTMENTS_CONFIG[regionsInZone[0]] || INITIAL_MAP_CONFIG);
            } else if (regionsInZone.length > 1) {
                const regionConfigs = regionsInZone.map(name => DEPARTMENTS_CONFIG[name]).filter(Boolean);
                if (regionConfigs.length > 0) {
                    const totalLon = regionConfigs.reduce((sum, config) => sum + config.center[0], 0);
                    const totalLat = regionConfigs.reduce((sum, config) => sum + config.center[1], 0);
                    const avgCenter = [totalLon / regionConfigs.length, totalLat / regionConfigs.length];
                    const minScale = Math.min(...regionConfigs.map(config => config.scale));
                    const newScale = minScale / (1 + (regionConfigs.length * 0.4));
                    setCurrentMapConfig({ center: avgCenter, scale: newScale });
                }
            }
        } else {
            setCurrentMapConfig(INITIAL_MAP_CONFIG);
        }
        setFilteredData(filtered);
        setCurrentSelectedRegion(region);
    }, []);

    useEffect(() => {
        if (initialData && isInitialLoad.current) {
            setCurrentAllData(initialData);
            applyFiltersAndZoom(initialData, 'all', 'all', 'all', 'all', 'all');
            isInitialLoad.current = false;
        }
    }, [initialData, applyFiltersAndZoom]);

    useEffect(() => {
        if (activeDataType) {
            setPendingSummaryType(activeDataType);
            setActiveSummaryType(activeDataType);
        }
    }, [activeDataType]);

    const availableYears = useMemo(() => Array.from(new Set(currentAllData.map(item => item.year.toString()))).filter(year => parseInt(year) >= 2023).sort((a, b) => a - b), [currentAllData]);
    const availableMonths = useMemo(() => {
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        return Array.from({ length: 12 }, (_, i) => ({ id: (i + 1).toString(), name: monthNames[i] }));
    }, []);
    const availableRegions = useMemo(() => Array.from(new Set(currentAllData.map(item => item.region))).sort(), [currentAllData]);
    const availableZones = useMemo(() => Array.from(new Set(currentAllData.map(item => item.zona))).sort(), [currentAllData]);
    const availableContratos = useMemo(() => Array.from(new Set(currentAllData.map(item => item.contrato_id).filter(id => id !== null && id !== undefined))).sort((a, b) => a - b), [currentAllData]);

    const handleLoadReport = async () => {
        setIsLoading(true);
        let dataParaFiltrar = currentAllData;
        
        if (pendingSummaryType !== activeSummaryType && onFetchData) {
            const newFetchedData = await onFetchData({ summary_type: pendingSummaryType });
            if (newFetchedData && newFetchedData.data) {
                dataParaFiltrar = newFetchedData.data;
                setCurrentAllData(newFetchedData.data);
                setActiveSummaryType(pendingSummaryType);
                setActiveTab('regiones');
            }
        }
        applyFiltersAndZoom(dataParaFiltrar, pendingYear, pendingMonth, pendingRegion, pendingZone, pendingContrato);
        
        setActiveYear(pendingYear);
        setActiveMonth(pendingMonth);
        setActiveRegion(pendingRegion);
        setActiveZone(pendingZone);
        setActiveContrato(pendingContrato);
        
        setIsLoading(false);
    };

    const handleRegionClick = useCallback((geoRegionName) => {
        const exactRegion = availableRegions.find(region => 
            normalizeGeoName(region) === normalizeGeoName(geoRegionName)
        );
        
        if (exactRegion) {
            setPendingRegion(exactRegion);
            setPendingZone('all');
            applyFiltersAndZoom(currentAllData, activeYear, activeMonth, exactRegion, 'all', activeContrato);
            setActiveRegion(exactRegion);
            setActiveZone('all');
        }
    }, [currentAllData, activeYear, activeMonth, activeContrato, applyFiltersAndZoom, availableRegions]);

    const handleResetMap = useCallback(() => {
        setPendingRegion('all');
        setPendingZone('all');
        applyFiltersAndZoom(currentAllData, activeYear, activeMonth, 'all', 'all', activeContrato);
        setActiveRegion('all');
        setActiveZone('all');
    }, [currentAllData, activeYear, activeMonth, activeContrato, applyFiltersAndZoom]);

    const regionDynamicColors = useMemo(() => {
        const colors = new Map();
        const uniqueRegions = Array.from(new Set(currentAllData.map(item => normalizeGeoName(item.region)))).sort();
        uniqueRegions.forEach((region, index) => {
            colors.set(region, COLOR_PALETTE[index % COLOR_PALETTE.length]);
        });
        return colors;
    }, [currentAllData]);

    const summary = useMemo(() => ({
        total_registros: filteredData.length,
        total_monto_general: filteredData.reduce((sum, item) => sum + item.monto_neto, 0)
    }), [filteredData]);

    // Top 10 por Regiones
    const top10Regiones = useMemo(() => {
        const aggregatedData = filteredData.reduce((acc, item) => {
            const region = item.region;
            if (!acc[region]) acc[region] = { monto_neto: 0, cantidad: 0 };
            acc[region].monto_neto += item.monto_neto;
            acc[region].cantidad += 1;
            return acc;
        }, {});
        
        return Object.entries(aggregatedData)
            .map(([region, data]) => ({ 
                region, 
                "Monto Desembolsado": data.monto_neto,
                "Cantidad de Desembolsos": data.cantidad
            }))
            .sort((a, b) => b["Monto Desembolsado"] - a["Monto Desembolsado"])
            .slice(0, 10);
    }, [filteredData]);

    // Top 10 por Agencias
    const top10Agencias = useMemo(() => {
        const aggregatedData = filteredData.reduce((acc, item) => {
            const agencia = item.nombre_agencia || 'SIN AGENCIA';
            if (!acc[agencia]) acc[agencia] = { monto_neto: 0, cantidad: 0 };
            acc[agencia].monto_neto += item.monto_neto;
            acc[agencia].cantidad += 1;
            return acc;
        }, {});
        
    return Object.entries(aggregatedData)
        .map(([agencia, data]) => ({ 
            agencia, 
            "Monto Desembolsado": data.monto_neto,
            "Cantidad de Desembolsos": data.cantidad
        }))
        .sort((a, b) => b["Monto Desembolsado"] - a["Monto Desembolsado"])
        .slice(0, 10);
}, [filteredData]);

    // Top 10 por Convenios
    const top10Convenios = useMemo(() => {
        const aggregatedData = filteredData.reduce((acc, item) => {
            const convenio = item.razon_social || 'SIN CONVENIO';
            if (!acc[convenio]) acc[convenio] = { monto_neto: 0, cantidad: 0 };
            acc[convenio].monto_neto += item.monto_neto;
            acc[convenio].cantidad += 1;
            return acc;
        }, {});
        
        return Object.entries(aggregatedData)
            .map(([convenio, data]) => ({ 
                convenio, 
                "Monto Desembolsado": data.monto_neto,
                "Cantidad de Desembolsos": data.cantidad
            }))
            .sort((a, b) => b["Monto Desembolsado"] - a["Monto Desembolsado"])
            .slice(0, 10);
    }, [filteredData]);

    const hasFiltersApplied = currentSelectedRegion !== 'all';
    const regionMapData = useMemo(() => filteredData.reduce((acc, item) => {
        const normRegion = normalizeGeoName(item.region);
        acc.set(normRegion, (acc.get(normRegion) || 0) + item.monto_neto);
        return acc;
    }, new Map()), [filteredData]);

    // Función para obtener el título según la pestaña activa
    const getChartTitle = () => {
        if (activeTab === 'regiones') {
            return hasFiltersApplied 
                ? `Desembolsos por Regiones - ${currentSelectedRegion}` 
                : "Desembolsos por Regiones";
        } else if (activeTab === 'agencias') {
            return hasFiltersApplied 
                ? `Desembolsos por Agencias - ${currentSelectedRegion}` 
                : "Desembolsos por Agencias";
        } else if (activeTab === 'convenios') {
            return hasFiltersApplied 
                ? `Desembolsos por Convenios - ${currentSelectedRegion}` 
                : "Desembolsos por Convenios";
        }
        return "Desembolsos";
    };

    // Función para obtener los datos del gráfico según la pestaña activa
    const getChartData = () => {
        if (activeTab === 'regiones') {
            return top10Regiones.map(item => ({
                name: item.region,
                "Monto Desembolsado": item["Monto Desembolsado"],
                "Cantidad de Desembolsos": item["Cantidad de Desembolsos"]
            }));
        } else if (activeTab === 'agencias') {
            return top10Agencias.map(item => ({
                name: item.agencia,
                "Monto Desembolsado": item["Monto Desembolsado"],
                "Cantidad de Desembolsos": item["Cantidad de Desembolsos"]
            }));
        } else if (activeTab === 'convenios') {
            return top10Convenios.map(item => ({
                name: item.convenio,
                "Monto Desembolsado": item["Monto Desembolsado"],
                "Cantidad de Desembolsos": item["Cantidad de Desembolsos"]
            }));
        }
        return [];
    };

    const chartData = getChartData();
    const isRegionView = currentSelectedRegion !== 'all';
    const hasChanges = pendingYear !== activeYear || pendingMonth !== activeMonth || pendingRegion !== activeRegion || pendingZone !== activeZone || pendingContrato !== activeContrato || pendingSummaryType !== activeSummaryType;

    const renderContent = () => (
        <div className="table-container">
            <table className="mapa-desembolsos-table">
                <thead>
                    <tr>
                        <th style={{ width: '60%' }}>DETALLES</th>
                        <th style={{ width: '40%' }}>GRÁFICO</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ height: '530px' }}>
                        <td style={{ width: '60%', verticalAlign: 'top' }}>
                            <div>
                                {chartData.length > 0 ? (
                                    <BarChartDetallesMapaDesembolsos 
                                        data={chartData}
                                        title={getChartTitle()}
                                        summary={{
                                            total_registros: summary.total_registros,
                                            total_monto_general: summary.total_monto_general
                                        }}
                                    />
                                ) : (
                                    <EmptyState icon={MapPin} text="No hay datos" />
                                )}
                            </div>
                        </td>
                        <td style={{ width: '40%', verticalAlign: 'top', position: 'relative' }}>
                            {isRegionView && (
                                <button 
                                    onClick={handleResetMap} 
                                    className="btn-reset"
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        zIndex: 10,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    <RotateCcw size={16} />
                                    Ver todo
                                </button>
                            )}
                            <div style={{ 
                                width: '100%', 
                                height: '530px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                <ComposableMap 
                                    projection="geoMercator" 
                                    projectionConfig={currentMapConfig} 
                                    width={400}
                                    height={530}
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    <Geographies geography={geojson}>
                                        {({ geographies }) => geographies.map(geo => {
                                            const normalizedRegionName = normalizeGeoName(geo.properties.NOMBDEP);
                                            const isSelectedRegion = normalizedRegionName === normalizeGeoName(currentSelectedRegion);
                                            const hasData = regionMapData.has(normalizedRegionName);
                                            const fillColor = hasData ? (regionDynamicColors.get(normalizedRegionName) || '#E5E7EB') : '#E5E7EB';

                                            return (
                                                <Geography
                                                    key={geo.rsmKey}
                                                    geography={geo}
                                                    fill={fillColor}
                                                    stroke={isSelectedRegion ? '#312e81' : "#FFF"}
                                                    strokeWidth={isSelectedRegion ? 2.5 : 0.5}
                                                    style={{
                                                        default: { outline: "none", cursor: hasData ? 'pointer' : 'default' },
                                                        hover: hasData ? { fill: fillColor, filter: "brightness(0.9)", outline: "none", cursor: 'pointer' } : { outline: "none" },
                                                        pressed: { outline: "none" }
                                                    }}
                                                    onClick={hasData ? () => handleRegionClick(geo.properties.NOMBDEP) : undefined}
                                                    onMouseEnter={hasData ? () => setHoveredRegion(normalizedRegionName) : undefined}
                                                    onMouseLeave={hasData ? () => setHoveredRegion(null) : undefined}
                                                />
                                            );
                                        })}
                                    </Geographies>
                                </ComposableMap>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

    const tabs = [
        { key: 'regiones', label: 'Regiones', content: renderContent() },
        { key: 'agencias', label: 'Agencias', content: renderContent() },
        { key: 'convenios', label: 'Convenios', content: renderContent() }
    ];

    if (!currentAllData || !geojson) return <EmptyState icon={MapPin} text="No se recibieron los datos para el mapa." />;
    if (isLoading) return <Loader />;

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h1>MAPA DE DESEMBOLSOS</h1>
                {isExpanded && onClose && (
                    <button 
                        onClick={onClose}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 20px',
                            backgroundColor: '#043d85',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#043d85'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0549a7'}
                    >
                        <ArrowLeft size={18} />
                        Volver
                    </button>
                )}
            </div>

            <div className="filtros">
                <div>
                    <label htmlFor="year">Año:</label>
                    <select id="year" value={pendingYear} onChange={(e) => setPendingYear(e.target.value)}>
                        <option value="all">Todos</option>
                        {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="month">Mes:</label>
                    <select id="month" value={pendingMonth} onChange={(e) => setPendingMonth(e.target.value)}>
                        <option value="all">Todos</option>
                        {availableMonths.map(month => <option key={month.id} value={month.id}>{month.name}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="contrato">Contrato:</label>
                    <select id="contrato" value={pendingContrato} onChange={(e) => setPendingContrato(e.target.value)}>
                        <option value="all">Todos</option>
                        {availableContratos.map(id => <option key={id} value={id.toString()}>Contrato {id}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="region">Región:</label>
                    <select id="region" value={pendingRegion} onChange={(e) => { setPendingRegion(e.target.value); setPendingZone('all'); }}>
                        <option value="all">Todos</option>
                        {availableRegions.map(region => <option key={region} value={region}>{region}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="zone">Zona:</label>
                    <select id="zone" value={pendingZone} onChange={(e) => { setPendingZone(e.target.value); setPendingRegion('all'); }}>
                        <option value="all">Todos</option>
                        {availableZones.map(zona => <option key={zona} value={zona}>{zona}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="summaryType">Tipo de Dato:</label>
                    <select id="summaryType" value={pendingSummaryType} onChange={(e) => setPendingSummaryType(e.target.value)}>
                        <option value="validated">Validado</option>
                        <option value="registered">Registrado</option>
                    </select>
                </div>
            </div>

            <ButtonSearch 
                onClick={handleLoadReport}
                isLoading={isLoading} 
            />

            <TabsWithTable 
                tabs={tabs} 
                defaultTab="regiones" 
                onTabChange={(tabKey) => setActiveTab(tabKey)}
            />
        </>
    );
};

export default GraficoMapaDesembolsos;