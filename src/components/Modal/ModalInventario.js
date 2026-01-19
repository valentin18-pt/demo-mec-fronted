import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { Plus, Minus } from 'lucide-react';
import './ModalInventario.css';
import Loader from '../../components/Loader/Loader'; 

const ModalInventario = ({ inventario, onSave, onClose, isOpen }) => {
  const [loading, setLoading] = useState(false);
  const [fotoFile, setFotoFile] = useState(null);
  const [facturaFile, setFacturaFile] = useState(null);

  const getInitialState = () => ({
    codigos: [''],
    activo: '',
    fecha_adquisicion: '',
    cantidad: 1,
    factura: '',
    marca: '',
    modelo: '',
    numero_serie: 'NO ESPECIFICADO',
    color: '',
    estado: 'NUEVO',
    donacion: 'No',
    precio_unitario: '',
    igv: '',
    valor_compra: '',
    foto_url: null,
    factura_url: null,
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (formData.donacion === 'Si') {
      setFormData(prevData => ({
        ...prevData,
        precio_unitario: '',
        igv: '',
      }));
      return;
    }

    const precio = parseFloat(formData.precio_unitario) || 0;
    const cantidad = parseInt(formData.cantidad, 10) || 0;
    const igvCalculado = precio * 0.18;
    const valorCompraCalculado = (precio + igvCalculado) * cantidad;

    setFormData(prevData => ({
      ...prevData,
      igv: igvCalculado.toFixed(2),
      valor_compra: valorCompraCalculado.toFixed(2)
    }));
  }, [formData.donacion, formData.precio_unitario, formData.cantidad]);

  useEffect(() => {
    if (isOpen) {
      if (inventario) {
        setFormData({
          codigos: inventario.codigo ? inventario.codigo.split(',') : [''],
          activo: inventario.activo || '',
          fecha_adquisicion: inventario.fecha_adquisicion
            ? new Date(inventario.fecha_adquisicion).toISOString().split('T')[0]
            : '',
          cantidad: inventario.cantidad || 1,
          factura: inventario.factura || '',
          marca: inventario.marca || '',
          modelo: inventario.modelo || '',
          numero_serie: inventario.numero_serie || '',
          color: inventario.color || '',
          estado: inventario.estado || '',
          donacion: inventario.donacion || 'No',
          precio_unitario: inventario.precio_unitario ? inventario.precio_unitario.toString() : '',
          igv: inventario.igv ? inventario.igv.toString() : '',
          valor_compra: inventario.valor_compra ? inventario.valor_compra.toString() : '',
          foto_url: inventario.foto_url || null,
          factura_url: inventario.factura_url || null,
        });
        setFotoFile(null);
        setFacturaFile(null);
      } else {
        setFormData(getInitialState());
        setFotoFile(null);
        setFacturaFile(null);
      }
    }
  }, [inventario, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCodigoChange = (index, e) => {
    const newCodigos = [...formData.codigos];
    newCodigos[index] = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      codigos: newCodigos,
    }));
  };

  const handleAddCodigo = () => {
    setFormData((prevData) => ({
      ...prevData,
      codigos: [...prevData.codigos, ''],
    }));
  };

  const handleRemoveCodigo = (index) => {
    const newCodigos = formData.codigos.filter((_, i) => i !== index);
    setFormData((prevData) => ({
      ...prevData,
      codigos: newCodigos.length > 0 ? newCodigos : [''],
    }));
  };

  const handleFotoFileChange = (e) => {
    setFotoFile(e.target.files[0]);
  };

  const handleFacturaFileChange = (e) => {
    setFacturaFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const dataToSave = {
        ...formData,
        codigo: formData.codigos.filter((codigo) => codigo.trim() !== '').join(','),
      };

      if (dataToSave.donacion === 'Si') {
        dataToSave.precio_unitario = null;
        dataToSave.igv = null;
        dataToSave.valor_compra = parseFloat(dataToSave.valor_compra) || 0;
      } else {
        dataToSave.precio_unitario = parseFloat(dataToSave.precio_unitario) || 0;
        dataToSave.igv = parseFloat(dataToSave.igv) || 0;
        dataToSave.valor_compra = parseFloat(dataToSave.valor_compra) || 0;
      }

      delete dataToSave.codigos;
      delete dataToSave.foto_url;
      delete dataToSave.factura_url;

      await onSave(dataToSave, fotoFile, facturaFile);
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Ocurrió un error al guardar.';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} className="custom-modal" backdrop={true}>
      <ModalHeader className="modal-header">
        <div className="titulo">
          <h1>{inventario ? 'EDITAR INVENTARIO' : 'NUEVO REGISTRO DE INVENTARIO'}</h1>
          <Button className="close-btn" onClick={onClose}>X</Button>
        </div>
      </ModalHeader>
      <div className="modal-body-footer">
        {loading ? (
          <Loader />
        ) : (
          <ModalBody className="modal-body">
            <Form className="fila">
              <FormGroup>
                <Label>Código(s):</Label>
                {formData.codigos.map((codigo, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '5px' }}>
                    <Input
                      className="form-control"
                      type="text"
                      name={`codigo-${index}`}
                      value={codigo}
                      onChange={(e) => handleCodigoChange(index, e)}
                      placeholder="Ingrese código"
                      style={{ flexGrow: 1, minWidth: '150px' }}
                    />
                    {formData.codigos.length > 1 && (
                      <Button color="danger" size="sm" onClick={() => handleRemoveCodigo(index)} style={{ width: '30px', height: '30px', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%' }}>
                        <Minus size={20} />
                      </Button>
                    )}
                    {index === formData.codigos.length - 1 && (
                      <Button color="success" size="sm" onClick={handleAddCodigo} style={{ width: '30px', height: '30px', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%' }}>
                        <Plus size={20} />
                      </Button>
                    )}
                  </div>
                ))}
              </FormGroup>

              <FormGroup>
                <Label>Activo:</Label>
                <Input className="form-control" type="text" name="activo" value={formData.activo} onChange={handleChange} />
              </FormGroup>

              <FormGroup>
                <Label>Fecha de Adquisición:</Label>
                <Input className="form-control" type="date" name="fecha_adquisicion" value={formData.fecha_adquisicion} onChange={handleChange} />
              </FormGroup>

              <FormGroup>
                <Label>Cantidad:</Label>
                <Input className="form-control" type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} min="1" />
              </FormGroup>

              <FormGroup>
                <Label>Factura:</Label>
                <Input className="form-control" type="text" name="factura" value={formData.factura} onChange={handleChange} />
              </FormGroup>

              <FormGroup>
                <Label>Imagen Factura:</Label>
                <div>
                  <Input className="form-control" type="file" name="factura_image" accept="application/pdf,image/*" onChange={handleFacturaFileChange} />
                </div>
                {formData.factura_url && (
                  <div style={{ marginTop: '10px' }}>
                    <p>Factura actual:</p>
                    <a href={formData.factura_url} target="_blank" rel="noopener noreferrer">Ver factura actual</a>
                  </div>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Marca:</Label>
                <Input className="form-control" type="text" name="marca" value={formData.marca} onChange={handleChange} />
              </FormGroup>

              <FormGroup>
                <Label>Modelo:</Label>
                <Input className="form-control" type="text" name="modelo" value={formData.modelo} onChange={handleChange} />
              </FormGroup>

              <FormGroup>
                <Label>Número de Serie:</Label>
                <Input className="form-control" type="text" name="numero_serie" value={formData.numero_serie} onChange={handleChange} />
              </FormGroup>

              <FormGroup>
                <Label>Color:</Label>
                <Input className="form-control" type="text" name="color" value={formData.color} onChange={handleChange} />
              </FormGroup>

              <FormGroup>
                <Label>Estado:</Label>
                <Input className="form-control" type="text" name="estado" value={formData.estado} onChange={handleChange} />
              </FormGroup>

              <FormGroup style={{ marginBottom: '20px' }}>
                <Label>Donación:</Label>
                <div className="radio-group-container">
                  <div className="radio-option-item">
                    <Input type="radio" name="donacion" value="Si" checked={formData.donacion === 'Si'} onChange={handleChange} />{' '}
                    Sí
                  </div>
                  <div className="radio-option-item">
                    <Input type="radio" name="donacion" value="No" checked={formData.donacion === 'No'} onChange={handleChange} />{' '}
                    No
                  </div>
                </div>
              </FormGroup>

              {formData.donacion === 'No' && (
                <>
                  <FormGroup>
                    <Label>Precio Unitario:</Label>
                    <div className="input-group custom-input-group">
                      <span className="input-group-text custom-symbol symbol-move-up-2px">S/.</span>
                      <Input className="form-control" type="number" name="precio_unitario" value={formData.precio_unitario} onChange={handleChange} min="0" step="0.01" placeholder="0.00" />
                    </div>
                  </FormGroup>

                  <FormGroup>
                    <Label>IGV (18%):</Label>
                    <div className="input-group custom-input-group">
                      <span className="input-group-text custom-symbol symbol-move-up-2px">S/.</span>
                      <Input className="form-control" type="number" name="igv" value={formData.igv} readOnly placeholder="0.00" />
                    </div>
                  </FormGroup>
                </>
              )}

              <FormGroup>
                <Label>Valor de Compra Total:</Label>
                <div className="input-group custom-input-group">
                  <span className="input-group-text custom-symbol symbol-move-up-2px">S/.</span>
                  <Input
                    className="form-control"
                    type="number"
                    name="valor_compra"
                    value={formData.valor_compra}
                    onChange={handleChange}
                    readOnly={formData.donacion === 'No'}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </FormGroup>

              <FormGroup>
                <Label>Foto (Artículo):</Label>
                <div>
                  <Input className="form-control" type="file" name="foto" accept="image/*" onChange={handleFotoFileChange} />
                </div>
                {formData.foto_url && (
                  <div style={{ marginTop: '10px' }}>
                    <p>Foto actual:</p>
                    <a href={formData.foto_url} target="_blank" rel="noopener noreferrer">Ver foto actual</a>
                  </div>
                )}
              </FormGroup>

              <FormGroup>
                <div className="button-container">
                  <Button className="button-custom" style={{ padding: '8px 20px', fontSize: '14px' }} onClick={async () => { if (window.confirm('¿Está seguro de guardar este registro?')) { await handleSubmit(); } }}>
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

export default ModalInventario;