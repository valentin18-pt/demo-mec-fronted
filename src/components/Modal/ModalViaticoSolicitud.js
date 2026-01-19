import React, { useState, useEffect, useContext } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { AppContext } from '../../application/provider';
import './ModalCajaFlujoConcepto.css';
import Loader from '../Loader/Loader';
import ArchivosService from '../../axios_services/archivos.service';

const ModalViaticoSolicitud = ({ onSave, onClose, isOpen, viaticoSolicitudEditar }) => {
  const [state] = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [archivoActual, setArchivoActual] = useState(null);

  const getInitialState = () => ({
    comentario: '',
    fecha_registro: new Date().toISOString().split('T')[0]
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
      if (viaticoSolicitudEditar) {
        setFormData({
          comentario: viaticoSolicitudEditar.comentario || '',
          fecha_registro: viaticoSolicitudEditar.fecha_registro 
            ? new Date(viaticoSolicitudEditar.fecha_registro).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
        });
        cargarArchivoExistente(viaticoSolicitudEditar.viatico_solicitud_id);
      } else {
        setFormData(getInitialState());
        setArchivoActual(null);
        setArchivoSeleccionado(null);
      }
    }
  }, [isOpen, viaticoSolicitudEditar]);

  const cargarArchivoExistente = async (viaticoSolicitudId) => {
    try {
      const response = await ArchivosService.getArchivoViaticoSolicitud(viaticoSolicitudId);
      if (response.success && response.data) {
        setArchivoActual(response.data);
      }
    } catch (error) {
      console.log('No hay archivo existente');
      setArchivoActual(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        alert('Solo se permiten archivos PDF, JPG, JPEG o PNG');
        e.target.value = '';
        return;
      }

      if (file.size > maxSize) {
        alert('El archivo no debe superar los 5MB');
        e.target.value = '';
        return;
      }

      setArchivoSeleccionado(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!archivoSeleccionado && !viaticoSolicitudEditar) {
        alert('Debe adjuntar un archivo');
        setLoading(false);
        return;
      }

      const dataToSave = {
        comentario: formData.comentario.trim(),
        usuario_id: state.user?.usuario_id
      };

      const solicitudResponse = await onSave(dataToSave);

      if (archivoSeleccionado) {
        const viaticoSolicitudId = viaticoSolicitudEditar 
          ? viaticoSolicitudEditar.viatico_solicitud_id 
          : solicitudResponse.data.viatico_solicitud_id;

        await ArchivosService.guardarArchivoViaticoSolicitud(
          archivoSeleccionado,
          viaticoSolicitudId,
          state.user?.usuario_id
        );
      }

      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
      const errorMsg = error.response?.data?.message || 'Ocurrió un error al guardar.';
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const verArchivo = () => {
    if (archivoActual && archivoActual.url_completa) {
      window.open(archivoActual.url_completa, '_blank');
    }
  };

  return (
    <Modal isOpen={isOpen} className="custom-modal" backdrop="static">
      <ModalHeader className="modal-header">
        <div className="titulo">
          <h1>{viaticoSolicitudEditar ? 'EDITAR SOLICITUD DE VIÁTICO' : 'AGREGAR SOLICITUD DE VIÁTICO'}</h1>
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
                <Label>Fecha de Registro:</Label>
                <Input
                  className="form-control"
                  type="date"
                  name="fecha_registro"
                  value={formData.fecha_registro}
                  onChange={handleChange}
                  disabled
                />
              </FormGroup>

              <FormGroup>
                <Label>Comentario:</Label>
                <Input
                  className="form-control"
                  type="textarea"
                  name="comentario"
                  value={formData.comentario}
                  onChange={handleChange}
                  placeholder="Ingrese un comentario (opcional)"
                  rows="3"
                />
              </FormGroup>

              <FormGroup>
                <Label>Archivo Adjunto: {!viaticoSolicitudEditar && <span style={{color: 'red'}}>*</span>}</Label>
                <Input
                  className="form-control"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleArchivoChange}
                />
                <small className="form-text text-muted">
                  Formatos permitidos: PDF, JPG, JPEG, PNG. Tamaño máximo: 5MB
                </small>
                {archivoSeleccionado && (
                  <div className="mt-2">
                    <small className="text-success">
                      ✓ Archivo seleccionado: {archivoSeleccionado.name}
                    </small>
                  </div>
                )}
                {archivoActual && !archivoSeleccionado && (
                  <div className="mt-2">
                    <Button size="sm" color="info" onClick={verArchivo}>
                      Ver Archivo Actual
                    </Button>
                  </div>
                )}
              </FormGroup>

              <FormGroup>
                <div className="button-container">
                  <Button
                    className="button-custom"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {viaticoSolicitudEditar ? 'ACTUALIZAR' : 'GUARDAR'}
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

export default ModalViaticoSolicitud;