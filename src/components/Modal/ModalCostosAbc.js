import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import './ModalCostosAbc.css';
import Loader from '../../components/Loader/Loader';

const ModalCostosAbc = ({ detalle, onSave, onClose, isOpen }) => {
  const [loading, setLoading] = useState(false);

  const getInitialState = () => ({
    datos_abc_id: '',
    indicador: '',
    volumen: '',
    presupuesto: ''
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
      if (detalle) {
        setFormData({
          datos_abc_id: detalle.datos_abc_id || '',
          indicador: detalle.indicador || '',
          volumen: detalle.volumen || '',
          presupuesto: detalle.presupuesto || ''
        });
      } else {
        setFormData(getInitialState());
      }
    }
  }, [detalle, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (!formData.indicador.trim()) {
        alert('El indicador es requerido');
        setLoading(false);
        return;
      }
      if (!formData.volumen || parseFloat(formData.volumen) < 0) {
        alert('El volumen debe ser mayor o igual a 0');
        setLoading(false);
        return;
      }
      if (!formData.presupuesto || parseFloat(formData.presupuesto) < 0) {
        alert('El presupuesto debe ser mayor o igual a 0');
        setLoading(false);
        return;
      }

      const dataToSave = {
        datos_abc_id: formData.datos_abc_id,
        indicador: formData.indicador,
        volumen: parseFloat(formData.volumen),
        presupuesto: parseFloat(formData.presupuesto)
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
          <h1>EDITAR COSTOS ABC</h1>
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
                <Label>Indicador:</Label>
                <Input
                  className="form-control"
                  type="text"
                  name="indicador"
                  value={formData.indicador}
                  onChange={handleChange}
                  placeholder="Ingrese el indicador"
                  maxLength="255"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Volumen:</Label>
                <Input
                  className="form-control"
                  type="number"
                  name="volumen"
                  value={formData.volumen}
                  onChange={handleChange}
                  placeholder="Ingrese el volumen"
                  min="0"
                  step="0.01"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Presupuesto:</Label>
                <Input
                  className="form-control"
                  type="number"
                  name="presupuesto"
                  value={formData.presupuesto}
                  onChange={handleChange}
                  placeholder="Ingrese el presupuesto"
                  min="0"
                  step="0.01"
                  required
                />
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

export default ModalCostosAbc;