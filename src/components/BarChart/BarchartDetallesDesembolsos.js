import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import './BarChartDetallesDesembolsos.css';

const BarChartDetallesDesembolsos = ({ data, title, summary }) => {
    const colors = {
        "Vigentes": "#3b82f6",
        "Cancelados": "#ef4444"
    };

    const formatoSoles = (monto) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(monto);
    };

    const formatXAxis = (value) => {
        return new Intl.NumberFormat('es-PE').format(value);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            
            return (
                <div className="mapa-tooltip">
                    <div className="mapa-tooltip-title">{label}</div>
                    <div className="mapa-tooltip-divider"></div>
                    
                    <div className="mapa-tooltip-item">
                        <div className="mapa-tooltip-label">
                            <div
                                className="mapa-tooltip-color-box"
                                style={{ backgroundColor: '#3b82f6' }}
                            ></div>
                            <span>Monto Desembolsado Vigente</span>
                        </div>
                        <div className="mapa-tooltip-value">
                            {formatoSoles(dataPoint.Vigentes)}
                        </div>
                    </div>

                    <div className="mapa-tooltip-item">
                        <div className="mapa-tooltip-label">
                            <div
                                className="mapa-tooltip-color-box"
                                style={{ backgroundColor: '#3b82f6' }}
                            ></div>
                            <span>Cantidad de Desembolsos Vigente</span>
                        </div>
                        <div className="mapa-tooltip-value">
                            {dataPoint.cantidadVigentes}
                        </div>
                    </div>

                    <div className="mapa-tooltip-item">
                        <div className="mapa-tooltip-label">
                            <div
                                className="mapa-tooltip-color-box"
                                style={{ backgroundColor: '#ef4444' }}
                            ></div>
                            <span>Monto Desembolsado Cancelado</span>
                        </div>
                        <div className="mapa-tooltip-value">
                            {formatoSoles(dataPoint.Cancelados)}
                        </div>
                    </div>

                    <div className="mapa-tooltip-item">
                        <div className="mapa-tooltip-label">
                            <div
                                className="mapa-tooltip-color-box"
                                style={{ backgroundColor: '#ef4444' }}
                            ></div>
                            <span>Cantidad de Desembolsos Cancelado</span>
                        </div>
                        <div className="mapa-tooltip-value">
                            {dataPoint.cantidadCancelados}
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderLegend = () => {
        const legendItems = [
            { name: 'Monto Desembolsado Vigente', color: '#3b82f6' },
            { name: 'Monto Desembolsado Cancelado', color: '#ef4444' }
        ];

        return (
            <div className="mapa-legend-wrapper-horizontal">
                <div className="mapa-legend-horizontal">
                    {legendItems.map((item, index) => (
                        <div key={index} className="mapa-legend-item">
                            <div
                                className="mapa-legend-color-box"
                                style={{ backgroundColor: item.color }}
                            ></div>
                            <span>{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div>
            <h2 className="chart-title-mapa">{title}</h2>
            
            {summary && (
                <div style={{ 
                    marginBottom: '10px', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    textAlign: 'left', 
                    color: '#333', 
                    paddingLeft: '10px'
                }}>
                    <p style={{ margin: '3px 0' }}>Total Desembolsos: {summary.total_registros}</p>
                    <p style={{ margin: '3px 0' }}>Total Monto Neto: {formatoSoles(summary.total_monto_neto)}</p>
                </div>
            )}

            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 20, left: 10, bottom: 60 }}
                    barSize={60}
                    barGap={5}
                >
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false}
                        stroke="#e0e0e0"
                    />
                    <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 11 }}
                    />
                    <YAxis
                        tickFormatter={formatXAxis}
                        tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    />
                    <Legend
                        layout="horizontal"
                        align="center"
                        verticalAlign="top"
                        content={renderLegend}
                        wrapperStyle={{ paddingTop: '10px', marginBottom: '20px' }}
                    />
                    <Bar 
                        dataKey="Vigentes" 
                        fill={colors["Vigentes"]}
                    />
                    <Bar 
                        dataKey="Cancelados" 
                        fill={colors["Cancelados"]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChartDetallesDesembolsos;