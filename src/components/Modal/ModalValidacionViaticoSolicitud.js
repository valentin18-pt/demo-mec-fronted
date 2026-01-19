import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import './ModalCajaFlujoConcepto.css';
import Loader from '../Loader/Loader';
import { CheckCircle, XCircle } from 'lucide-react';

const ModalValidacionViaticoSolicitud = ({ isOpen, onClose, solicitud, onValidacionComplete }) => {
    const [loading, setLoading] = useState(false);
    const [comentario, setComentario] = useState('');

    const handleValidar = async () => {
        try {
            setLoading(true);
            await onValidacionComplete('validar', comentario);
            setComentario('');
            onClose();
        } catch (error) {
            console.error("Error al validar:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleObservar = async () => {
        try {
            if (!comentario.trim()) {
                alert('Debe ingresar un comentario para observar la solicitud');
                return;
            }

            setLoading(true);
            await onValidacionComplete('observar', comentario);
            setComentario('');
            onClose();
        } catch (error) {
            console.error("Error al observar:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!solicitud) return null;

    return (
        <Modal isOpen={isOpen} className="custom-modal" backdrop="static">
            <ModalHeader className="modal-header">
                <div className="titulo">
                    <h1>VALIDAR SOLICITUD DE VIÁTICO</h1>
                    <Button className="close-btn" onClick={onClose}>X</Button>
                </div>
            </ModalHeader>
            <div className="modal-body-footer">
                {loading ? (
                    <Loader />
                ) : (
                    <ModalBody className="modal-body">
                        <div className="mb-3">
                            <p><strong>N° Solicitud:</strong> {solicitud.n_solicitud}</p>
                            <p><strong>Colaborador:</strong> {solicitud.colaborador}</p>
                            <p><strong>Fecha:</strong> {new Date(solicitud.fecha_registro).toLocaleDateString('es-PE')}</p>
                            {solicitud.comentario && (
                                <p><strong>Comentario anterior:</strong> {solicitud.comentario}</p>
                            )}
                        </div>

                        <Form onSubmit={(e) => e.preventDefault()}>
                            <FormGroup>
                                <Label>Comentario (opcional para validar, obligatorio para observar):</Label>
                                <Input
                                    className="form-control"
                                    type="textarea"
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    placeholder="Ingrese un comentario"
                                    rows="4"
                                />
                            </FormGroup>

                            <FormGroup>
                                <div className="d-flex gap-2 justify-content-center">
                                    <Button
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-semibold rounded-lg shadow transition"
                                        onClick={handleValidar}
                                        disabled={loading}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Validar
                                    </Button>
                                    <Button
                                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 font-semibold rounded-lg shadow transition"
                                        onClick={handleObservar}
                                        disabled={loading}
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Observar
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

export default ModalValidacionViaticoSolicitud;