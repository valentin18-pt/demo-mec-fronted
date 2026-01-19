import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import './BarChartResumenFinal.css';

const BarChartResumenFinal = ({ data }) => {
    const colors = {
        "Costos Directos": "#3b82f6",
        "Costos Indirectos": "#f97316",
        "Costo Total": "#6b7280"
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
                <div className="resumenfinal-tooltip">
                    <div className="resumenfinal-tooltip-title">{label}</div>
                    <div className="resumenfinal-tooltip-divider"></div>
                    {payload.map((entry, index) => (
                        <div key={index} className="resumenfinal-tooltip-item">
                            <div className="resumenfinal-tooltip-label">
                                <div
                                    className="resumenfinal-tooltip-color-box"
                                    style={{ backgroundColor: entry.color }}
                                ></div>
                                <span>{entry.name}</span>
                            </div>
                            <div className="resumenfinal-tooltip-value">
                                {formatoSoles(entry.value)}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const CustomXAxisTick = ({ x, y, payload }) => {
        const lines = payload.value.split('\n');
        return (
            <g transform={`translate(${x},${y})`}>
                {lines.map((line, index) => (
                    <text
                        key={index}
                        x={0}
                        y={index * 12}
                        dy={8}
                        textAnchor="middle"
                        fill="#666"
                        fontSize="10px"
                    >
                        {line}
                    </text>
                ))}
            </g>
        );
    };

    const renderLegend = (props) => {
        const { payload } = props;
        return (
            <div className="resumenfinal-legend-wrapper">
                <div className="resumenfinal-legend">
                    {payload.map((entry, index) => (
                        <div key={index} className="resumenfinal-legend-item">
                            <div
                                className="resumenfinal-legend-color-box"
                                style={{ backgroundColor: entry.color }}
                            ></div>
                            <span>{entry.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div> 
            <h2 className="chart-title-resumenfinal">
                COSTO TOTAL POR CANAL / CMAC / TIPO CRÉDITO
            </h2>
            <ResponsiveContainer height={350}>
                <BarChart
                    data={data}
                    margin={{ top: 40, right: 100, left: 20, bottom: 40 }} 
                    barSize={30}
                >
                    <CartesianGrid 
                        horizontal={true} 
                        vertical={false}
                        stroke="#e0e0e0"
                    />
                    <XAxis
                        dataKey="name"
                        height={60}
                        tick={<CustomXAxisTick />}
                    />
                    <YAxis
                        tickFormatter={formatoSoles}
                        width={100}
                        tick={{ fontSize: 10 }}
                    />
                    <Tooltip 
                        content={<CustomTooltip />} 
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} 
                        position={fixedTooltipPosition}
                    />
                    <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="top"
                        content={renderLegend}
                        wrapperStyle={{ paddingTop: '50px', right: 50 }}
                    />
                    <Bar dataKey="Costos Directos" fill={colors["Costos Directos"]} />
                    <Bar dataKey="Costos Indirectos" fill={colors["Costos Indirectos"]} />
                    <Bar dataKey="Costo Total" fill={colors["Costo Total"]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChartResumenFinal;