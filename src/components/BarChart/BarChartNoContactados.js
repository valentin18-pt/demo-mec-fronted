import React from "react";

import { BarChart} from '@tremor/react';

function BarChartNoContactados({reportesFiltrados}) {


    const Tooltip = ({ payload, label }) => {
      if (!payload || payload.length === 0) return null;
      const contactados = payload[0]?.payload?.contactados || 0;
    
      return (
        <div className="rounded-md border border-black bg-white px-4 py-2 text-sm shadow-md dark:border-gray-400/20">
          <div className="flex items-center justify-between h-7">
            <span className="text-xl">{label} </span>
            <span className="text-xl">{contactados}</span>
          </div>
          <div className="mt-2 flex flex-col space-y-0.5">
            {payload.map((categoryPayload, index) => {
              const colorClass = categoryPayload?.color
                ? `bg-${categoryPayload.color}-500`  
                : 'bg-gray-500';
              return (
                <div key={index} className="flex items-center space-x-2.5">
                  <div className={`w-3.5 h-3.5 rounded ${colorClass}`} />
                  <div className="w-full">
                    <div className="flex items-center justify-between space-x-8">
                      <p className="whitespace-nowrap text-right text-tremor-content text-lg">
                      {categoryPayload?.name
                        ?.replace(/_/g, ' ')
                        .replace(/^([a-z])/i, (match) => match.toUpperCase())}
                      </p>
                      <p className="whitespace-nowrap text-right font-medium text-tremor-content-emphasis text-lg">
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

    const reportes = reportesFiltrados.map(item => ({
    ...item,
    nombre: (() => {
      const [apellidos, nombres] = item.nombre_gestor.toUpperCase().split(',').map(s => s.trim());
      const primerNombre = nombres.split(' ')[0];
      const inicialesApellidos = apellidos
        .split(' ')
        .filter(ap => ap && ap.trim().length > 0)  
        .map(ap => ap[0].toUpperCase() + '.')
        .join(' ');
      return `${primerNombre} ${inicialesApellidos}`;
    })(),
    pendientes: Number(item.total_prospectos_asignados) - Number(item.contactados) - Number(item.no_contactados),
  }));



  return (
    <>
        <BarChart
            className="mt-6 w-full h-96"
            data={reportes}
            index="nombre"
            stack={true}
            categories={["no_califica", "telefono_errado", "no_contesta", "sin_telefono", "otros_no_contactado"]}
            customTooltip={Tooltip}
            rotateLabelX={{
              angle: 270,
              verticalShift: 30,
              xAxisHeight: 80,
            }}
            barCategoryGap="10%"
            showLegend={false}
            colors={["amber",  "cyan" , "violet", "emerald", "blue"]}
            allowDecimals={false}
            showAnimation={true}
            animationDuration={1000}
        />
    </>
  );
}

export default BarChartNoContactados;