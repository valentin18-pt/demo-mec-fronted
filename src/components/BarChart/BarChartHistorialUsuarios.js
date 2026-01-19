import React, { useMemo } from "react";
import { BarChart } from "@tremor/react";
import "./BarChartHistorialUsuarios.css";

function BarChartHistorialUsuarios({ resumenData }) {

  const dataOrdenada = useMemo(() => {
    if (!resumenData) return [];
    const arrayPlano = Object.values(resumenData).flat();

    arrayPlano.sort((a, b) => (a.periodo > b.periodo ? 1 : -1));

    return arrayPlano.map(({ periodo, n_usuarios_comercial, n_usuarios_administracion, n_usuarios_externo }) => ({
      periodo,
      Comercial: Number(n_usuarios_comercial),
      Administración: Number(n_usuarios_administracion),
      Externo: Number(n_usuarios_externo),
    }));
  }, [resumenData]);

  const Tooltip = ({ payload, label }) => {
    if (!payload || payload.length === 0) return null;

    // Suma total de usuarios para el label (opcional)
    const totalUsuarios = payload.reduce((acc, curr) => acc + (curr.value || 0), 0);

    const getColorClass = (color) => {
      switch (color) {
        case "indigo": return "color-indigo";
        case "slate": return "color-slate";
        case "violet": return "color-violet";
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
          <span className="count">{totalUsuarios.toLocaleString()}</span>
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
        categories={["Comercial", "Administración", "Externo"]}
        colors={["indigo", "slate", "violet"]}
        yAxisWidth={50}
        stack={true}
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

export default BarChartHistorialUsuarios;
