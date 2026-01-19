import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import CajaDatosService from '../../axios_services/cajaflujodatos.service';
import './ModalCajaFlujoConcepto.css';
import Loader from '../Loader/Loader';

const ModalCajaFlujoConcepto = ({ onSave, onClose, isOpen, perfilId, conceptoEditar }) => {
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  const getInitialState = () => ({
    caja_categoria_id: '',
    nombre_concepto: ''
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    const cargarCategorias = async () => {
      if (isOpen) {
        // Si hay concepto a editar, cargar sus datos
        if (conceptoEditar) {
          setFormData({
            caja_categoria_id: conceptoEditar.caja_categoria_id || '',
            nombre_concepto: conceptoEditar.nombre_concepto || ''
          });
        } else {
          setFormData(getInitialState());
        }
        
        setLoadingCategorias(true);
        
        try {
          const response = await CajaDatosService.getCajaCategoria(perfilId);
          if (response.success && response.data) {
            setCategorias(response.data);
          } else {
            setCategorias([]);
            alert('No se pudieron cargar las categorías');
          }
        } catch (error) {
          console.error('Error al cargar categorías:', error);
          const errorMsg = error.response?.data?.message || 'Error al cargar las categorías';
          alert(errorMsg);
          setCategorias([]);
        } finally {
          setLoadingCategorias(false);
        }
      } else {
        setCategorias([]);
      }
    };

    cargarCategorias();
  }, [isOpen, perfilId, conceptoEditar]);

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
      
      if (!formData.caja_categoria_id) {
        alert('La categoría es obligatoria');
        setLoading(false);
        return;
      }
      if (!formData.nombre_concepto.trim()) {
        alert('El nombre del concepto es requerido');
        setLoading(false);
        return;
      }

      const dataToSave = {
        caja_categoria_id: parseInt(formData.caja_categoria_id),
        nombre_concepto: formData.nombre_concepto.trim()
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
          <h1>{conceptoEditar ? 'EDITAR CONCEPTO' : 'AGREGAR CONCEPTO'}</h1>
          <Button className="close-btn" onClick={onClose}>X</Button>
        </div>
      </ModalHeader>
      <div className="modal-body-footer">
        {(loading || loadingCategorias) ? (
          <Loader />
        ) : (
          <ModalBody className="modal-body">
            <Form className="fila" onSubmit={(e) => e.preventDefault()}>
              <FormGroup>
                <Label>Categoría:</Label>
                <Input
                  className="form-control"
                  type="select"
                  name="caja_categoria_id"
                  value={formData.caja_categoria_id}
                  onChange={handleChange}
                  disabled={loadingCategorias}
                  required
                >
                  <option value="">
                    {loadingCategorias ? 'Cargando categorías...' : 'Seleccione una categoría'}
                  </option>
                  {categorias && categorias.map((categoria) => (
                    <option key={categoria.caja_categoria_id} value={categoria.caja_categoria_id}>
                      {categoria.nombre_categoria}
                    </option>
                  ))}
                </Input>
              </FormGroup>

              <FormGroup>
                <Label>Nombre del Concepto:</Label>
                <Input
                  className="form-control"
                  type="text"
                  name="nombre_concepto"
                  value={formData.nombre_concepto}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre del concepto"
                  maxLength="255"
                  required
                />
              </FormGroup>

              <FormGroup>
                <div className="button-container">
                  <Button
                    className="button-custom"
                    onClick={handleSubmit}
                    disabled={loading || loadingCategorias}
                  >
                    {conceptoEditar ? 'ACTUALIZAR' : 'GUARDAR'}
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

export default ModalCajaFlujoConcepto;