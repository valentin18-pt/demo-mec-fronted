import React from "react";
import "./DonutChartTotal.css";

import {DonutChart, Legend} from '@tremor/react';

function DonutChartTotal({totalProspectosAsignados, totalContactados, totalNoContactados}) {

  const prospectosPendientes = totalProspectosAsignados - (totalContactados + totalNoContactados);
  const chartdata = [
      {
        prospectos: "Pendientes",
        Total: prospectosPendientes,
      },
      {
        prospectos: "Contactados",
        Total: totalContactados,
      },
      {
        prospectos: "No contactados",
        Total: totalNoContactados,
      },
    ]

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
          data={chartdata}
          category="Total"
          index="prospectos"
          showLabel={false}
          customTooltip={customTooltip}
          colors={["blue","emerald", "amber"]}
          showAnimation={true}
          animationDuration={1000}
          noDataText="No Data"
        />
        <div className="donut-center-text">
            <div className="total-number">{totalProspectosAsignados}</div>
            <div className="total-label">Prospectos</div>
          </div>
      </div>
    </div>

<div className="datos-donutchart">
  {chartdata.map((dato, index) => (
    <div className="columnx3" key={index}>
      <div className="row">{dato.prospectos}</div>
      <div className="row">{dato.Total}</div> 
    </div>
  ))}
</div>
    </>
  );
}

export default DonutChartTotal;