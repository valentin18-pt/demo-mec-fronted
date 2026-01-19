import React, { useState, useEffect, useRef } from 'react';
import UsuarioService from "../axios_services/usuarios.service";
import BarChartIngresosCeses from '../components/BarChart/BarChartIngresosCeses';
import BarChartHistorialUsuarios from '../components/BarChart/BarChartHistorialUsuarios';
import { Button } from "reactstrap";
import { Card, SearchSelect, SearchSelectItem } from '@tremor/react';
import { Users , BarChart2, Plus, X, CheckCircle, XCircle, Activity, ArrowRightLeft  } from 'lucide-react';

import "./DashboardAdministracion.css";
import "./Usuarios.css";

function DashboardAdministracion() {
    const [años, setAños] = useState([{ año: new Date().getFullYear(), mes: null }]);
    const [añosHistorialUsuarios, setAñosHistorialUsuarios] = useState([{ año: new Date().getFullYear(), mes: null }]);
    const [loadingIngresosCeses, setLoadingIngresosCeses] = useState(false);
    const [loadingHistorialUsuarios, setLoadingHistorialUsuarios] = useState(false);
    const [reporteCesesIngresos, setReporteCesesIngresos] = useState(null);
    const [reporteCantidadUsuarios, setReporteCantidadUsuarios] = useState(null);
    const isFirstRender = useRef(true);

    const getHistorialCesesIngresos = async () => {
        try {
        setLoadingIngresosCeses(true);
        const data = await UsuarioService.getHistorialCesesIngresos(años);
        setReporteCesesIngresos(data);
        } catch (error) {
        console.error("Error al obtener historial:", error);
        } finally {
        setLoadingIngresosCeses(false);
        }
    };

    const getCantidadUsuariosPorPeriodo = async () => {
        try {
        setLoadingHistorialUsuarios(true);
        const data = await UsuarioService.getCantidadUsuariosPorPeriodo(añosHistorialUsuarios);
        setReporteCantidadUsuarios(data);
        } catch (error) {
        console.error("Error al obtener historial:", error);
        } finally {
        setLoadingHistorialUsuarios(false);
        }
    };

    React.useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const fetchData = async () => {
            await Promise.all([
            getHistorialCesesIngresos(),
            getCantidadUsuariosPorPeriodo()
            ]);
        };
        fetchData();
    }, []);
    
    const calcularTotales = (data) => {
        if (!data) return { ingresos: 0, ceses: 0, balance: 0 };

        let totalIngresos = 0;
        let totalCeses = 0;

        Object.values(data).forEach((meses) => {
        meses.forEach(({ ingresos, ceses }) => {
            totalIngresos += Number(ingresos) || 0;
            totalCeses += Number(ceses) || 0;
        });
        });

        return {
        ingresos: totalIngresos,
        ceses: totalCeses,
        balance: totalIngresos - totalCeses,
        };
    };

    const totales = calcularTotales(reporteCesesIngresos);

    const handleButtonClick = async () => {
        await getHistorialCesesIngresos();
    };

    const handleButtonClickUsuarios = async () => {
        await getCantidadUsuariosPorPeriodo();
    };

    return (
    <>
    <h1>Dashboard de Administración</h1>
    <div className="contenedor-charts">
        <div className="chart-card chart-cantidad_usuarios">
            <div className="chart-header">
                <Users color='blue'/><h3>CANTIDAD DE USUARIOS</h3>
            </div>
            <div className="chart-filtros">
                {añosHistorialUsuarios.map((item, index) => (
                    <div key={index} className="filtro-item">
                    <div className="filtro-año-mes">
                        <input
                        type="number"
                        min="2024"
                        value={item.año}
                        onChange={(e) => {
                            const nuevos = [...añosHistorialUsuarios];
                            nuevos[index].año = e.target.value;
                            setAñosHistorialUsuarios(nuevos);
                        }}
                        placeholder="Año"
                        />
                        <SearchSelect
                        value={item.mes || ""}
                        onValueChange={(value) => {
                            const nuevos = [...añosHistorialUsuarios];
                            nuevos[index].mes = value === "" ? null : value;
                            setAñosHistorialUsuarios(nuevos);
                        }}
                        className="mes-select "
                        placeholder="Mes (Opcional)"
                        >
                        {Array.from({ length: 12 }, (_, i) => {
                            const numero = String(i + 1).padStart(2, '0');
                            const nombre = new Date(0, i).toLocaleString('es-ES', { month: 'long' });
                            return (
                            <SearchSelectItem key={numero} value={numero} className="search_select">
                                {nombre.charAt(0).toUpperCase() + nombre.slice(1)}
                            </SearchSelectItem>
                            );
                        })}
                        </SearchSelect>
                        {añosHistorialUsuarios.length > 1 && (
                            <Button
                                type="button"
                                className="boton-icono"
                                onClick={() => {
                                const nuevos = añosHistorialUsuarios.filter((_, i) => i !== index);
                                setAñosHistorialUsuarios(nuevos);
                                }}
                                title="Eliminar fecha"
                            >
                                <X size={18} />
                            </Button>
                        )}
                    </div>
                    </div>
                ))}
                <Button
                    type="button"
                    onClick={() => setAñosHistorialUsuarios([...añosHistorialUsuarios, { año: "", mes: null }])}
                    className="boton-icono"
                    title="Añadir nueva fecha"
                    >
                    <Plus size={20} />
                </Button>
                <Button
                    onClick={handleButtonClickUsuarios}
                    disabled={loadingHistorialUsuarios}
                    className="boton-filtrar"
                >
                    <BarChart2 size={16} />
                    {loadingHistorialUsuarios ? 'Cargando...' : 'Cargar Reporte'}
                </Button>
            </div>
            <div className="container-chart">
                {loadingHistorialUsuarios ? (
                    <div className="cargando">Cargando datos...</div>
                ) : (
                    <BarChartHistorialUsuarios
                    resumenData={reporteCantidadUsuarios}
                    style={{ width: "100%", height: "100%" }}
                    className="grafico-responsivo"
                    />
                )}
            </div>
            {/* <div className="cards-container">
                <Card className="card-green-custom ">
                <p>Ingresos Totales</p>
                <p className="amount">{totales.ingresos}</p>
                </Card>
                <Card className="card-red-custom ">
                <p>Ceses Totales</p>
                <p className="amount">{totales.ceses}</p>
                </Card>
                <Card className="card-blue-custom">
                <p>Balance Neto</p>
                <p className="amount">{totales.balance}</p>
                </Card>
            </div> */}
        </div>
        <div className="chart-card chart-ingresos-ceses">
            <div className="chart-header">
                <ArrowRightLeft color='blue'/><h3>INGRESOS VS CESES</h3>
            </div>
            <div className="chart-filtros">
                {años.map((item, index) => (
                    <div key={index} className="filtro-item">
                    <div className="filtro-año-mes">
                        <input
                        type="number"
                        min="2024"
                        value={item.año}
                        onChange={(e) => {
                            const nuevos = [...años];
                            nuevos[index].año = e.target.value;
                            setAños(nuevos);
                        }}
                        placeholder="Año"
                        />
                        <SearchSelect
                        value={item.mes || ""}
                        onValueChange={(value) => {
                            const nuevos = [...años];
                            nuevos[index].mes = value === "" ? null : value;
                            setAños(nuevos);
                        }}
                        className="mes-select "
                        placeholder="Mes (Opcional)"
                        >
                        {Array.from({ length: 12 }, (_, i) => {
                            const numero = String(i + 1).padStart(2, '0');
                            const nombre = new Date(0, i).toLocaleString('es-ES', { month: 'long' });
                            return (
                            <SearchSelectItem key={numero} value={numero} className="search_select">
                                {nombre.charAt(0).toUpperCase() + nombre.slice(1)}
                            </SearchSelectItem>
                            );
                        })}
                        </SearchSelect>
                        {años.length > 1 && (
                            <Button
                                type="button"
                                className="boton-icono"
                                onClick={() => {
                                const nuevos = años.filter((_, i) => i !== index);
                                setAños(nuevos);
                                }}
                                title="Eliminar fecha"
                            >
                                <X size={18} />
                            </Button>
                        )}
                    </div>
                    </div>
                ))}
                <Button
                    type="button"
                    onClick={() => setAños([...años, { año: "", mes: null }])}
                    className="boton-icono"
                    title="Añadir nueva fecha"
                    >
                    <Plus size={20} />
                </Button>
                <Button
                    onClick={handleButtonClick}
                    disabled={loadingIngresosCeses}
                    className="boton-filtrar"
                >
                    <BarChart2 size={16} />
                    {loadingIngresosCeses ? 'Cargando...' : 'Cargar Reporte'}
                </Button>
            </div>
            <div className="container-chart">
                {loadingIngresosCeses ? (
                    <div className="cargando">Cargando datos...</div>
                ) : (
                    <BarChartIngresosCeses
                    resumenData={reporteCesesIngresos}
                    style={{ width: "100%", height: "100%" }}
                    className="grafico-responsivo"
                    />
                )}
            </div>
            {/* <div className="cards-container">
                <Card className="card-green-custom ">
                <p>Ingresos Totales</p>
                <p className="amount">{totales.ingresos}</p>
                </Card>
                <Card className="card-red-custom ">
                <p>Ceses Totales</p>
                <p className="amount">{totales.ceses}</p>
                </Card>
                <Card className="card-blue-custom">
                <p>Balance Neto</p>
                <p className="amount">{totales.balance}</p>
                </Card>
            </div> */}
        </div>
            
        </div>
    </>
    
  );
}

export default DashboardAdministracion;
