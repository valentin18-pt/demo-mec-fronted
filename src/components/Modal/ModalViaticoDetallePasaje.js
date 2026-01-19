import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import './ModalCajaFlujoConcepto.css';
import Loader from '../Loader/Loader';

const ModalViaticoDetallePasaje = ({ onSave, onClose, isOpen, detallePasajeEditar }) => {
  const [loading, setLoading] = useState(false);

  const getInitialState = () => ({
    origen: '',
    destino: '',
    pasaje: '',
    hospedaje: '',
    alimentacion: '',
    adicional_asignado: ''
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
      if (detallePasajeEditar) {
        setFormData({
          origen: detallePasajeEditar.origen || '',
          destino: detallePasajeEditar.destino || '',
          pasaje: detallePasajeEditar.pasaje || '',
          hospedaje: detallePasajeEditar.hospedaje || '',
          alimentacion: detallePasajeEditar.alimentacion || '',
          adicional_asignado: detallePasajeEditar.adicional_asignado || ''
        });
      } else {
        setFormData(getInitialState());
      }
    }
  }, [isOpen, detallePasajeEditar]);

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
      
      if (!formData.origen.trim()) {
        alert('El origen es requerido');
        setLoading(false);
        return;
      }

      if (!formData.destino.trim()) {
        alert('El destino es requerido');
        setLoading(false);
        return;
      }

      const dataToSave = {
        origen: formData.origen.trim(),
        destino: formData.destino.trim(),
        pasaje: formData.pasaje ? parseFloat(formData.pasaje) : null,
        hospedaje: formData.hospedaje ? parseFloat(formData.hospedaje) : null,
        alimentacion: formData.alimentacion ? parseFloat(formData.alimentacion) : null,
        adicional_asignado: formData.adicional_asignado ? parseFloat(formData.adicional_asignado) : null
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
          <h1>{detallePasajeEditar ? 'EDITAR DETALLE PASAJE' : 'AGREGAR DETALLE PASAJE'}</h1>
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
                <Label>Origen:</Label>
                <Input
                  className="form-control"
                  type="text"
                  name="origen"
                  value={formData.origen}
                  onChange={handleChange}
                  placeholder="Ingrese el origen"
                  maxLength="255"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Destino:</Label>
                <Input
                  className="form-control"
                  type="text"
                  name="destino"
                  value={formData.destino}
                  onChange={handleChange}
                  placeholder="Ingrese el destino"
                  maxLength="255"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Pasaje Ida - Vuelta:</Label>
                <Input
                  className="form-control"
                  type="number"
                  name="pasaje"
                  value={formData.pasaje}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </FormGroup>

              <FormGroup>
                <Label>Hospedaje:</Label>
                <Input
                  className="form-control"
                  type="number"
                  name="hospedaje"
                  value={formData.hospedaje}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </FormGroup>

              <FormGroup>
                <Label>Alimentación:</Label>
                <Input
                  className="form-control"
                  type="number"
                  name="alimentacion"
                  value={formData.alimentacion}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </FormGroup>

              <FormGroup>
                <Label>Adicional Asignado:</Label>
                <Input
                  className="form-control"
                  type="number"
                  name="adicional_asignado"
                  value={formData.adicional_asignado}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </FormGroup>

              <FormGroup>
                <div className="button-container">
                  <Button
                    className="button-custom"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {detallePasajeEditar ? 'ACTUALIZAR' : 'GUARDAR'}
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

export default ModalViaticoDetallePasaje;