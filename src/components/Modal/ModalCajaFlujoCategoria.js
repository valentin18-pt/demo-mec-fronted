import React, { useState, useEffect, useContext } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { AppContext } from '../../application/provider';
import './ModalCajaFlujoConcepto.css';
import Loader from '../Loader/Loader';

const ModalCajaFlujoCategoria = ({ onSave, onClose, isOpen, categoriaEditar }) => {
  const [state] = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [tiposCategorias] = useState(
    state.catalogos?.tipos?.filter(t => t.categoria_id == 27) || []
  );

  const getInitialState = () => ({
    nombre_categoria: '',
    tipo_id: ''
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
      // Si hay categoría a editar, cargar sus datos
      if (categoriaEditar) {
        setFormData({
          nombre_categoria: categoriaEditar.nombre_categoria || '',
          tipo_id: categoriaEditar.tipo_id || ''
        });
      } else {
        setFormData(getInitialState());
      }
    }
  }, [isOpen, categoriaEditar]);

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
      
      if (!formData.tipo_id) {
        alert('El tipo de categoría es obligatorio');
        setLoading(false);
        return;
      }

      if (!formData.nombre_categoria.trim()) {
        alert('El nombre de la categoría es requerido');
        setLoading(false);
        return;
      }

      const dataToSave = {
        nombre_categoria: formData.nombre_categoria.trim(),
        tipo_id: parseInt(formData.tipo_id)
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
          <h1>{categoriaEditar ? 'EDITAR CATEGORÍA' : 'AGREGAR CATEGORÍA'}</h1>
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
                <Label>Tipo de Categoría:</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="tipo_id"
                  value={formData.tipo_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  {tiposCategorias && tiposCategorias.map((tipo) => (
                    <option key={tipo.tipo_id} value={tipo.tipo_id}>
                      {tipo.descripcion}
                    </option>
                  ))}
                </Input>
              </FormGroup>

              <FormGroup>
                <Label>Nombre de la Categoría:</Label>
                <Input
                  className="form-control"
                  type="text"
                  name="nombre_categoria"
                  value={formData.nombre_categoria}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre de la categoría"
                  maxLength="255"
                  required
                />
              </FormGroup>

              <FormGroup>
                <div className="button-container">
                  <Button
                    className="button-custom"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {categoriaEditar ? 'ACTUALIZAR' : 'GUARDAR'}
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

export default ModalCajaFlujoCategoria;