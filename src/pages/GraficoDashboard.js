import React, { useState, useEffect, useRef, useMemo, useCallback, useContext} from 'react';
import { Maximize } from 'lucide-react';
import { AppContext } from '../application/provider';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { Text, Metric, DonutChart, BarChart } from '@tremor/react';
import GraficoAvance from '../components/GraficoDashboard/GraficoAvance';
import GraficoDesembolsos from '../components/GraficoDashboard/GraficoDesembolsos';
import GraficoMapaDesembolsos from '../components/GraficoDashboard/GraficoMapaDesembolsos';
import services from '../axios_services/graficosDashboard';
import { getPeruGeoJson } from '../axios_services/geoJson';
import Loader from '../components/Loader/Loader';
import './GraficoDashboard.css';

const formatCurrency = (value) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

const normalizeGeoName = (name) => {
    if (!name) return '';
    return name.normalize("NFD").replace(/[\u0300-\u030f]/g, "").toUpperCase().trim();
};

const CustomTooltip = ({ payload, active, valueFormatter }) => {
    if (!active || !payload || payload.length === 0) return null;
    const category = payload[0];
    const data = category.payload;
    const name = data.name || data.Mes;
    const value = category.value;

    return (
        <div className="tooltip-custom">
            <p className="tooltip-title">{name}</p>
            <p className="tooltip-value">
                {valueFormatter ? valueFormatter(value) : value.toString()}
            </p>
        </div>
    );
};

const AvanceSemestralTooltip = ({ payload, active }) => {
    if (!active || !payload || payload.length === 0) return null;
    
    const data = payload[0].payload;
    const { name, value, type, monthly_goal } = data;

    if (type === 'advance') {
        return (
            <div className="tooltip-custom">
                <p className="tooltip-title">{name}</p>
                <p><strong>Avance:</strong> {formatCurrency(value)}</p>
                <p><strong>Meta del Mes:</strong> {formatCurrency(monthly_goal)}</p>
            </div>
        );
    }

    return (
        <div className="tooltip-custom">
            <p className="tooltip-title">{name}</p>
            <p className="tooltip-value">{formatCurrency(value)}</p>
        </div>
    );
};

const ChartPreviewCard = ({ title, children, onExpand, chartName }) => (
    <div className="chart-preview-card">
        <div className="chart-preview-header">
            <h3 className="chart-preview-title">{title}</h3>
            <button onClick={() => onExpand(chartName)} className="chart-preview-expand-button" title="EXPANDIR">
                <Maximize className="chart-preview-icon" />
            </button>
        </div>
        <div className="chart-preview-content">
            {children}
        </div>
    </div>
);

const ErrorMessage = ({ message }) => (
    <div className="error-message">
        <p>{message}</p>
    </div>
);

const GraficoDashboard = () => {
    const [state] = useContext(AppContext);
    const [expandedChart, setExpandedChart] = useState(null);
    const hasFetched = useRef(false);

    const [avanceSemestralData, setAvanceSemestralData] = useState(null);
    const [desembolsoDetalleData, setDesembolsoDetalleData] = useState(null);
    const [mapaSummaryData, setMapaSummaryData] = useState(null);
    const [geojson, setGeojson] = useState(null);
    
    const [avanceError, setAvanceError] = useState(null);
    const [desembolsoError, setDesembolsoError] = useState(null);
    const [mapaError, setMapaError] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [mapaDataType, setMapaDataType] = useState('validated');
    const [desembolsoDataType, setDesembolsoDataType] = useState('validated');
    
    const fetchMapData = useCallback(async (filters) => {
        setMapaError(null);
        try {
            const mapaResult = await services.getMapaDesembolsos(filters);
            if (mapaResult.success) {
                setMapaSummaryData(mapaResult.data);
                if (filters.summary_type) setMapaDataType(filters.summary_type);
                return { data: mapaResult.data, success: true };
            } else {
                setMapaError('Error al cargar datos del mapa.');
                return { data: null, success: false };
            }
        } catch (err) {
            console.error('Error en fetchMapData:', err);
            setMapaError('Error inesperado en el mapa.');
            return { data: null, success: false };
        }
    }, []);

    const fetchDesembolsoDetalleData = useCallback(async (filters) => {
        setDesembolsoError(null);
        try {
            const desembolsoResult = await services.getDetalleDesembolsos(filters);
            if (desembolsoResult.success) {
                const processedData = desembolsoResult.data.map(item => ({
                    ...item,
                    year: parseInt(item.fecha_desembolso.split('-')[0]),
                    month: parseInt(item.fecha_desembolso.split('-')[1]),
                    day: parseInt(item.fecha_desembolso.split('-')[2])
                }));
                setDesembolsoDetalleData(processedData);
                if (filters.summary_type) setDesembolsoDataType(filters.summary_type);
                return { data: processedData, success: true };
            } else {
                setDesembolsoError('Error al cargar datos de desembolsos.');
                return { data: null, success: false };
            }
        } catch (err) {
            console.error('Error en fetchDesembolsoDetalleData:', err);
            setDesembolsoError('Error inesperado en desembolsos.');
            return { data: null, success: false };
        }
    }, []);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchData = async () => {
            setIsLoading(true);

            try {
                const geoResult = await getPeruGeoJson();
                setGeojson(geoResult);
            } catch (err) {
                console.error('Error loading geojson:', err);
                setMapaError('No se pudo cargar el geodato.');
            }

            try {
                const avanceResult = await services.getAvancesSemestrales();
                if (avanceResult.success) {
                    setAvanceSemestralData(avanceResult.data);
                } else {
                    setAvanceError('Error al cargar Avance de Metas.');
                }
            } catch (err) {
                console.error('Error loading avances:', err);
                setAvanceError('Error inesperado en Avance de Metas.');
            }
            
            await fetchMapData({ summary_type: 'validated' });
            await fetchDesembolsoDetalleData({ summary_type: 'validated' });

            setIsLoading(false);
        };

        fetchData();
    }, [fetchMapData, fetchDesembolsoDetalleData]);

    const avanceSemestralPreview = useMemo(() => {
        if (!avanceSemestralData) return null;
    
        const { semestral_goal, monthly_details } = avanceSemestralData;
        const chartData = [];
        const colors = [];
        
        const ADVANCE_COLORS = ['green', 'blue', 'cyan', 'indigo', 'fuchsia', 'amber'];
        const GOAL_COLOR = 'red';
        const REMAINING_COLOR = 'slate';
    
        let totalAdvance = 0;
        let colorIndex = 0;

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;

        const monthNameToNumber = {
            'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4, 'Mayo': 5, 'Junio': 6,
            'Julio': 7, 'Agosto': 8, 'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
        };
    
        const activeMonths = monthly_details.filter(m => m.monthly_goal > 0);
    
        activeMonths.forEach(month => {
            if (month.advance_amount > 0) {
                chartData.push({
                    name: month.month_name,
                    value: month.advance_amount,
                    type: 'advance',
                    monthly_goal: month.monthly_goal
                });
                colors.push(ADVANCE_COLORS[colorIndex % ADVANCE_COLORS.length]);
                colorIndex++;
            }
            totalAdvance += month.advance_amount;
        });
    
        let totalActiveMonthlyGoalsUntilCurrent = 0;
        activeMonths.forEach(month => {
            const monthNumber = monthNameToNumber[month.month_name];
                if (monthNumber && monthNumber <= currentMonth) {
                totalActiveMonthlyGoalsUntilCurrent += month.monthly_goal;
            }
        });

        const remainingActiveGoal = totalActiveMonthlyGoalsUntilCurrent - totalAdvance;
        if (remainingActiveGoal > 0) {
            chartData.push({
                name: 'Meta por alcanzar',
                value: remainingActiveGoal,
                type: 'goal'
            });
            colors.push(GOAL_COLOR);
        }
    
        const remainingSemesterGoal = semestral_goal - totalAdvance;
        if (remainingSemesterGoal > 0) {
            chartData.push({
                name: 'Meta Semestral Restante',
                value: remainingSemesterGoal,
                type: 'remaining'
            });
            colors.push(REMAINING_COLOR);
        }
    
        const percentage = semestral_goal > 0 ? ((totalAdvance / semestral_goal) * 100).toFixed(1) : "0";
        const formattedGoal = formatCurrency(semestral_goal);
    
        return { chartData, colors, percentage, period: avanceSemestralData.period, formattedGoal };
    }, [avanceSemestralData]);

    const desembolsoPreviewData = useMemo(() => {
        if (!desembolsoDetalleData || desembolsoDetalleData.length === 0) return null;
        
        const currentYear = new Date().getFullYear();
        const monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
        
        const monthlyData = desembolsoDetalleData
            .filter(item => item.year === currentYear)
            .reduce((acc, item) => {
                const monthIndex = item.month - 1;
                const monthKey = monthNames[monthIndex];
                if (!acc[monthKey]) {
                    acc[monthKey] = 0;
                }
                acc[monthKey] += item.monto_neto_final;
                return acc;
            }, {});

        const chartData = monthNames.map(monthName => ({
            'Mes': monthName,
            'Monto Desembolsado': monthlyData[monthName] || 0
        }));
        
        return { chartData };
    }, [desembolsoDetalleData]);
    
    const mapaPreviewData = useMemo(() => {
        if (!mapaSummaryData) return { regionColors: new Map(), hasData: false };
        const colores = ['#60A5FA', '#34D399', '#FCD34D', '#A78BFA', '#F87171'];
        const regionsWithData = new Set(mapaSummaryData.map(d => normalizeGeoName(d.region)));
        const sortedRegions = Array.from(regionsWithData).sort();
        const regionColors = new Map();
        sortedRegions.forEach((region, index) => {
            regionColors.set(region, colores[index % colores.length]);
        });
        return { regionColors, hasData: mapaSummaryData.length > 0 };
    }, [mapaSummaryData]);

    const handleExpandChart = useCallback((chartName) => setExpandedChart(chartName), []);
    const handleCloseExpandedChart = useCallback(() => setExpandedChart(null), []);

    if (expandedChart) {
        return (
            <div className="grafico-dashboard-expanded">
                {expandedChart === 'avance' && <GraficoAvance isExpanded={true} onClose={handleCloseExpandedChart} />}
                {expandedChart === 'desembolso' && (
                    <GraficoDesembolsos
                        isExpanded={true}
                        onClose={handleCloseExpandedChart}
                        initialData={desembolsoDetalleData}
                        onFetchData={fetchDesembolsoDetalleData}
                    />
                )}
                {expandedChart === 'mapa' && (
                    <GraficoMapaDesembolsos
                        isExpanded={true}
                        onClose={handleCloseExpandedChart}
                        initialData={mapaSummaryData}
                        geojson={geojson}
                        onFetchData={fetchMapData}
                        activeDataType={mapaDataType}
                    />
                )}
            </div>
        );
    }
    
    return (
        <>
        {isLoading && (
            <div>
                <Loader />
            </div>
        )}
        <h1>DASHBOARD GERENCIAL</h1>
        <div className="grafico-dashboard-container">
            <div className="dashboard-grid" style={{ opacity: isLoading ? 0.3 : 1 }}>
                <div className="dashboard-column">
                <ChartPreviewCard title="DESEMBOLSOS" onExpand={handleExpandChart} chartName="desembolso">
                    {desembolsoError ? (
                        <ErrorMessage message={desembolsoError} />
                    ) : desembolsoPreviewData && desembolsoPreviewData.chartData.length > 0 ? (
                        <BarChart
                            data={desembolsoPreviewData.chartData}
                            index="Mes"
                            categories={['Monto Desembolsado']}
                            colors={['indigo']}
                            showYAxis={false}
                            showLegend={false}
                            valueFormatter={formatCurrency}
                            customTooltip={(props) => <CustomTooltip {...props} valueFormatter={formatCurrency} />}
                            className="h-full w-full"
                        />
                    ) : (
                        <Text className="no-data-text">NO HAY DATOS DE DESEMBOLSOS</Text>
                    )}
                </ChartPreviewCard>
                {Number(state.user?.perfil_id) !== 20 && (<ChartPreviewCard title={`AVANCE DE METAS`} onExpand={handleExpandChart} chartName="avance">
                    {avanceError ? (
                        <ErrorMessage message={avanceError} />
                    ) : avanceSemestralPreview ? (
                        <div className="avance-donut-chart-container">
                            <DonutChart
                                data={avanceSemestralPreview.chartData}
                                category="value"
                                index="name"
                                variant="donut"
                                colors={avanceSemestralPreview.colors}
                                customTooltip={AvanceSemestralTooltip}
                                showLabel={false}
                                className="h-full w-full"
                            />
                            <div className="donut-chart-info">
                                <Metric className="donut-chart-percentage">{avanceSemestralPreview.percentage}%</Metric>
                                <Text className="donut-chart-label">DE LA META SEMESTRAL</Text>
                                <Text className="donut-chart-goal font-semibold text-slate-700 mt-1">
                                    {avanceSemestralPreview.formattedGoal}
                                </Text>
                            </div>
                        </div>
                    ) : (
                        <Text className="no-data-text">NO HAY DATOS DE AVANCE</Text>
                    )}
                </ChartPreviewCard>)}</div>

                <div className="dashboard-map-card-wrapper">
                    <ChartPreviewCard title="MAPA DE DESEMBOLSOS" onExpand={handleExpandChart} chartName="mapa">
                        {mapaError ? (
                            <ErrorMessage message={mapaError} />
                        ) : (geojson && mapaPreviewData.hasData) ? (
                            <ComposableMap
                                projection="geoMercator"
                                projectionConfig={{ scale: 2000, center: [-75, -9.5] }}
                                className="map-chart"
                            >
                                <Geographies geography={geojson}>
                                    {({ geographies }) => geographies.map(geo => {
                                        const regionName = normalizeGeoName(geo.properties.NOMBDEP);
                                        const color = mapaPreviewData.regionColors.get(regionName) || '#E5E7EB';
                                        return <Geography key={geo.rsmKey} geography={geo} fill={color} stroke="#FFF" strokeWidth={0.5} className="map-geography" />;
                                    })}
                                </Geographies>
                            </ComposableMap>
                        ) : geojson && !mapaPreviewData.hasData ? (
                            <Text className="no-data-text">NO HAY DATOS PARA EL MAPA</Text>
                        ) : (
                            <Text className="loading-map-text">CARGANDO MAPA...</Text>
                        )}
                    </ChartPreviewCard>
                </div>
            </div>
        </div>
        </>
    );
};

export default GraficoDashboard;