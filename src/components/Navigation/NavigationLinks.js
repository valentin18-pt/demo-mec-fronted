import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home, LineChart, Settings, TrendingUp, UserPlus, ClipboardList, Wallet, Files,
  ArrowRightCircle, Target, CreditCard, FileSpreadsheet, BriefcaseBusiness, Users
} from 'lucide-react';


const navItems = [
  { to: "/home", label: "Home", icon: Home, allowed: "all" },
  { to: "/grafico_dashboard", label: "Dashboard Gerencial", icon: LineChart, allowed: [8, 6, 10, 9, 20] },
  { to: "/dashboard_administracion", label: "Dashboard Administración", icon: Settings, allowed: [8, 5, 10] },
  { to: "/graficos_colocaciones", label: "Avance de Colocaciones", icon: TrendingUp, allowed: [8, 3, 2, 1, 6, 10, 9, 13, 5] },
  { to: "/prospectos", label: "Data Prospectos", icon: UserPlus, allowed: [1, 2, 3, 4, 6, 8, 9, 10] },
  // { to: "/reportes", label: "Reportes", icon: ClipboardList, allowed: [1, 2, 3, 4, 6, 8, 9, 10] },
  { to: "/usuarios", label: "Usuarios", icon: Users, allowed: [5, 8, 11, 22] },
  { to: "/revision", label: "Reporte de desembolsos", icon: Wallet, allowed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20] },
  { to: "/solicitudes_extra", label: "Reporte de solicitudes extra", icon: Files, allowed: [1, 2, 3, 4, 6, 8, 9, 10] },
  { to: "/avances", label: "Avances", icon: ArrowRightCircle, allowed: [1, 2, 3, 4, 6, 8, 9, 10] },
  { to: "/asignacion_metas", label: "Asignacion de metas", icon: Target, allowed: [1, 2, 3, 6, 8, 9, 10] },
  { to: "/simulador_creditos", label: "Simulador de préstamos", icon: CreditCard, allowed: [1, 2, 3, 4, 6, 8, 9] },
  { to: "/planilla", label: "Planilla", icon: FileSpreadsheet, allowed: [5, 8, 10, 13, 22] },
  { to: "/recibo_honorarios", label: "Recibo por honorarios", icon: BriefcaseBusiness, allowed: [8, 5, 18, 19, 22] },
  { to: "/cargo_pago", label: "Cargo de Pago", icon: FileSpreadsheet, allowed: [5, 8, 10, 13, 22] },
  { to: "/inventario", label: "Inventario", icon: BriefcaseBusiness, allowed: [8, 10, 11, 12] },
  // { to: "/gastos_totales", label: "Gastos Totales", icon: BriefcaseBusiness, allowed: [8, 12, 13] },
  // { to: "/detalle_abc", label: "Detalle ABC", icon: BriefcaseBusiness, allowed: [8, 12, 13] },
  // { to: "/costos_abc", label: "Costos ABC", icon: BriefcaseBusiness, allowed: [8, 12, 13] },
  // { to: "/costos_directos", label: "Costos Directos", icon: BriefcaseBusiness, allowed: [8, 12, 13] },
  // { to: "/resumen_final", label: "Resumen Final", icon: BriefcaseBusiness, allowed: [8, 12, 13] },
  { to: "/caja_flujo_datos", label: "Flujo de Caja - Conceptos", icon: BriefcaseBusiness, allowed: [8, 12, 21] },
  { to: "/caja_financiero_movimiento", label: "Flujo de Caja - Movimiento", icon: BriefcaseBusiness, allowed: [8, 10, 12, 21] },
  { to: "/caja_financiero_reporte", label: "Flujo de Caja - Resumen", icon: BriefcaseBusiness, allowed: [8, 10, 12, 21] },
  // { to: "/viatico-detalle-pasaje", label: "Detalle de Pasaje", icon: BriefcaseBusiness, allowed: [8, 12, 21] },
  // { to: "/viatico-solicitud", label: "Solicitud de Viaticos", icon: BriefcaseBusiness, allowed: [8, 12, 21] },
  { to: "/seguimiento-desembolsos", label: "Seguimiento de Desembolsos", icon: BriefcaseBusiness, allowed: [8, 23, 1, 2, 6] },
  { to: "/comisiones-desembolsos", label: "Comisiones Comercial", icon: BriefcaseBusiness, allowed: [8] },
];

const NavigationLinks = ({ perfilId, linkClassName = "", paginate = false, isCollapsed }) => {
  const id = Number(perfilId);
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(0);

  const allowedLinks = navItems.filter(
    (item) => item.allowed === "all" || item.allowed.includes(id)
  );

  const totalPages = Math.ceil(allowedLinks.length / itemsPerPage);

  const paginatedLinks = paginate
    ? allowedLinks.slice(
        currentPage * itemsPerPage,
        currentPage * itemsPerPage + itemsPerPage
      )
    : allowedLinks;

  return (
    <nav>
      <ul>
        {paginatedLinks.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              onClick={(e) => {
                if (window.location.pathname === item.to) {
                  e.preventDefault();
                }
              }}
                          className={({ isActive }) =>
                `${linkClassName} ${isActive ? "active" : ""}`
              }
            >
              {isCollapsed ? (
                item.icon && <item.icon size={20} />
              ) : (
                <>
                  <span className="nav-link-label">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {paginate && totalPages > 1 && (
        <div className="pagination-dots">
          {Array.from({ length: totalPages }).map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentPage ? "active" : ""}`}
              onClick={() => setCurrentPage(index)}
            >
              •
            </span>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavigationLinks;