import React, { useContext, useEffect, useState } from "react";
import { BarChart } from '@tremor/react';
import { AppContext } from '../../application/provider';
import "./BarChartEvaluacion.css";

function BarChartEvaluacion({ evaluacionData, zonalFilter, supervisorFilter }) {
    const [state] = useContext(AppContext);
    const [chartData, setChartData] = useState([]);
    const [chartCategories, setChartCategories] = useState([]);

    const getSupervisorName = (userId) => {
        const user = state.user.personal.find(p => p.usuario_id === userId);
        if (user && user.supervisor) {
            const parts = user.supervisor.split(', ');
            if (parts.length === 2) {
                const nombres = parts[1].split(' ');
                const apellidos = parts[0].split(' ');
                const firstName = nombres[0] || '';
                const firstLastName = apellidos[0] || '';
                return `${firstName} ${firstLastName}`.toUpperCase().trim();
            }
            const nameParts = user.supervisor.split(' ');
            return `${nameParts[0] || ''} ${nameParts[1] || ''}`.toUpperCase().trim();
        }
        return `SUPERVISOR DESCONOCIDO (ID:${userId})`;
    };

    const getGestorName = (userId) => {
        const user = state.user.personal.find(p => p.usuario_id === userId);
        if (user) {
            const parts = user.nombre_completo_usuario.split(', ');
            if (parts.length === 2) {
                const nombres = parts[1].split(' ');
                const apellidos = parts[0].split(' ');
                const firstName = nombres[0] || '';
                const firstLastName = apellidos[0] || '';
                return `${firstName} ${firstLastName}`.toUpperCase().trim();
            }
            const nameParts = user.nombre_completo_usuario.split(' ');
            return `${nameParts[0] || ''} ${nameParts[1] || ''}`.toUpperCase().trim();
        }
        return `GESTOR DESCONOCIDO (ID:${userId})`;
    };

    const getZonalId = (userId) => {
        const user = state.user.personal.find(p => p.usuario_id === userId);
        return user ? user.zonal_id : null;
    };

    const getSupervisorId = (userId) => {
        const user = state.user.personal.find(p => p.usuario_id === userId);
        return user ? user.supervisor_id : null;
    };

    const generateDateRange = (start, end) => {
        const dates = [];
        let currentDate = new Date(`${start}T00:00:00`);
        const endDate = new Date(`${end}T00:00:00`);

        while (currentDate <= endDate) {
            dates.push(currentDate.toISOString().slice(0, 10));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    };

    useEffect(() => {
        const isSupervisorFiltered = supervisorFilter !== null && supervisorFilter !== '';

        const filteredEvaluacionData = evaluacionData.filter(item => {
            const userMakingComment = state.user.personal.find(p => p.usuario_id === item.usuario_id);

            if (!userMakingComment || userMakingComment.perfil_id !== '4') {
                return false;
            }

            if (zonalFilter && Number(getZonalId(item.usuario_id)) !== Number(zonalFilter)) {
                return false;
            }

            if (supervisorFilter) {
                if (Number(userMakingComment.supervisor_id) !== Number(supervisorFilter) && Number(userMakingComment.usuario_id) !== Number(supervisorFilter)) {
                    return false;
                }
            }
            return true;
        });

        let allCategoriesToShow;
        if (isSupervisorFiltered) {
            allCategoriesToShow = Array.from(new Set(
                filteredEvaluacionData.map(item => getGestorName(item.usuario_id))
            )).sort();
        } else {
            allCategoriesToShow = Array.from(new Set(
                state.user.personal
                    .filter(p => p.perfil_id === '3')
                    .map(supervisor => getSupervisorName(supervisor.usuario_id))
            )).sort();
        }

        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); 
        const startDate = firstDayOfMonth.toISOString().slice(0, 10);
        const endDate = lastDayOfMonth.toISOString().slice(0, 10);

        const allDatesToShow = generateDateRange(startDate, endDate);
        
        const transformedData = [];
        allDatesToShow.forEach(date => {
            const entry = { fecha: date };
            allCategoriesToShow.forEach(name => {
                entry[name] = 0;
            });
            transformedData.push(entry);
        });

        filteredEvaluacionData.forEach(item => {
            const fecha = item.fecha_comentario;
            const categoryName = isSupervisorFiltered ? getGestorName(item.usuario_id) : getSupervisorName(item.usuario_id);
            const cantidad = Number(item.cantidad_prospectos_unicos) || 0;

            let entry = transformedData.find(e => e.fecha === fecha);
            if (entry && allCategoriesToShow.includes(categoryName)) {
                entry[categoryName] = (entry[categoryName] || 0) + cantidad;
            }
        });

        setChartData(transformedData);
        setChartCategories(allCategoriesToShow);

    }, [evaluacionData, zonalFilter, supervisorFilter, state.personal]);

    const colors = [
        "blue", "emerald", "violet", "orange", "indigo", "rose", "gray", "red", "teal", "yellow",
        "purple", "fuchsia", "lime", "cyan", "sky", "green", "pink"
    ];

    const getCategoryColor = (categoryName) => {
        const index = chartCategories.indexOf(categoryName);
        if (index === -1) {
            return 'gray';
        }
        return colors[index % colors.length];
    };

    const colorClassMap = {
        "blue": "bg-blue-500", "emerald": "bg-emerald-500", "violet": "bg-violet-500",
        "orange": "bg-orange-500", "indigo": "bg-indigo-500", "rose": "bg-rose-500",
        "gray": "bg-gray-500", "red": "bg-red-500", "teal": "bg-teal-500",
        "yellow": "bg-yellow-500", "purple": "bg-purple-500", "fuchsia": "bg-fuchsia-500",
        "lime": "bg-lime-500", "cyan": "bg-cyan-500", "sky": "bg-sky-500",
        "green": "bg-green-500", "pink": "bg-pink-500"
    };

    const CustomTooltip = ({ payload, label, active }) => {
        if (!active || !payload || payload.length === 0) return null;
        
        const filteredPayload = payload.filter(entry => (Number(entry.value) || 0) > 0);

        if (filteredPayload.length === 0) return null;

        const totalForDay = filteredPayload.reduce((sum, entry) => sum + (Number(entry.value) || 0), 0);

        return (
            <div className="tooltip-container">
                <div className="tooltip-header">
                    <span className="tooltip-date-label">Fecha: {label} </span>
                    <span className="tooltip-total-label">Total: {totalForDay}</span>
                </div>
                <div className="tooltip-content-wrapper">
                    {filteredPayload.map((categoryPayload, index) => {
                        const assignedColorName = getCategoryColor(categoryPayload?.name);
                        const colorClass = colorClassMap[assignedColorName] || 'bg-gray-500';

                        return (
                            <div key={index} className="tooltip-item-row">
                                <div className={`tooltip-color-box ${colorClass}`} />
                                <div className="tooltip-item-details">
                                    <div className="tooltip-item-text-container">
                                        <p className="tooltip-item-name">
                                            {categoryPayload?.name}
                                        </p>
                                        <p className="tooltip-item-value">
                                            {categoryPayload?.value}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="chart-legend-container">
                <div className="chart-legend-items">
                    {chartCategories.map((name, index) => {
                        const assignedColorName = getCategoryColor(name);
                        const colorClass = colorClassMap[assignedColorName] || 'bg-gray-500';
                        return (
                            <div key={index} className="chart-legend-item">
                                <div className={`chart-legend-color-box ${colorClass}`} />
                                <span className="chart-legend-name">{name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <BarChart
                className="mt-6 w-full h-96"
                data={chartData}
                index="fecha"
                stack={true}
                categories={chartCategories}
                customTooltip={CustomTooltip}
                rotateLabelX={{
                    angle: 270,
                    verticalShift: 30,
                    xAxisHeight: 80,
                }}
                barCategoryGap="10%"
                showLegend={false}
                colors={colors}
                allowDecimals={false}
                showAnimation={true}
                animationDuration={1000}
                yAxisWidth={48}
            />
        </>
    );
}

export default BarChartEvaluacion;