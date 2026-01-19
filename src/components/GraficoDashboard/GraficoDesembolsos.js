import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { TrendingUp, ArrowLeft } from 'lucide-react';
import { ButtonSearch } from '../Buttons/Buttons';
import TabsWithTable from '../Tabs/TabsWithTable';
import BarChartDetallesDesembolsos from '../BarChart/BarchartDetallesDesembolsos';
import Loader from '../Loader/Loader';
import './GraficoDesembolsos.css';

const EmptyState = ({ icon: Icon, text }) => (
    <div className="empty-state-container">
        <Icon className="empty-state-icon" />
        <p className="empty-state-text">{text}</p>
    </div>
);

const formatoSoles = (monto) => {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(monto);
};

const GraficoDesembolsos = ({ initialData, onFetchData, activeDataType, isExpanded, onClose }) => {
    const [pendingYear, setPendingYear] = useState('all');
    const [pendingMonth, setPendingMonth] = useState('all');
    const [pendingSummaryType, setPendingSummaryType] = useState(activeDataType || 'validated');
    
    const [activeYear, setActiveYear] = useState('all');
    const [activeMonth, setActiveMonth] = useState('all');
    const [activeSummaryType, setActiveSummaryType] = useState(activeDataType || 'validated');
    
    const [currentAllData, setCurrentAllData] = useState(initialData || []);
    const [filteredData, setFilteredData] = useState(initialData || []);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('mensual');
    const isInitialLoad = useRef(true);

    const applyFilters = useCallback((data, year, month) => {
        let filtered = data;
        
        if (year !== 'all') {
            filtered = filtered.filter(item => item.year.toString() === year);
        }
        
        if (month !== 'all') {
            filtered = filtered.filter(item => item.month.toString() === month);
        }
        
        setFilteredData(filtered);
    }, []);

    useEffect(() => {
        if (initialData && isInitialLoad.current) {
            setCurrentAllData(initialData);
            applyFilters(initialData, 'all', 'all');
            isInitialLoad.current = false;
        }
    }, [initialData, applyFilters]);

    useEffect(() => {
        if (activeDataType) {
            setPendingSummaryType(activeDataType);
            setActiveSummaryType(activeDataType);
        }
    }, [activeDataType]);

    const availableYears = useMemo(() => {
        return Array.from(new Set(currentAllData.map(item => item.year.toString())))
            .filter(year => parseInt(year) >= 2023)
            .sort((a, b) => a - b);
    }, [currentAllData]);

    const availableMonths = useMemo(() => {
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                           "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        return Array.from({ length: 12 }, (_, i) => ({ 
            id: (i + 1).toString(), 
            name: monthNames[i] 
        }));
    }, []);

    const handleLoadReport = async () => {
        setIsLoading(true);
        let dataParaFiltrar = currentAllData;
        
        if (pendingSummaryType !== activeSummaryType && onFetchData) {
            const newFetchedData = await onFetchData({ summary_type: pendingSummaryType });
            if (newFetchedData && newFetchedData.data) {
                dataParaFiltrar = newFetchedData.data;
                setCurrentAllData(newFetchedData.data);
                setActiveSummaryType(pendingSummaryType);
                setActiveTab('mensual');
            }
        }
        
        applyFilters(dataParaFiltrar, pendingYear, pendingMonth);
        
        setActiveYear(pendingYear);
        setActiveMonth(pendingMonth);
        
        setIsLoading(false);
    };

    const dataDiaria = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        const dataDelMes = filteredData.filter(item => {
            if (activeYear !== 'all' && item.year.toString() !== activeYear.toString()) return false;
            if (activeMonth !== 'all' && item.month.toString() !== activeMonth.toString()) return false;
            
            if (activeYear === 'all' && activeMonth === 'all') {
                return item.year === currentYear && item.month === currentMonth;
            }
            
            return true;
        });

        const agregado = dataDelMes.reduce((acc, item) => {
            const fecha = new Date(item.fecha_desembolso);
            const dia = fecha.getDate();
            const key = `Día ${dia}`;
            
            if (!acc[key]) {
                acc[key] = { vigentes: 0, cancelados: 0, cantidadVigentes: 0, cantidadCancelados: 0 };
            }
            
            if (item.cancelado === 0) {
                acc[key].vigentes += item.monto_neto_final;
                acc[key].cantidadVigentes += 1;
            } else {
                acc[key].cancelados += item.monto_neto_final;
                acc[key].cantidadCancelados += 1;
            }
            
            return acc;
        }, {});

        return Object.entries(agregado)
            .map(([name, data]) => ({
                name,
                "Vigentes": data.vigentes,
                "Cancelados": data.cancelados,
                cantidadVigentes: data.cantidadVigentes,
                cantidadCancelados: data.cantidadCancelados
            }))
            .sort((a, b) => {
                const diaA = parseInt(a.name.replace('Día ', ''));
                const diaB = parseInt(b.name.replace('Día ', ''));
                return diaA - diaB;
            });
    }, [filteredData, activeYear, activeMonth]);

    const dataMensual = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", 
                           "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        
        const dataDelAnio = filteredData.filter(item => {
            if (activeYear !== 'all') {
                return item.year.toString() === activeYear.toString();
            }
            return item.year === currentYear;
        });

        const agregado = dataDelAnio.reduce((acc, item) => {
            const monthKey = monthNames[item.month - 1];
            
            if (!acc[monthKey]) {
                acc[monthKey] = { vigentes: 0, cancelados: 0, monthNum: item.month, cantidadVigentes: 0, cantidadCancelados: 0 };
            }
            
            if (item.cancelado === 0) {
                acc[monthKey].vigentes += item.monto_neto_final;
                acc[monthKey].cantidadVigentes += 1;
            } else {
                acc[monthKey].cancelados += item.monto_neto_final;
                acc[monthKey].cantidadCancelados += 1;
            }
            
            return acc;
        }, {});

        return Object.entries(agregado)
            .map(([name, data]) => ({
                name,
                "Vigentes": data.vigentes,
                "Cancelados": data.cancelados,
                monthNum: data.monthNum,
                cantidadVigentes: data.cantidadVigentes,
                cantidadCancelados: data.cantidadCancelados
            }))
            .sort((a, b) => a.monthNum - b.monthNum);
    }, [filteredData, activeYear]);

    const dataAnual = useMemo(() => {
        const agregado = filteredData.reduce((acc, item) => {
            const year = item.year.toString();
            
            if (!acc[year]) {
                acc[year] = { vigentes: 0, cancelados: 0, cantidadVigentes: 0, cantidadCancelados: 0 };
            }
            
            if (item.cancelado === 0) {
                acc[year].vigentes += item.monto_neto_final;
                acc[year].cantidadVigentes += 1;
            } else {
                acc[year].cancelados += item.monto_neto_final;
                acc[year].cantidadCancelados += 1;
            }
            
            return acc;
        }, {});

        return Object.entries(agregado)
            .map(([name, data]) => ({
                name,
                "Vigentes": data.vigentes,
                "Cancelados": data.cancelados,
                cantidadVigentes: data.cantidadVigentes,
                cantidadCancelados: data.cantidadCancelados
            }))
            .sort((a, b) => a.name - b.name);
    }, [filteredData]);

    const dataPorContrato = useMemo(() => {
        const agregado = filteredData.reduce((acc, item) => {
            const contratoKey = `Contrato ${item.contrato_id}`;
            
            if (!acc[contratoKey]) {
                acc[contratoKey] = { vigentes: 0, cancelados: 0, contratoNum: item.contrato_id, cantidadVigentes: 0, cantidadCancelados: 0 };
            }
            
            if (item.cancelado === 0) {
                acc[contratoKey].vigentes += item.monto_neto_final;
                acc[contratoKey].cantidadVigentes += 1;
            } else {
                acc[contratoKey].cancelados += item.monto_neto_final;
                acc[contratoKey].cantidadCancelados += 1;
            }
            
            return acc;
        }, {});

        return Object.entries(agregado)
            .map(([name, data]) => ({
                name,
                "Vigentes": data.vigentes,
                "Cancelados": data.cancelados,
                contratoNum: data.contratoNum,
                cantidadVigentes: data.cantidadVigentes,
                cantidadCancelados: data.cantidadCancelados
            }))
            .sort((a, b) => a.contratoNum - b.contratoNum);
    }, [filteredData]);

    const summary = useMemo(() => {
        return {
            total_registros: filteredData.length,
            total_monto_neto: filteredData.reduce((sum, item) => sum + item.monto_neto_final, 0)
        };
    }, [filteredData]);

    const getChartTitle = () => {
        const filters = [];
        if (activeYear !== 'all') filters.push(`Año ${activeYear}`);
        if (activeMonth !== 'all') {
            const monthName = availableMonths.find(m => m.id === activeMonth)?.name;
            filters.push(monthName);
        }
        
        const filterStr = filters.length > 0 ? ` - ${filters.join(' ')}` : '';
        
        switch(activeTab) {
            case 'diario': return `Desembolsos Diarios${filterStr}`;
            case 'mensual': return `Desembolsos Mensuales${filterStr}`;
            case 'anual': return `Desembolsos Anuales${filterStr}`;
            case 'contrato': return `Desembolsos por Contrato${filterStr}`;
            default: return 'Desembolsos';
        }
    };

    const getChartData = () => {
        switch(activeTab) {
            case 'diario': return dataDiaria;
            case 'mensual': return dataMensual;
            case 'anual': return dataAnual;
            case 'contrato': return dataPorContrato;
            default: return [];
        }
    };

    const chartData = getChartData();

    const renderContent = () => (
        <div className="table-container">
            <table className="mapa-desembolsos-table">
                <thead>
                    <tr>
                        <th>GRÁFICO</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ height: '530px' }}>
                        <td style={{ verticalAlign: 'top' }}>
                            <div>
                                {chartData.length > 0 ? (
                                    <BarChartDetallesDesembolsos 
                                        data={chartData}
                                        title={getChartTitle()}
                                        summary={{
                                            total_registros: summary.total_registros,
                                            total_monto_neto: summary.total_monto_neto
                                        }}
                                    />
                                ) : (
                                    <EmptyState icon={TrendingUp} text="No hay datos disponibles para esta vista" />
                                )}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

    const tabs = [
        { key: 'diario', label: 'Diario', content: renderContent() },
        { key: 'mensual', label: 'Mensual', content: renderContent() },
        { key: 'anual', label: 'Anual', content: renderContent() },
        { key: 'contrato', label: 'Por Contrato', content: renderContent() }
    ];

    if (!currentAllData) return <EmptyState icon={TrendingUp} text="No se recibieron los datos de desembolsos." />;
    if (isLoading) return <Loader />;

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h1>DESEMBOLSOS</h1>
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
                    <select 
                        id="year" 
                        value={pendingYear} 
                        onChange={(e) => setPendingYear(e.target.value)}
                    >
                        <option value="all">Todos</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="month">Mes:</label>
                    <select 
                        id="month" 
                        value={pendingMonth} 
                        onChange={(e) => setPendingMonth(e.target.value)}
                    >
                        <option value="all">Todos</option>
                        {availableMonths.map(month => (
                            <option key={month.id} value={month.id}>{month.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="summaryType">Tipo de Dato:</label>
                    <select 
                        id="summaryType" 
                        value={pendingSummaryType} 
                        onChange={(e) => setPendingSummaryType(e.target.value)}
                    >
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
                defaultTab="mensual" 
                onTabChange={(tabKey) => setActiveTab(tabKey)}
            />
        </>
    );
};

export default GraficoDesembolsos;