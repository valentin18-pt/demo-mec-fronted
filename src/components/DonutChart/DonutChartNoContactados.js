import React from "react";
import "./DonutChartTotal.css";

import {DonutChart} from '@tremor/react';

function DonutChartNoContactados({reportesFiltrados}) {

    const total_no_contactados = reportesFiltrados.reduce((sum, reporte) => sum + Number(reporte.no_contactados || 0), 0);
    const total_no_califica = reportesFiltrados.reduce((sum, reporte) => sum + Number(reporte.no_califica || 0), 0);
    const total_telefono_errado = reportesFiltrados.reduce((sum, reporte) => sum + Number(reporte.telefono_errado || 0), 0);
    const total_no_contesta = reportesFiltrados.reduce((sum, reporte) => sum + Number(reporte.no_contesta || 0), 0);
    const total_sin_telefono = reportesFiltrados.reduce((sum, reporte) => sum + Number(reporte.sin_telefono || 0), 0);
    const total_otros_no_contactado = reportesFiltrados.reduce((sum, reporte) => sum + Number(reporte.otros_no_contactado || 0), 0);


    const chartData = [
        { prospectos: "No califica", Total: total_no_califica },
        { prospectos: "Telefono errado", Total: total_telefono_errado },
        { prospectos: "No contesta", Total: total_no_contesta },
        { prospectos: "Sin teléfono", Total: total_sin_telefono },
        { prospectos: "Otros", Total: total_otros_no_contactado },
      ];

    const customTooltip = ({ payload, active }) => {
      if (!active || !payload || !payload[0]) return null;

      const categoryPayload = payload[0];
      const nameLength = categoryPayload.name ? categoryPayload.name.length : 0;
      const tooltipWidth = Math.max(250, nameLength * 8);

      return (
        <div className="custom-tooltip" style={{ width: `${tooltipWidth}px` }}>
          <div className="tooltip-content">
            <div className={`color-indicator bg-${categoryPayload?.color}-500`} />
            <div className="tooltip-info">
              <div className="tooltip-row">
                <p className="tooltip-name">{categoryPayload.name}</p>
                <p className="tooltip-value">{categoryPayload.value}</p>
              </div>
            </div>
          </div>
        </div>
      );
    };
  return (
    <>
    <div className="donut-chart-wrapper">
      <div className="donut-chart-container">
      <DonutChart
        className="h-96 w-96"
        data={chartData}
        category="Total"
        index="prospectos"
        showLabel={false}
        customTooltip={customTooltip}
        colors={["amber",  "cyan" , "violet", "emerald", "blue"]}
        showAnimation={true}
        animationDuration={1000}
        noDataText="No Data"
      />
      <div className="donut-center-text">
          <div className="total-number">{total_no_contactados}</div>
          <div className="total-label">Prospectos</div>
        </div>
    </div>
    </div>

    <div className="datos-donutchart">
    {chartData.map((dato, index) => (
        <div className="columnx3" key={index}>
        <div className="row">{dato.prospectos}</div>
        <div className="row">{dato.Total}</div> 
        </div>
    ))}
    </div>
    </>
  );
}

export default DonutChartNoContactados;