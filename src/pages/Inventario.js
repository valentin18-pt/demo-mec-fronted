import React, { useState, useEffect, useRef, useContext } from 'react';
import { Table } from 'reactstrap';
import { AppContext } from '../application/provider';
import inventarioService from '../axios_services/inventario.service';
import archivoService from '../axios_services/archivos.service';
import ModalInventario from '../components/Modal/ModalInventario';
import { FileText, Image } from 'lucide-react';
import Loader from '../components/Loader/Loader';
import { ButtonSearch, ButtonUpdate, ButtonDelete, ButtonInsert, ButtonExcel } from '../components/Buttons/Buttons';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import './Inventario.css';

const Inventario = () => {
  const [state] = useContext(AppContext);
  const [inventarios, setInventarios] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInventario, setSelectedInventario] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [codigoFilter, setCodigoFilter] = useState('');
  const [activoFilter, setActivoFilter] = useState('');
  const [fechaAdquisicionFilter, setFechaAdquisicionFilter] = useState('');
  const [numRegistros, setNumRegistros] = useState(0);
  const [valorTotalCompra, setValorTotalCompra] = useState(0);
  const initialFetchDone = useRef(false);

  const inventoryFields = [
    { key: 'codigo', label: 'Código' },
    { key: 'activo', label: 'Activo' },
    { key: 'fecha_adquisicion', label: 'Fecha de adquisición' },
    { key: 'cantidad', label: 'Cantidad' },
    { key: 'factura', label: 'Factura' },
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'numero_serie', label: 'Número de serie' },
    { key: 'color', label: 'Color' },
    { key: 'estado', label: 'Estado' },
    { key: 'donacion', label: 'Donación' },
    { key: 'precio_unitario', label: 'Precio unitario' },
    { key: 'igv', label: 'IGV' },
    { key: 'valor_compra', label: 'Valor de compra' },
  ];

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchInventarios();
      initialFetchDone.current = true;
    }
  }, []);

  useEffect(() => {
    setNumRegistros(inventarios.length);
    const totalValor = inventarios.reduce((sum, item) => sum + (parseFloat(item.valor_compra) || 0), 0);
    setValorTotalCompra(totalValor.toFixed(2));
  }, [inventarios]);

  const fetchInventarios = async (filters = {}) => {
    setIsLoading(true);
    try {
      const data = await inventarioService.getListaInventario(filters);
      setInventarios(data);
    } catch (error) {
      console.error('Error al obtener inventarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchClick = () => {
    const filters = {};
    if (codigoFilter) filters.codigo = codigoFilter;
    if (activoFilter) filters.activo = activoFilter;
    if (fechaAdquisicionFilter) filters.fecha_adquisicion = fechaAdquisicionFilter;
    fetchInventarios(filters);
  };

  const handleCreateClick = () => {
    setSelectedInventario(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (inventario) => {
    setSelectedInventario(inventario);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este registro de inventario?')) {
      return;
    }

    try {
      setIsLoading(true);
      await inventarioService.eliminarRegistroInventario(id);
      await fetchInventarios();
      alert('Registro eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar inventario:', error);
      alert('Error al eliminar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewImage = async (inventario_id) => {
    try {
      const imageData = await archivoService.getImagenInventario(inventario_id);
      if (imageData && imageData.url_completa) {
        window.open(imageData.url_completa, '_blank', 'noopener,noreferrer');
      } else {
        alert('No se encontró una imagen para este registro.');
      }
    } catch (error) {
      console.error(`Error al obtener la imagen para el inventario ${inventario_id}:`, error);
      alert('Error al cargar la imagen. Es posible que no tenga una imagen asignada.');
    }
  };

  const handleViewInvoice = async (inventario_id) => {
    try {
      const invoiceData = await archivoService.getFacturaInventario(inventario_id);
      if (invoiceData && invoiceData.url_completa) {
        window.open(invoiceData.url_completa, '_blank', 'noopener,noreferrer');
      } else {
        alert('No se encontró una factura para este registro.');
      }
    } catch (error) {
      console.error(`Error al obtener la factura para el inventario ${inventario_id}:`, error);
      alert('Error al cargar la factura. Es posible que no tenga una factura asignada.');
    }
  };

  const handleSaveInventario = async (inventarioData, fotoFile, facturaFile) => {
    try {
      setIsLoading(true);
      setIsModalOpen(false);

      let savedInventario;
      if (selectedInventario) {
        await inventarioService.actualizarInventario(
          selectedInventario.inventario_id,
          inventarioData
        );
        savedInventario = {
          ...inventarioData,
          inventario_id: selectedInventario.inventario_id,
        };
      } else {
        const response = await inventarioService.crearInventario(inventarioData);
        savedInventario = response.data;
      }

      if (fotoFile && savedInventario && savedInventario.inventario_id) {
        await archivoService.guardarImagenInventario(
          fotoFile,
          savedInventario.inventario_id,
          state.usuario_id
        );
      }

      if (facturaFile && savedInventario && savedInventario.inventario_id) {
        await archivoService.guardarFacturaInventario(
          facturaFile,
          savedInventario.inventario_id,
          state.usuario_id
        );
      }

      await fetchInventarios();
      setSelectedInventario(null);
    } catch (error) {
      console.error('Error al guardar inventario:', error);
      alert('Error al guardar el registro');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInventario(null);
  };

  const exportarInventario = async () => {
    if (inventarios.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario');

    worksheet.columns = [
      { header: 'CÓDIGO', key: 'codigo', width: 15 },
      { header: 'ACTIVO', key: 'activo', width: 25 },
      { header: 'FECHA DE ADQUISICIÓN', key: 'fecha_adquisicion', width: 18 },
      { header: 'CANTIDAD', key: 'cantidad', width: 12 },
      { header: 'FACTURA', key: 'factura', width: 15 },
      { header: 'MARCA', key: 'marca', width: 15 },
      { header: 'MODELO', key: 'modelo', width: 20 },
      { header: 'NÚMERO DE SERIE', key: 'numero_serie', width: 20 },
      { header: 'COLOR', key: 'color', width: 15 },
      { header: 'ESTADO', key: 'estado', width: 15 },
      { header: 'DONACIÓN', key: 'donacion', width: 15 },
      { header: 'PRECIO UNITARIO', key: 'precio_unitario', width: 15 },
      { header: 'IGV', key: 'igv', width: 12 },
      { header: 'VALOR DE COMPRA', key: 'valor_compra', width: 15 }
    ];

    inventarios.forEach(item => {
      const codes = Array.isArray(item.codigo)
        ? item.codigo
        : item.codigo
        ? String(item.codigo).split(',').map((c) => c.trim()).join(', ')
        : '';

      worksheet.addRow({
        codigo: codes,
        activo: item.activo || '',
        fecha_adquisicion: formatDateForDisplay(item.fecha_adquisicion),
        cantidad: Number(item.cantidad) || 0,
        factura: item.factura || '',
        marca: item.marca || '',
        modelo: item.modelo || '',
        numero_serie: item.numero_serie ? `${item.numero_serie}` : '',
        color: item.color || '',
        estado: item.estado || '',
        donacion: item.donacion || '',
        precio_unitario: Number(item.precio_unitario) || 0,
        igv: Number(item.igv) || 0,
        valor_compra: Number(item.valor_compra) || 0
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
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };

        const colKey = worksheet.columns[colNumber - 1].key;
        if (['precio_unitario', 'igv', 'valor_compra', 'cantidad'].includes(colKey)) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          if (['precio_unitario', 'igv', 'valor_compra'].includes(colKey)) {
            cell.numFmt = '"S/ "#,##0.00';
          }
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    
    const currentYear = new Date().getFullYear();
    const nombreArchivo = `InventarioMec${currentYear}.xlsx`;
    saveAs(blob, nombreArchivo);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="caja-flujo-container">
      <div className="flex items-center justify-between mb-4">
        <h1>INVENTARIO</h1>
        <ButtonExcel 
          onClick={exportarInventario}
          disabled={inventarios.length === 0}
        />
      </div>

      <div className="filtros">
        <div className="campo-fecha">
          <label htmlFor="codigo">Código:</label>
          <input
            id="codigo"
            type="text"
            value={codigoFilter}
            onChange={(e) => setCodigoFilter(e.target.value)}
          />
        </div>

        <div className="campo-fecha">
          <label htmlFor="activo">Activo:</label>
          <input
            id="activo"
            type="text"
            value={activoFilter}
            onChange={(e) => setActivoFilter(e.target.value)}
          />
        </div>

        <div className="campo-fecha">
          <label htmlFor="fecha_adquisicion">Fecha de Adquisición:</label>
          <input
            id="fecha_adquisicion"
            type="date"
            value={fechaAdquisicionFilter}
            onChange={(e) => setFechaAdquisicionFilter(e.target.value)}
          />
        </div>
      </div>

      <ButtonSearch
        onClick={handleSearchClick}
        isLoading={isLoading}
      />

      <div style={{
        marginTop: '15px',
        padding: '10px 15px',
        borderRadius: '8px',
        backgroundColor: '#f8f8f8',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: 'fit-content'
      }}>
        <p style={{ color: 'green', fontSize: '1em', fontWeight: 'bold', margin: '0' }}>
          N° de registros: {numRegistros}
        </p>
        <p style={{ color: 'black', fontSize: '1em', fontWeight: 'normal', margin: '5px 0 0 0' }}>
          Valor total: S/. {valorTotalCompra}
        </p>
      </div>

      <div className="nuevo-movimiento-section">
        <ButtonInsert onClick={handleCreateClick} />
      </div>

      <div className="table-container">
        <Table>
          <thead>
            <tr>
              {inventoryFields.map((field) => (
                <th key={field.key}>{field.label.toUpperCase()}</th>
              ))}
              <th>FOTO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {inventarios.length > 0 ? (
              inventarios.map((item) => (
                <tr key={item.inventario_id}>
                  {inventoryFields.map((field) => {
                    if (field.key === 'codigo') {
                      const codes = Array.isArray(item[field.key])
                        ? item[field.key]
                        : item[field.key]
                        ? String(item[field.key]).split(',').map((c) => c.trim())
                        : [];
                      return (
                        <td key={`${item.inventario_id}-${field.key}`}>
                          {codes.length > 0 ? (
                            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                              {codes.map((code, index) => (
                                <li key={index} style={{ whiteSpace: 'nowrap' }}>
                                  {code}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span>N/A</span>
                          )}
                        </td>
                      );
                    }
                    if (field.key === 'factura') {
                      return (
                        <td key={`${item.inventario_id}-${field.key}`}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {item[field.key] && <span>{item[field.key]}</span>}
                            <button
                              onClick={() => handleViewInvoice(item.inventario_id)}
                              type="button"
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                padding: 0, 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                color: '#374151',
                                textAlign: 'left'
                              }}
                            >
                              <FileText size={16} style={{ marginRight: '5px' }} /> Ver Factura
                            </button>
                          </div>
                        </td>
                      );
                    }
                    return (
                      <td key={`${item.inventario_id}-${field.key}`}>
                        {field.key === 'fecha_adquisicion'
                          ? formatDateForDisplay(item[field.key])
                          : item[field.key] || 'N/A'}
                      </td>
                    );
                  })}
                  <td>
                    <button
                      onClick={() => handleViewImage(item.inventario_id)}
                      type="button"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        padding: 0, 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#374151'
                      }}
                    >
                      <Image size={20} style={{ marginRight: '5px' }} /> Ver Imagen
                    </button>
                  </td>
                  <td>
                    <div className="acciones-container">
                      <ButtonUpdate 
                        onClick={() => handleEditClick(item)} 
                      />
                      <ButtonDelete 
                        onClick={() => handleDeleteClick(item.inventario_id)} 
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={inventoryFields.length + 2} className="text-center text-gray-500 py-4">
                  No hay registros de inventario disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <ModalInventario
        inventario={selectedInventario}
        onSave={handleSaveInventario}
        onClose={handleCloseModal}
        isOpen={isModalOpen}
      />
    </div>
  );
};

export default Inventario;