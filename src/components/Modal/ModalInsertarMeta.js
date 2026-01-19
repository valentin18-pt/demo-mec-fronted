import React, {useState, useContext} from "react";
import {AppContext} from '../../application/provider';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup} from 'reactstrap';
import "./ModalCrearUsuario.css";
import MetasService from "../../axios_services/metas.service";
import Loader from '../../components/Loader/Loader'; 


function ModalInsertarMeta({isOpen}) {

    const [state,setState] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [monto, setMonto] = useState('');

    const insertarMetaMensual = async () => {
            try {
                await MetasService.insertarMetaMensual(
                    state.periodo_fecha_meta,
                    monto,
                    state.user?.usuario_id,
                    state.usuario_asignado_id,
                    state.tipo_meta_id,
                    state.asignacion_meta_id
                );
                setState((prevState) => ({...prevState, isUpdated: true}));
                alert("La meta ha sido registrada correctamente");
                cerrarModal();
            } catch (error) {
                console.error("Error al registrar meta:", error);
                alert("Ocurrió un error al registrar meta. Por favor, intente nuevamente.");
            }
        };

    function cerrarModal () {
        setState((prevState) => ({
            ...prevState,
            modalInsertarMeta: false,
            periodo_fecha_meta: null,
            usuario_asignado_id:null,
        }));
        setMonto('');
    }; 

return (
    state.modalInsertarMeta === true && (<Modal isOpen={state.modalInsertarMeta} className="custom-modal" backdrop={true}>
        <ModalHeader className="modal-header">
            <div class="titulo">
                <h1>{state.asignacion_meta_id === 1 ? 'META INDIVIDUAL': state.asignacion_meta_id === 2 ? 'META POR EQUIPO' : ''}</h1>
                <Button className="close-btn" onClick={cerrarModal}>X</Button>
            </div>
        </ModalHeader>
    <div class="modal-body-footer">
            {loading ? (
            <Loader />
            ) : (
        <ModalBody className="modal-body">
            <Form className="fila">
                <FormGroup>
                    <label>Meta:</label>
                    <div className="input-group custom-input-group">
                        <span className="input-group-text custom-symbol">S/.</span>
                            <input
                                className="form-control"
                                name="monto"
                                type="number"
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                            />
                    </div>
                </FormGroup>
                <FormGroup>
                    <div className="button-container">
                        <Button 
                            className="button-custom" 
                            onClick={async () => {
                                const confirmAction = window.confirm("¿Está seguro de asignar esta meta al usuario seleccionado?");
                                if (!confirmAction) {
                                    return;
                                }
                                await insertarMetaMensual();
                        }}
                        >
                            {"ASIGNAR"}
                        </Button>
                    </div>
                </FormGroup>
            </Form>
        </ModalBody>)}
        </div>
    </Modal>)
        
    );
}

export default ModalInsertarMeta;