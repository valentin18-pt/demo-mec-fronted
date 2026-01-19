import React, { useState, useEffect, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import './ModalGastosTotales.css';
import Loader from '../../components/Loader/Loader';

const ModalGastosTotales = ({ 
  gasto, 
  onSave, 
  onClose, 
  isOpen, 
  datosAbc, 
  gastosConceptos, 
  tiposGasto, 
  detallesGasto,
  tiposComprobante, 
  responsablesGasto 
}) => {
  const [loading, setLoading] = useState(false);

  const getInitialState = () => ({
    fecha_movimiento: '',
    fecha_comprobante: '',
    tipo_comprobante: '',
    serie: '',
    numero: '',
    ruc_proveedor: '',
    nombre_proveedor: '',
    descripcion: '',
    tipo_gasto_id: '',
    detalle_gasto_id: '',
    concepto_gasto_id: '',
    monto: '',
    responsable_gasto_id: '',
    actividad_gasto_id: '',
  });

  const [formData, setFormData] = useState(getInitialState());

  const conceptosFiltrados = useMemo(() => {
    if (!gastosConceptos || !Array.isArray(gastosConceptos)) return [];
    
    if (!formData.tipo_gasto_id || formData.tipo_gasto_id === '') {
      return gastosConceptos;
    }
    
    const tipoGastoId = parseInt(formData.tipo_gasto_id, 10);
    return gastosConceptos.filter(concepto => parseInt(concepto.tipo, 10) === tipoGastoId);
  }, [gastosConceptos, formData.tipo_gasto_id]);

  const actividadesFiltradas = useMemo(() => {
    if (!datosAbc || !Array.isArray(datosAbc)) return [];
    
    if (!formData.responsable_gasto_id || formData.responsable_gasto_id === '') {
      return datosAbc;
    }
    
    const responsableId = parseInt(formData.responsable_gasto_id, 10);
    return datosAbc.filter(actividad => parseInt(actividad.area_id, 10) === responsableId);
  }, [datosAbc, formData.responsable_gasto_id]);

  const detallesFiltrados = useMemo(() => {
    if (!detallesGasto || !Array.isArray(detallesGasto)) return [];
  
    if (!formData.tipo_gasto_id || formData.tipo_gasto_id === '') {
      return detallesGasto;
    }

    const tipoGastoId = parseInt(formData.tipo_gasto_id, 10);
  
    if (tipoGastoId === 1) {
      return detallesGasto.filter(detalle => parseInt(detalle.tipo_id, 10) === 1);
    } else if (tipoGastoId === 2) {
      return detallesGasto.filter(detalle => {
        const detalleId = parseInt(detalle.tipo_id, 10);
        return detalleId === 2 || detalleId === 3 || detalleId === 4;
      });
    }
  return detallesGasto;
  }, [detallesGasto, formData.tipo_gasto_id]);

  useEffect(() => {
    if (isOpen) {
      if (gasto) {
        setFormData({
          fecha_movimiento: gasto.fecha_movimiento || '',
          fecha_comprobante: gasto.fecha_comprobante || '',
          tipo_comprobante: gasto.tipo_comprobante?.toString() || '',
          serie: gasto.serie || '',
          numero: gasto.numero || '',
          ruc_proveedor: gasto.ruc_proveedor || '',
          nombre_proveedor: gasto.nombre_proveedor || '',
          descripcion: gasto.descripcion || '',
          tipo_gasto_id: gasto.tipo_gasto_id?.toString() || '',
          detalle_gasto_id: gasto.detalle_gasto_id?.toString() || '',
          concepto_gasto_id: gasto.concepto_gasto_id?.toString() || '',
          monto: gasto.monto?.toString() || '',
          responsable_gasto_id: gasto.responsable_gasto_id?.toString() || '',
          actividad_gasto_id: gasto.actividad_gasto_id?.toString() || '',
        });
      } else {
        setFormData(getInitialState());
      }
    }
  }, [gasto, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prevData) => {
      const newData = {
        ...prevData,
        [name]: value,
      };
      
      if (
        name === 'monto' &&
        prevData.tipo_gasto_id === '2' &&
        prevData.monto === '' &&
        value && value !== '-'
      ) {
        newData.monto = '-' + value;
      }

      if (name === 'tipo_gasto_id') {
        newData.concepto_gasto_id = '';
        if (value === '1') {
          newData.detalle_gasto_id = '1';
        } else {
          newData.detalle_gasto_id = '';
        }
      }
      
      if (name === 'responsable_gasto_id') {
        newData.actividad_gasto_id = '';
      }
      
      return newData;
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
    
      if (!formData.fecha_movimiento || !formData.fecha_comprobante || formData.monto === '') {
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
        ...formData,
        tipo_comprobante: parseInt(formData.tipo_comprobante, 10) || null,
        tipo_gasto_id: parseInt(formData.tipo_gasto_id, 10) || null,
        detalle_gasto_id: parseInt(formData.detalle_gasto_id, 10) || null,
        concepto_gasto_id: parseInt(formData.concepto_gasto_id, 10) || null,
        monto: parseFloat(formData.monto) || 0,
        responsable_gasto_id: parseInt(formData.responsable_gasto_id, 10) || null,
        actividad_gasto_id: parseInt(formData.actividad_gasto_id, 10) || null,
      };

      if (gasto) {
        dataToSave.gastos_totales_id = gasto.gastos_totales_id;
      }
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
          <h1>{gasto ? 'EDITAR GASTO' : 'NUEVO GASTO'}</h1>
          <Button className="close-btn" onClick={onClose}>X</Button>
        </div>
      </ModalHeader>
      <div className="modal-body-footer">
        {loading ? (
          <Loader />
        ) : (
          <ModalBody className="modal-body">
            <Form className="fila" onSubmit={(e) => e.preventDefault()}>
              <FormGroup>
                <Label>Fecha Movimiento:</Label>
                <Input
                  className="form-control"
                  type="date"
                  name="fecha_movimiento"
                  value={formData.fecha_movimiento}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Fecha Comprobante:</Label>
                <Input
                  className="form-control"
                  type="date"
                  name="fecha_comprobante"
                  value={formData.fecha_comprobante}
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
                <Label>Serie:</Label>
                <Input
                  className="form-control"
                  type="text"
                  name="serie"
                  value={formData.serie}
                  onChange={handleChange}
                  placeholder="Ingrese el número de serie"
                  maxLength="20"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Número:</Label>
                <Input
                  className="form-control"
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  placeholder="Ingrese el número"
                  maxLength="20"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>RUC Proveedor:</Label>
                <Input
                  className="form-control"
                  type="text"
                  name="ruc_proveedor"
                  value={formData.ruc_proveedor}
                  onChange={handleChange}
                  placeholder="Ingrese el RUC del proveedor"
                  maxLength="12"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Nombre Proveedor:</Label>
                <Input
                  className="form-control"
                  type="text"
                  name="nombre_proveedor"
                  value={formData.nombre_proveedor}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre del proveedor"
                  maxLength="50"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Descripción:</Label>
                <Input
                  className="form-control"
                  type="textarea"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Ingrese una descripción"
                  maxLength="100"
                  rows="2"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Tipo Gasto:</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="tipo_gasto_id"
                  value={formData.tipo_gasto_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  {tiposGasto?.map((tipo) => (
                    <option key={tipo.tipo_id} value={tipo.tipo_id}>
                      {tipo.descripcion}
                    </option>
                  ))}
                </Input>
              </FormGroup>

              <FormGroup>
                <Label>Detalle Gasto:</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="detalle_gasto_id"
                  value={formData.detalle_gasto_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  {detallesFiltrados?.map((tipo) => (
                    <option key={tipo.tipo_id} value={tipo.tipo_id}>
                      {tipo.descripcion}
                    </option>
                  ))}
                </Input>
              </FormGroup>

              <FormGroup>
                <Label>Concepto Gasto:</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="concepto_gasto_id"
                  value={formData.concepto_gasto_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  {conceptosFiltrados?.map((concepto) => (
                    <option key={concepto.gasto_concepto_id} value={concepto.gasto_concepto_id}>
                      {concepto.concepto}
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
                <Label>Responsable:</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="responsable_gasto_id"
                  value={formData.responsable_gasto_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  {responsablesGasto?.map((responsable) => (
                    <option key={responsable.tipo_id} value={responsable.tipo_id}>
                      {responsable.descripcion}
                    </option>
                  ))}
                </Input>
              </FormGroup>

              <FormGroup>
                <Label>Actividad:</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="actividad_gasto_id"
                  value={formData.actividad_gasto_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  {actividadesFiltradas?.map((actividad) => (
                    <option key={actividad.datos_abc_id} value={actividad.datos_abc_id}>
                      {actividad.actividad.toUpperCase()}
                    </option>
                  ))}
                </Input>
              </FormGroup>

              <FormGroup>
                <div className="button-container">
                  <Button
                    className="button-custom"
                    onClick={handleSubmit}
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

export default ModalGastosTotales;