import React, {useState, useContext, useEffect} from "react";
import {AppContext} from '../../application/provider';
import { Modal, ModalHeader, ModalBody, Button, FormGroup} from 'reactstrap';
import "./ModalCrearUsuario.css";
import AsesorCajaService from "../../axios_services/asesorCaja.service";
import Loader from '../../components/Loader/Loader'; 

function ModalAsesorCaja({isOpen, onRefresh}) {
    const [state, setState] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [nombre_asesor, setNombreAsesor] = useState('');
    const [apellidos_asesor, setApellidosAsesor] = useState('');

    const registrarAsesorCaja = async () => {
        try {
            if (!nombre_asesor || nombre_asesor.trim().length <= 1) {
                alert("Ingrese un nombre válido");
                return;
            }
            if (!apellidos_asesor || apellidos_asesor.trim().length <= 1) {
                alert("Ingrese los apellidos correctamente.");
                return;
            }
            if (!state.asesor_caja?.celular_responsable || state.asesor_caja.celular_responsable.replace(/\s+/g, '').length !== 9) {
                alert("Ingrese un número de celular válido de 9 dígitos");
                return;
            }
            if (!/\S+@\S+\.\S+/.test(state.asesor_caja?.correo_responsable)) {
                alert("Ingrese un correo electrónico válido");
                return;
            }
            if (!state.asesor_caja?.agencia_id || state.asesor_caja.agencia_id === '') {
                alert("Seleccione una agencia válida");
                return;
            }
            if (!state.asesor_caja?.codigo_asesor || state.asesor_caja.codigo_asesor.length !== 6) {
                alert("El código del asesor debe contener exactamente 6 caracteres.");
                return;
            }
            if (!/^[a-zA-Z]+$/.test(state.asesor_caja.codigo_asesor)) {
                alert("El código de asesor solo debe contener letras");
                return;
            }
            
            setLoading(true);
            
            await AsesorCajaService.registrarAsesorCaja(
                `${apellidos_asesor.trim().toUpperCase()}, ${nombre_asesor.trim().toUpperCase()}`,
                state.asesor_caja.celular_responsable.replace(/\s+/g, ''),
                state.asesor_caja.correo_responsable.trim(),
                state.asesor_caja.agencia_id,
                state.asesor_caja.codigo_asesor.toUpperCase(),
            );
            
            alert("Asesor registrado satisfactoriamente");
            
            if (onRefresh) {
                await onRefresh();
            }
            
            cerrarModal();
        } catch (error) {
            console.error("Error al registrar el asesor de caja:", error);
            alert(error.response?.data?.error || error.response?.data?.message || "Ocurrió un error al registrar el asesor. Por favor, intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const updateAsesorCaja = async () => {
        try {
            if (!nombre_asesor || nombre_asesor.trim().length <= 1) {
                alert("Ingrese un nombre válido");
                return;
            }
            if (!apellidos_asesor || apellidos_asesor.trim().length <= 1) {
                alert("Ingrese los apellidos correctamente.");
                return;
            }
            if (!state.asesor_caja?.celular_responsable || state.asesor_caja.celular_responsable.replace(/\s+/g, '').length !== 9) {
                alert("Ingrese un número de celular válido de 9 dígitos");
                return;
            }
            if (!/\S+@\S+\.\S+/.test(state.asesor_caja?.correo_responsable)) {
                alert("Ingrese un correo electrónico válido");
                return;
            }
            if (!state.asesor_caja?.agencia_id || state.asesor_caja.agencia_id === '') {
                alert("Seleccione una agencia válida");
                return;
            }
            if (!state.asesor_caja?.codigo_asesor || state.asesor_caja.codigo_asesor.length !== 6) {
                alert("El código del asesor debe contener exactamente 6 caracteres.");
                return;
            }
            if (!/^[a-zA-Z]+$/.test(state.asesor_caja.codigo_asesor)) {
                alert("El código de asesor solo debe contener letras");
                return;
            }
            
            setLoading(true);
            
            await AsesorCajaService.updateAsesorCaja(
                state.asesor_caja.responsable_agencia_id,
                `${apellidos_asesor.trim().toUpperCase()}, ${nombre_asesor.trim().toUpperCase()}`,
                state.asesor_caja.celular_responsable.replace(/\s+/g, ''),
                state.asesor_caja.correo_responsable.trim(),
                state.asesor_caja.agencia_id,
                state.asesor_caja.codigo_asesor.toUpperCase(),
            );
            
            alert("Asesor de caja actualizado satisfactoriamente");
            
            if (onRefresh) {
                await onRefresh();
            }
            
            cerrarModal();
        } catch (error) {
            console.error("Error al actualizar el asesor:", error);
            alert(error.response?.data?.error || error.response?.data?.message || "Ocurrió un error al actualizar el asesor. Por favor, intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    function cerrarModal() {
        setState((prevState) => ({
            ...prevState,
            mostrarModalAsesorCaja: false,
            asesor_caja: null
        }));
        setNombreAsesor('');
        setApellidosAsesor('');
        setIsSaved(false);
    }

    useEffect(() => {
        if (state.asesor_caja?.nombre_responsable && state.mostrarModalAsesorCaja === true) {
            const nombreCompleto = state.asesor_caja.nombre_responsable.trim();
            if (nombreCompleto.includes(',')) {
                const [apellidos, nombres] = nombreCompleto.split(',').map(x => x.trim());
                setApellidosAsesor(apellidos || '');
                setNombreAsesor(nombres || '');
            } else {
                setNombreAsesor('');
                setApellidosAsesor('');
            }
        } else if (state.mostrarModalAsesorCaja === true) {
            // Nuevo registro - limpiar campos
            setNombreAsesor('');
            setApellidosAsesor('');
        }
    }, [state.asesor_caja?.nombre_responsable, state.mostrarModalAsesorCaja]);

    return (
        <Modal isOpen={isOpen} className="custom-modal" backdrop="static">
            <ModalHeader className="modal-header">
                <div className="titulo">
                    <h1>
                        {state.asesor_caja?.responsable_agencia_id 
                            ? "EDITAR ASESOR DE CAJA" 
                            : "REGISTRAR ASESOR DE CAJA"
                        }
                    </h1>
                    <Button className="close-btn" onClick={cerrarModal} disabled={loading}>X</Button>
                </div>
            </ModalHeader>
            <div className="modal-body-footer">
                {loading ? (
                    <Loader />
                ) : (
                    <ModalBody className="modal-body">
                        <span>Los campos marcados con (*) son obligatorios para completar el formulario.</span>
                        <div className="filter-colum1">
                            <FormGroup>
                                <label>Nombres (*):</label>
                                <input
                                    className="form-control"
                                    name="nombre"
                                    type="text"
                                    value={nombre_asesor}
                                    onChange={(e) => setNombreAsesor(e.target.value)}
                                    disabled={loading}
                                />
                            </FormGroup>
                            <FormGroup>
                                <label>Apellidos (*):</label>
                                <input
                                    className="form-control"
                                    name="apellidos"
                                    type="text"
                                    value={apellidos_asesor} 
                                    onChange={(e) => setApellidosAsesor(e.target.value)}
                                    disabled={loading}
                                />
                            </FormGroup>
                            <FormGroup>
                                <label>Celular (*):</label>
                                <input 
                                    className="form-control"
                                    name="celular"
                                    type="text" 
                                    maxLength={9}
                                    value={state.asesor_caja?.celular_responsable || ''} 
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setState((prevState) => ({
                                            ...prevState,
                                            asesor_caja: {
                                                ...prevState.asesor_caja, 
                                                celular_responsable: value
                                            }
                                        }));
                                    }}
                                    disabled={loading}
                                    placeholder="999999999"
                                />
                                <small>{(state.asesor_caja?.celular_responsable?.length || 0)} / 9</small>
                            </FormGroup>
                            <FormGroup>
                                <label>Correo electrónico (*):</label>
                                <input 
                                    className="form-control"
                                    name="correo_personal"
                                    type="email" 
                                    value={state.asesor_caja?.correo_responsable || ''} 
                                    onChange={(e) => 
                                        setState((prevState) => ({
                                            ...prevState,
                                            asesor_caja: {
                                                ...prevState.asesor_caja, 
                                                correo_responsable: e.target.value
                                            }
                                        }))
                                    }
                                    disabled={loading}
                                    placeholder="ejemplo@correo.com"
                                />
                            </FormGroup>
                            <FormGroup>
                                <label>Agencia (*):</label>
                                <select
                                    name="agencia_id"
                                    className="form-control"
                                    value={state.asesor_caja?.agencia_id || ''}
                                    onChange={(e) => {
                                        const selectedValue = e.target.value;
                                        setState((prevState) => ({
                                            ...prevState,
                                            asesor_caja: { 
                                                ...prevState.asesor_caja, 
                                                agencia_id: selectedValue 
                                            },
                                        }));
                                    }}
                                    disabled={loading}
                                >
                                    <option value="">Seleccione una agencia...</option>
                                    {state.agencias && state.agencias.length > 0 ? (
                                        state.agencias.map((item) => (
                                            <option key={item.agencia_id} value={item.agencia_id}>
                                                {item.descripcion}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No hay agencias disponibles</option>
                                    )}
                                </select>
                            </FormGroup>
                            <FormGroup>
                                <label>Código de asesor (*):</label>
                                <input 
                                    className="form-control"
                                    name="codigo_asesor"
                                    type="text" 
                                    maxLength={6} 
                                    value={state.asesor_caja?.codigo_asesor || ''} 
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^a-zA-Z]/g, '');
                                        setState((prevState) => ({
                                            ...prevState,
                                            asesor_caja: {
                                                ...prevState.asesor_caja, 
                                                codigo_asesor: value.toUpperCase()
                                            }
                                        }));
                                    }}
                                    disabled={loading}
                                    placeholder="CODIGO"
                                />
                                <small>{(state.asesor_caja?.codigo_asesor?.length || 0)} / 6</small>
                            </FormGroup>
                            <div className="button-container">
                                <Button 
                                    className="button-custom" 
                                    disabled={isSaved || loading}
                                    onClick={async () => {
                                        const confirmAction = window.confirm("¿Está seguro de que desea realizar esta acción?");
                                        if (!confirmAction) {
                                            return;
                                        }
                                        setIsSaved(true);
                                        try {
                                            if (state.asesor_caja?.responsable_agencia_id) {
                                                await updateAsesorCaja();
                                            } else {
                                                await registrarAsesorCaja();
                                            }
                                        } catch (error) {
                                            console.error('Error: ', error);
                                            alert("Ocurrió un error, por favor intente nuevamente.");
                                        } finally {
                                            setIsSaved(false);
                                        }
                                    }}
                                >
                                    {state.asesor_caja?.responsable_agencia_id ? "ACTUALIZAR" : "REGISTRAR"}
                                </Button>
                            </div>
                        </div>
                    </ModalBody>
                )}
            </div>
        </Modal>
    );
}

export default ModalAsesorCaja;