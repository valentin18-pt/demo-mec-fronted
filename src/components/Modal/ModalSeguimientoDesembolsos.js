import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import Loader from '../Loader/Loader';

const ModalSeguimientoDesembolsos = ({ 
  seguimiento, 
  onSave, 
  onClose, 
  isOpen,
  estadosSeguimiento,
  usuarioId
}) => {
  const [loading, setLoading] = useState(false);

  const getInitialState = () => ({
    estado_id: '',
    comentario: ''
  });

  const [formData, setFormData] = useState(getInitialState());

  const esEstadoFinalizado = seguimiento?.estado_id === 1;

  useEffect(() => {
    if (isOpen) {
      if (seguimiento) {
        setFormData({
          estado_id: seguimiento.estado_id?.toString() || '',
          comentario: seguimiento.comentario || ''
        });
      } else {
        setFormData(getInitialState());
      }
    }
  }, [seguimiento, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!formData.estado_id) {
        alert('Por favor, seleccione un estado.');
        setLoading(false);
        return;
      }

      if (esEstadoFinalizado) {
        alert('Este seguimiento ya está finalizado y no se puede modificar.');
        setLoading(false);
        return;
      }

      const dataToSave = {
        propuesta_solicitud_id: seguimiento.propuesta_solicitud_id,
        estado_id: parseInt(formData.estado_id, 10),
        comentario: formData.comentario.trim() || null,
        usuario_id: usuarioId,
        fecha_seguimiento: new Date().toISOString().split('T')[0]
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
          <h1>SEGUIMIENTO DE DESEMBOLSO</h1>
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
                <Label>N° de Solicitud:</Label>
                <Input
                  className="form-control"
                  type="text"
                  value={seguimiento?.n_solicitud || 'N/A'}
                  disabled
                />
              </FormGroup>

              <FormGroup>
                <Label>DNI:</Label>
                <Input
                  className="form-control"
                  type="text"
                  value={seguimiento?.dni || 'N/A'}
                  disabled
                />
              </FormGroup>

              <FormGroup>
                <Label>Apellidos y Nombres:</Label>
                <Input
                  className="form-control"
                  type="text"
                  value={seguimiento?.nombre || 'N/A'}
                  disabled
                />
              </FormGroup>

              <FormGroup>
                <Label>Estado (*):</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="estado_id"
                  value={formData.estado_id}
                  onChange={handleChange}
                  disabled={esEstadoFinalizado}
                  required
                >
                  <option value="">Seleccione...</option>
                  {estadosSeguimiento?.map((estado) => (
                    <option key={estado.tipo_id} value={estado.tipo_id}>
                      {estado.descripcion}
                    </option>
                  ))}
                </Input>
                {esEstadoFinalizado && (
                  <small className="text-danger">
                    Este seguimiento está finalizado y no puede modificarse.
                  </small>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Comentario:</Label>
                <Input
                  className="form-control"
                  type="textarea"
                  name="comentario"
                  value={formData.comentario}
                  onChange={handleChange}
                  placeholder="Ingrese sus comentario"
                  rows={4}
                  maxLength={250}
                  disabled={esEstadoFinalizado}
                />
                <small>{(formData.comentario?.length || 0)} / 250</small>
              </FormGroup>

              <FormGroup>
                <div className="button-container">
                  <Button
                    className="button-custom"
                    onClick={async () => {
                      if (window.confirm('¿Está seguro de guardar este seguimiento?')) {
                        await handleSubmit();
                      }
                    }}
                    disabled={esEstadoFinalizado}
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

export default ModalSeguimientoDesembolsos;