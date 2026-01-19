import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import './ModalDetalleAbc.css';
import Loader from '../../components/Loader/Loader';

const ModalDetalleAbc = ({
  detalle,
  onSave,
  onClose,
  isOpen,
  areas,
  prioridadActividad
}) => {
  const [loading, setLoading] = useState(false);

  const getInitialState = () => ({
    area_id: '',
    actividad: '',
    prioridad: ''
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
      if (detalle) {
        setFormData({
          area_id: detalle.area_id?.toString() || '',
          actividad: detalle.actividad || '',
          prioridad: detalle.prioridad?.toString() || ''
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
      
      if (!formData.area_id || !formData.actividad.trim() || !formData.prioridad) {
        alert('Complete todos los campos obligatorios.');
        setLoading(false);
        return;
      }

      const dataToSave = {
        ...formData,
        area_id: parseInt(formData.area_id, 10),
        prioridad: parseInt(formData.prioridad, 10)
      };

      if (detalle) {
        dataToSave.gasto_responsable_id = detalle.gasto_responsable_id;
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
          <h1>{detalle ? 'EDITAR DETALLAE ABC' : 'NUEVO DETALLE ABC'}</h1>
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
                <Label>Área:</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="area_id"
                  value={formData.area_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  {areas?.map((area) => (
                    <option key={area.tipo_id} value={area.tipo_id}>
                      {area.descripcion}
                    </option>
                  ))}
                </Input>
              </FormGroup>

              <FormGroup>
                <Label>Actividad:</Label>
                <Input
                  className="form-control"
                  type="text"
                  name="actividad"
                  value={formData.actividad}
                  onChange={handleChange}
                  placeholder="Ingrese la actividad"
                  maxLength="255"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Prioridad:</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="prioridad"
                  value={formData.prioridad}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  {prioridadActividad?.map((prioridad) => (
                    <option key={prioridad.tipo_id} value={prioridad.tipo_id}>
                      {prioridad.descripcion}
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

export default ModalDetalleAbc;