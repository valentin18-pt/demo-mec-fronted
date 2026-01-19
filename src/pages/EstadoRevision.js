import React, { useState, useContext } from "react";
import { AppContext } from '../application/provider';
import "./EstadoRevision.css";
import { Container, Table, Button } from "reactstrap";
import PropuestaSolicitudService from "../axios_services/solicitud.service";
import ArchivoService from "../axios_services/archivos.service";
import ModalSeguimientoER from "../components/Modal/ModalSeguimientoER";
import ModalValidacionCaja from "../components/Modal/ModalValidacionCaja";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { RiDeleteBinFill } from '@remixicon/react';
import { SearchSelect, SearchSelectItem } from '@tremor/react';
import Loader from '../components/Loader/Loader';
import ButtonSearch from '../components/Buttons/ButtonSearch';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, FileMinus, RotateCcw, FileSpreadsheet, Banknote, ShieldCheck } from "lucide-react";
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';


function EstadoRevision() {
    const [state, setState] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [propuestas_solicitud, setPropuestasSolicitud] = useState([]);
    const [estado_revision, setEstadoRevision] = useState('');
    const [subgerente, setSubgerente] = useState('');
    const [gestor, setGestor] = useState('');
    const [supervisor, setSupervisor] = useState('');
    const [loadingTable, setLoadingTable] = useState(false);
    const [expedientillo, setExpedientillo] = useState(null);
    const [modalValidacionCajaOpen, setModalValidacionCajaOpen] = useState(false);
    const [propuestaSeleccionada, setPropuestaSeleccionada] = useState(null);
    const [fecha_min, setFechaMin] = useState(() => {
        const now = new Date();
        const primerDiaDelMes = new Date(now.getFullYear(), now.getMonth(), 1);
        return primerDiaDelMes.toISOString().split('T')[0];
    });
    const [fecha_max, setFechaMax] = useState(() => {
        const now = new Date();
        const ultimoDiaDelMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return ultimoDiaDelMes.toISOString().split('T')[0];
    });
    const [fecha_desembolso, setFechaDesembolso] = useState('');
    const [filtrosConsultados, setFiltrosConsultados] = useState({
        fecha_min: fecha_min,
        fecha_max: fecha_max,
        estado_revision: '',
        gestor: '',
        supervisor: '',
        subgerente: ''
    });
    const totalMontoBruto = propuestas_solicitud.reduce((acc, reporte) => acc + Number(reporte.monto_bruto_final || 0), 0);
    const totalMontoNeto = propuestas_solicitud.reduce((acc, reporte) => acc + Number(reporte.monto_neto_final || 0), 0);

    //CATALOGOS
    const [instituciones] = useState(state.catalogos.instituciones);
    const [buro] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 3 }));
    const [estados_ps] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 11 }));
    const [contrato_condicion] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 13 }));
    const [canal_captacion] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 14 }));
    const [estados_revision] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 12 }));
    const [tipos_desembolso] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 10 }));
    const [subgerentes] = useState(state.user.personal.filter(p => { return p.perfil_id == 6 }));
    const [supervisores] = useState(state.user.personal.filter(p => { return p.perfil_id == 3 }));
    const [gestores] = useState(state.user.personal.filter(p => { return p.perfil_id == 3 || p.perfil_id == 4 }));

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getComparableValue = (item, key) => {
        switch (key) {
            case 'canal_captacion_id':
                const canal = canal_captacion.find(i => i.tipo_id === item.canal_captacion_id);
                return canal ? canal.descripcion.toLowerCase() : '';
            case 'razon_social_id':
                const inst = instituciones.find(i => i.institucion_id === item.razon_social_id);
                return inst ? inst.razon_social.toLowerCase() : '';
            case 'contrato_condicion':
                const contrato = contrato_condicion.find(i => i.tipo_id === item.contrato_condicion);
                return contrato ? contrato.descripcion.toLowerCase() : '';
            case 'buro_id':
                const b = buro.find(i => i.tipo_id === item.buro_id);
                return b ? b.descripcion.toLowerCase() : '';
            case 'estado_id':
                const e = estados_ps.find(i => i.tipo_id === item.estado_id);
                return e ? e.descripcion.toLowerCase() : '';
            case 'desembolso_id':
                const t = tipos_desembolso.find(i => i.tipo_id === item.desembolso_id);
                return t ? t.descripcion.toLowerCase() : '';
            case 'estado_revision':
                return Number(item.estado_revision);
            case 'monto_bruto_final':
            case 'monto_neto_final':
                return item[key] ? Number(item[key]) : 0;
            case 'fecha_envio':
            case 'fecha_desembolso':
                return item[key] ? new Date(item[key]) : new Date(0);
            default:
                return item[key] ? item[key].toString().toLowerCase() : '';
        }
    };

    const sortedPropuestas = React.useMemo(() => {
        let sortableItems = [...propuestas_solicitud];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const valA = getComparableValue(a, sortConfig.key);
                const valB = getComparableValue(b, sortConfig.key);

                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [propuestas_solicitud, sortConfig]);

    const renderSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) return <FaSort className="text-gray-400" />;
        if (sortConfig.direction === 'ascending') return <FaSortUp className="text-blue-600" />;
        return <FaSortDown className="text-blue-600" />;
    };

    const SortableHeader = ({ label, sortKey, width }) => (
        <th
            onClick={() => requestSort(sortKey)}
            style={{
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minWidth: width,
                position: 'relative'
            }}
        >
            <div className="flex items-center justify-center relative w-full px-4">
                <span>{label}</span>
                <div className="absolute right-0">
                    {renderSortIcon(sortKey)}
                </div>
            </div>
        </th>
    );

    const handleButtonClick = async () => {
        await getReporteDesembolsados();
        setFiltrosConsultados({
            fecha_min,
            fecha_max,
            estado_revision,
            gestor,
            supervisor,
            subgerente
        });
    };

    const filtrosHanCambiado = () => {
        return (
            filtrosConsultados.fecha_min !== fecha_min ||
            filtrosConsultados.fecha_max !== fecha_max ||
            filtrosConsultados.estado_revision !== estado_revision ||
            filtrosConsultados.gestor !== gestor ||
            filtrosConsultados.supervisor !== supervisor ||
            filtrosConsultados.subgerente !== subgerente
        );
    };

    const getReporteDesembolsados = async () => {
        setLoadingTable(true);
        const data = await PropuestaSolicitudService.getReporteDesembolsados(state.user?.usuario_id, state.user?.perfil_id, fecha_min, fecha_max, estado_revision, gestor, supervisor, subgerente);
        setPropuestasSolicitud(data);
        setLoadingTable(false);
    };

    const deletePropuestaSolicitud = async (propuesta_solicitud_id, prospecto_id, n_solicitud) => {
        try {
            const data = await PropuestaSolicitudService.deletePropuestaSolicitud(propuesta_solicitud_id, prospecto_id, n_solicitud, state.user?.usuario_id);
            await getReporteDesembolsados();
            await alert('Desembolso eliminado con éxito');
        } catch (error) {
            console.error('Error en la solicitud de eliminación:', error);
            alert('Hubo un error al eliminar el desembolso');
        }
    };

    const formatoSSoles = (monto) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(monto);
    };

    const mostrarModalValidacionCaja = (propuesta) => {
        setPropuestaSeleccionada(propuesta);
        setModalValidacionCajaOpen(true);
    };

    const cerrarModalValidacionCaja = () => {
        setModalValidacionCajaOpen(false);
        setPropuestaSeleccionada(null);
    };

    const onValidacionComplete = async () => {
        await getReporteDesembolsados();
    };

    const formatearAlerta = (alertaTexto) => {
        if (!alertaTexto) return "ALERTA ⚠️";
        const lineas = alertaTexto.split(',').map(linea => linea.trim()).filter(linea => linea);
        return (
            <div className="alerta-formateada">
                ALERTA ⚠️<br />
                {lineas.map((linea, index) => (
                    <span key={index}>{linea}</span>
                ))}
            </div>
        );
    };

    const generarExcel = async (data, fields, nombreArchivo = "Exportacion.xlsx", nombreHoja = "Datos") => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(nombreHoja);

        worksheet.columns = fields.map(field => ({
            header: field.header,
            key: field.key,
            width: field.width || 20,
            style: {
                font: { name: 'Calibri', size: 11 },
                alignment: { vertical: 'middle', horizontal: 'left' }
            }
        }));

        const columnasMoneda = ['monto_bruto_final', 'monto_neto_final'];
        const columnasTexto = ['celular', 'tasa', 'plazo'];

        data.forEach(item => {
            const row = {};
            fields.forEach(field => {
                const key = field.key;

                if (key === 'razon_social_id' || key === 'convenio') {
                    const institucion = instituciones.find(i => i.institucion_id === item.razon_social_id);
                    row[key] = institucion ? institucion.razon_social : 'N/A';

                } else if (key === 'canal_captacion_id') {
                    const canal = canal_captacion.find(c => c.tipo_id === item[key]);
                    row[key] = canal ? canal.descripcion : 'N/A';

                } else if (key === 'contrato_condicion') {
                    const contrato = contrato_condicion.find(c => c.tipo_id === item[key]);
                    row[key] = contrato ? contrato.descripcion : 'N/A';

                } else if (key === 'buro_id') {
                    const b = buro.find(c => c.tipo_id === item[key]);
                    row[key] = b ? b.descripcion : 'N/A';

                } else if (key === 'estado_ps') {
                    const e = estados_ps.find(c => c.tipo_id === item[key]);
                    row[key] = e ? e.descripcion : 'N/A';

                } else if (key === 'desembolso_id') {
                    const t = tipos_desembolso.find(c => c.tipo_id === item[key]);
                    row[key] = t ? t.descripcion : 'N/A';

                } else if (key === 'estado_revision') {
                    const r = estados_revision.find(c => c.tipo_id === item[key]);
                    row[key] = r ? r.descripcion : 'PENDIENTE';

                } else if (columnasMoneda.includes(key)) {
                    row[key] = Number(item[key]) || 0;

                } else if (columnasTexto.includes(key)) {
                    row[key] = item[key] !== null && item[key] !== undefined ? `${item[key]}` : '';

                } else {
                    row[key] = item[key];
                }
            });

            const excelRow = worksheet.addRow(row);

            columnasTexto.forEach(colKey => {
                const colIndex = fields.findIndex(f => f.key === colKey);
                if (colIndex >= 0) {
                    const cell = excelRow.getCell(colIndex + 1);
                    cell.value = `${row[colKey]}`;
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                }
            });
        });

        const headerRow = worksheet.getRow(1);
        headerRow.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 20;
        headerRow.eachCell(cell => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1F497D' }
            };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
        });

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;

            if (rowNumber % 2 === 0) {
                row.eachCell(cell => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF2F2F2' }
                    };
                });
            }

            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
                };

                const colKey = worksheet.columns[colNumber - 1].key;
                if (columnasMoneda.includes(colKey) || colKey === 'plazo' || colKey === 'tasa') {
                    cell.alignment = { vertical: 'middle', horizontal: 'right' };
                } else if (colKey === 'celular') {
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                } else {
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                }
            });
        });

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            row.eachCell((cell, colNumber) => {
                const colKey = worksheet.columns[colNumber - 1].key;
                if (columnasMoneda.includes(colKey)) {
                    cell.numFmt = '"S/ "#,##0.00';
                }
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        saveAs(blob, nombreArchivo);
    };



    const exportarDatosCompletos = () => {
        let fieldsToExport;
        fieldsToExport = [
            { key: 'n_solicitud', header: 'N° de solicitud' },
            { key: 'zonal', header: esAntesDe2026() ? 'Zonal' : 'Subgerente de Negocios' },
            { key: 'supervisor', header: 'Supervisor' },
            { key: 'asesor', header: 'Gestor de ventas' },
            { key: 'fecha_envio', header: 'Fecha de envío' },
            { key: 'dni', header: 'DNI' },
            { key: 'nombre', header: 'Apellidos y nombres' },
            { key: 'celular', header: 'Celular' },
            { key: 'canal_captacion_id', header: 'Canal de captación' },
            { key: 'contrato_condicion', header: 'Condición laboral' },
            { key: 'buro_id', header: 'Buro' },
            { key: 'monto_bruto_final', header: 'Monto bruto' },
            { key: 'monto_neto_final', header: 'Monto neto' },
            { key: 'plazo', header: 'Plazo' },
            { key: 'tasa', header: 'Tasa' },
            { key: 'estado_ps', header: 'Estado' },
            { key: 'asesor_agencia', header: 'Asesor de agencia' },
            { key: 'agencia', header: 'Agencia' },
            { key: 'distrito', header: 'Distrito' },
            { key: 'provincia', header: 'Provincia' },
            { key: 'departamento', header: 'Departamento' },
            { key: 'zona', header: 'Zona' },
            { key: 'desembolso_id', header: 'Tipo de desembolso' },
            { key: 'fecha_desembolso', header: 'Fecha de desembolso' },
            { key: 'estado_revision', header: 'Estado de Validacion' }
        ];
        generarExcel(propuestas_solicitud, fieldsToExport, "Desembolsos.xlsx", "Desembolsos");
    };

    const exportarCajaExcel = () => {
        const fields = [
            { key: 'dni', header: 'DNI', width: 12 },
            { key: 'nombre', header: 'Apellidos y nombres', width: 35 },
            { key: 'distrito', header: 'Distrito', width: 20 },
            { key: 'celular', header: 'Celular', width: 12 },
            { key: 'fecha_desembolso', header: 'Fecha de desembolso', width: 18 },
            { key: 'monto_neto_final', header: 'Monto de Desembolso', width: 18 },
            { key: 'tasa', header: 'Tasa', width: 10 },
            { key: 'plazo', header: 'Plazo', width: 10 },
            { key: 'agencia', header: 'Agencia', width: 25 },
            { key: 'convenio', header: 'Nombre de Convenio', width: 30 },
            { key: 'estado_revision', header: 'Estado de Validación', width: 25 }
        ];
        generarExcel(propuestas_solicitud, fields, "Caja.xlsx", "Caja");
    };

    function mostrarModalSeguimientoER(propuesta) {
        setState({
            ...state,
            modalSeguimientoER: true,
            propuesta_solicitud: propuesta,
            isUpdated: false,
        })
    };

    const handleVerExpedientillo = async (propuesta_solicitud_id) => {
        try {
            const expedientillo = await ArchivoService.getExpedientillo(propuesta_solicitud_id);
            window.open(expedientillo.url_completa, "_blank", "noopener,noreferrer");
        } catch (error) {
            console.error("Error trayendo expedientillo:", error);
            alert("Este desembolso no tiene expedientillo.");
        }
    };

    const esAntesDe2026 = () => {
        if (!fecha_min && !fecha_max) return false;
        const inicioDe2026 = new Date('2026-01-01');
        const fechaConsulta = new Date(fecha_max || fecha_min);
        return fechaConsulta < inicioDe2026;
    };

    React.useEffect(() => {
        if (state.isUpdated === true) {
            const fetchData = async () => {
                await getReporteDesembolsados();
            };
            fetchData();
        }
    }, [state.isUpdated]);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await getReporteDesembolsados();
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <>
            {loading
                ? (<Loader />)
                : (<Container>
                    <div className="flex items-center justify-between mb-4">
                        <h1>
                            REPORTE DE DESEMBOLSOS
                        </h1>
                        <div className="flex items-center gap-x-4">
                            {[1, 6, 8, 7, 9, 10, 20].includes(Number(state.user?.perfil_id)) && (
                                <Button
                                    onClick={() => exportarCajaExcel()}
                                    className="flex items-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-semibold shadow transition"
                                >
                                    <Banknote className="w-4 h-4" />
                                    Exportar Caja
                                </Button>
                            )}
                            {[1, 6, 8, 9, 10].includes(Number(state.user?.perfil_id)) && (
                                <Button
                                    onClick={() => exportarDatosCompletos()}
                                    className="flex items-center gap-2 rounded-2xl bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-xs font-semibold shadow transition"
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    Exportar Data
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="filtros">
                        <div>
                            <label htmlFor="dni">Estado de revisión:</label>
                            <SearchSelect
                                id="zonal"
                                name="estado_revision_id"
                                className="search_select"
                                value={estado_revision}
                                onValueChange={(value) => setEstadoRevision(value)}
                                placeholder="Seleccione..."
                            >
                                <SearchSelectItem value="0" className="search_select"> PENDIENTE </SearchSelectItem>
                                {estados_revision.map((item) => (
                                    <SearchSelectItem key={item.tipo_id} value={item.tipo_id} className="search_select">
                                        {item.descripcion}
                                    </SearchSelectItem>
                                ))}
                            </SearchSelect>
                        </div>
                        <div>
                            <label htmlFor="dni">Fecha de desembolso (Min):</label>
                            <input
                                id="fecha"
                                type="date"
                                value={fecha_min}
                                onChange={(e) => setFechaMin(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="dni">Fecha de desembolso (Max):</label>
                            <input
                                id="fecha"
                                type="date"
                                value={fecha_max}
                                onChange={(e) => setFechaMax(e.target.value)}
                            />
                        </div>
                        {(Number(state.user?.perfil_id) === 1 || Number(state.user?.perfil_id) === 6 || Number(state.user?.perfil_id) === 8) && Number(state.user?.perfil_id) !== 7 && Number(state.user?.perfil_id) !== 20 && (<div>
                            <label>{esAntesDe2026() ? 'Zonal:' : 'Subgerente de Negocios:'}</label>
                            <SearchSelect
                                name="subgerente"
                                className="search_select"
                                value={subgerente}
                                onValueChange={(value) => setSubgerente(value)}
                                placeholder="Seleccione..."
                            >
                                {subgerentes.map((item) => (
                                    <SearchSelectItem key={item.usuario_id} value={item.usuario_id} className="search_select">
                                        {item.nombre_completo_usuario.toUpperCase()}
                                    </SearchSelectItem>
                                ))}
                            </SearchSelect>
                        </div>)}
                        {Number(state.user?.perfil_id) !== 3 && Number(state.user?.perfil_id) !== 4 && Number(state.user?.perfil_id) !== 7 && Number(state.user?.perfil_id) !== 20 && (<div>
                            <label>Supervisor:</label>
                            <SearchSelect
                                id="supervisor"
                                className="search_select"
                                value={supervisor}
                                onValueChange={(value) => setSupervisor(value)}
                                placeholder="Seleccione..."
                            >
                                {supervisores
                                    .filter(supervisor => subgerente === '' || Number(supervisor.zonal_id) === Number(subgerente))
                                    .map((supervisor) => (
                                        <SearchSelectItem key={supervisor.usuario_id} value={supervisor.usuario_id} className="search_select">
                                            {supervisor.nombre_completo_usuario.toUpperCase()}
                                        </SearchSelectItem>
                                    ))}
                            </SearchSelect>
                        </div>)}
                        {Number(state.user?.perfil_id) !== 4 && Number(state.user?.perfil_id) !== 7 && Number(state.user?.perfil_id) !== 20 && (<div>
                            <label>Gestor:</label>
                            <SearchSelect
                                id="gestor"
                                className="search_select"
                                value={gestor}
                                onValueChange={(value) => setGestor(value)}
                                placeholder="Seleccione..."
                            >
                                {gestores
                                    .filter(gestor => subgerente === '' || gestor.zonal_id === subgerente)
                                    .filter(gestor => supervisor === '' || gestor.supervisor_id === supervisor || gestor.usuario_id === supervisor)
                                    .map((gestor) => (
                                        <SearchSelectItem key={gestor.usuario_id} value={gestor.usuario_id} className="search_select">
                                            {gestor.nombre_completo_usuario.toUpperCase()}
                                        </SearchSelectItem>
                                    ))}
                            </SearchSelect>
                        </div>)}
                    </div>
                    {loadingTable ? (
                        <Loader />
                    ) : (<>
                        <div>
                            <ButtonSearch
                                onClick={handleButtonClick}
                                isLoading={loadingTable}
                            />
                        </div>
                        <div className="numero-propuestas">
                            <p>N° de operaciones: {propuestas_solicitud.length}</p>
                            <p>Monto bruto total: {formatoSSoles(totalMontoBruto)}</p>
                            <p>Monto neto total: {formatoSSoles(totalMontoNeto)}</p>
                        </div>
                        <div className="table-container-estado-revision table-container">
                            <Table id="data-estado-revision">
                                <thead>
                                    <tr>
                                        {[6, 8, 9].includes(Number(state.user?.perfil_id)) && (<th> </th>)}
                                        {Number(state.user?.perfil_id) !== 7 && Number(state.user?.perfil_id) !== 20 && (<SortableHeader label="N° de solicitud" sortKey="n_solicitud" />)}
                                        {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<SortableHeader label={esAntesDe2026() ? 'Zonal' : 'Subgerente de Negocios'} sortKey="zonal" />)}
                                        {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<SortableHeader label="Supervisor" sortKey="supervisor" />)}
                                        {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<SortableHeader label="Gestor de ventas" sortKey="asesor" />)}
                                        {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<SortableHeader label="Fecha de envío" sortKey="fecha_envio" />)}
                                        <SortableHeader label="DNI" sortKey="dni" />
                                        <SortableHeader label="Apellidos y nombres" sortKey="nombre" width="200px" />
                                        <SortableHeader label="Celular" sortKey="celular" />
                                        {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<SortableHeader label="Canal de captación" sortKey="canal_captacion_id" width="150px" />)}
                                        <SortableHeader label="Convenio" sortKey="razon_social_id" width="150px" />
                                        {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<SortableHeader label="Condición laboral" sortKey="contrato_condicion" />)}
                                        {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<SortableHeader label="Buro" sortKey="buro_id" />)}
                                        <SortableHeader label="Monto bruto" sortKey="monto_bruto_final" />
                                        <SortableHeader label="Monto neto" sortKey="monto_neto_final" />
                                        <SortableHeader label="Plazo" sortKey="plazo" />
                                        <SortableHeader label="Tasa" sortKey="tasa" />
                                        {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<SortableHeader label="Estado" sortKey="estado_id" />)}
                                        {![6, 10, 9].includes(Number(state.user?.perfil_id)) && (<SortableHeader label="Asesor de agencia" sortKey="asesor_agencia" />)}
                                        <SortableHeader label="Agencia" sortKey="agencia" />
                                        {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<SortableHeader label="Distrito" sortKey="distrito" />)}
                                        {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<SortableHeader label="Provincia" sortKey="provincia" />)}
                                        {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<SortableHeader label="Departamento" sortKey="departamento" />)}
                                        {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<SortableHeader label="Zona" sortKey="zona" />)}
                                        <SortableHeader label="Tipo de desembolso" sortKey="desembolso_id" width="150px" />
                                        <SortableHeader label="Fecha de desembolso" sortKey="fecha_desembolso" width="120px" />
                                        <th>Expedientillo</th>
                                        <SortableHeader label="Estado de Validación" sortKey="estado_revision" />
                                        {[6, 7, 20, 8, 9].includes(Number(state.user?.perfil_id)) && (<th>Acciones</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedPropuestas.length === 0 ? (
                                        <tr>
                                            <td colSpan="27" className="sin-data">Sin desembolsos</td>
                                        </tr>
                                    ) : (sortedPropuestas.map((propuesta, index) => (
                                        <tr
                                            key={index}
                                            className={
                                                Number(propuesta.estado_revision) === 0
                                                    ? 'estado-0'
                                                    : Number(propuesta.estado_revision) === 1
                                                        ? 'estado-1'
                                                        : Number(propuesta.estado_revision) === 2
                                                            ? 'estado-2'
                                                            : Number(propuesta.estado_revision) === 3
                                                                ? 'estado-3'
                                                                : Number(propuesta.estado_revision) === 4
                                                                    ? 'estado-4'
                                                                    : ''
                                            }
                                        >
                                            {[6, 8, 9].includes(Number(state.user?.perfil_id)) && (
                                                <td>
                                                    <Button
                                                        disabled={Number(propuesta.estado_revision) !== 0}
                                                        onClick={() => {
                                                            const confirmDelete = window.confirm(`¿Está seguro de eliminar el desembolso n° ${propuesta.n_solicitud}?`);
                                                            if (confirmDelete) { deletePropuestaSolicitud(propuesta.propuesta_solicitud_id, propuesta.prospecto_id, propuesta.n_solicitud); }
                                                        }}>
                                                        <RiDeleteBinFill size={20}
                                                            color={Number(propuesta.estado_revision) !== 0 ? 'gray' : 'red'}
                                                            style={{ marginRight: '8px', opacity: Number(propuesta.estado_revision) === 0 ? 0.5 : 1 }} />
                                                    </Button>
                                                </td>)}
                                            {Number(state.user?.perfil_id) !== 7 && Number(state.user?.perfil_id) !== 20 && (<td>{propuesta.n_solicitud ? propuesta.n_solicitud : 'N/A'}</td>)}
                                            {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<td>{propuesta.zonal ? propuesta.zonal.toUpperCase() : 'N/A'}</td>)}
                                            {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<td>{propuesta.supervisor ? propuesta.supervisor.toUpperCase() : 'N/A'}</td>)}
                                            {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<td>{propuesta.asesor ? propuesta.asesor.toUpperCase() : 'N/A'}</td>)}
                                            {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<td>{propuesta.fecha_envio ? new Date(propuesta.fecha_envio).toISOString().split('T')[0] : 'N/A'}</td>)}
                                            <td>{propuesta.dni ? propuesta.dni : 'N/A'}</td>
                                            <td>{propuesta.nombre ? propuesta.nombre : 'N/A'}</td>
                                            <td>{propuesta.celular ? propuesta.celular : 'N/A'}</td>
                                            {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<td>
                                                {canal_captacion.find(item => item.tipo_id === propuesta.canal_captacion_id)
                                                    ? canal_captacion.find(item => item.tipo_id === propuesta.canal_captacion_id).descripcion
                                                    : 'N/A'}
                                            </td>)}
                                            <td>
                                                {instituciones.find(item => item.institucion_id === propuesta.razon_social_id)
                                                    ? instituciones.find(item => item.institucion_id === propuesta.razon_social_id).razon_social
                                                    : 'N/A'}
                                            </td>
                                            {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<td>
                                                {contrato_condicion.find(item => item.tipo_id === propuesta.contrato_condicion)
                                                    ? contrato_condicion.find(item => item.tipo_id === propuesta.contrato_condicion).descripcion
                                                    : 'N/A'}
                                            </td>)}
                                            {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<td>
                                                {buro.find(item => item.tipo_id === propuesta.buro_id)
                                                    ? buro.find(item => item.tipo_id === propuesta.buro_id).descripcion
                                                    : 'N/A'}
                                            </td>)}
                                            <td>{propuesta.monto_bruto_final ? formatoSSoles(propuesta.monto_bruto_final) : 'N/A'}</td>
                                            <td>{propuesta.monto_neto_final ? formatoSSoles(propuesta.monto_neto_final) : 'N/A'}</td>
                                            <td>{propuesta.plazo ? propuesta.plazo : 'N/A'}</td>
                                            <td>{propuesta.tasa ? propuesta.tasa : 'N/A'}</td>
                                            {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<td>
                                                {estados_ps.find(item => item.tipo_id === propuesta.estado_id)
                                                    ? estados_ps.find(item => item.tipo_id === propuesta.estado_id).descripcion
                                                    : 'N/A'}
                                            </td>)}
                                            {![9, 10, 6].includes(Number(state.user?.perfil_id)) && (<td>{propuesta.asesor_agencia ? propuesta.asesor_agencia : 'N/A'}</td>)}
                                            <td>{propuesta.agencia ? propuesta.agencia : 'N/A'}</td>
                                            {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<td>{propuesta.distrito ? propuesta.distrito.toUpperCase() : 'N/A'}</td>)}
                                            {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<td>{propuesta.provincia ? propuesta.provincia.toUpperCase() : 'N/A'}</td>)}
                                            {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<td>{propuesta.departamento ? propuesta.departamento.toUpperCase() : 'N/A'}</td>)}
                                            {![7, 20, 9, 10].includes(Number(state.user?.perfil_id)) && (<td>{propuesta.zona ? propuesta.zona : 'N/A'}</td>)}
                                            <td>
                                                {tipos_desembolso.find(item => item.tipo_id === propuesta.desembolso_id)
                                                    ? tipos_desembolso.find(item => item.tipo_id === propuesta.desembolso_id).descripcion
                                                    : 'N/A'}
                                            </td>
                                            <td>{propuesta.fecha_desembolso ? propuesta.fecha_desembolso : 'N/A'}</td>
                                            <td className="px-4 py-2 border border-gray-200 text-center">
                                                {propuesta.tiene_expedientillo === '1' ? (
                                                    <button
                                                        onClick={() => handleVerExpedientillo(propuesta.propuesta_solicitud_id)}
                                                        className="expediente-disponible cursor-pointer bg-transparent border-0 p-0"
                                                        title="Expedientillo adjuntado - haz clic para ver"
                                                        type="button"
                                                    >
                                                        <FileMinus size={20} />
                                                    </button>
                                                ) : (
                                                    <FileMinus
                                                        size={20}
                                                        className="expediente-faltante"
                                                        title="Expedientillo no adjuntado"
                                                    />
                                                )}
                                            </td>
                                            <td className="estado-validacion-cell">
                                                {Number(propuesta.estado_revision) === 0 && "PENDIENTE"}
                                                {Number(propuesta.estado_revision) === 1 && "VALIDADO POR GERENCIA GENERAL"}
                                                {Number(propuesta.estado_revision) === 2 && formatearAlerta(propuesta.alerta)}
                                                {Number(propuesta.estado_revision) === 3 && (esAntesDe2026() ? "VALIDADO POR ZONAL" : "VALIDADO POR SUBGERENTE DE NEGOCIOS")}
                                                {Number(propuesta.estado_revision) === 4 && "VALIDADO POR CAJA"}
                                            </td>
                                            {[6, 7, 20, 8, 9].includes(Number(state.user?.perfil_id)) && (
                                                <td>
                                                    {(Number(propuesta.estado_revision) === 0 && Number(state.user?.perfil_id) === 6) && (
                                                        <Button
                                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm font-semibold rounded-lg shadow transition mb-2"
                                                            onClick={() => mostrarModalSeguimientoER(propuesta)}
                                                        >
                                                            <ShieldCheck className="w-4 h-4" />
                                                            Validar
                                                        </Button>
                                                    )}

                                                    {(Number(propuesta.estado_revision) === 2 && [6, 8, 9].includes(Number(state.user?.perfil_id))) && (
                                                        <Button
                                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm font-semibold rounded-lg shadow transition mb-2"
                                                            onClick={() => mostrarModalSeguimientoER(propuesta)}
                                                        >
                                                            <Edit2 className="w-4 h-4 mr-1" />
                                                            Editar
                                                        </Button>
                                                    )}

                                                    <div className="flex justify-center items-center">
                                                        {Number(propuesta.estado_revision) === 1 && (
                                                            <span className="text-2xl" title="Validado por Gerencia - Bloqueado">
                                                                🔒
                                                            </span>
                                                        )}
                                                        {Number(propuesta.estado_revision) === 3 && Number(state.user?.perfil_id) === 6 && (
                                                            <span className="text-2xl" title={esAntesDe2026() ? "Validado por Zonal - Bloqueado" : "Validado por Subgerente de Negocios - Bloqueado"}>
                                                                🔒
                                                            </span>
                                                        )}
                                                        {Number(propuesta.estado_revision) === 4 && [6, 8].includes(Number(state.user?.perfil_id)) && (
                                                            <span className="text-2xl" title="Validado por Caja - Bloqueado">
                                                                🔒
                                                            </span>
                                                        )}
                                                        {Number(propuesta.estado_revision) === 2 && Number(state.user?.perfil_id) === 20 && (
                                                            <span className="text-2xl" title="Alerta - Bloqueado">
                                                                🔒
                                                            </span>
                                                        )}
                                                        {Number(propuesta.estado_revision) === 4 && Number(state.user?.perfil_id) === 20 && (
                                                            <span className="text-2xl" title="Validado por Caja - Bloqueado">
                                                                🔒
                                                            </span>
                                                        )}
                                                    </div>

                                                    {([0, 3].includes(Number(propuesta.estado_revision)) && [7, 20, 8].includes(Number(state.user?.perfil_id))) && (
                                                        <Button
                                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm font-semibold rounded-lg shadow transition mb-2"
                                                            onClick={() => mostrarModalValidacionCaja(propuesta)}
                                                        >
                                                            <ShieldCheck className="w-4 h-4" />
                                                            Validar
                                                        </Button>
                                                    )}
                                                </td>)}
                                        </tr>
                                    )))}
                                </tbody>
                            </Table>

                            <ModalSeguimientoER
                                isOpen={state.modalSeguimientoER}
                            />

                            <ModalValidacionCaja
                                isOpen={modalValidacionCajaOpen}
                                onClose={cerrarModalValidacionCaja}
                                propuesta={propuestaSeleccionada}
                                onValidacionComplete={onValidacionComplete}
                                handleVerExpedientillo={handleVerExpedientillo}
                            />
                        </div>
                    </>)}
                </Container>)}
        </>
    );
}

export default EstadoRevision;