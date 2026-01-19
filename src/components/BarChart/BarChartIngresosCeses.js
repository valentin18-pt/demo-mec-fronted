import React, { useMemo } from "react";
import { BarChart } from "@tremor/react";
import "./BarChartIngresosCeses.css";

function BarChartIngresosCeses({ resumenData }) {

  const dataOrdenada = useMemo(() => {
    if (!resumenData) return [];
    const arrayPlano = Object.values(resumenData).flat();

    arrayPlano.sort((a, b) => (a.periodo > b.periodo ? 1 : -1));

    return arrayPlano.map(({ periodo, ingresos, ceses }) => ({
      periodo,
      ingresos: Number(ingresos),
      ceses: Number(ceses),
    }));
  }, [resumenData]);

  const Tooltip = ({ payload, label }) => {
    if (!payload || payload.length === 0) return null;

    const nUsuarios = payload[0]?.payload?.n_usuarios || 0;

    const getColorClass = (color) => {
      switch (color) {
        case "emerald": return "color-emerald";
        case "rose": return "color-rose";
        case "amber": return "color-amber";
        default: return "";
      }
    };

    const formatName = (name) =>
      name
        .replace(/_/g, " ")
        .replace(/^([a-z])/i, (m) => m.toUpperCase());

    return (
      <div className="tooltip-container">
        <div className="tooltip-header">
          <span>{label}</span>
          <span className="count">{nUsuarios.toLocaleString()}</span>
        </div>
        <div>
          {payload.map(({ color, name, value }, index) => (
            <div key={index} className="tooltip-item">
              <div className="flex items-center">
                <span className={`color-dot ${getColorClass(color)}`} />
                <span>{formatName(name)}</span>
              </div>
              <span>{value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="chart-container">
      <BarChart
        className="w-full h-full"
        data={dataOrdenada}
        index="periodo"
        categories={["ingresos", "ceses"]}
        colors={["emerald", "rose"]}
        yAxisWidth={50}
        xAxisHeight={90}
        barCategoryGap="10%"
        showLegend={true}
        allowDecimals={false}
        showAnimation={true}
        animationDuration={900}
        showGridLines={true}
        rotateLabelX={{
          angle: -45,
          verticalShift: 12,
          xAxisHeight: 90,
        }}
        intervalType="equidistant"
        customTooltip={Tooltip}
      />
    </div>
  );
}

export default BarChartIngresosCeses;
