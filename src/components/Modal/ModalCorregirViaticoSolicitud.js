import React, { useState, useContext } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { AppContext } from '../../application/provider';
import './ModalCajaFlujoConcepto.css';
import Loader from '../Loader/Loader';
import ArchivosService from '../../axios_services/archivos.service';

const ModalCorregirViaticoSolicitud = ({ isOpen, onClose, solicitud, onCorreccionComplete }) => {
    const [state] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [comentario, setComentario] = useState('');

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
            if (!archivoSeleccionado) {
                alert('Debe adjuntar un nuevo archivo');
                return;
            }

            setLoading(true);

            await ArchivosService.guardarArchivoViaticoSolicitud(
                archivoSeleccionado,
                solicitud.viatico_solicitud_id,
                state.user?.usuario_id
            );

            await onCorreccionComplete(comentario);
            setComentario('');
            setArchivoSeleccionado(null);
            onClose();
        } catch (error) {
            console.error("Error al corregir:", error);
            const errorMsg = error.response?.data?.message || 'Ocurrió un error al corregir.';
            alert(`Error: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    if (!solicitud) return null;

    return (
        <Modal isOpen={isOpen} className="custom-modal" backdrop="static">
            <ModalHeader className="modal-header">
                <div className="titulo">
                    <h1>CORREGIR SOLICITUD DE VIÁTICO</h1>
                    <Button className="close-btn" onClick={onClose}>X</Button>
                </div>
            </ModalHeader>
            <div className="modal-body-footer">
                {loading ? (
                    <Loader />
                ) : (
                    <ModalBody className="modal-body">
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-300 rounded">
                            <p><strong>Observación:</strong> {solicitud.comentario}</p>
                        </div>

                        <Form onSubmit={(e) => e.preventDefault()}>
                            <FormGroup>
                                <Label>Nuevo Archivo: <span style={{color: 'red'}}>*</span></Label>
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
                            </FormGroup>

                            <FormGroup>
                                <Label>Comentario (opcional):</Label>
                                <Input
                                    className="form-control"
                                    type="textarea"
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    placeholder="Ingrese un comentario sobre la corrección"
                                    rows="3"
                                />
                            </FormGroup>

                            <FormGroup>
                                <div className="button-container">
                                    <Button
                                        className="button-custom"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                    >
                                        ENVIAR CORRECCIÓN
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

export default ModalCorregirViaticoSolicitud;