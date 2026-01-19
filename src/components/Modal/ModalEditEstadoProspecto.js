import React, {useState, useContext} from "react";
import {AppContext} from '../../application/provider';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Toast, ToastBody, ToastHeader,Form, FormGroup} from 'reactstrap';
import "./ModalEditEstadoProspecto.css";
import ProspectoService from "../../axios_services/prospectos.service";
import { Switch } from '@tremor/react';
import Loader from '../../components/Loader/Loader'; 

function ModalEditEstadoProspecto({isOpen}) {

    const [state,setState] = useContext(AppContext);
    const [usuario,setUsuario] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    //CATALOGOS
    const [gestores] = useState(state.user.personal.filter(p => {return p.perfil_id == 3 || p.perfil_id == 4}));
    const [estado] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 9 && (t.tipo_id == 3 || t.tipo_id == 11)}));

    const actualizarProspecto = () => {
        setState((prevState) => ({
            ...prevState, 
            isUpdated: true
        }));
    };

    const updateEvaluacionProspecto = async () => {
        try {
            const data = await ProspectoService.updateEvaluacionProspecto(
                state.prospecto_id, 
                state.zonal_prospecto,
                state.gestor_prospecto,
                state.user?.usuario_id
            );
            alert("Prospecto liberado satisfactoriamente");
            await cerrarModal();
            } catch (error) {
                if (error.response && error.response.data && error.response.data.error) {
                    alert(`Error: ${error.response.data.error}`);
                    } else {
                        alert("Hubo un error al liberar al prospecto. Intenta nuevamente.");
                    }
            }
    };

    const liberarDesembolsadoProspecto = async () => {
        try {
            const data = await ProspectoService.liberarDesembolsadoProspecto(
                state.prospecto_id, 
                state.user?.usuario_id
            );
            alert("Prospecto liberado satisfactoriamente");
            await cerrarModal();
            } catch (error) {
                if (error.response && error.response.data && error.response.data.error) {
                    alert(`Error: ${error.response.data.error}`);
                    } else {
                        alert("Hubo un error al liberar al prospecto. Intenta nuevamente.");
                    }
            }
    };

    function cerrarModal () {
        setState((prevState) => ({
            ...prevState,
            modalEditEstadoProspecto: false,
            isUpdated: false,
            prospecto_id: null,
            estado_prospecto: null,
            gestor_prospecto: null
        }));
    }; 

return (
    state.modalEditEstadoProspecto === true && (<Modal isOpen={state.modalEditEstadoProspecto} className="custom-modal" backdrop={true}>
        <ModalHeader className="modal-header">
            <div class="titulo">
                <h1>{state.prospecto_nombre}</h1>
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
                    <label className="label">Estado:</label>
                    <label className="input-checkbox">
                        <input
                            type="checkbox"
                            checked={Number(state.estado_prospecto) === 3 || Number(state.estado_prospecto) === 11} 
                            onChange={(e) => setState({...state,
                                    estado_prospecto: e.target.checked ? 3 : null
                            })}
                        />
                        {state.descripcion_estado_prospecto}
                    </label>
                </FormGroup>
                {state.descripcion_estado_prospecto === 'EVALUACIÓN' && (<FormGroup>
                    <label className="label">Gestor:</label>
                    <select 
                        className="form-control"
                        name="gestor_id"
                        value={state.gestor_prospecto} 
                        disabled={Number(state.estado_prospecto) === 3}
                        onChange={(e) => setState({...state, gestor_prospecto: e.target.value})}
                    >
                        {gestores
                        .filter(item => (item.usuario_id_jefe_inmediato === state.zonal_prospecto) || (item.usuario_id_jefe_jefe_inmediato === state.zonal_prospecto))
                        .map((item) => (
                            <option key={item.usuario_id} value={item.usuario_id}>
                                {item.nombre_completo_usuario}
                            </option>
                        ))}
                    </select>
                </FormGroup>)}
            </Form>
            <div className="button-container fila">
                <Button 
                    className="button-custom" 
                    disabled={(Number(state.estado_prospecto) === 3 ||Number(state.estado_prospecto) === 11)}
                    onClick={async () => {
                        const userConfirmed = window.confirm(`Esta acción liberará de su estado evaluacion a este prospecto.` + 
                            "¿Está seguro de que desea proceder?");
                            if (userConfirmed) {
                                if (state.descripcion_estado_prospecto === 'EVALUACIÓN') {
                                    await updateEvaluacionProspecto();
                                } else if (state.descripcion_estado_prospecto === 'DESEMBOLSÓ') {
                                    await liberarDesembolsadoProspecto();
                                }
                                actualizarProspecto();
                            }
                    }}
                    >
                    Actualizar 
                </Button>
            </div>
        </ModalBody>)}
        </div>
    </Modal>)
        
    );
}

export default ModalEditEstadoProspecto;