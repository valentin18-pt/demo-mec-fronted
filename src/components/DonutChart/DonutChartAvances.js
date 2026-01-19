import React from "react";
import { DonutChart } from "@tremor/react";
import "./DonutChartAvances.css";

function DonutChartAvances({ title, data, total }) {
  const chartdata = data.map(item => ({
    categoria: item.nombre,
    operaciones: item.operaciones,
  }));

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

  const brightColors = [
    "blue", "emerald", "amber", "indigo", "rose", "cyan", "violet",
    "purple", "pink", "green", "red", "orange", "teal", "lime",
    "sky", "fuchsia", "yellow", "slate", "stone"
  ];

  const getColorForValue = (value, index) => {
    if (value === 0) return "gray";
    return brightColors[index % brightColors.length];
  };

  const customizedColors = data.map((item, index) =>
    getColorForValue(item.operaciones, index)
  );

  const forceTailwindColors = [
    "fill-blue-500", "fill-emerald-500", "fill-amber-500",
    "fill-indigo-500", "fill-rose-500", "fill-cyan-500",
    "fill-violet-500", "fill-purple-500", "fill-pink-500",
    "fill-green-500", "fill-red-500", "fill-orange-500",
    "fill-teal-500", "fill-lime-500", "fill-sky-500",
    "fill-fuchsia-500", "fill-yellow-500", "fill-slate-500",
    "fill-stone-500", "fill-gray-500"
  ];

  return (
    <div className="donut-chart-wrapper">
      {title && (
        <div className="tittle-donutchart">
          <h3>{title}</h3>
        </div>
      )}

      <div className="hidden">
        {forceTailwindColors.map(cls => (
          <div key={cls} className={cls}></div>
        ))}
      </div>

      <div className="donut-chart-container">
        <DonutChart
          className="h-96 w-96"
          data={chartdata}
          category="operaciones"
          index="categoria"
          showLabel={false}
          customTooltip={customTooltip}
          colors={customizedColors}
          showAnimation={true}
          animationDuration={1000}
          noDataText="No Data"
        />
        <div className="donut-center-text">
          <div className="total-number">{total}</div>
          <div className="total-label">Operaciones</div>
        </div>
      </div>
    </div>
  );
}

export default DonutChartAvances;