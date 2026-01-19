import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import CajaDatosService from '../../axios_services/cajaflujodatos.service';
import Loader from '../Loader/Loader';

const ModalCajaFinancieroMovimiento = ({ 
  movimiento, 
  onSave, 
  onClose, 
  isOpen,
  tiposComprobante,
  entidadesFinancieras,
  tiposMovimiento,
  tiposEmpresa,
  perfilId,
  usuarioId
}) => {
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [conceptos, setConceptos] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const getInitialState = () => ({
    empresa_id: '',
    periodo_fecha: '',
    tipo_comprobante: '',
    entidad_financiera_id: '',
    cliente: '',
    tipo_gasto_id: '',
    categoria_id: '',
    concepto_id: '',
    monto: ''
  });

  const [formData, setFormData] = useState(getInitialState());

  const categoriasFiltradas = React.useMemo(() => {
    if (!formData.tipo_gasto_id) {
      return categorias;
    }
    return categorias.filter(cat => cat.tipo_id?.toString() === formData.tipo_gasto_id);
  }, [formData.tipo_gasto_id, categorias]);

  const conceptosFiltrados = React.useMemo(() => {
    if (!formData.categoria_id) {
      return conceptos;
    }
    return conceptos.filter(con => con.caja_categoria_id?.toString() === formData.categoria_id);
  }, [formData.categoria_id, conceptos]);

  useEffect(() => {
    const loadData = async () => {
      if (isOpen && perfilId) {
        setLoadingData(true);
        try {
          const [categoriasRes, conceptosRes] = await Promise.all([
            CajaDatosService.getCajaCategoria(perfilId),
            CajaDatosService.getCajaConcepto(perfilId)
          ]);

          if (categoriasRes.success) {
            setCategorias(categoriasRes.data || []);
          }

          if (conceptosRes.success) {
            setConceptos(conceptosRes.data || []);
          }
        } catch (error) {
          console.error('Error al cargar datos:', error);
          alert('Error al cargar las categorías y conceptos');
        } finally {
          setLoadingData(false);
        }
      }
    };

    loadData();
  }, [isOpen, perfilId]);

  useEffect(() => {
    if (isOpen) {
      if (movimiento) {
        setFormData({
          empresa_id: movimiento.empresa_id?.toString() || '',
          periodo_fecha: movimiento.periodo_fecha || '',
          tipo_comprobante: movimiento.tipo_comprobante?.toString() || '',
          entidad_financiera_id: movimiento.entidad_financiera_id?.toString() || '',
          cliente: movimiento.cliente || '',
          tipo_gasto_id: movimiento.tipo_gasto_id?.toString() || '',
          categoria_id: movimiento.caja_categoria_id?.toString() || '',
          concepto_id: movimiento.caja_concepto_id?.toString() || '',
          monto: movimiento.monto?.toString() || ''
        });
      } else {
        const now = new Date();
        const periodoActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        setFormData({
          ...getInitialState(),
          periodo_fecha: periodoActual
        });
      }
    }
  }, [movimiento, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prevData) => {
      const newData = {
        ...prevData,
        [name]: value,
      };

      if (name === 'tipo_gasto_id') {
        newData.categoria_id = '';
        newData.concepto_id = '';
      }

      if (name === 'categoria_id') {
        newData.concepto_id = '';
      }
      
      if (
        name === 'monto' &&
        prevData.tipo_gasto_id === '2' &&
        prevData.monto === '' &&
        value && value !== '-'
      ) {
        newData.monto = '-' + value;
      }
      
      return newData;
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
    
      if (!formData.empresa_id || !formData.periodo_fecha || !formData.tipo_comprobante || !formData.entidad_financiera_id || formData.monto === '') {
        alert('Por favor, complete todos los campos obligatorios.');
        setLoading(false);
        return;
      }

      if (isNaN(formData.monto)) {
        alert('Por favor, ingrese un monto válido.');
        setLoading(false);
        return;
      }

      const dataToSave = {
        empresa_id: parseInt(formData.empresa_id, 10) || null,
        periodo_fecha: formData.periodo_fecha,
        tipo_comprobante: parseInt(formData.tipo_comprobante, 10) || null,
        entidad_financiera_id: parseInt(formData.entidad_financiera_id, 10) || null,
        cliente: formData.cliente || null,
        tipo_gasto_id: parseInt(formData.tipo_gasto_id, 10) || null,
        caja_categoria_id: parseInt(formData.categoria_id, 10) || null,
        caja_concepto_id: parseInt(formData.concepto_id, 10) || null,
        monto: parseFloat(formData.monto) || 0,
      };

      await onSave(dataToSave);
      onClose(); 

    } catch (error) {
      console.error("Error al guardar:", error);
      const errorMsg = error.response?.data?.message || 'Ocurrió un error al guardar.';
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }  
  };

  return (
    <Modal isOpen={isOpen} className="custom-modal" backdrop="static">
      <ModalHeader className="modal-header">
        <div className="titulo">
          <h1>{movimiento ? 'EDITAR MOVIMIENTO' : 'NUEVO MOVIMIENTO'}</h1>
          <Button className="close-btn" onClick={onClose}>X</Button>
        </div>
      </ModalHeader>
      <div className="modal-body-footer">
        {loading || loadingData ? (
          <Loader />
        ) : (
          <ModalBody className="modal-body">
            <Form className="fila" onSubmit={(e) => e.preventDefault()}>
              <FormGroup>
                <Label>Empresa:</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="empresa_id"
                  value={formData.empresa_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  {tiposEmpresa?.map((empresa) => (
                    <option key={empresa.tipo_id} value={empresa.tipo_id}>
                      {empresa.descripcion}
                    </option>
                  ))}
                </Input>
              </FormGroup>

              <FormGroup>
                <Label>Periodo (Mes/Año):</Label>
                <Input
                  className="form-control"
                  type="month"
                  name="periodo_fecha"
                  value={formData.periodo_fecha}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Tipo Comprobante:</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="tipo_comprobante"
                  value={formData.tipo_comprobante}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  {tiposComprobante?.map((tipo) => (
                    <option key={tipo.tipo_id} value={tipo.tipo_id}>
                      {tipo.descripcion}
                    </option>
                  ))}
                </Input>
              </FormGroup>

              <FormGroup>
                <Label>Cuenta Financiera:</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="entidad_financiera_id"
                  value={formData.entidad_financiera_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  {entidadesFinancieras?.map((entidad) => (
                    <option key={entidad.tipo_id} value={entidad.tipo_id}>
                      {entidad.descripcion}
                    </option>
                  ))}
                </Input>
              </FormGroup>

             <FormGroup>
                <Label>Cliente/Proveedor:</Label>
                <Input
                  className="form-control"
                  type="text"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre del cliente o proveedor"
                  maxLength={150}
                />
                <small>{(formData.cliente?.length || 0)} / 150</small>
              </FormGroup>

              <FormGroup>
                <Label>Tipo Movimiento:</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="tipo_gasto_id"
                  value={formData.tipo_gasto_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  {tiposMovimiento?.map((tipo) => (
                    <option key={tipo.tipo_id} value={tipo.tipo_id}>
                      {tipo.descripcion}
                    </option>
                  ))}
                </Input>
              </FormGroup>

              <FormGroup>
                <Label>Categoría:</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  {categoriasFiltradas.map((categoria) => (
                    <option key={categoria.caja_categoria_id} value={categoria.caja_categoria_id.toString()}>
                      {categoria.nombre_categoria}
                    </option>
                  ))}
                </Input>
              </FormGroup>

              <FormGroup>
                <Label>Concepto:</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="concepto_id"
                  value={formData.concepto_id}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  {conceptosFiltrados.map((concepto) => (
                    <option key={concepto.caja_concepto_id} value={concepto.caja_concepto_id.toString()}>
                      {concepto.nombre_concepto}
                    </option>
                  ))}
                </Input>
              </FormGroup>

              <FormGroup>
                <Label>Monto:</Label>
                <div className="input-group custom-input-group">
                  <span className="input-group-text custom-symbol">S/.</span>
                  <Input
                    className="form-control"
                    type="number"
                    name="monto"
                    value={formData.monto}
                    onChange={handleChange}
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
              </FormGroup>

              <FormGroup>
                <div className="button-container">
                  <Button
                    className="button-custom"
                    onClick={async () => {
                      if (window.confirm('¿Está seguro de guardar este movimiento?')) {
                        await handleSubmit();
                      }
                    }}
                  >
                    GUARDAR
                  </Button>
                </div>
              </FormGroup>
            </Form>
          </ModalBody>
        )}
      </div>
    </Modal>
  );
};

export default ModalCajaFinancieroMovimiento;