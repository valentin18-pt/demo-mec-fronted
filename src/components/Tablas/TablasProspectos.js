import React from "react";
import { Table } from "reactstrap";
import Loader from "../Loader/Loader";
import {
  FilaSeguimiento,
  FilaDatosPersonales,
  FilaHistorialCredito,
  FilaDetallesRCC,
  FilaVacia,
} from "./FilaProspecto";

/**
 * Hook personalizado para handlers comunes de tablas
 */
export const useTablaHandlers = (prospectos, prospectosSeleccionados, setState, state, agencias) => {
  const handleVerMas = (prospecto) => {
    setState({
      ...state,
      modalEditProspectos: true,
      contactado: prospecto.contactado,
      estado_id: prospecto.estado_id,
      prospecto_id: prospecto.prospecto_id,
      isUpdated: false,
      prospecto_nombre: prospecto.nombre,
      prospecto: prospecto,
    });
  };

  const handlePropuestaSolicitud = (prospecto) => {
    setState({
      ...state,
      modalSolicitud: true,
      gestor_id: prospecto.gestor_id,
      prospecto_id: prospecto.prospecto_id,
      agencias: agencias,
      prospecto_nombre: prospecto.nombre,
      prospecto_dni: prospecto.dni,
      estado_id: prospecto.estado_id,
      prospecto_razon_social_id: prospecto.razon_social_id,
    });
  };

  return { handleVerMas, handlePropuestaSolicitud };
};

/**
 * Tabla de Seguimiento (ahora incluye Celulares y Email)
 */
export const TablaSeguimiento = ({
  prospectos,
  instituciones,
  estado,
  loading,
  asignacionActiva,
  prospectosSeleccionados,
  onSelectAll,
  onCheckboxChange,
  onVerMas,
  onPropuestaSolicitud,
}) => {
  const allChecked = prospectosSeleccionados.length === prospectos.length && prospectos.length > 0;

  return (
    <div className="table-container" style={{ position: 'relative', minHeight: '400px' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10
        }}>
          <Loader />
        </div>
      )}
      <Table hover size="sm">
        <thead>
          <tr>
            {asignacionActiva && (
              <th>
                ASIGNAR
                <br />
                <input type="checkbox" onChange={onSelectAll} checked={allChecked} />
              </th>
            )}
            <th className="prospecto-dni">DNI</th>
            <th className="prospecto-nombre">Nombre</th>
            <th className="prospecto-convenio">Convenio</th>
            <th>Contactado</th>
            <th>Estado</th>
            <th className="prospecto-celular">Celulares</th>
            <th>Email</th>
            <th className="prospecto-gestor-asignado">Gestor Asignado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody style={{ opacity: loading ? 0.3 : 1 }}>
          {prospectos.length > 0 ? (
            prospectos.map((prospecto) => (
              <FilaSeguimiento
                key={prospecto.prospecto_id}
                prospecto={prospecto}
                instituciones={instituciones}
                estado={estado}
                mostrarCheckbox={asignacionActiva}
                onCheckboxChange={onCheckboxChange}
                isChecked={prospectosSeleccionados.includes(prospecto.prospecto_id)}
                onVerMas={onVerMas}
                onPropuestaSolicitud={onPropuestaSolicitud}
              />
            ))
          ) : (
            <FilaVacia colSpan={asignacionActiva ? "10" : "9"} />
          )}
        </tbody>
      </Table>
    </div>
  );
};

/**
 * Tabla de Datos Personales
 */
export const TablaDatosPersonales = ({
  prospectos,
  estadoCivil,
  contratoCondicion,
  formatoSoles,
  loading,
  onVerMas,
  onPropuestaSolicitud,
}) => {
  return (
    <div className="table-container" style={{ position: 'relative', minHeight: '400px' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10
        }}>
          <Loader />
        </div>
      )}
      <Table hover size="sm">
        <thead>
          <tr>
            <th rowSpan="2" className="prospecto-dni">DNI</th>
            <th rowSpan="2" className="prospecto-nombre">Nombre</th>
            <th colSpan="5">Información Personal</th>
            <th colSpan="3">Información Laboral</th>
            <th rowSpan="2">Acciones</th>
          </tr>
          <tr>
            <th>Edad</th>
            <th>Estado Civil</th>
            <th className="prospecto-direccion">Dirección</th>
            <th>Cons. Datos</th>
            <th>DNI Cónyuge</th>
            <th className="prospecto-cargo">Cargo</th>
            <th>Condición Laboral</th>
            <th>Rango de Ingresos</th>
          </tr>
        </thead>
        <tbody style={{ opacity: loading ? 0.3 : 1 }}>
          {prospectos.length > 0 ? (
            prospectos.map((prospecto) => (
              <FilaDatosPersonales
                key={prospecto.prospecto_id}
                prospecto={prospecto}
                estadoCivil={estadoCivil}
                contratoCondicion={contratoCondicion}
                formatoSoles={formatoSoles}
                onVerMas={onVerMas}
                onPropuestaSolicitud={onPropuestaSolicitud}
              />
            ))
          ) : (
            <FilaVacia colSpan="11" />
          )}
        </tbody>
      </Table>
    </div>
  );
};

/**
 * Tabla de Historial de Crédito
 */
export const TablaHistorialCredito = ({
  prospectos,
  buro,
  tipoCredito,
  formatoSoles,
  loading,
  onVerMas,
  onPropuestaSolicitud,
}) => {
  return (
    <div className="table-container" style={{ position: 'relative', minHeight: '400px' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10
        }}>
          <Loader />
        </div>
      )}
      <Table hover size="sm">
        <thead>
          <tr>
            <th rowSpan="2" className="prospecto-dni">DNI</th>
            <th rowSpan="2" className="prospecto-nombre">Nombre</th>
            <th rowSpan="2">Buro</th>
            <th rowSpan="2">Den. Def.</th>
            <th rowSpan="2">Deuda Caja</th>
            <th colSpan="4">Último Crédito</th>
            <th rowSpan="2">Part. Aval</th>
            <th rowSpan="2">Atraso Aval</th>
            <th colSpan="3">Saldo en Otras Entidades</th>
            <th rowSpan="2">Acciones</th>
          </tr>
          <tr>
            <th className="prospecto-tipo">Tipo</th>
            <th>Cuota</th>
            <th>Afecta Boleta</th>
            <th>Prom. Mora</th>
            <th>Cliente</th>
            <th>Cónyuge</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody style={{ opacity: loading ? 0.3 : 1 }}>
          {prospectos.length > 0 ? (
            prospectos.map((prospecto) => (
              <FilaHistorialCredito
                key={prospecto.prospecto_id}
                prospecto={prospecto}
                buro={buro}
                tipoCredito={tipoCredito}
                formatoSoles={formatoSoles}
                onVerMas={onVerMas}
                onPropuestaSolicitud={onPropuestaSolicitud}
              />
            ))
          ) : (
            <FilaVacia colSpan="15" />
          )}
        </tbody>
      </Table>
    </div>
  );
};

/**
 * Tabla de Detalles RCC
 */
export const TablaDetallesRCC = ({
  prospectos,
  formatoSoles,
  loading,
  onVerMas,
  onPropuestaSolicitud,
}) => {
  return (
    <div className="table-container" style={{ position: 'relative', minHeight: '400px' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10
        }}>
          <Loader />
        </div>
      )}
      <Table hover size="sm">
        <thead>
          <tr>
            <th rowSpan="2" className="prospecto-dni">DNI</th>
            <th rowSpan="2" className="prospecto-nombre">Nombre</th>
            <th colSpan="3">RCC Cliente</th>
            <th colSpan="3">RCC Cónyuge</th>
            <th rowSpan="2">Saldo Caja Total</th>
            <th rowSpan="2">Acciones</th>
          </tr>
          <tr>
            <th>Calificación</th>
            <th>N° Entidad</th>
            <th>Saldo Caja</th>
            <th>Calificación</th>
            <th>N° Entidad</th>
            <th>Saldo Caja</th>
          </tr>
        </thead>
        <tbody style={{ opacity: loading ? 0.3 : 1 }}>
          {prospectos.length > 0 ? (
            prospectos.map((prospecto) => (
              <FilaDetallesRCC
                key={prospecto.prospecto_id}
                prospecto={prospecto}
                formatoSoles={formatoSoles}
                onVerMas={onVerMas}
                onPropuestaSolicitud={onPropuestaSolicitud}
              />
            ))
          ) : (
            <FilaVacia colSpan="10" />
          )}
        </tbody>
      </Table>
    </div>
  );
};