import React, { useState, useContext, useEffect, useRef } from 'react';
import { Table, Button } from "reactstrap";
import { AppContext } from '../application/provider';
import CajaFinancieroMovimientoService from "../axios_services/cajafinancieromovimiento.service";
import Loader from "../components/Loader/Loader";
import { ButtonSearch, ButtonUpdate, ButtonDelete, ButtonInsert, ButtonExcel } from '../components/Buttons/Buttons';
import ModalCajaFinancieroMovimiento from '../components/Modal/ModalCajaFinancieroMovimiento';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import './CajaFinancieroMovimiento.css';

function CajaFinancieroMovimiento() {
    const [state] = useContext(AppContext);
    const [movimientos, setMovimientos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMovimiento, setSelectedMovimiento] = useState(null);
    const initialFetchDone = useRef(false);
    
    const [entidad_financiera] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 25 }));
    const [tipo_movimiento] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 27 }));
    const [tipo_comprobante] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 28 }));
    const [tipo_empresa] = useState(state.catalogos.tipos.filter(t => { return t.categoria_id == 37 }));

    const [periodo_fecha, setPeriodoFecha] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    
    const [periodo_consultado, setPeriodoConsultado] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const [empresa_id, setEmpresaId] = useState('');
    const [empresa_consultada, setEmpresaConsultada] = useState('');
    const [tipo_gasto_id, setTipoGastoId] = useState('');
    const [tipo_gasto_consultado, setTipoGastoConsultado] = useState('');
    const [movimientosSinFiltrar, setMovimientosSinFiltrar] = useState([]);

    const formatoSoles = (monto) => {
        const valor = new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(monto);
        return valor;
    };

    const getClaseMonto = (monto) => {
        const valor = parseFloat(monto);
        if (valor < 0) return 'monto-negativo';
        if (valor > 0) return 'monto-positivo';
        return 'monto-neutro';
    };

    useEffect(() => {
        if (!initialFetchDone.current) {
            loadInitialPageData();
            initialFetchDone.current = true;
        }
    }, []);

    const loadInitialPageData = async () => {
        setIsLoading(true);
        const perfil_id = state.user?.perfil_id;
        const usuario_id = state.user?.usuario_id;
        
        try {
            const response = await CajaFinancieroMovimientoService.getCajaFinancieroMovimiento(
                perfil_id,
                usuario_id,
                periodo_fecha
            );
            
            setMovimientosSinFiltrar(response.data || []);
            setMovimientos(response.data || []);
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            if (error.response?.status === 403) {
                alert(error.response?.data?.message || 'No tiene permisos para acceder a esta información');
            }
            setMovimientosSinFiltrar([]);
            setMovimientos([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMovimientos = async () => {
        setIsLoading(true);
        try {
            const response = await CajaFinancieroMovimientoService.getCajaFinancieroMovimiento(
                state.user?.perfil_id,
                state.user?.usuario_id,
                periodo_fecha
            );
            
            setMovimientosSinFiltrar(response.data || []);
            
            setTimeout(() => {
                aplicarFiltroEmpresa(response.data || []);
                setIsLoading(false);
            }, 300);
        } catch (error) {
            console.error('Error al obtener movimientos:', error);
            if (error.response?.status === 403) {
                alert(error.response?.data?.message || 'No tiene permisos para acceder a esta información');
            }
            setMovimientosSinFiltrar([]);
            setMovimientos([]);
            setIsLoading(false);
        }
    };

    const aplicarFiltroEmpresa = (datos) => {
        let filtrados = datos;

        if (tipo_gasto_id) {
            filtrados = filtrados.filter(mov => mov.tipo_gasto_id?.toString() === tipo_gasto_id);
        }

        if (empresa_id) {
            filtrados = filtrados.filter(mov => mov.empresa_id?.toString() === empresa_id);
        }

        setMovimientos(filtrados);
    };

    const handleCalcularClick = async () => {
        setPeriodoConsultado(periodo_fecha);
        setEmpresaConsultada(empresa_id);
        setTipoGastoConsultado(tipo_gasto_id);
        await fetchMovimientos();
    };

    const handleNuevoMovimiento = () => {
        setSelectedMovimiento(null);
        setIsModalOpen(true);
    };

    const handleEditarMovimiento = (movimiento) => {
        setSelectedMovimiento(movimiento);
        setIsModalOpen(true);
    };

    const handleEliminarMovimiento = async (movimientoId) => {
        if (!window.confirm('¿Está seguro que desea eliminar este movimiento?')) {
            return;
        }

        try {
            setIsLoading(true);
            await CajaFinancieroMovimientoService.deleteCajaFinancieroMovimiento({
                caja_financiero_movimiento_id: movimientoId,
                perfil_id: state.user?.perfil_id
            });
            await fetchMovimientos();
            alert('Movimiento eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar movimiento:', error);
            const errorMsg = error.response?.data?.message || 'Error al eliminar el movimiento';
            alert(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMovimiento(null);
    };

    const handleSaveMovimiento = async (movimientoData) => {
        try {
            setLoadingModal(true);
            setIsModalOpen(false);
            
            const dataConPerfil = {
                ...movimientoData,
                perfil_id: state.user?.perfil_id
            };

            let response;
            if (selectedMovimiento) {
                response = await CajaFinancieroMovimientoService.updateCajaFinancieroMovimiento({
                    ...dataConPerfil,
                    caja_financiero_movimiento_id: selectedMovimiento.caja_financiero_movimiento_id
                });
            } else {
                response = await CajaFinancieroMovimientoService.insertCajaFinancieroMovimiento(dataConPerfil);
            }
            
            await fetchMovimientos();
            setSelectedMovimiento(null);
            
            return response;
        } catch (error) {
            console.error('Error al guardar movimiento:', error);
            alert(error.response?.data?.message || 'Ocurrió un error al guardar.');
            throw error;
        } finally {
            setLoadingModal(false);
        }
    };

    const exportarAExcel = async () => {
        if (movimientos.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Movimientos');

        worksheet.columns = [
            { header: 'EMPRESA', key: 'empresa' },
            { header: 'PERIODO', key: 'periodo' },
            { header: 'TIPO COMPROBANTE', key: 'tipo_comprobante' },
            { header: 'CUENTA FINANCIERA', key: 'cuenta_financiera' },
            { header: 'CLIENTE/PROVEEDOR', key: 'cliente' },
            { header: 'TIPO MOVIMIENTO', key: 'tipo_movimiento' },
            { header: 'CATEGORÍA', key: 'categoria' },
            { header: 'CONCEPTO', key: 'concepto' },
            { header: 'MONTO', key: 'monto' }
        ];

        movimientos.forEach(mov => {
            worksheet.addRow({
                empresa: tipo_empresa.find(item => item.tipo_id === mov.empresa_id)?.descripcion || 'N/A',
                periodo: mov.periodo_fecha,
                tipo_comprobante: tipo_comprobante.find(item => item.tipo_id === mov.tipo_comprobante)?.descripcion || 'N/A',
                cuenta_financiera: entidad_financiera.find(item => item.tipo_id === mov.entidad_financiera_id)?.descripcion || 'N/A',
                cliente: mov.cliente || 'N/A',
                tipo_movimiento: tipo_movimiento.find(item => item.tipo_id === mov.tipo_gasto_id)?.descripcion || 'N/A',
                categoria: mov.nombre_categoria || 'N/A',
                concepto: mov.nombre_concepto || 'N/A',
                monto: parseFloat(mov.monto) || 0
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
                    top: { style: 'thin', color: { argb: 'FF000000 ' } },
                    left: { style: 'thin', color: { argb: 'FF000000 ' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000 ' } },
                    right: { style: 'thin', color: { argb: 'FF000000 ' } }
                };

                if (colNumber === 9) {
                    cell.alignment = { vertical: 'middle', horizontal: 'right' };
                    cell.numFmt = '"S/ "#,##0.00';
                } else {
                    cell.alignment = { vertical: 'middle', horizontal: 'left' };
                }
            });
        });

        worksheet.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: false }, (cell) => {
                let cellValue = '';
                
                if (cell.value !== null && cell.value !== undefined) {
                    if (typeof cell.value === 'object' && cell.value.text) {
                        cellValue = cell.value.text.toString();
                    } else {
                        cellValue = cell.value.toString();
                    }
                }
                
                const columnLength = cellValue.length;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            
            column.width = Math.min(Math.max(maxLength + 3, 12), 60);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        
        const empresaNombre = empresa_id 
            ? tipo_empresa.find(e => e.tipo_id.toString() === empresa_id)?.descripcion || 'Empresa'
            : 'TodasEmpresas';
        
        const nombreArchivo = `CajaFinanciero_${periodo_consultado}_${empresaNombre}.xlsx`;
        saveAs(blob, nombreArchivo);
    };

    if (isLoading || loadingModal) {
        return <Loader />;
    }

    return (
        <div className="caja-flujo-container">
            <div className="flex items-center justify-between mb-4">
                <h1>CAJA FINANCIERO - MOVIMIENTOS</h1>
                <ButtonExcel 
                    onClick={exportarAExcel}
                    disabled={movimientos.length === 0}
                />
            </div>

            <div className="filtros">
                <div className="campo-fecha">
                    <label htmlFor="periodo_fecha">Periodo:</label>
                    <input
                        id="periodo_fecha"
                        type="month"
                        value={periodo_fecha}
                        onChange={(e) => setPeriodoFecha(e.target.value)}
                    />
                </div>

                <div className="campo-fecha">
                    <label htmlFor="tipo_gasto_id">Tipo Movimiento:</label>
                    <select
                        id="tipo_gasto_id"
                        value={tipo_gasto_id}
                        onChange={(e) => setTipoGastoId(e.target.value)}
                        className="form-control"
                    >
                        <option value="">Todos los tipos</option>
                        {tipo_movimiento?.map((tipo) => (
                            <option key={tipo.tipo_id} value={tipo.tipo_id}>
                                {tipo.descripcion}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="campo-fecha">
                    <label htmlFor="empresa_id">Empresa:</label>
                    <select
                        id="empresa_id"
                        value={empresa_id}
                        onChange={(e) => setEmpresaId(e.target.value)}
                        className="form-control"
                    >
                        <option value="">Todas las empresas</option>
                        {tipo_empresa?.map((empresa) => (
                            <option key={empresa.tipo_id} value={empresa.tipo_id}>
                                {empresa.descripcion}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <ButtonSearch
                onClick={handleCalcularClick}
                isLoading={isLoading}
            />

            <div className="nuevo-movimiento-section">
                {[8, 12, 13, 21].includes(Number(state.user?.perfil_id)) && (
                    <ButtonInsert onClick={handleNuevoMovimiento} />
                )}
            </div>

            <div className="table-container">
                <Table>
                    <thead>
                        <tr>
                            <th>EMPRESA</th>
                            <th>TIPO COMPROBANTE</th>
                            <th>CUENTA FINANCIERA</th>
                            <th>CLIENTE/PROVEEDOR</th>
                            <th>TIPO MOVIMIENTO</th>
                            <th>CATEGORÍA</th>
                            <th>CONCEPTO</th>
                            <th>MONTO</th>
                            {[8, 12, 13, 21].includes(Number(state.user?.perfil_id)) && <th>ACCIONES</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {movimientos.length > 0 ? (
                            movimientos.map((movimiento, index) => (
                                <tr key={movimiento.caja_financiero_movimiento_id || index}>
                                    <td>
                                        {tipo_empresa.find(item => item.tipo_id === movimiento.empresa_id)?.descripcion || 'N/A'}
                                    </td>
                                    <td>
                                        {tipo_comprobante.find(item => item.tipo_id === movimiento.tipo_comprobante)?.descripcion || 'N/A'}
                                    </td>
                                    <td>
                                        {entidad_financiera.find(item => item.tipo_id === movimiento.entidad_financiera_id)?.descripcion || 'N/A'}
                                    </td>
                                    <td>{movimiento.cliente?.toUpperCase() || 'N/A'}</td>
                                    <td>
                                        {tipo_movimiento.find(item => item.tipo_id === movimiento.tipo_gasto_id)?.descripcion || 'N/A'}
                                    </td>
                                    <td>{movimiento.nombre_categoria || 'N/A'}</td>
                                    <td>{movimiento.nombre_concepto || 'N/A'}</td>
                                    <td className={`col-monto ${getClaseMonto(movimiento.monto)}`}>
                                        {formatoSoles(movimiento.monto)}
                                    </td>
                                    {[8, 12, 13, 21].includes(Number(state.user?.perfil_id)) && (
                                        <td>
                                            <div className="acciones-container">
                                                <ButtonUpdate 
                                                    onClick={() => handleEditarMovimiento(movimiento)} 
                                                />
                                                <ButtonDelete 
                                                    onClick={() => handleEliminarMovimiento(movimiento.caja_financiero_movimiento_id)} 
                                                />
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={[8, 12, 13, 21].includes(Number(state.user?.perfil_id)) ? 9 : 8} 
                                    className="text-center text-gray-500 py-4">
                                    No hay datos disponibles para este período.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            <ModalCajaFinancieroMovimiento
                onSave={handleSaveMovimiento}
                onClose={handleCloseModal}
                isOpen={isModalOpen}
                movimiento={selectedMovimiento}
                tiposComprobante={tipo_comprobante}
                entidadesFinancieras={entidad_financiera}
                tiposMovimiento={tipo_movimiento}
                tiposEmpresa={tipo_empresa}
                perfilId={state.user?.perfil_id}
                usuarioId={state.user?.usuario_id}
            />
        </div>
    );
}

export default CajaFinancieroMovimiento;