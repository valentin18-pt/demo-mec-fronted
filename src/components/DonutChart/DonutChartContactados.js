import React from "react";
import "./DonutChartTotal.css";

import {DonutChart, Legend} from '@tremor/react';

function DonutChartContactados({reportesFiltrados}) {

    const total_contactados = reportesFiltrados.reduce((sum, reporte) => sum + Number(reporte.contactados || 0), 0);
    const total_prospecto = reportesFiltrados.reduce((sum, reporte) => sum + Number(reporte.prospecto || 0), 0);
    const total_no_desea = reportesFiltrados.reduce((sum, reporte) => sum + Number(reporte.no_desea || 0), 0);
    const total_evaluacion = reportesFiltrados.reduce((sum, reporte) => sum + Number(reporte.evaluacion || 0), 0);
    const total_opi = reportesFiltrados.reduce((sum, reporte) => sum + Number(reporte.opi || 0), 0);
    const total_posible_denuncia = reportesFiltrados.reduce((sum, reporte) => sum + Number(reporte.posible_denuncia || 0), 0);
    const total_desembolso = reportesFiltrados.reduce((sum, reporte) => sum + Number(reporte.desembolso || 0), 0);
    const total_otros_contactado = reportesFiltrados.reduce((sum, reporte) => sum + Number(reporte.otros_contactado || 0), 0);

    const chartData = [
        { prospectos: "Prospecto", Total: total_prospecto },
        { prospectos: "No desea", Total: total_no_desea },
        { prospectos: "Evaluación", Total: total_evaluacion },
        { prospectos: "Opi", Total: total_opi },
        { prospectos: "Posible denuncia", Total: total_posible_denuncia },
        { prospectos: "Desembolsó", Total: total_desembolso },
        { prospectos: "Otros", Total: total_otros_contactado }
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
        colors={["gray","pink",  "cyan" , "violet", "emerald", "blue", "amber"]}
        showAnimation={true}
        animationDuration={1000}
        noDataText="No Data"
      />
      <div className="donut-center-text">
        <div className="total-number">{total_contactados}</div>
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

export default DonutChartContactados;