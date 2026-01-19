import React, {useState, useContext} from "react";
import {AppContext} from '../../application/provider';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table, Toast, ToastBody, ToastHeader,Form, FormGroup} from 'reactstrap';
import "./ModalCrearUsuario.css";
import UsuarioService from "../../axios_services/usuarios.service";
import {SearchSelect,SearchSelectItem} from '@tremor/react';
import { User, Briefcase, CreditCard, Paperclip , Edit2, Trash2, Plus, PackageCheck  } from "lucide-react";
import { CheckCircle, XCircle } from "lucide-react";
import Loader from '../../components/Loader/Loader'; 


function ModalCrearUsuario({isOpen}) {

    const [state,setState] = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const jefePorPerfil = {4:3, 3:2, 2:6, 6:1, 1:9, 10:9, 5:10, 8:10, 11:10, 12:10, 13:10, 14:10, 15:10, 16:10, 17:10, 18:10, 19:6, 7:20};
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    

    //CATALOGOS
    const [jornada_laboral,setJornadaLaboral] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 5}));
    const [perfiles,setPerfiles] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 6}));
    const [provincia,setProvincia] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 7}));
    const [centro_estudios,setCentroEstudios] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 23}));
    const [turnos_horario_laboral,setTurnosHorarioLaboral] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 24}));
    const [entidades_financieras] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 25}));
    const [areas_laborales] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 22}));
    const [motivos_cese] = useState(state.catalogos.tipos.filter(t => {return t.categoria_id == 18}));

    const createUsuario = async () => {
        try {
            if (state.usuario.nombre == null || state.usuario.nombre.length <= 1) {
                alert("Ingrese un nombre válido");
                return;
            }
            if (state.usuario.apellidos == null || state.usuario.apellidos.length <= 1) {
                alert("Ingrese un apellido válido");
                return;
            }
            if (state.usuario.perfil_id == null) {
                alert("Seleccione un perfil válido");
                return;
            }
            if (![9, 20].includes(Number(state.usuario.perfil_id)) && !state.usuario.usuario_id_jefe_inmediato) {
                alert("Ingrese un jefe inmediato válido");
                return;
            }
            if (state.usuario.dni == null || state.usuario.dni.length != 8) {
                alert("Ingrese un DNI válido");
                return;
            }
            if (state.usuario.celular == null || state.usuario.celular.length != 9) {
                alert("Ingrese un número de celular válido");
                return;
            }
            if (!/\S+@\S+\.\S+/.test(state.usuario.correo_personal)) {
                alert("Ingrese un correo electrónico válido");
                return;
            }

            const dataToSend = { 
                usuario_actualizador_id: state.user?.usuario_id,
                usuario_id: state.usuario.usuario_id,
                apellidos: state.usuario.apellidos,
                nombre: state.usuario.nombre,
                dni: state.usuario.dni,
                fecha_nacimiento: state.usuario.fecha_nacimiento,
                celular: state.usuario.celular,
                correo_personal: state.usuario.correo_personal,
                area_id: state.usuario.area_id,
                perfil_id: state.usuario.perfil_id,
                usuario_id_jefe_inmediato: state.usuario.usuario_id_jefe_inmediato,
                perfil_id_jefe_inmediato: state.user.personal.find(u => u.usuario_id === state.usuario.usuario_id_jefe_inmediato)?.perfil_id ?? null,
                correo_corporativo: state.usuario.correo_corporativo,
                equipo_id: state.usuario.equipo_id,
                provincia_id: state.usuario.provincia_id,
                n_contrato: state.usuario.n_contrato,
                centro_estudios_id: state.usuario.centro_estudios_id,
                fecha_ingreso: state.usuario.fecha_ingreso,
                fecha_termino_contrato: state.usuario.fecha_termino_contrato,
                tipo_jornada_laboral_id: state.usuario.tipo_jornada_laboral_id,
                turno_laboral_id: state.usuario.turno_laboral_id,
                entidad_financiera_id: state.usuario.entidad_financiera_id,
                n_cuenta_bancaria: state.usuario.n_cuenta_bancaria,
                n_cuenta_interbancaria: state.usuario.n_cuenta_interbancaria,
                tiene_casaca: Number(state.usuario.tiene_casaca) ? 1 : 0,
                tiene_fotocheck: Number(state.usuario.tiene_fotocheck) ? 1 : 0,
                tiene_equifax: Number(state.usuario.tiene_equifax) ? 1 : 0,
                archivo_dni: state.usuario.archivo_dni,
                archivo_ficha: state.usuario.archivo_ficha,
                archivo_contrato: state.usuario.archivo_contrato,
                archivo_recibo_luz_agua: state.usuario.archivo_recibo_luz_agua,
                archivo_certijoven: state.usuario.archivo_certijoven,                               
            };

            const data = await UsuarioService.createUsuario(dataToSend);
            setState((prevState) => ({...prevState, isUpdated: true}));
            alert(`Usuario creado satisfactoriamente con código: ${data.codigo_usuario}`);
            cerrarModal();
        } catch (error) {
            console.error("Error al crear el usuario:", error);
            alert("Ocurrió un error al crear el usuario. Por favor, intente nuevamente.");
        }
    };

    const updateUserRRHH = async () => {
        try {
            if (state.usuario.nombre == null || state.usuario.nombre.length <= 1) {
                alert("Ingrese un nombre válido");
                return;
            }
            if (state.usuario.apellidos == null || state.usuario.apellidos.length <= 1) {
                alert("Ingrese un apellido válido");
                return;
            }
            if (state.usuario.perfil_id == null) {
                alert("Seleccione un perfil válido");
                return;
            }
            if (![9, 7].includes(Number(state.usuario.perfil_id)) && !state.usuario.usuario_id_jefe_inmediato) {
                alert("Ingrese un jefe inmediato válido");
                return;
            }
            if (state.usuario.dni == null || state.usuario.dni.length != 8) {
                alert("Ingrese un DNI válido");
                return;
            }
            if (state.usuario.fecha_ingreso == null) {
                alert("Ingrese la fecha de ingreso");
                return;
            }
            if (state.usuario.celular == null || state.usuario.celular.length != 9) {
                alert("Ingrese un número de celular válido");
                return;
            }
            if (!/\S+@\S+\.\S+/.test(state.usuario.correo_personal)) {
                alert("Ingrese un correo electrónico válido");
                return;
            }

            const dataToSend = {
                usuario_actualizador_id: state.user?.usuario_id,
                periodo_fecha: state.periodo_fecha,
                usuario_id: state.usuario.usuario_id,
                apellidos: state.usuario.apellidos,
                nombre: state.usuario.nombre,
                dni: state.usuario.dni,
                fecha_nacimiento: state.usuario.fecha_nacimiento,
                celular: state.usuario.celular,
                correo_personal: state.usuario.correo_personal,
                area_id: state.usuario.area_id,
                perfil_id: state.usuario.perfil_id,
                usuario_id_jefe_inmediato: state.usuario.usuario_id_jefe_inmediato,
                perfil_id_jefe_inmediato: state.user.personal.find(u => u.usuario_id === state.usuario.usuario_id_jefe_inmediato)?.perfil_id ?? null,
                correo_corporativo: state.usuario.correo_corporativo,
                equipo_id: state.usuario.equipo_id,
                provincia_id: state.usuario.provincia_id,
                n_contrato: state.usuario.n_contrato,
                centro_estudios_id: state.usuario.centro_estudios_id,
                fecha_ingreso: state.usuario.fecha_ingreso,
                fecha_termino_contrato: state.usuario.fecha_termino_contrato,
                tipo_jornada_laboral_id: state.usuario.tipo_jornada_laboral_id,
                turno_laboral_id: state.usuario.turno_laboral_id,
                fecha_cese: state.usuario.fecha_cese,
                entidad_financiera_id: state.usuario.entidad_financiera_id,
                n_cuenta_bancaria: state.usuario.n_cuenta_bancaria,
                n_cuenta_interbancaria: state.usuario.n_cuenta_interbancaria,
                tiene_casaca: Number(state.usuario.tiene_casaca) ? 1 : 0,
                tiene_fotocheck: Number(state.usuario.tiene_fotocheck) ? 1 : 0,
                tiene_equifax: Number(state.usuario.tiene_equifax) ? 1 : 0,
                motivo_cese_id: state.usuario.motivo_cese_id,
                comentario_cese: state.usuario.comentario_cese,
                devolvio_fotocheck: Number(state.usuario.devolvio_fotocheck) ? 1 : 0,
                archivo_dni: state.usuario.archivo_dni,
                archivo_ficha: state.usuario.archivo_ficha,
                archivo_contrato: state.usuario.archivo_contrato,
                archivo_recibo_luz_agua: state.usuario.archivo_recibo_luz_agua,
                archivo_certijoven: state.usuario.archivo_certijoven,
            };

            const data = await UsuarioService.updateUserRRHH(dataToSend);

            setState((prevState) => ({ ...prevState, isUpdated: true }));
            alert(`Usuario actualizado satisfactoriamente`);
            cerrarModal();

        } catch (error) {
            console.error("Error al actualizar el usuario:", error);
            alert("Ocurrió un error al actualizar el usuario. Por favor, intente nuevamente.");
        }
    };

    function cerrarModal () {
        setState((prevState) => ({
            ...prevState,
            modalCrearUsuario: false,
            usuario: null
        }));
    }; 

return (
    state.modalCrearUsuario === true && (<Modal isOpen={state.modalCrearUsuario} className="custom-modal" backdrop={true}>
        <ModalHeader className="modal-header">
            <div class="titulo">
                <h1>{state.usuario && state.usuario.usuario_id ? "EDITAR USUARIO" : "REGISTRAR USUARIO"}</h1>
                <Button className="close-btn" onClick={cerrarModal}>X</Button>
            </div>
        </ModalHeader>
    <div class="modal-body-footer">
            {loading ? (
            <Loader />
            ) : (
        <ModalBody className="modal-body">
            <Form className="fila">
            <fieldset className="fieldset-container">
                <legend className="fieldset-legend">
                    <User size={18} style={{ marginRight: '0.5rem' }} />
                    Datos personales
                </legend>
                <FormGroup className="form-group">
                <label>Apellidos y Nombres (*):</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                    className="form-control small-input"
                    name="apellidos"
                    type="text"
                    placeholder="Ej. Pérez Gómez"
                    value={state.usuario?.apellidos || ''}
                    onChange={(e) =>
                        setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, apellidos: e.target.value },
                        }))
                    }
                    />
                    <span style={{ alignSelf: 'center', marginBottom: 'auto' }}>,</span>
                    <input
                    className="form-control small-input"
                    name="nombre"
                    type="text"
                    placeholder="Ej. Juan Carlos"
                    value={state.usuario?.nombre || ''}
                    onChange={(e) =>
                        setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, nombre: e.target.value },
                        }))
                    }
                    />
                </div>
                </FormGroup>
                <FormGroup className="form-group">
                <label>DNI (*):</label>
                <input
                    className="form-control small-input"
                    name="dni"
                    type="text"
                    placeholder="Ej. 12345678"
                    value={state.usuario?.dni || ''}
                    onChange={(e) =>
                    setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, dni: e.target.value },
                    }))
                    }
                />
                </FormGroup>
                <FormGroup className="form-group">
                <label>Fecha de nacimiento:</label>
                <input
                    className="form-control small-input"
                    name="fecha_nacimiento"
                    type="date"
                    value={state.usuario?.fecha_nacimiento || ''}
                    onChange={(e) =>
                    setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, fecha_nacimiento: e.target.value },
                    }))
                    }
                />
                </FormGroup>
                <FormGroup className="form-group">
                <label>Celular (*):</label>
                <input
                    className="form-control small-input"
                    name="celular"
                    type="text"
                    placeholder="Ej. 987654321"
                    value={state.usuario?.celular || ''}
                    onChange={(e) =>
                    setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, celular: e.target.value },
                    }))
                    }
                />
                </FormGroup>
                <FormGroup className="form-group">
                <label>Correo electrónico (*):</label>
                <input
                    className="form-control small-input"
                    name="correo_personal"
                    type="text"
                    placeholder="Ej. ejemplo@gmail.com"
                    value={state.usuario?.correo_personal || ''}
                    onChange={(e) =>
                    setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, correo_personal: e.target.value },
                    }))
                    }
                />
                </FormGroup>
            </fieldset>
            <fieldset className="fieldset-container">
                <legend className="fieldset-legend">
                    <Briefcase size={18} style={{ marginRight: '0.5rem' }} />
                    Información laboral
                </legend>
                <FormGroup className="form-group">
                <label>Área (*):</label>
                <select
                    className="form-control small-input"
                    name="area_id"
                    value={state.usuario?.area_id || ''}
                    onChange={(e) =>
                    setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, area_id: e.target.value },
                    }))
                    }
                >
                    <option value="">Seleccione el área laboral</option>
                    {areas_laborales.map((item) => (
                    <option key={item.tipo_id} value={item.tipo_id}>
                        {item.descripcion}
                    </option>
                    ))}
                </select>
                </FormGroup>
                <FormGroup className="form-group">
                <label>Cargo (*):</label>
                <select
                    className="form-control small-input"
                    name="perfil_id"
                    value={state.usuario?.perfil_id || ''}
                    onChange={(e) =>
                    setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, perfil_id: e.target.value },
                    }))
                    }
                >
                    <option value="">Seleccione el cargo</option>
                    {(
                        Number(state.usuario?.area_id) === 1
                            ? perfiles.filter(p => [1, 2, 3, 4, 6].includes(Number(p.tipo_id)))
                        : Number(state.usuario?.area_id) === 2
                            ? perfiles.filter(p => [5, 8, 9, 10, 11, 12, 13, 14, 15, 18, 19].includes(Number(p.tipo_id)))
                        : Number(state.usuario?.area_id) === 3
                            ? perfiles.filter(p => [7, 16, 17].includes(Number(p.tipo_id)))
                        : Number(state.usuario?.area_id) === 4
                            ? perfiles.filter(p => [7, 20].includes(Number(p.tipo_id)))
                        : perfiles
                        ).map(perfil => (
                        <option key={perfil.tipo_id} value={perfil.tipo_id}>
                            {perfil.descripcion}
                    </option>
                    ))}
                </select>
                </FormGroup>
                <FormGroup className="form-group">
                <label>Jefe inmediato (*):</label>
                <select
                    className="form-control small-input"
                    name="usuario_id_jefe_inmediato"
                    value={state.usuario?.usuario_id_jefe_inmediato || ''}
                    onChange={(e) =>
                    setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, usuario_id_jefe_inmediato: e.target.value },
                    }))
                    }
                >
                    <option value="">Seleccione</option>
                    {(state.jefes_inmediatos
                        ? state.jefes_inmediatos.filter(
                            p =>
                            Number(p.perfil_id) === jefePorPerfil[Number(state.usuario?.perfil_id)]
                        )
                        : []
                    ).map(p => (
                        <option key={p.usuario_id} value={p.usuario_id}>
                        {p.nombre_completo_usuario}
                        </option>
                    ))}
                </select>
                </FormGroup>
                {state.usuario && Number(state.usuario.perfil_id) !== 4 && (
                <FormGroup className="form-group">
                    <label>Correo corporativo:</label>
                    <input
                    className="form-control small-input"
                    name="correo_corporativo"
                    type="text"
                    placeholder="Ej. usuario@mec.com.pe"
                    value={state.usuario.correo_corporativo || ''}
                    onChange={(e) =>
                        setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, correo_corporativo: e.target.value },
                        }))
                    }
                    />
                </FormGroup>
                )}
                <FormGroup className="form-group">
                <label>Provincia:</label>
                <select
                    className="form-control small-input"
                    name="provincia_id"
                    value={state.usuario?.provincia_id || ''}
                    onChange={(e) =>
                    setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, provincia_id: e.target.value },
                    }))
                    }
                >
                    <option value="">Seleccione una provincia</option>
                    {provincia.map((item) => (
                    <option key={item.tipo_id} value={item.tipo_id}>
                        {item.descripcion}
                    </option>
                    ))}
                </select>
                </FormGroup>
                <FormGroup className="form-group">
                <label>N° de contrato:</label>
                <input
                    className="form-control small-input"
                    name="n_contrato"
                    type="text"
                    placeholder="Ej. 00000001"
                    value={state.usuario?.n_contrato || ''}
                    onChange={(e) =>
                    setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, n_contrato: e.target.value },
                    }))
                    }
                />
                </FormGroup>
                <FormGroup className="form-group">
                <label>Centro de estudios (prácticas):</label>
                <select
                    className="form-control small-input"
                    name="centro_estudios_id"
                    value={state.usuario?.centro_estudios_id || ''}
                    onChange={(e) =>
                    setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, centro_estudios_id: e.target.value },
                    }))
                    }
                >
                    <option value="">Seleccione una institución</option>
                    {centro_estudios.map((item) => (
                    <option key={item.tipo_id} value={item.tipo_id}>
                        {item.descripcion}
                    </option>
                    ))}
                </select>
                </FormGroup>
                <FormGroup className="form-group">
                <label>Fecha de ingreso:</label>
                <input
                    className="form-control small-input"
                    name="fecha_ingreso"
                    type="date"
                    value={state.usuario?.fecha_ingreso || ''}
                    onChange={(e) =>
                    setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, fecha_ingreso: e.target.value },
                    }))
                    }
                />
                </FormGroup>
                <FormGroup className="form-group">
                <label>Término de contrato:</label>
                <input
                    className="form-control small-input"
                    name="fecha_termino_contrato"
                    type="date"
                    value={state.usuario?.fecha_termino_contrato || ''}
                    onChange={(e) =>
                    setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, fecha_termino_contrato: e.target.value },
                    }))
                    }
                />
                </FormGroup>
                <FormGroup className="form-group">
                <label>Jornada laboral:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <select
                    className="form-control small-input"
                    name="tipo_jornada_laboral_id"
                    value={state.usuario?.tipo_jornada_laboral_id || ''}
                    onChange={(e) =>
                        setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, tipo_jornada_laboral_id: e.target.value },
                        }))
                    }
                    >
                    <option value="">Seleccione jornada laboral</option>
                    {jornada_laboral.map((item) => (
                        <option key={item.tipo_id} value={item.tipo_id}>
                        {item.descripcion}
                        </option>
                    ))}
                    </select>
                    <select
                    className="form-control small-input"
                    name="turno_laboral_id"
                    value={state.usuario?.turno_laboral_id || ''}
                    onChange={(e) =>
                        setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, turno_laboral_id: e.target.value },
                        }))
                    }
                    disabled={!state.usuario?.tipo_jornada_laboral_id || Number(state.usuario?.tipo_jornada_laboral_id) === 2}
                    >
                    <option value="">Sin turno</option>
                    {turnos_horario_laboral.map((item) => (
                        <option key={item.tipo_id} value={item.tipo_id}>
                        {item.descripcion}
                        </option>
                    ))}
                    </select>
                </div>
                </FormGroup>
                {state.usuario?.estado === '0' && (
                    <FormGroup className="form-group">
                        <label>Fecha de Cese:</label>
                        <input
                            className="form-control small-input"
                            name="fecha_cese"
                            type="date"
                            value={state.usuario?.fecha_cese || ''}
                            onChange={(e) =>
                                setState((prevState) => ({
                                    ...prevState,
                                    usuario: { ...prevState.usuario, fecha_cese: e.target.value },
                                }))
                            }
                        />
                    </FormGroup>
                )}
                {state.usuario?.estado === '0' && (
                    <FormGroup className="form-group">
                        <label>Motivo de Cese:</label>
                        <select
                            className="form-control small-input"
                            name="motivo_cese_id"
                            value={state.usuario?.motivo_cese_id || ''}
                            onChange={(e) =>
                            setState((prevState) => ({
                                ...prevState,
                                usuario: { ...prevState.usuario, motivo_cese_id: e.target.value },
                            }))
                            }
                        >
                            <option value="">Seleccione el motivo de cese</option>
                            {motivos_cese.map((item) => (
                            <option key={item.tipo_id} value={item.tipo_id}>
                                {item.descripcion}
                            </option>
                            ))}
                        </select>
                    </FormGroup>
                )}
                {state.usuario?.estado === '0' && (
                    <FormGroup className="form-group">
                        <label>Comentario cese:</label>
                        <textarea
                            className="form-control small-input"
                            name="comentario_cese"
                            rows={3}
                            maxLength={50}
                            value={state.usuario?.comentario_cese || ''}
                            onChange={(e) => {
                            const val = e.target.value;
                            if(val.length <= 50){
                                setState((prevState) => ({
                                ...prevState,
                                usuario: { ...prevState.usuario, comentario_cese: val },
                                }));
                            }
                            }}
                        />
                        <small>{(state.usuario?.comentario_cese?.length || 0)} / 50</small>
                    </FormGroup>
                )}
                {state.usuario?.estado === '0' && (
                    <FormGroup className="form-group">
                        <label>Devolvio indumentaria:</label>
                        <div className="d-flex align-items-center">
                            <input
                            type="checkbox"
                            id="devolvio_fotocheck"
                            name="devolvio_fotocheck"
                            checked={state.usuario?.devolvio_fotocheck === '1'}
                            onChange={(e) =>
                                setState((prevState) => ({
                                ...prevState,
                                usuario: {
                                    ...prevState.usuario,
                                    devolvio_fotocheck: e.target.checked ? '1' : '0',
                                },
                                }))
                            }
                            />
                        </div>
                    </FormGroup>
                )}
            </fieldset>
            <fieldset className="fieldset-container">
                <legend className="fieldset-legend">
                    <CreditCard size={18} style={{ marginRight: '0.5rem' }} />
                    Información bancaria
                </legend>
                <FormGroup className="form-group">
                <label>Entidad financiera (Medio de pago):</label>
                <select
                    className="form-control small-input"
                    name="entidad_financiera_id"
                    value={state.usuario?.entidad_financiera_id || ''}
                    onChange={(e) =>
                    setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, entidad_financiera_id: e.target.value },
                    }))
                    }
                >
                    <option value="">Seleccione entidad bancaria</option>
                    {entidades_financieras.map((item) => (
                    <option key={item.tipo_id} value={item.tipo_id}>
                        {item.descripcion}
                    </option>
                    ))}
                </select>
                </FormGroup>
                <FormGroup className="form-group">
                <label>N° de cuenta bancaria:</label>
                <input
                    className="form-control small-input"
                    name="n_cuenta_bancaria"
                    type="text"
                    placeholder="Ej. 1234567890"
                    value={state.usuario?.n_cuenta_bancaria || ''}
                    onChange={(e) =>
                    setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, n_cuenta_bancaria: e.target.value },
                    }))
                    }
                />
                </FormGroup>
                <FormGroup className="form-group">
                <label>N° de cuenta interbancaria:</label>
                <input
                    className="form-control small-input"
                    name="titular_cuenta"
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    value={state.usuario?.n_cuenta_interbancaria || ''}
                    onChange={(e) =>
                    setState((prevState) => ({
                        ...prevState,
                        usuario: { ...prevState.usuario, n_cuenta_interbancaria: e.target.value },
                    }))
                    }
                />
                </FormGroup>
            </fieldset>
            <fieldset className="fieldset-container documentos-adjuntos">
                <legend className="fieldset-legend">
                    <Paperclip size={18} style={{ marginRight: '0.5rem' }} />
                    Documentos adjuntados
                </legend>
                <FormGroup className="form-group">
                    {(state.usuario?.tiene_archivo_ficha || '0') === '1' 
                        ? (<CheckCircle color="green" size={20} title="Documento adjuntado" />) 
                        : (<XCircle color="red" size={20} title="Documento no adjuntado" />)}
                    <label htmlFor="archivo_ficha">Ficha:</label>
                    <input
                        className="form-control small-input"
                        type="file"
                        id="archivo_ficha"
                        name="archivo_ficha"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file && file.size > MAX_FILE_SIZE) {
                                alert("El archivo Ficha no debe superar los 5MB");
                                e.target.value = null;
                                return;
                            }
                            setState((prevState) => ({
                                ...prevState,
                                usuario: { ...prevState.usuario, archivo_ficha: file },
                            }));
                        }}
                    />
                </FormGroup>
                <FormGroup className="form-group">
                    {(state.usuario?.tiene_archivo_contrato || '0') === '1' 
                        ? (<CheckCircle color="green" size={20} title="Documento adjuntado" />) 
                        : (<XCircle color="red" size={20} title="Documento no adjuntado" />)}
                    <label htmlFor="archivo_contrato">Contrato:</label>
                    <input
                        className="form-control small-input"
                        type="file"
                        id="archivo_contrato"
                        name="archivo_contrato"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file && file.size > MAX_FILE_SIZE) {
                                alert("El archivo Contrato no debe superar los 5MB");
                                e.target.value = null;
                                return;
                            }
                            setState((prevState) => ({
                                ...prevState,
                                usuario: { ...prevState.usuario, archivo_contrato: file },
                            }));
                        }}
                    />
                </FormGroup>
                <FormGroup className="form-group" >
                    {(state.usuario?.tiene_archivo_dni || '0') === '1' 
                        ? (<CheckCircle color="green" size={20} title="Documento adjuntado" />) 
                        : (<XCircle color="red" size={20} title="Documento no adjuntado" />)}
                    <label htmlFor="archivo_dni">DNI:</label>
                    <input
                        className="form-control small-input"
                        type="file"
                        id="archivo_dni"
                        name="archivo_dni"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file && file.size > MAX_FILE_SIZE) {
                                alert("El archivo DNI no debe superar los 5MB");
                                e.target.value = null;
                                return;
                            }
                            setState((prevState) => ({
                                ...prevState,
                                usuario: { ...prevState.usuario, archivo_dni: file },
                            }));
                        }}
                    />
                </FormGroup>
                <FormGroup className="form-group">
                    {(state.usuario?.tiene_archivo_recibo_luz_agua || '0') === '1' 
                        ? (<CheckCircle color="green" size={20} title="Documento adjuntado" />) 
                        : (<XCircle color="red" size={20} title="Documento no adjuntado" />)}
                    <label htmlFor="archivo_recibo_luz_agua">Recibo de agua o luz:</label>
                    <input
                        className="form-control small-input"
                        type="file"
                        id="archivo_recibo_luz_agua"
                        name="archivo_recibo_luz_agua"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file && file.size > MAX_FILE_SIZE) {
                                alert("El archivo Recibo de agua o luz no debe superar los 5MB");
                                e.target.value = null;
                                return;
                            }
                            setState((prevState) => ({
                                ...prevState,
                                usuario: { ...prevState.usuario, archivo_recibo_luz_agua: file },
                            }));
                        }}
                    />
                </FormGroup>
                <FormGroup className="form-group">
                    {(state.usuario?.tiene_archivo_certijoven || '0') === '1' 
                        ? (<CheckCircle color="green" size={20} title="Documento adjuntado" />) 
                        : (<XCircle color="red" size={20} title="Documento no adjuntado" />)}
                    <label htmlFor="archivo_certijoven">Certijoven:</label>
                    <input
                        className="form-control small-input"
                        type="file"
                        id="archivo_certijoven"
                        name="archivo_certijoven"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file && file.size > MAX_FILE_SIZE) {
                                alert("El archivo Certijoven no debe superar los 5MB");
                                e.target.value = null;
                                return;
                            }
                            setState((prevState) => ({
                                ...prevState,
                                usuario: { ...prevState.usuario, archivo_certijoven: file },
                            }));
                        }}
                    />
                </FormGroup>
            </fieldset>
            <fieldset className="fieldset-container instrumentos-trabajo">
                <legend className="fieldset-legend">
                    <PackageCheck  size={18} style={{ marginRight: '0.5rem' }} />
                    Instrumentos de trabajo
                </legend>
                <FormGroup className="form-group">
                    <label htmlFor="tiene_fotocheck">Fotocheck:</label>
                    <input
                        type="checkbox"
                        id="tiene_fotocheck"
                        name="tiene_fotocheck"
                        checked={state.usuario?.tiene_fotocheck === '1'}
                        onChange={(e) =>
                        setState((prevState) => ({
                            ...prevState,
                            usuario: {
                            ...prevState.usuario,
                            tiene_fotocheck: e.target.checked ? '1' : '0',
                            },
                        }))
                        }
                    />
                </FormGroup>
                <FormGroup className="form-group">
                    <label htmlFor="tiene_equifax">Equifax:</label>
                    <input
                        type="checkbox"
                        id="tiene_equifax"
                        name="tiene_equifax"
                        checked={state.usuario?.tiene_equifax === '1'}
                        onChange={(e) =>
                        setState((prevState) => ({
                            ...prevState,
                            usuario: {
                            ...prevState.usuario,
                            tiene_equifax: e.target.checked ? '1' : '0',
                            },
                        }))
                        }
                    />
                </FormGroup>
                <FormGroup className="form-group">
                    <label htmlFor="tiene_casaca">Casaca:</label>
                    <input
                        type="checkbox"
                        id="tiene_casaca"
                        name="tiene_casaca"
                        checked={state.usuario?.tiene_casaca === '1'}
                        onChange={(e) =>
                        setState((prevState) => ({
                            ...prevState,
                            usuario: {
                            ...prevState.usuario,
                            tiene_casaca: e.target.checked ? '1' : '0',
                            },
                        }))
                        }
                    />
                </FormGroup>
            </fieldset>
            </Form>
            <div className="button-container">
                    <Button
                    id="boton-form-modal"
                    className="button-custom"
                    disabled={isSaved}
                    onClick={async () => {
                        const confirmAction = window.confirm("¿Está seguro de que desea realizar esta acción?");
                        if (!confirmAction) return;
                        setIsSaved(true);
                        try {
                        if (state.usuario && state.usuario.usuario_id) {
                            await updateUserRRHH();
                        } else {
                            await createUsuario();
                        }
                        } catch (error) {
                        alert("Ocurrió un error, por favor intente nuevamente.");
                        } finally {
                        setIsSaved(false);
                        }
                    }}
                    >
                    {state.usuario && state.usuario.usuario_id ? "ACTUALIZAR" : "REGISTRAR"}
                    </Button>
                </div>
        </ModalBody>)}
        </div>
    </Modal>)
        
    );
}

export default ModalCrearUsuario;