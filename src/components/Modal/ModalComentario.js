import React, { useState, useContext } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, FormGroup, Label } from 'reactstrap';
import PropuestaSolicitudService from '../../axios_services/solicitud.service';


const ModalComentario = ({ isOpen, toggle, propuestaId }) => {
    const [state] = useContext(AppContext);
    const [comentario, setComentario] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGuardarComentario = async () => {
        if (!comentario.trim()) {
            alert('El comentario no puede estar vacío.');
            return;
        }
        setLoading(true);
        try {
            await PropuestaSolicitudService.addComentarioEstadoRevision(
                propuestaId,
                state.user?.usuario_id,
                state.user?.perfil_id,
                comentario
            );
            alert('Comentario registrado con éxito.');
            setComentario('');
            toggle();
        } catch (error) {
            console.error('Error al registrar el comentario:', error);
            alert('Hubo un error al registrar el comentario.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Agregar Comentario</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="comentario">Comentario</Label>
                    <Input
                        type="textarea"
                        name="comentario"
                        id="comentario"
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder="Escribe tu comentario aquí..."
                        rows="5"
                    />
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={handleGuardarComentario} disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrar'}
                </Button>{' '}
                <Button color="secondary" onClick={toggle} disabled={loading}>
                    Cancelar
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default ModalComentario;