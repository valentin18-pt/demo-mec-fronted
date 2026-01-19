import React from "react";
import AccionesProspecto from "./AccionesProspecto";
import AsignacionProspecto from "./AsignacionProspecto";

/**
 * Componente base para filas de prospectos
 * Maneja el estilo de la fila según el estado de contactado
 */
const FilaProspectoBase = ({ prospecto, children, mostrarCheckbox, onCheckboxChange, isChecked }) => {
  const getClassName = () => {
    if (prospecto.contactado === "S") return "contactado-si";
    if (prospecto.contactado === "N") return "contactado-no";
    return "";
  };

  return (
    <tr className={getClassName()}>
      {mostrarCheckbox && (
        <AsignacionProspecto
          prospectoId={prospecto.prospecto_id}
          checked={isChecked}
          onChange={(e) => onCheckboxChange(e, prospecto)}
        />
      )}
      {children}
    </tr>
  );
};

/**
 * Componente para fila de tabla de Seguimiento
 */
export const FilaSeguimiento = ({
  prospecto,
  instituciones,
  estado,
  mostrarCheckbox,
  onCheckboxChange,
  isChecked,
  onVerMas,
  onPropuestaSolicitud,
}) => {
  const getConvenio = () => {
    const institucion = instituciones.find(
      (item) => item.institucion_id === prospecto.razon_social_id
    );
    return institucion?.razon_social || "N/A";
  };

  const getEstado = () => {
    const estadoItem = estado.find((item) => item.tipo_id === prospecto.estado_id);
    const descripcion = estadoItem?.descripcion || "N/A";
    const sufijo = Number(prospecto.estado_final) === 3 ? " (E)" : "";
    return `${descripcion}${sufijo}`;
  };

  const renderCelulares = () => {
    if (!prospecto.celulares || prospecto.celulares.length === 0) {
      return "N/A";
    }
    
    return prospecto.celulares.map((celular, index) => (
      <React.Fragment key={index}>
        <a
          href={`https://wa.me/51${celular}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {celular}
        </a>
        {prospecto.celulares.length > 1 && index < prospecto.celulares.length - 1 && " / "}
      </React.Fragment>
    ));
  };

  return (
    <FilaProspectoBase
      prospecto={prospecto}
      mostrarCheckbox={mostrarCheckbox}
      onCheckboxChange={onCheckboxChange}
      isChecked={isChecked}
    >
      <td>{prospecto.dni}</td>
      <td>{prospecto.nombre}</td>
      <td>{getConvenio()}</td>
      <td>{prospecto.contactado || "N/A"}</td>
      <td>{getEstado()}</td>
      <td>{renderCelulares()}</td>
      <td>{prospecto.email || "N/A"}</td>
      <td>{prospecto.gestor_nombre?.toUpperCase() || "N/A"}</td>
      <AccionesProspecto
        prospecto={prospecto}
        onVerMas={onVerMas}
        onPropuestaSolicitud={onPropuestaSolicitud}
      />
    </FilaProspectoBase>
  );
};

/**
 * Componente para fila de tabla de Datos Personales
 */
export const FilaDatosPersonales = ({
  prospecto,
  estadoCivil,
  contratoCondicion,
  formatoSoles,
  mostrarCheckbox,
  onCheckboxChange,
  isChecked,
  onVerMas,
  onPropuestaSolicitud,
}) => {
  const getEstadoCivil = () => {
    const ec = estadoCivil.find((ec) => ec.tipo_id === prospecto.estado_civil_id);
    return ec?.descripcion || "N/A";
  };

  const getContratoCondicion = () => {
    const cc = contratoCondicion.find((cc) => cc.tipo_id === prospecto.contrato_condicion);
    return cc?.descripcion || "N/A";
  };

  return (
    <FilaProspectoBase
      prospecto={prospecto}
      mostrarCheckbox={mostrarCheckbox}
      onCheckboxChange={onCheckboxChange}
      isChecked={isChecked}
    >
      <td>{prospecto.dni}</td>
      <td>{prospecto.nombre}</td>
      <td>{prospecto.edad || "N/A"}</td>
      <td>{getEstadoCivil()}</td>
      <td>{prospecto.direccion || "N/A"}</td>
      <td>{prospecto.consentimiento_datos || "N/A"}</td>
      <td>{prospecto.dni_conyuge || "N/A"}</td>
      <td>{prospecto.cargo || "N/A"}</td>
      <td>{getContratoCondicion()}</td>
      <td>{prospecto.rango_ingresos ? formatoSoles(prospecto.rango_ingresos) : "N/A"}</td>
      <AccionesProspecto
        prospecto={prospecto}
        onVerMas={onVerMas}
        onPropuestaSolicitud={onPropuestaSolicitud}
      />
    </FilaProspectoBase>
  );
};

/**
 * Componente para fila de tabla de Historial de Crédito
 */
export const FilaHistorialCredito = ({
  prospecto,
  buro,
  tipoCredito,
  formatoSoles,
  mostrarCheckbox,
  onCheckboxChange,
  isChecked,
  onVerMas,
  onPropuestaSolicitud,
}) => {
  const getBuro = () => {
    const item = buro.find((item) => item.tipo_id === prospecto.buro_id);
    return item?.descripcion || "N/A";
  };

  const getTipoCredito = () => {
    const tc = tipoCredito.find((tc) => tc.tipo_id === prospecto.ultimo_tipo_credito_id);
    return tc?.descripcion || "N/A";
  };

  const getAfectaBoleta = () => {
    if (!["1", "0"].includes(prospecto.afecta_boleta_ultimo_credito)) return "N/A";
    return prospecto.afecta_boleta_ultimo_credito === "1" ? "SI" : "NO";
  };

  return (
    <FilaProspectoBase
      prospecto={prospecto}
      mostrarCheckbox={mostrarCheckbox}
      onCheckboxChange={onCheckboxChange}
      isChecked={isChecked}
    >
      <td>{prospecto.dni}</td>
      <td>{prospecto.nombre}</td>
      <td>{getBuro()}</td>
      <td>{prospecto.denegado_definitivo || "N/A"}</td>
      <td>{prospecto.deuda_caja || "N/A"}</td>
      <td>{getTipoCredito()}</td>
      <td>{prospecto.monto_cuota_ultimo_credito ? formatoSoles(prospecto.monto_cuota_ultimo_credito) : "N/A"}</td>
      <td>{getAfectaBoleta()}</td>
      <td>{prospecto.promedio_mora_ultimo_credito || "N/A"}</td>
      <td>{prospecto.participacion_aval || "N/A"}</td>
      <td>{prospecto.atraso_aval || "N/A"}</td>
      <td>{prospecto.saldo_otras_entidades ? formatoSoles(prospecto.saldo_otras_entidades) : "N/A"}</td>
      <td>{prospecto.saldo_otras_entidades_cony ? formatoSoles(prospecto.saldo_otras_entidades_cony) : "N/A"}</td>
      <td>{prospecto.sum_saldo_otras_entidades ? formatoSoles(prospecto.sum_saldo_otras_entidades) : "N/A"}</td>
      <AccionesProspecto
        prospecto={prospecto}
        onVerMas={onVerMas}
        onPropuestaSolicitud={onPropuestaSolicitud}
      />
    </FilaProspectoBase>
  );
};

/**
 * Componente para fila de tabla de Detalles RCC
 */
export const FilaDetallesRCC = ({
  prospecto,
  formatoSoles,
  mostrarCheckbox,
  onCheckboxChange,
  isChecked,
  onVerMas,
  onPropuestaSolicitud,
}) => {
  return (
    <FilaProspectoBase
      prospecto={prospecto}
      mostrarCheckbox={mostrarCheckbox}
      onCheckboxChange={onCheckboxChange}
      isChecked={isChecked}
    >
      <td>{prospecto.dni}</td>
      <td>{prospecto.nombre}</td>
      <td>{prospecto.rcc_calificacion_cliente || "N/A"}</td>
      <td>{prospecto.rcc_num_entidad_deuda_cliente || "N/A"}</td>
      <td>{prospecto.rcc_saldo_caja ? formatoSoles(prospecto.rcc_saldo_caja) : "N/A"}</td>
      <td>{prospecto.rcc_calificacion_conyuge || "N/A"}</td>
      <td>{prospecto.rcc_num_entidad_deuda_conyuge || "N/A"}</td>
      <td>{prospecto.rcc_saldo_caja_cony ? formatoSoles(prospecto.rcc_saldo_caja_cony) : "N/A"}</td>
      <td>{prospecto.sum_rcc_saldo_caja ? formatoSoles(prospecto.sum_rcc_saldo_caja) : "N/A"}</td>
      <AccionesProspecto
        prospecto={prospecto}
        onVerMas={onVerMas}
        onPropuestaSolicitud={onPropuestaSolicitud}
      />
    </FilaProspectoBase>
  );
};

/**
 * Componente de mensaje cuando no hay datos
 */
export const FilaVacia = ({ colSpan, mensaje = "No hay prospectos disponibles" }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center">
        {mensaje}
      </td>
    </tr>
  );
};