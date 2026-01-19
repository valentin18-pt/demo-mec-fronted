import React, {useState, useContext} from "react";
import {AppContext} from '../../application/provider';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup} from 'reactstrap';
import "./ModalReestablecerUsuario.css";
import UsuarioService from "../../axios_services/usuarios.service";
import Loader from '../../components/Loader/Loader'; 

function ModalReestablecerUsuario({isOpen}) {

    const [state,setState] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [fecha_ingreso, setFechaIngreso] = useState('');

    const reestablecerUsuario = async () => {
        if (fecha_ingreso == '' || new Date(fecha_ingreso) < new Date(state.usuario.fecha_cese) || new Date(fecha_ingreso) > new Date()) {
            alert("Ingrese una fecha de ingreso válida (posterior al cese y no mayor a hoy)");
            return;
        }
    
        try {
            await UsuarioService.reestablecerUsuario(
                state.user?.usuario_id,
                state.usuario.usuario_id,  
                fecha_ingreso
            );
            setState((prevState) => ({...prevState, isUpdated: true}));
            alert("El usuario ha sido reestablecido correctamente");
            cerrarModal();
        } catch (error) {
            console.error("Error al reestablecer el usuario:", error);
            alert("Ocurrió un error al reestablecer el usuario. Por favor, intente nuevamente.");
        }
    };

    function cerrarModal () {
        setState((prevState) => ({
            ...prevState,
            modalReestablecerUsuario: false,
            usuario:null
        }));
        setFechaIngreso('');
    }; 

return (
    state.modalReestablecerUsuario === true && (<Modal isOpen={state.modalReestablecerUsuario} className="custom-modal" backdrop={true}>
        <ModalHeader className="modal-header">
            <div class="titulo">
                <h1>{(state.usuario.apellidos.toUpperCase() + ', ' + state.usuario.nombre.toUpperCase())}</h1>
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
                    <label>Fecha de ingreso:</label>
                    <input
                        className="form-control"
                        name="fecha_ingreso"
                        type="date"
                        value={fecha_ingreso} 
                        onChange={(e) => setFechaIngreso(e.target.value)}
                        min={state.usuario.fecha_cese} 
                        max={new Date().toISOString().split('T')[0]}
                    />
                </FormGroup>
                    <div className="button-container">
                        <Button 
                            id="boton-form-modal"
                            className="button-custom" 
                            style={{ backgroundColor: '#2e7d32'}}
                            onClick={async () => {
                                const confirmAction = window.confirm("¿Está seguro de que desea reestablecer a este usuario?");
                                if (!confirmAction) {
                                    return;
                                }
                                await reestablecerUsuario();
                        }}
                        >
                            {"REACTIVAR USUARIO"}
                        </Button>
                    </div>
            </Form>
        </ModalBody>)}
        </div>
    </Modal>)
        
    );
}

export default ModalReestablecerUsuario;