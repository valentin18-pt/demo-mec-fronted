import { Table, Button } from "reactstrap";
import React, { useState, useContext, useRef, useEffect } from "react";
import { AppContext } from '../application/provider';
import ModalEstadoPago from "../components/Modal/ModalEstadoPago";
import PlanillaService from "../axios_services/planilla.service";
import ArchivoService from "../axios_services/archivos.service";
import {FileMinus} from "lucide-react";
import Loader from "../components/Loader/Loader";
import ButtonUpdate from "../components/Buttons/ButtonUpdate";
import { ButtonExcel, ButtonSearch } from '../components/Buttons/Buttons';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import "./CargoPago.css";

function CargoPago() {
    const [periodo_fecha, setPeriodoFecha] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [periodo_consultado, setPeriodoConsultado] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [periodo_pago, setPeriodoPago] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [usuarios, setUsuarios] = useState([]);
    const [cargo_pago, setCargoPago] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingDocumento, setLoadingDocumento] = useState({ usuarioId:null});
    const [state,setState] = useContext(AppContext);
    const isFirstRender = useRef(true);
    const [entidades_financieras] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 25}));
    const [estados_pago] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 32}));

    const meses = {
        '01': 'ENERO', '02': 'FEBRERO', '03': 'MARZO', '04': 'ABRIL',
        '05': 'MAYO', '06': 'JUNIO', '07': 'JULIO', '08': 'AGOSTO',
        '09': 'SETIEMBRE', '10': 'OCTUBRE', '11': 'NOVIEMBRE', '12': 'DICIEMBRE'
    };

    const getCargoPago = async () => {
        setLoading(true);
        try {
            const response = await PlanillaService.getCargoPago(periodo_fecha);
            setCargoPago(response);
        } catch (error) {
            console.error('Error al obtener datos de planilla:', error);
            setCargoPago([]);
        } finally {
            setLoading(false);
        }
    };

    const formatoSoles = (valor) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(valor || 0);
    };

    const handleButtonClick = async () => {
        setPeriodoConsultado(periodo_fecha);
        await getCargoPago();
    };

    const handleVerReciboHonorarios = async (usuario_id, periodo_fecha) => {
        try {
            const recibo_honorarios = await ArchivoService.getReciboPorHonorarios(usuario_id, periodo_fecha);
            window.open(recibo_honorarios.url_completa, "_blank", "noopener,noreferrer");
        } catch (error) {
            console.error("Error trayendo recibo por honorarios:", error);
            alert("Hubo un error al cargar el recibo por honorarios.");
        }
    };

    const mostrarModalEstadoPago = (cargo_pago) => {
        setState({ 
            ...state, 
            modalEstadoPago: true, 
            cargo_pago: cargo_pago,
            isUpdated: false
        });
    };

    const getNombreMesActual = () => {
        const [year, month] = periodo_fecha.split('-');
        return meses[month] || '';
    };

    const getNombreMesAnterior = () => {
        const [year, month] = periodo_fecha.split('-');
        const mesNum = parseInt(month);
        const mesAnterior = mesNum === 1 ? 12 : mesNum - 1;
        const mesPadded = String(mesAnterior).padStart(2, '0');
        return meses[mesPadded] || '';
    };

    const exportarAExcel = async () => {
        if (cargo_pago.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Cargo de Pago');

        const [year, month] = periodo_fecha.split('-');
        const mesActual = meses[month];
        const mesAnterior = getNombreMesAnterior();

        worksheet.mergeCells('A1:Q1');
        const empresaCell = worksheet.getCell('A1');
        empresaCell.value = 'MEC BUSINNES PARTNER S.A.C.';
        empresaCell.font = { name: 'Calibri', size: 14, bold: true };
        empresaCell.alignment = { vertical: 'middle', horizontal: 'left' };
        empresaCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' }
        };

        worksheet.mergeCells('A2:Q2');
        const rucCell = worksheet.getCell('A2');
        rucCell.value = '20612796484';
        rucCell.font = { name: 'Calibri', size: 12, bold: true };
        rucCell.alignment = { vertical: 'middle', horizontal: 'left' };
        rucCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' }
        };

        worksheet.mergeCells('A3:Q3');
        const tituloCell = worksheet.getCell('A3');
        tituloCell.value = `CARGO DE PAGO - PRODUCCIÓN ${mesActual} ${year}`;
        tituloCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF000000' } };
        tituloCell.alignment = { vertical: 'middle', horizontal: 'center' };
        tituloCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF92D050' }
        };
        tituloCell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        worksheet.getRow(3).height = 25;

        const headers = [
            'N°',
            'APELLIDOS Y NOMBRES',
            'CARGO',
            `TOTAL A PAGAR PRODUCCIÓN ${mesActual}`,
            `Monto a regularizar del mes de ${mesAnterior}`,
            'DESCUENTO POR SALDO PENDIENTE',
            'DESCUENTO POR CANCELACION',
            'DESCUENTO POR DOC. OBSERVADO',
            'RxH',
            'IMPORTE NETO A PAGAR',
            'N° DNI',
            'N° CUENTA',
            'N° CUENTA INTERBANCARIA',
            'ENTIDAD BANCARIA',
            'ESTADO',
            'FECHA DE CESE',
            'FECHA DE PAGO'
        ];

        worksheet.getRow(4).values = headers;

        const headerRow = worksheet.getRow(4);
        headerRow.font = { name: 'Calibri', size: 11, bold: true };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        headerRow.height = 30;

        const headerColors = {
            'A4': 'FFFFC000',
            'B4': 'FFFFC000',
            'C4': 'FFFFC000',
            'D4': 'FFCC99FF',
            'E4': 'FFCC99FF',
            'F4': 'FFFF0000',
            'G4': 'FFFF0000',
            'H4': 'FFFF0000',
            'I4': 'FFFFC000',
            'J4': 'FFFFFF00',
            'K4': 'FFFFC000',
            'L4': 'FFFFC000',
            'M4': 'FFFFC000',
            'N4': 'FFFFC000',
            'O4': 'FFFFC000',
            'P4': 'FFFFC000',
            'Q4': 'FFFF99CC'
        };

        headerRow.eachCell((cell, colNumber) => {
            const cellAddress = cell.address;
            
            if (['F4', 'G4', 'H4'].includes(cellAddress)) {
                cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
            } else {
                cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF000000' } };
            }
            
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: headerColors[cellAddress] || 'FFFFC000' }
            };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
        });

        cargo_pago.forEach((cp, index) => {
            const rowNumber = 5 + index;
            const row = worksheet.addRow([
                index + 1,
                cp.gestor.toUpperCase(),
                cp.perfil,
                parseFloat(cp.total_produccion) || 0,
                0,
                parseFloat(cp.descuento_extra) || 0,
                parseFloat(cp.descuento_cancelados) || 0,
                0,
                'E001-',
                { formula: `D${rowNumber}+E${rowNumber}-F${rowNumber}-G${rowNumber}-H${rowNumber}` },
                cp.dni,
                cp.n_cuenta_bancaria || 'N/A',
                cp.n_cuenta_interbancaria || 'N/A',
                entidades_financieras.find((item) => item.tipo_id === cp.entidad_financiera_id)?.descripcion || 'N/A',
                'ACTIVO',
                '',
                ''
            ]);

            const importeCell = row.getCell(10);
            importeCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF99' }
            };

            [6, 7, 8].forEach(colNum => {
                const cell = row.getCell(colNum);
                cell.font = { name: 'Calibri', size: 11, color: { argb: 'FFFF0000' } };
            });
        });

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 4) return;

            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };

                if ([4, 5, 6, 7, 8, 10].includes(colNumber)) {
                    cell.alignment = { vertical: 'middle', horizontal: 'right' };
                    cell.numFmt = '"S/ "#,##0.00';
                } else if (colNumber === 2) {
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                } else {
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                }
            });
        });

        const lastDataRow = 4 + cargo_pago.length;
        const totalRow = worksheet.getRow(lastDataRow + 1);
        
        totalRow.getCell(1).value = '';
        totalRow.getCell(2).value = '';
        totalRow.getCell(3).value = '';
        
        totalRow.getCell(4).value = { formula: `SUM(D5:D${lastDataRow})` };
        totalRow.getCell(5).value = { formula: `SUM(E5:E${lastDataRow})` };
        totalRow.getCell(6).value = { formula: `SUM(F5:F${lastDataRow})` };
        totalRow.getCell(7).value = { formula: `SUM(G5:G${lastDataRow})` };
        totalRow.getCell(8).value = { formula: `SUM(H5:H${lastDataRow})` };
        totalRow.getCell(9).value = '';
        totalRow.getCell(10).value = { formula: `SUM(J5:J${lastDataRow})` };
        
        totalRow.font = { name: 'Calibri', size: 11, bold: true };
        totalRow.height = 20;
        
        [4, 5, 6, 7, 8, 10].forEach(colNum => {
            const cell = totalRow.getCell(colNum);
            cell.numFmt = '"S/ "#,##0.00';
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
            
            if ([6, 7, 8].includes(colNum)) {
                cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFF0000' } };
            }
        });

        worksheet.columns = [
            { width: 5 },
            { width: 35 },
            { width: 20 },
            { width: 25 },
            { width: 25 },
            { width: 20 },
            { width: 20 },
            { width: 20 },
            { width: 15 },
            { width: 20 },
            { width: 12 },
            { width: 20 },
            { width: 25 },
            { width: 25 },
            { width: 12 },
            { width: 15 },
            { width: 15 }
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        
        const nombreArchivo = `CargoPago_${mesActual}_${year}.xlsx`;
        saveAs(blob, nombreArchivo);
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const fetchData = async () => {
            setLoading(true);
            await getCargoPago();
            setLoading(false);
            if (state.isUpdated) {
                setState(prevState => ({
                    ...prevState,
                    isUpdated: false,
                }));
            }
        };

        fetchData();
    }, [state.isUpdated]);

    return (
        <div className="cargo-pago-module">
            {loading ? (
            <Loader />
        ) :
            (<>
                <div className="flex items-center justify-between mb-4">
                    <h1>CARGO DE PAGO</h1>
                    <ButtonExcel 
                        onClick={exportarAExcel}
                        disabled={cargo_pago.length === 0}
                    />
                </div>
                <div className="filtros">
                    <div>
                        <label htmlFor="periodo_fecha">Periodo de fecha:</label>
                        <input
                            id="periodo_fecha"
                            type="month"
                            value={periodo_fecha}
                            onChange={(e) => setPeriodoFecha(e.target.value)}
                        />
                    </div>
                </div>
                <ButtonSearch
                    onClick={handleButtonClick}
                    isLoading={loading}
                />
                {loading ? (
                    <div className="cargando">Cargando...</div>
                    ) : (
                    <div className="table-container">
                    <Table>
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>APELLIDOS Y NOMBRES</th>
                                <th>CARGO</th>
                                <th>TOTAL A PAGAR PRODUCCIÓN {getNombreMesActual()}</th>
                                <th>Monto a regularizar del mes de {getNombreMesAnterior()}</th>
                                <th>DESC. EXTRA</th>
                                <th>DESC. CANCELADO</th>
                                <th>DESCUENTO POR DOC. OBSERVADO</th>
                                <th>RxH</th>
                                <th>IMPORTE NETO A PAGAR</th>
                                <th>N° DNI</th>
                                <th>N° CUENTA</th>
                                <th>N° CUENTA INTERBANCARIA</th>
                                <th>ENTIDAD BANCARIA</th>
                                <th>ESTADO</th>
                                <th>FECHA DE CESE</th>
                                <th>FECHA DE PAGO</th>
                                <th>R.H.</th>
                                <th>ESTADO DE PAGO</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargo_pago.length > 0 
                            ? (cargo_pago.map((cp, i) => (
                                <tr key={cp.usuario_id}>
                                    <td>{i + 1}</td>
                                    <td><strong>{cp.gestor.toUpperCase()}</strong></td>
                                    <td>{cp.perfil}</td>
                                    <td>{formatoSoles(cp.total_produccion)}</td>
                                    <td></td>
                                    <td>{formatoSoles(cp.descuento_extra)}</td>
                                    <td>{formatoSoles(cp.descuento_cancelados)}</td>
                                    <td></td>
                                    <td>E001-</td>
                                    <td><strong>{formatoSoles(cp.total_pagar)}</strong></td>
                                    <td>{cp.dni}</td>
                                    <td><strong>{cp.n_cuenta_bancaria ? cp.n_cuenta_bancaria : 'N/A'}</strong></td>
                                    <td>{cp.n_cuenta_interbancaria ? cp.n_cuenta_interbancaria : 'N/A'}</td>
                                    <td>
                                        {entidades_financieras.find((item) => item.tipo_id === cp.entidad_financiera_id)
                                            ? entidades_financieras.find((item) => item.tipo_id === cp.entidad_financiera_id).descripcion
                                            : "N/A"}
                                    </td>
                                    <td>ACTIVO</td>
                                    <td></td>
                                    <td></td>
                                    <td className="px-4 py-2">
                                        {cp.tiene_recibo_honorarios === '1' 
                                            ? (<button
                                                    onClick={() => handleVerReciboHonorarios(cp.usuario_id, periodo_fecha)}
                                                    className={`archivo-presente bg-transparent border-0 p-0 ${
                                                        loadingDocumento.usuarioId === cp.usuario_id
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'cursor-pointer'
                                                    }`}
                                                    title="Documento adjuntado - haz clic para ver"
                                                    >
                                                    <FileMinus size={20} />
                                                </button>) 
                                            : (<FileMinus size={20} className="archivo-faltante" title="Documento no adjuntado" />)}
                                    </td>
                                    <td>
                                        {estados_pago.find(item => item.tipo_id === cp.estado_pago_id)
                                            ? estados_pago.find(item => item.tipo_id === cp.estado_pago_id).descripcion
                                            : 'N/A'}
                                    </td>
                                    <td>
                                        <ButtonUpdate 
                                            onClick={() => mostrarModalEstadoPago(cp)} 
                                            title="Editar estado de pago"
                                            disabled= {cp.tiene_recibo_honorarios === '0'}
                                        />
                                    </td>
                                </tr>
                                )))
                            : (
                                <tr>
                                    <td colSpan={21} className="bg-white text-center text-gray-500 text-sm py-2">
                                        Sin cargo de pago registrado
                                    </td>
                                </tr>
                                )}
                        </tbody>
                    </Table>
                    </div>
                )}
                <ModalEstadoPago 
                    isOpen={state.modalEstadoPago} 
                />
            </>)}
        </div>
    );
}

export default CargoPago;