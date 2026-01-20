import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DonutChart, BarChart, Legend, Metric, Text, ProgressBar } from '@tremor/react';
import { TrendingUp, ArrowLeft, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { ButtonSearch } from '../Buttons/Buttons';
import TabsWithTable from '../Tabs/TabsWithTable';
import avancesService from '../../axios_services/graficosDashboard';
import Loader from '../Loader/Loader';
import './GraficoAvance.css';

const EmptyState = ({ icon: Icon, text }) => (
    <div className="empty-state-container">
        <Icon className="empty-state-icon" />
        <p className="empty-state-text">{text}</p>
    </div>
);

const GraficoAvance = ({ isExpanded, onClose, initialData = null }) => {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth();

    const primerDiaMesActual = new Date(anioActual, mesActual, 1);
    const ultimoDiaMesActual = new Date(anioActual, mesActual + 1, 0);
    const primerDiaMesAnterior = new Date(anioActual, mesActual - 1, 1);
    const ultimoDiaMesAnterior = new Date(anioActual, mesActual, 0);

    const formatCurrency = (value) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    const initialMonth = localToday.toISOString().slice(0, 7);

    const [periodoFecha, setPeriodoFecha] = useState(initialMonth);
    const [barFechaMin1, setBarFechaMin1] = useState(primerDiaMesActual.toISOString().split('T')[0]);
    const [barFechaMax1, setBarFechaMax1] = useState(ultimoDiaMesActual.toISOString().split('T')[0]);
    const [barFechaMin2, setBarFechaMin2] = useState(primerDiaMesAnterior.toISOString().split('T')[0]);
    const [barFechaMax2, setBarFechaMax2] = useState(ultimoDiaMesAnterior.toISOString().split('T')[0]);
    const [dataType, setDataType] = useState('registered');

    const [donutData, setDonutData] = useState(null);
    const [barData, setBarData] = useState([]);
    const [comparisonDifference, setComparisonDifference] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [donutError, setDonutError] = useState(null);
    const [barError, setBarError] = useState(null);

    const [activeTab, setActiveTab] = useState('mensual');
    const isInitialLoad = useRef(true);

    const DONUT_COLORS = ['blue', 'slate'];
    const BAR_COLORS = ['blue', 'emerald'];


    const loadDonutData = useCallback(async () => {
        setDonutError(null);
        if (!periodoFecha) return;

        const [year, month] = periodoFecha.split('-');
        try {
            const filtersToSend = { year, month, dataType };
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
                setDonutError(response.message || 'No se encontraron datos.');
            }
        } catch (err) {
            setDonutData(null);
            setDonutError('Error al cargar datos de Avance.');
        }
    }, [periodoFecha, dataType]);

    const loadBarData = useCallback(async () => {
        setBarError(null);
        if (!barFechaMin1 || !barFechaMax1) {
            setBarError('Complete el Rango.');
            return;
        }

        const fetchPeriodData = async (startDate, endDate, label) => {
            if (!startDate || !endDate) return null;
            try {
                const response = await avancesService.getAvancesMensuales({
                    startDate, endDate, dataType
                });
                if (response.success && response.data.goal !== null) {
                    const { total_amount, goal } = response.data;
                    const percentage = goal > 0 ? ((total_amount / goal) * 100).toFixed(1) : 0;
                    return {
                        name: `${label} (${percentage}%)`,
                        "Avance": total_amount,
                        "Meta": goal,
                        total_amount,
                        percentage
                    };
                }
            } catch (error) {
                console.error(error);
            }
            return null;
        };

        try {
            const promises = [fetchPeriodData(barFechaMin1, barFechaMax1, 'Período 1')];
            if (barFechaMin2 && barFechaMax2) {
                promises.push(fetchPeriodData(barFechaMin2, barFechaMax2, 'Período 2'));
            }

            const results = (await Promise.all(promises)).filter(Boolean);

            if (results.length === 0) {
                setBarData([]);
                setBarError('No se encontraron datos para los períodos.');
            } else {
                setBarData(results);
                if (results.length === 2) {
                    const diff = results[1].total_amount - results[0].total_amount;
                    let colorClass = 'text-yellow-500';
                    let IconComponent = Minus;

                    if (diff > 0) { colorClass = 'text-green-600'; IconComponent = ArrowUp; }
                    else if (diff < 0) { colorClass = 'text-red-600'; IconComponent = ArrowDown; }

                    setComparisonDifference({
                        differenceText: `Diferencia: ${formatCurrency(diff)}`,
                        colorClass,
                        IconComponent
                    });
                } else {
                    setComparisonDifference(null);
                }
            }
        } catch (err) {
            setBarData([]);
            setBarError('Error al cargar comparación.');
        }
    }, [barFechaMin1, barFechaMax1, barFechaMin2, barFechaMax2, dataType]);

    const handleSearch = async () => {
        setIsLoading(true);
        await Promise.all([loadDonutData(), loadBarData()]);
        setIsLoading(false);
    };

    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            if (initialData) {
                const { total_amount, goal, source } = initialData;
                const remaining = Math.max(0, goal - total_amount);
                const periodName = new Date().toLocaleDateString('es-ES', { month: 'long' });

                setDonutData({
                    chartData: [{ name: 'Avance', value: total_amount }, { name: 'Restante', value: remaining }],
                    total: goal,
                    progress: total_amount,
                    percentage: goal > 0 ? ((total_amount / goal) * 100).toFixed(1) : 0,
                    period: periodName.charAt(0).toUpperCase() + periodName.slice(1),
                    source
                });

                if (source) setDataType(source === 'validated' ? 'validated' : 'registered');
                loadBarData();
            } else {
                handleSearch();
            }
        }
    }, [initialData, loadBarData, handleSearch]);


    const customTooltip = (props) => {
        const { payload, active } = props;
        if (!active || !payload) return null;
        return (
            <div className="w-auto min-w-[12rem] rounded-tremor-default border border-tremor-border bg-white p-3 text-tremor-default shadow-tremor-dropdown">
                {payload.map((category, idx) => (
                    <div key={idx} className="flex flex-1 space-x-3 mb-2 last:mb-0 items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 bg-${category.color}-500 rounded-sm`} />
                            <p className="text-gray-500 text-xs whitespace-nowrap">
                                {category.name === "Avance" || category.dataKey === "Avance" ? "Monto Desembolso" : (category.dataKey || category.name)}
                            </p>
                        </div>
                        <p className="font-semibold text-right whitespace-nowrap text-gray-700 text-xs ml-4">
                            {formatCurrency(category.value)}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    const renderContentWrapper = (children) => (
        <div className="table-container">
            <table className="mapa-desembolsos-table">
                <thead>
                    <tr>
                        <th>GRÁFICO</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ height: '530px' }}>
                        <td style={{ verticalAlign: 'middle' }}>
                            {children}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

    const renderDonutContent = () => renderContentWrapper(
        <div className="flex items-center justify-center p-6 h-full">
            {donutData ? (
                <div className="flex flex-row items-center justify-center gap-16 w-full max-w-5xl mt-8">
                    <div className="donut-chart-container-avance w-80 h-80 flex-shrink-0 relative flex items-center justify-center">
                        <DonutChart
                            data={donutData.chartData}
                            category="value"
                            index="name"
                            valueFormatter={formatCurrency}
                            colors={DONUT_COLORS}
                            className="h-full w-full"
                            showLabel={false}
                            customTooltip={customTooltip}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-xl font-bold text-slate-700">
                                {formatCurrency(donutData.progress)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-start justify-center">
                        <Metric className="text-3xl font-semibold text-slate-700">{donutData.percentage}%</Metric>
                        <Text className="text-base text-slate-500 mt-1">Avance de Meta Mensual</Text>

                        <div className="mt-6">
                            <Text className="text-lg font-medium text-slate-700">
                                {formatCurrency(donutData.progress)}
                                <span className="text-slate-400 font-normal mx-1">de</span>
                                {formatCurrency(donutData.total)}
                            </Text>
                            <ProgressBar value={parseFloat(donutData.percentage)} color="blue" className="mt-3 w-52" />
                        </div>

                        <div className="flex flex-wrap gap-4 mt-6">
                            {['Avance', 'Restante'].map((category, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                    <div className={`w-3.5 h-3.5 bg-${DONUT_COLORS[idx]}-500 rounded-none`} />
                                    <span className="text-gray-700 font-medium text-sm">{category}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <EmptyState icon={TrendingUp} text={donutError || "Sin datos."} />
            )}
        </div>
    );

    const renderBarContent = () => renderContentWrapper(
        <div className="p-6 h-full flex flex-col justify-center">
            {barData.length > 0 ? (
                <div className="w-full flex flex-col">
                    <BarChart
                        data={barData}
                        index="name"
                        categories={['Avance', 'Meta']}
                        colors={BAR_COLORS}
                        valueFormatter={formatCurrency}
                        showYAxis={false}
                        showLegend={false}
                        className="h-80 mt-4 bar-chart-avance"
                        customTooltip={customTooltip}
                    />

                    <div className="flex flex-wrap justify-center gap-6 mt-2">
                        {['Avance', 'Meta'].map((category, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                                <div className={`w-3.5 h-3.5 bg-${BAR_COLORS[idx]}-500 rounded-none`} />
                                <span className="text-gray-700 font-medium text-sm">{category}</span>
                            </div>
                        ))}
                    </div>

                    {comparisonDifference && (
                        <div className="mt-6 flex items-center justify-center">
                            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${comparisonDifference.colorClass.replace('text-', 'bg-').replace('-600', '-100').replace('-500', '-100')}`}>
                                <comparisonDifference.IconComponent className={`h-5 w-5 ${comparisonDifference.colorClass}`} />
                                <Text className={`text-sm font-bold ${comparisonDifference.colorClass}`}>{comparisonDifference.differenceText}</Text>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <EmptyState icon={TrendingUp} text={barError || "Sin datos para comparar."} />
            )}
        </div>
    );

    const tabs = [
        { key: 'mensual', label: 'Avance Mensual', content: renderDonutContent() },
        { key: 'comparacion', label: 'Comparación de períodos', content: renderBarContent() }
    ];

    if (isLoading && !donutData && barData.length === 0) return <Loader />;

    return (
        <>
            <div className="grafico-avance-header flex items-center justify-between mb-4">
                <h1>AVANCE DE METAS</h1>
                {isExpanded && onClose && (
                    <button
                        onClick={onClose}
                        className="btn-volver"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 20px',
                            backgroundColor: '#043d85', color: 'white', border: 'none', borderRadius: '6px',
                            cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'background-color 0.2s ease'
                        }}
                    >
                        <ArrowLeft size={18} />
                        Volver
                    </button>
                )}
            </div>

            <div className="filtros-container filtros grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 items-end">
                {activeTab === 'mensual' && (
                    <div className="flex flex-col">
                        <label htmlFor="periodo_fecha" className="text-sm font-medium mb-1">Periodo:</label>
                        <input
                            id="periodo_fecha"
                            type="month"
                            value={periodoFecha}
                            onChange={(e) => setPeriodoFecha(e.target.value)}
                            className="form-input border rounded px-3 py-2 w-full h-[38px]"
                        />
                    </div>
                )}

                {activeTab === 'comparacion' && (
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Fecha 1 (Rango):</label>
                        <div className="flex space-x-2">
                            <input
                                type="date"
                                value={barFechaMin1}
                                onChange={(e) => setBarFechaMin1(e.target.value)}
                                className="form-input border rounded px-2 py-2 w-1/2 text-xs h-[38px]"
                                title="Inicio Rango"
                            />
                            <input
                                type="date"
                                value={barFechaMax1}
                                onChange={(e) => setBarFechaMax1(e.target.value)}
                                className="form-input border rounded px-2 py-2 w-1/2 text-xs h-[38px]"
                                title="Fin Rango"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'comparacion' && (
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Fecha 2 (Rango):</label>
                        <div className="flex space-x-2">
                            <input
                                type="date"
                                value={barFechaMin2}
                                onChange={(e) => setBarFechaMin2(e.target.value)}
                                className="form-input border rounded px-2 py-2 w-1/2 text-xs h-[38px]"
                                title="Inicio Rango"
                            />
                            <input
                                type="date"
                                value={barFechaMax2}
                                onChange={(e) => setBarFechaMax2(e.target.value)}
                                className="form-input border rounded px-2 py-2 w-1/2 text-xs h-[38px]"
                                title="Fin Rango"
                            />
                        </div>
                    </div>
                )}

                <div className="flex flex-col">
                    <label htmlFor="tipo_dato" className="text-sm font-medium mb-1">Tipo de Dato:</label>
                    <select
                        id="tipo_dato"
                        value={dataType}
                        onChange={(e) => setDataType(e.target.value)}
                        className="form-input border rounded px-3 py-2 w-full h-[38px]"
                    >
                        <option value="validated">Validado</option>
                        <option value="registered">Registrado</option>
                    </select>
                </div>
            </div>

            <div className="search-button-container mb-6">
                <ButtonSearch
                    onClick={handleSearch}
                    isLoading={isLoading}
                />
            </div>

            <TabsWithTable
                tabs={tabs}
                defaultTab="mensual"
                onTabChange={(tabKey) => setActiveTab(tabKey)}
            />
        </>
    );
};

export default GraficoAvance;