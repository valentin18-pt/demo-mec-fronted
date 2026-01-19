import React, { useState, useEffect, useCallback } from 'react';
import { DonutChart, BarChart, Legend, Title, Text, Metric, ProgressBar, Card, Grid, Button } from '@tremor/react';
import { TrendingUp, BarChart3, Minimize, UploadCloud, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import avancesService from '../../axios_services/graficosDashboard';
import './GraficoAvance.css';

const LoadingIndicator = () => (<div className="loading-effect"><div className="cargando">Cargando...</div></div>);
const EmptyState = ({ icon: Icon, text }) => (<div className="empty-state-container"><Icon className="empty-state-icon" /><Text className="empty-state-text">{text}</Text></div>);

const GraficoAvance = ({ isExpanded, onClose, initialData = null }) => {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth();
    const primerDiaMesActual = new Date(anioActual, mesActual, 1);
    const ultimoDiaMesActual = new Date(anioActual, mesActual + 1, 0);
    const primerDiaMesAnterior = new Date(anioActual, mesActual - 1, 1);
    const ultimoDiaMesAnterior = new Date(anioActual, mesActual, 0);
    const [donutData, setDonutData] = useState(null);
    const [barData, setBarData] = useState([]);
    const [donutLoading, setDonutLoading] = useState(false);
    const [barLoading, setBarLoading] = useState(false);
    const [error, setError] = useState(null);
    const [barError, setBarError] = useState(null);
    const [comparisonDifference, setComparisonDifference] = useState(null);
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    const initialMonth = localToday.toISOString().slice(0, 7);
    const [periodoFechaTemp, setPeriodoFechaTemp] = useState(initialMonth);
    const [pendingDonutDataType, setPendingDonutDataType] = useState('registered');
    const [isDonutButtonDisabled, setIsDonutButtonDisabled] = useState(true);
    const [barFechaMin1, setBarFechaMin1] = useState(primerDiaMesActual.toISOString().split('T')[0]);
    const [barFechaMax1, setBarFechaMax1] = useState(ultimoDiaMesActual.toISOString().split('T')[0]);
    const [barFechaMin2, setBarFechaMin2] = useState(primerDiaMesAnterior.toISOString().split('T')[0]);
    const [barFechaMax2, setBarFechaMax2] = useState(ultimoDiaMesAnterior.toISOString().split('T')[0]);
    const [pendingBarDataType1, setPendingBarDataType1] = useState('registered');
    const [pendingBarDataType2, setPendingBarDataType2] = useState('registered');
    const [isBarButtonDisabled, setIsBarButtonDisabled] = useState(true);
    const formatCurrency = (value) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
    const checkBarButtonDisabled = useCallback(() => {
        const period1Filled = barFechaMin1 && barFechaMax1 && pendingBarDataType1;
        const period2Filled = (barFechaMin2 && barFechaMax2 && pendingBarDataType2) || (!barFechaMin2 && !barFechaMax2 && !pendingBarDataType2);
        return !(period1Filled && period2Filled);
    }, [barFechaMin1, barFechaMax1, pendingBarDataType1, barFechaMin2, barFechaMax2, pendingBarDataType2]);
    useEffect(() => {
        setIsBarButtonDisabled(checkBarButtonDisabled());
    }, [barFechaMin1, barFechaMax1, pendingBarDataType1, barFechaMin2, barFechaMax2, pendingBarDataType2, checkBarButtonDisabled]);
    const checkDonutButtonDisabled = useCallback(() => {
        return !(periodoFechaTemp && pendingDonutDataType);
    }, [periodoFechaTemp, pendingDonutDataType]);
    useEffect(() => {
        setIsDonutButtonDisabled(checkDonutButtonDisabled());
    }, [periodoFechaTemp, pendingDonutDataType, checkDonutButtonDisabled]);
    const loadDonutData = async () => {
        setDonutLoading(true);
        setError(null);
        setIsDonutButtonDisabled(true);
        if (!periodoFechaTemp) {
            setError('Por favor, selecciona un periodo mensual.');
            setDonutLoading(false);
            return;
        }
        const [year, month] = periodoFechaTemp.split('-');
        try {
            const filtersToSend = {
                year,
                month,
                dataType: pendingDonutDataType
            };
            const response = await avancesService.getAvancesMensuales(filtersToSend);
            if (response.success && response.data) {
                const { total_amount, goal, source, period } = response.data;
                const remaining = Math.max(0, goal - total_amount);
                setDonutData({
                    chartData: [{ name: 'Avance', value: total_amount }, { name: 'Restante', value: remaining }],
                    total: goal,
                    progress: total_amount,
                    percentage: goal > 0 ? ((total_amount / goal) * 100).toFixed(1) : 0,
                    period: period,
                    source,
                });
            } else {
                setDonutData(null);
                setError(response.message || 'No se encontraron datos para los filtros seleccionados.');
            }
        } catch (err) {
            setDonutData(null);
            setError(err.response?.data?.message || 'Error al cargar los datos.');
        } finally {
            setDonutLoading(false);
        }
    };
    const loadBarData = async () => {
        setBarLoading(true);
        setBarError(null);
        setIsBarButtonDisabled(true);
        if (!barFechaMin1 || !barFechaMax1 || !pendingBarDataType1) {
            setBarError('Por favor, selecciona un rango de fechas y un tipo de dato para el Período 1.');
            setBarLoading(false);
            return;
        }
        const fetchPeriodData = async (startDate, endDate, dataType, basePeriodLabel) => {
            if (!startDate || !endDate || !dataType) return null;
            const filters = {
                startDate,
                endDate,
                dataType,
            };
            const response = await avancesService.getAvancesMensuales(filters);
            if (response.success && response.data.goal !== null) {
                const { total_amount, goal } = response.data;
                const percentage = goal > 0 ? ((total_amount / goal) * 100).toFixed(1) : 0;
                const periodNameWithPercentage = `${basePeriodLabel} (${percentage}%)`;
                return {
                    name: periodNameWithPercentage,
                    "Avance": total_amount,
                    "Meta": goal,
                    total_amount: total_amount,
                    goal: goal,
                    percentage: percentage,
                };
            }
            return null;
        };
        try {
            const promises = [fetchPeriodData(barFechaMin1, barFechaMax1, pendingBarDataType1, 'Período 1')];
            if (barFechaMin2 && barFechaMax2 && pendingBarDataType2) {
                promises.push(fetchPeriodData(barFechaMin2, barFechaMax2, pendingBarDataType2, 'Período 2'));
            }
            const results = (await Promise.all(promises)).filter(Boolean);
            if (results.length === 0) {
                setBarData([]);
                setBarError('No se encontraron datos o metas para los períodos seleccionados.');
            } else {
                setBarData(results);
                if (results.length === 2) {
                    const avance1 = results[0].total_amount;
                    const avance2 = results[1].total_amount;
                    const diff = avance2 - avance1;
                    let colorClass = '';
                    let IconComponent;
                    if (diff > 0) {
                        colorClass = 'text-green-600';
                        IconComponent = ArrowUp;
                    } else if (diff < 0) {
                        colorClass = 'text-red-600';
                        IconComponent = ArrowDown;
                    } else {
                        colorClass = 'text-yellow-500';
                        IconComponent = Minus;
                    }
                    setComparisonDifference({
                        differenceText: `Diferencia: ${formatCurrency(diff)}`,
                        colorClass: colorClass,
                        IconComponent: IconComponent
                    });
                } else {
                    setComparisonDifference(null);
                }
            }
        } catch (err) {
            setBarData([]);
            setBarError(err.response?.data?.message || 'Error al cargar los datos de comparación.');
        } finally {
            setBarLoading(false);
        }
    };
    useEffect(() => {
        if (initialData) {
            const { total_amount, goal, source } = initialData;
            const remaining = Math.max(0, goal - total_amount);
            const initialDate = new Date();
            const formattedPeriod = initialDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
            setDonutData({
                chartData: [{ name: 'Avance', value: total_amount }, { name: 'Restante', value: remaining }],
                total: goal,
                progress: total_amount,
                percentage: goal > 0 ? ((total_amount / goal) * 100).toFixed(1) : 0,
                period: formattedPeriod.charAt(0).toUpperCase() + formattedPeriod.slice(1),
                source,
            });
            const initialDataType = source === 'validated' ? 'validated' : 'registered';
            setPendingDonutDataType(initialDataType);
            setIsDonutButtonDisabled(true);
        }
    }, [initialData]);
    useEffect(() => {
        loadDonutData();
    }, []);
    const dataTypesOptions = [
        { value: 'validated', label: 'Validado' },
        { value: 'registered', label: 'Registrado' }
    ];
    const DONUT_COLORS = ['blue', 'slate'];
    const BAR_COLORS = ['blue', 'emerald'];
    const customTooltip = (props) => {
        const { payload, active } = props;
        if (!active || !payload) return null;
        const period1Avance = payload.find(item => item.dataKey === 'Avance' && item.payload.name.includes('Período 1'));
        const period1Meta = payload.find(item => item.dataKey === 'Meta' && item.payload.name.includes('Período 1'));
        const period2Avance = payload.find(item => item.dataKey === 'Avance' && item.payload.name.includes('Período 2'));
        const period2Meta = payload.find(item => item.dataKey === 'Meta' && item.payload.name.includes('Período 2'));
        return (
            <div className="tremor-tooltip">
                {period1Avance && (
                    <div className="tremor-tooltip-row">
                        <span className="tremor-tooltip-label">Período 1:</span>
                        <span className="tremor-tooltip-value">
                            Avance: {formatCurrency(period1Avance.value)} ({period1Avance.payload.percentage}%)
                            {period1Meta && <><br />Meta: {formatCurrency(period1Meta.value)}</>}
                        </span>
                    </div>
                )}
                {period2Avance && (
                    <div className="tremor-tooltip-row">
                        <span className="tremor-tooltip-label">Período 2:</span>
                        <span className="tremor-tooltip-value">
                            Avance: {formatCurrency(period2Avance.value)} ({period2Avance.payload.percentage}%)
                            {period2Meta && <><br />Meta: {formatCurrency(period2Meta.value)}</>}
                        </span>
                    </div>
                )}
            </div>
        );
    };
    return (
        <div className="grafico-avance-container">
            {isExpanded && onClose && (
                <button onClick={onClose} className="close-button" title="Cerrar">
                    <Minimize className="close-icon" />
                </button>
            )}
            <main className="dashboard-main-content">
                <Grid numItemsLg={2} className="main-grid">
                    <Card className="chart-card lg:col-span-1">
                        <Title className="chart-title">Avance Mensual</Title>
                        <div className="filter-controls">
                            <div className="filter-group-top">
                                <div className="filter-group">
                                    <label htmlFor="periodo_fecha" className="filter-label">Período:</label>
                                    <input
                                        id="periodo_fecha"
                                        type="month"
                                        value={periodoFechaTemp}
                                        onChange={(e) => {
                                            setPeriodoFechaTemp(e.target.value);
                                            setIsDonutButtonDisabled(false);
                                        }}
                                        className="filter-input"
                                    />
                                </div>
                                <div className="data-type-buttons">
                                    {dataTypesOptions.map(opt => (
                                        <Button
                                            key={opt.value}
                                            onClick={() => {
                                                setPendingDonutDataType(opt.value);
                                                setIsDonutButtonDisabled(false);
                                            }}
                                            color={pendingDonutDataType === opt.value ? 'indigo' : 'white'}
                                            variant={pendingDonutDataType === opt.value ? 'primary' : 'light'}
                                            className={`
                                                ${pendingDonutDataType === opt.value ? 'text-white' : 'text-black border border-indigo-200'}
                                                h-10 px-4 text-sm whitespace-nowrap flex-shrink-0
                                            `}
                                        >
                                            {opt.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <Button
                                onClick={loadDonutData}
                                className="filter-button-full-width"
                                icon={UploadCloud}
                                color="indigo"
                                disabled={isDonutButtonDisabled}
                            >
                                Cargar Reporte
                            </Button>
                        </div>
                        <div className="chart-area justify-start">
                            {donutLoading ? <LoadingIndicator /> : donutData ? (
                                <div className="text-center w-full h-full flex flex-col items-center justify-center">
                                    <div className="donut-chart-container-avance">
                                        <DonutChart
                                            data={donutData.chartData}
                                            category="value"
                                            index="name"
                                            valueFormatter={formatCurrency}
                                            colors={DONUT_COLORS}
                                            className="h-full w-full"
                                        />
                                    </div>
                                    <Metric className="text-tremor-content-strong mt-4">{donutData.percentage}%</Metric>
                                    <Legend categories={['Avance', 'Restante']} colors={DONUT_COLORS} className="justify-center mt-4" />
                                    <Text className="mt-2">{formatCurrency(donutData.progress)} de {formatCurrency(donutData.total)}</Text>
                                    <ProgressBar value={parseFloat(donutData.percentage)} color="blue" className="mt-2 w-full max-w-sm" />
                                </div>
                            ) : <EmptyState icon={TrendingUp} text={error || "Ajusta los filtros para ver los datos."} />}
                        </div>
                    </Card>
                    <Card className="chart-card lg:col-span-1">
                        <Title className="chart-title">Comparación de Períodos</Title>
                        <div className="filter-controls">
                            <div className="w-full p-2 border rounded-md">
                                <Text className="font-medium text-tremor-content-strong">Período 1</Text>
                                <div className="filter-row mt-2">
                                    <div className="filter-group">
                                        <label htmlFor="bar_fecha_min_1" className="filter-label">Desde:</label>
                                        <input id="bar_fecha_min_1" type="date" value={barFechaMin1} onChange={(e) => { setBarFechaMin1(e.target.value); setIsBarButtonDisabled(false); }} className="filter-input" />
                                    </div>
                                    <div className="filter-group">
                                        <label htmlFor="bar_fecha_max_1" className="filter-label">Hasta:</label>
                                        <input id="bar_fecha_max_1" type="date" value={barFechaMax1} onChange={(e) => { setBarFechaMax1(e.target.value); setIsBarButtonDisabled(false); }} className="filter-input" />
                                    </div>
                                    <div className="data-type-buttons">
                                        {dataTypesOptions.map(opt => (
                                            <Button
                                                key={opt.value}
                                                onClick={() => { setPendingBarDataType1(opt.value); setIsBarButtonDisabled(false); }}
                                                color={pendingBarDataType1 === opt.value ? 'indigo' : 'white'}
                                                variant={pendingBarDataType1 === opt.value ? 'primary' : 'light'}
                                                className={`
                                                    ${pendingBarDataType1 === opt.value ? 'text-white' : 'text-black border border-indigo-200'}
                                                    h-10 px-4 text-sm whitespace-nowrap flex-shrink-0
                                                `}
                                            >
                                                {opt.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full p-2 border rounded-md">
                                <Text className="font-medium text-tremor-content-strong">Período 2</Text>
                                <div className="filter-row mt-2">
                                    <div className="filter-group">
                                        <label htmlFor="bar_fecha_min_2" className="filter-label">Desde:</label>
                                        <input id="bar_fecha_min_2" type="date" value={barFechaMin2} onChange={(e) => { setBarFechaMin2(e.target.value); setIsBarButtonDisabled(false); }} className="filter-input" />
                                    </div>
                                    <div className="filter-group">
                                        <label htmlFor="bar_fecha_max_2" className="filter-label">Hasta:</label>
                                        <input id="bar_fecha_max_2" type="date" value={barFechaMax2} onChange={(e) => { setBarFechaMax2(e.target.value); setIsBarButtonDisabled(false); }} className="filter-input" />
                                    </div>
                                    <div className="data-type-buttons">
                                        {dataTypesOptions.map(opt => (
                                            <Button
                                                key={opt.value}
                                                onClick={() => { setPendingBarDataType2(opt.value); setIsBarButtonDisabled(false); }}
                                                color={pendingBarDataType2 === opt.value ? 'indigo' : 'white'}
                                                variant={pendingBarDataType2 === opt.value ? 'primary' : 'light'}
                                                className={`
                                                    ${pendingBarDataType2 === opt.value ? 'text-white' : 'text-black border border-indigo-200'}
                                                    h-10 px-4 text-sm whitespace-nowrap flex-shrink-0
                                                `}
                                            >
                                                {opt.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={loadBarData}
                                className="filter-button-full-width"
                                icon={UploadCloud}
                                color="indigo"
                                disabled={isBarButtonDisabled}
                            >
                                Comparar Períodos
                            </Button>
                        </div>
                        <div className="chart-area">
                            {barLoading ? <LoadingIndicator /> : barData.length > 0 ? (
                                <>
                                    <BarChart
                                        data={barData}
                                        index="name"
                                        categories={['Avance', 'Meta']}
                                        colors={BAR_COLORS}
                                        valueFormatter={formatCurrency}
                                        showYAxis={false}
                                        tooltip={customTooltip}
                                    />
                                    {comparisonDifference && (
                                        <div className="mt-8 flex items-center justify-center">
                                            <div className={`flex items-center space-x-2 p-2 rounded-md ${comparisonDifference.colorClass.replace('text-', 'bg-').replace('-600', '-100')}`}>
                                                <comparisonDifference.IconComponent className={`h-5 w-5 ${comparisonDifference.colorClass}`} />
                                                <Text className={`${comparisonDifference.colorClass}`}>{comparisonDifference.differenceText}</Text>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : <EmptyState icon={BarChart3} text={barError || "Ajusta los filtros para comparar períodos."} />}
                        </div>
                    </Card>
                </Grid>
            </main>
        </div>
    );
};

export default GraficoAvance;