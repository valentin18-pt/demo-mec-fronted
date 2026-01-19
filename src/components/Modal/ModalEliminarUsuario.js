import React, {useState, useContext} from "react";
import {AppContext} from '../../application/provider';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup} from 'reactstrap';
import "./ModalCrearUsuario.css";
import UsuarioService from "../../axios_services/usuarios.service";
import Loader from '../../components/Loader/Loader'; 


function ModalEliminarUsuario({isOpen}) {

    const [state,setState] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [fecha_cese, setFechaCese] = useState('');
    const [devolvio_fotocheck, setDevolvioFotocheck] = useState(false);
    const [motivo_cese_id, setMotivoCese] = useState('');
    const [comentario, setComentario] = useState('');

    //CATALOGOS
    const [motivos_cese] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 18}));

    const deleteUsuario = async () => {
    
        if (fecha_cese == '' || new Date(fecha_cese) <= new Date(state.usuario.fecha_ingreso) || new Date(fecha_cese) > new Date()) {
            alert("Ingrese una fecha de cese válida (posterior al ingreso y no mayor a hoy)");
            return;
        }
        if (!motivo_cese_id) {
            alert("Seleccione un motivo de cese válido");
            return;
        }
    
        try {
            await UsuarioService.deleteUsuario(
                state.user?.usuario_id,   
                state.usuario.usuario_id,  
                fecha_cese,
                motivo_cese_id,
                comentario,
                devolvio_fotocheck
            );
            setState((prevState) => ({...prevState, isUpdated: true}));
            alert("El usuario ha sido dado de baja correctamente");
            cerrarModal();
        } catch (error) {
            console.error("Error al dar de baja el usuario:", error);
            alert("Ocurrió un error al dar de baja al usuario. Por favor, intente nuevamente.");
        }
    };

    function cerrarModal () {
        setState((prevState) => ({
            ...prevState,
            modalEliminarUsuario: false,
            usuario:null
        }));
        setFechaCese('');
        setMotivoCese('');
        setComentario('');
        setDevolvioFotocheck('');
    }; 

return (
    state.modalEliminarUsuario === true && (<Modal isOpen={state.modalEliminarUsuario} className="custom-modal" backdrop={true}>
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
                    <label>Fecha de cese:</label>
                    <input
                        className="form-control"
                        name="fecha_cese"
                        type="date"
                        value={fecha_cese} 
                        onChange={(e) => setFechaCese(e.target.value)}
                        min={state.usuario.fecha_ingreso} 
                        max={new Date().toISOString().split('T')[0]}
                    />
                </FormGroup>
                <FormGroup>
                    <label >Motivo de cese:</label>
                    <select 
                        className="form-control"
                        name="motivo_cese"
                        value={motivo_cese_id} 
                        onChange={(e) => setMotivoCese(e.target.value)} 
                    >
                        <option value=''>Selecciona el motivo de cese</option>
                        {motivos_cese.map((item) => (
                                <option key={item.tipo_id} value={item.tipo_id}>
                                    {item.descripcion}
                                </option>
                            ))}
                    </select>
                </FormGroup>
                <FormGroup>
                    <label >Comentario:</label>
                    <input
                        className="form-control"
                        name="comentario"
                        type="text"
                        value={comentario} 
                        onChange={(e) => setComentario(e.target.value)}
                    />
                </FormGroup>
                <FormGroup className="form-group d-flex align-items-center">
                    <input
                        type="checkbox"
                        id="devolvio_indumentaria"
                        name="devolvio_indumentaria"
                        checked={devolvio_fotocheck}
                        onChange={(e) => setDevolvioFotocheck(e.target.checked)}
                    />
                    <label htmlFor="devolvio_indumentaria" className="checkbox-label">
                        Devolvió indumentaria (fotocheck)
                    </label>
                </FormGroup>
                    <div className="button-container">
                        <Button 
                            id="boton-form-modal"
                            className="button-custom" 
                            style={{ backgroundColor: '#c53030'}}
                            onClick={async () => {
                                const confirmAction = window.confirm("¿Está seguro de que desea dar de baja a este usuario?");
                                if (!confirmAction) {
                                    return;
                                }
                                await deleteUsuario();
                        }}
                        >
                            {"DESACTIVAR USUARIO"}
                        </Button>
                    </div>
            </Form>
        </ModalBody>)}
        </div>
    </Modal>)
        
    );
}

export default ModalEliminarUsuario;