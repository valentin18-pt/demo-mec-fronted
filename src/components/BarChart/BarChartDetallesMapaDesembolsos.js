import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import './BarChartDetallesMapaDesembolsos.css';

const BarChartDetallesMapaDesembolsos = ({ data, title, summary }) => {
    const colors = {
        "Monto Desembolsado": "#3b82f6",
        "Cantidad de Desembolsos": "#10b981"
    };

    const formatoSoles = (monto) => {
        const valor = new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(monto);
        return valor;
    };
    
    const fixedTooltipPosition = { y: 10 };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="mapa-tooltip">
                    <div className="mapa-tooltip-title">{label}</div>
                    <div className="mapa-tooltip-divider"></div>
                    {payload.map((entry, index) => (
                        <div key={index} className="mapa-tooltip-item">
                            <div className="mapa-tooltip-label">
                                <div
                                    className="mapa-tooltip-color-box"
                                    style={{ backgroundColor: entry.color }}
                                ></div>
                                <span>{entry.name}</span>
                            </div>
                            <div className="mapa-tooltip-value">
                                {entry.dataKey === "Monto Desembolsado" 
                                    ? formatoSoles(entry.value)
                                    : entry.value
                                }
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderLegend = (props) => {
        const { payload } = props;
        return (
            <div className="mapa-legend-wrapper-horizontal">
                <div className="mapa-legend-horizontal">
                    {payload.map((entry, index) => (
                        <div key={index} className="mapa-legend-item">
                            <div
                                className="mapa-legend-color-box"
                                style={{ backgroundColor: entry.color }}
                            ></div>
                            <span>{entry.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const formatXAxis = (value) => {
        return new Intl.NumberFormat('es-PE').format(value);
    };

    return (
        <div> 
            <h2 className="chart-title-mapa">
                {title}
            </h2>
            {summary && (
                <div style={{ marginBottom: '10px', fontSize: '12px', fontWeight: '500', textAlign: 'left', color: '#333', paddingLeft: '10px' }}>
                    <p style={{ margin: '3px 0' }}>Total Desembolsos: {summary.total_registros}</p>
                    <p style={{ margin: '3px 0' }}>Total Monto Neto: {formatoSoles(summary.total_monto_general)}</p>
                </div>
            )}
            <ResponsiveContainer height={400}>
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                    barSize={80}
                    layout="vertical"
                    barGap={5}
                    barCategoryGap={20}
                >
                    <CartesianGrid 
                        horizontal={false} 
                        vertical={true}
                        stroke="#e0e0e0"
                    />
                    <XAxis
                        type="number"
                        tickFormatter={formatXAxis}
                        tick={{ fontSize: 10 }}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={130}
                        tick={{ fontSize: 10 }}
                    />
                    <Tooltip 
                        content={<CustomTooltip />} 
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} 
                        position={fixedTooltipPosition}
                    />
                    <Legend
                        layout="horizontal"
                        align="center"
                        verticalAlign="top"
                        content={renderLegend}
                        wrapperStyle={{ paddingTop: '10px', marginBottom: '20px' }}
                    />
                    <Bar dataKey="Monto Desembolsado" fill={colors["Monto Desembolsado"]} />
                    <Bar dataKey="Cantidad de Desembolsos" fill={colors["Cantidad de Desembolsos"]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChartDetallesMapaDesembolsos;